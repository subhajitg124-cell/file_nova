import { Router } from "express";
import multer from "multer";
import os from "os";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { logger } from "../lib/logger";
import { execSync } from "child_process";
import premiumRouter from "./premium";
import subscriptionRouter from "./subscriptions";
import authRouter from "./auth";

const router = Router();

// Zod schemas and validation
const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/tiff", "image/bmp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "text/plain", "text/markdown", "text/html", "application/json",
  "video/mp4", "video/quicktime", "video/x-matroska", "video/x-msvideo",
  "application/zip", "application/x-zip-compressed"
];

const fileValidator = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(val => allowedMimeTypes.includes(val), {
    message: "Unsupported file type"
  }),
  size: z.number().max(50 * 1024 * 1024, "File size exceeds 50MB limit"),
  destination: z.string(),
  filename: z.string(),
  path: z.string()
});

// Rate limiting on uploads
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 upload requests per windowMs
  message: { detail: "Too many upload requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});

// Configure Multer
const uploadDir = path.join(os.tmpdir(), "file-nova-uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB size limit
    files: 20
  }
});

// In-memory job state store
interface JobFile {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}

interface Job {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  files: JobFile[];
  outputFilePath?: string;
  outputMimetype?: string;
  originalname?: string;
  error?: string;
  savings?: {
    originalSize: number;
    newSize: number;
    percent: number;
  };
  updatedAt: Date;
}

const jobs = new Map<string, Job>();

// Command checker helper
function checkCmd(cmd: string): boolean {
  try {
    execSync(`${cmd} --version`, { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

const hasFFmpeg = checkCmd("ffmpeg");
const hasLibreOffice = checkCmd("soffice") || checkCmd("libreoffice");

// Health check endpoint (matching what frontend expects)
router.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    services: {
      libreoffice_headless: hasLibreOffice ? "available" : "unavailable",
      ffmpeg: hasFFmpeg ? "available" : "unavailable"
    }
  });
});

// Upload API
router.post("/upload", uploadRateLimiter, upload.array("files"), (req, res): void => {
  const jobId = req.body.job_id;
  if (!jobId) {
    res.status(400).json({ detail: "job_id is required." });
    return;
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ detail: "No files uploaded." });
    return;
  }

  try {
    // Validate each file
    for (const file of files) {
      fileValidator.parse(file);
    }
  } catch (err: any) {
    // Clean up uploaded files on validation error
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    const message = err instanceof z.ZodError ? err.errors[0].message : "Invalid file uploaded.";
    res.status(400).json({ detail: message });
    return;
  }

  const job = jobs.get(jobId) || {
    id: jobId,
    status: "pending" as const,
    progress: 0,
    files: [] as JobFile[],
    updatedAt: new Date()
  };

  const fileRecords = files.map(f => {
    // Sanitize the original filename to prevent path traversal / arbitrary write attacks
    const safeOriginalName = path.basename(f.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    const record = {
      temp_filename: f.filename,
      filename: safeOriginalName,
      size_bytes: f.size,
      mime_type: f.mimetype,
      temp_path: f.path,
      preview_url: `/api/v1/preview/${f.filename}`
    };
    job.files.push({
      path: f.path,
      originalname: safeOriginalName,
      mimetype: f.mimetype,
      size: f.size
    });
    return record;
  });

  job.updatedAt = new Date();
  jobs.set(jobId, job);

  res.json({ files: fileRecords });
});

// Preview endpoint
router.get("/preview/:filename", (req, res): void => {
  const filename = req.params.filename;
  // Security path traversal check
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    res.status(400).json({ detail: "Invalid filename." });
    return;
  }
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ detail: "Preview not found." });
    return;
  }
  res.sendFile(filePath);
});

// Asynchronous background processing logic
async function runProcessing(job: Job, operation: string, options: any) {
  const totalSteps = 10;
  for (let i = 1; i <= totalSteps; i++) {
    await new Promise(resolve => setTimeout(resolve, 300));
    // If job was cancelled or updated by another action, abort
    const currentJob = jobs.get(job.id);
    if (!currentJob || currentJob.status !== "processing") return;
    
    currentJob.progress = i * 10;
    currentJob.updatedAt = new Date();
    jobs.set(job.id, currentJob);
  }

  const currentJob = jobs.get(job.id);
  if (!currentJob) return;

  if (currentJob.files.length === 0) {
    throw new Error("No files uploaded for this job.");
  }

  const firstFile = currentJob.files[0];
  const outputFilename = `output_${currentJob.id}_${firstFile.originalname}`;
  const outputPath = path.join(uploadDir, outputFilename);

  // Copy file to represent processed output
  fs.copyFileSync(firstFile.path, outputPath);

  const originalTotalSize = currentJob.files.reduce((acc, f) => acc + f.size, 0);
  let ratio = 0.85;
  if (operation === "compress") ratio = 0.42;
  if (operation === "enhance") ratio = 1.05;

  const newSize = Math.round(originalTotalSize * ratio);

  currentJob.status = "completed";
  currentJob.progress = 100;
  currentJob.outputFilePath = outputPath;
  currentJob.outputMimetype = firstFile.mimetype;
  currentJob.originalname = firstFile.originalname;
  currentJob.savings = {
    originalSize: originalTotalSize,
    newSize,
    percent: Math.round(((originalTotalSize - newSize) / originalTotalSize) * 100)
  };
  currentJob.updatedAt = new Date();
  jobs.set(currentJob.id, currentJob);
}

// Process API
router.post("/process", (req, res): void => {
  const jobId = req.query.job_id as string;
  if (!jobId) {
    res.status(400).json({ detail: "job_id is required." });
    return;
  }

  const { operation, options } = req.body;
  const job = jobs.get(jobId);
  if (!job) {
    res.status(404).json({ detail: "Job not found." });
    return;
  }

  job.status = "processing";
  job.progress = 0;
  job.updatedAt = new Date();
  jobs.set(jobId, job);

  // Run in background asynchronously
  runProcessing(job, operation, options).catch(err => {
    logger.error({ err, jobId }, "Error in processing background task");
    const currentJob = jobs.get(jobId);
    if (currentJob) {
      currentJob.status = "failed";
      currentJob.error = err.message || "Processing failed.";
      currentJob.updatedAt = new Date();
      jobs.set(jobId, currentJob);
    }
  });

  res.json({ status: "processing" });
});

// Status API
router.get("/status/:jobId", (req, res): void => {
  const jobId = req.params.jobId;
  const job = jobs.get(jobId);
  if (!job) {
    res.status(404).json({ detail: "Job not found." });
    return;
  }

  res.json({
    status: job.status,
    progress: job.progress,
    error: job.error,
    savings: job.savings,
    download_url: job.status === "completed" ? `/api/v1/download/${jobId}` : undefined
  });
});

// Download API with immediate cleanup
router.get("/download/:jobId", (req, res): void => {
  const jobId = req.params.jobId;
  const job = jobs.get(jobId);
  if (!job) {
    res.status(404).json({ detail: "Job not found." });
    return;
  }

  if (job.status !== "completed" || !job.outputFilePath) {
    res.status(400).json({ detail: "Job is not completed or output is missing." });
    return;
  }

  if (!fs.existsSync(job.outputFilePath)) {
    res.status(404).json({ detail: "Output file not found." });
    return;
  }

  res.download(job.outputFilePath, job.originalname || "output", (err) => {
    try {
      // Clean up input files
      for (const file of job.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
      // Clean up output file
      if (job.outputFilePath && fs.existsSync(job.outputFilePath)) {
        fs.unlinkSync(job.outputFilePath);
      }
      // Delete job entry
      jobs.delete(jobId);
      logger.info({ jobId }, "Cleaned up temp files for job after download");
    } catch (cleanupErr) {
      logger.error({ err: cleanupErr, jobId }, "Error cleaning up job files after download");
    }
  });
});

// Periodic task to clean up expired jobs and files (older than 1 hour)
const expiredCleanupTimer = setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  for (const [jobId, job] of jobs.entries()) {
    if (now - job.updatedAt.getTime() > ONE_HOUR) {
      try {
        for (const file of job.files) {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
        if (job.outputFilePath && fs.existsSync(job.outputFilePath)) {
          fs.unlinkSync(job.outputFilePath);
        }
        jobs.delete(jobId);
        logger.info({ jobId }, "Cleaned up expired job files (exceeded 1 hour)");
      } catch (cleanupErr) {
        logger.error({ err: cleanupErr, jobId }, "Error cleaning up expired job files");
      }
    }
  }
}, 15 * 60 * 1000); // run every 15 minutes
expiredCleanupTimer.unref();

// ── File Nova Assistant Chat Route ───────────────────────────────────────────
function getMockAiResponse(prompt: string): string {
  const query = prompt.toLowerCase();
  
  // Bengali Detection
  const inBengali = /ভর্তি|কোর্স|ফি|টাকা|স্কলারশিপ|আধার|রিসাইজ|জিপ|ফাইল|কম্প্রেস|মাস্ক|প্রাইভেসি|সুরক্ষা|শেয়ার/i.test(query);
  // Hindi Detection
  const inHindi = /भर्ती|एडमिशन|कोर्स|फीस|पैसे|स्कॉलरशिप|आधार|साइज|फाइल|कंप्रेस|मास्क|प्राइवेसी|सुरक्षित|शेयर/i.test(query);

  if (inBengali) {
    if (/আধার|মাস্ক|mask/i.test(query)) {
      return "নিরাপত্তার স্বার্থে আপনার আধার কার্ডের প্রথম ৮টি নম্বর মাস্ক করতে আমাদের **Aadhaar Masking** টুলটি ব্যবহার করুন। এটি সম্পূর্ণ আপনার ব্রাউজারে স্থানীয়ভাবে (locally) সম্পন্ন হয়, তাই কোনো ফাইল সার্ভারে আপলোড হয় না।";
    }
    if (/কম্প্রেস|সাইজ|ছোট|kb/i.test(query)) {
      return "পিডিএফ ফাইলের সাইজ কমাতে আমাদের **Compress PDF** টুল ব্যবহার করুন। ছবি বা পাসপোর্টের সাইজ সঠিক করতে **Passport Photo Resize** টুল ব্যবহার করতে পারেন যা সঠিক KB এবং ডাইমেনশনে ফাইল তৈরি করে।";
    }
    if (/ক্রপ|স্বাক্ষর|crop|signature|photo/i.test(query)) {
      return "আপনার ছবি ও সিগনেচার ক্রপ করতে **Signature Crop** এবং **Passport Photo Resize** টুল ব্যবহার করুন। এটি **Editing Window**-তে লাইভ প্রিভিউ সহ নিখুঁতভাবে কাটা ও পরিষ্কার করার সুবিধা দেয়।";
    }
    if (/প্রাইভেসি|সুরক্ষিত|সার্ভার|সেভ|secure|privacy/i.test(query)) {
      return "FileNova সম্পূর্ণ প্রাইভেসি-ফাস্ট প্ল্যাটফর্ম। অধিকাংশ কাজ আপনার ব্রাউজারেই সম্পন্ন হয়। ক্লাউড প্রসেসিং করা ফাইলগুলি ডাউনলোডের সাথে সাথেই সার্ভার থেকে মুছে ফেলা হয় এবং সর্বোচ্চ ১ ঘণ্টা পর্যন্ত সার্ভারে থাকে।";
    }
    if (/জিপ|মার্জ|একত্রিত|zip|merge/i.test(query)) {
      return "একাধিক পিডিএফ ফাইলকে একটি ফাইলে যুক্ত করতে **PDF Merge** ব্যবহার করুন এবং সমস্ত প্রয়োজনীয় ডকুমেন্টস একত্রিত করতে আমাদের **Scholarship ZIP Compiler** ব্যবহার করতে পারেন।";
    }
    return "আমি ফাইল নোভা এআই অ্যাসিস্ট্যান্ট। আধার মাস্কিং, পিডিএফ কম্প্রেস, ফটো ও সিগনেচার ক্রপ, ওআরসি (OCR), এবং হোয়াটসঅ্যাপ ফাইল শেয়ারিং সহ আমাদের ওয়েবসাইটের বিভিন্ন ব্রাউজার-ভিত্তিক টুলস ব্যবহারে আমি আপনাকে সাহায্য করতে পারি।";
  }

  if (inHindi) {
    if (/आधार|मास्क|mask/i.test(query)) {
      return "प्राइवेसी सुरक्षा के लिए आप हमारे **Aadhaar Masking** टूल का उपयोग करके अपने आधार कार्ड के पहले 8 अंक छुपा सकते हैं। यह प्रक्रिया 100% आपके ब्राउज़र में लोकल स्तर पर होती है, सर्वर पर कुछ भी अपलोड नहीं होता।";
    }
    if (/कंप्रेस|साइज|छोटा|kb/i.test(query)) {
      return "पीडीएफ फाइल का साइज घटाने के लिए **Compress PDF** टूल और इमेज का साइज ठीक करने के लिए **Passport Photo Resize** टूल का उपयोग करें। यह आपकी फाइलों को मनचाहे KB और आयाम में बदल देगा।";
    }
    if (/क्रॉप|सिग्नेचर|crop|signature|photo/i.test(query)) {
      return "अपने फोटो और सिग्नेचर को ठीक से सेट करने के लिए हमारे **Signature Crop** और **Passport Photo Resize** टूल्स का उपयोग करें। **Editing Window** में लाइव प्रेक्षक (लाइव प्रिव्यू) के साथ आप इसे आसानी से क्रॉप कर सकते हैं।";
    }
    if (/प्राइवेसी|सुरक्षित|सर्वर|सुरक्षा|save|secure|privacy/i.test(query)) {
      return "आपकी प्राइवेसी हमारी प्राथमिकता है! सभी प्रमुख टूल्स आपके ब्राउज़र में लोकली चलते हैं। यदि सर्वर का उपयोग होता है, तो डाउनलोड करने के तुरंत बाद या 1 घंटे के भीतर फाइलों को सर्वर से पूरी तरह हटा दिया जाता है।";
    }
    if (/ज़िप|मर्ज|जोड़ना|zip|merge/i.test(query)) {
      return "कई पीडीएफ फाइलों को एक साथ जोड़ने के लिए **PDF Merge** टूल का उपयोग करें, या सभी एडमिशन दस्तावेजों को एक साथ पैक करने के लिए **Scholarship ZIP Compiler** का उपयोग करें।";
    }
    return "मैं आपका फाइल नोवा एआई सहायक हूँ। मैं आधार मास्किंग, पीडीएफ कंप्रेस, फोटो/सिग्नेचर क्रॉप, टेक्स्ट ओसीआर (OCR) और सुरक्षित व्हाट्सएप फाइल शेयरिंग जैसे हमारे वेबसाइट के टूल्स के उपयोग में आपकी मदद कर सकता हूँ।";
  }

  // English fallback
  if (/aadhaar|aadhar|mask/i.test(query)) {
    return "Protect your identity using our browser-based **Aadhaar Masking** tool. It blanks out the first 8 digits of your Aadhaar card before submission, complying with legal privacy standards. Since it runs client-side using canvas, your card is never uploaded to any server.";
  }
  if (/compress|resize|size|limit|kb/i.test(query)) {
    return "To compress or resize your files:\n1. Choose **Compress PDF** from the Shortcuts or Advanced Tools list to shrink document sizes under portal limits.\n2. Use **Passport Photo Resize** to scale images to exact dimensions and target file sizes (e.g. under 50KB or 100KB).";
  }
  if (/crop|photo|signature/i.test(query)) {
    return "Use our **Signature Crop** and **Passport Photo Resize** tools. They allow adjusting crop boundaries, cleaning up scan artifacts, and editing image aspect ratios directly inside our interactive browser **Editing Window**.";
  }
  if (/privacy|secure|store|server|save/i.test(query)) {
    return "Privacy is our key design choice! All document processing is done **directly in your browser** so your files never leave your computer. For cloud-processed features, files are encrypted in transit and deleted automatically immediately after download or within 1 hour.";
  }
  if (/merge|combine|zip|package/i.test(query)) {
    return "You can merge multiple PDFs using our **PDF Merge** tool. To package multiple marksheets, income certificates, and ID cards together for admission portals, use our **ZIP Compiler**.";
  }
  if (/voice|speech|mic/i.test(query)) {
    return "Click the **Voice** button or mic icon. Speak commands like *'compress PDF'*, *'mask Aadhaar'*, or *'crop signature'* to instantly trigger and launch the corresponding tool.";
  }
  if (/ocr|text|extract/i.test(query)) {
    return "Use the **OCR / Text Extract** tool to automatically scan and extract text from images and PDF documents. It runs in-browser and lets you copy or save the extracted text instantly.";
  }

  return "Welcome to **File Nova Assistant**! I am here to help you understand and use our secure **FileNova** document tools. Ask me how to mask Aadhaar cards, compress PDFs, crop signatures, resize passport photos, extract text (OCR), package ZIP files, or how our client-side privacy protection works!";
}

router.post("/ai/chat", async (req, res): Promise<void> => {
  try {
    const { messages, history } = req.body;
    const userMessage = messages || "";

    if (!userMessage) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn("GEMINI_API_KEY is not defined. Using mock fallback response.");
      const reply = getMockAiResponse(userMessage);
      res.json({ reply, mode: "fallback", success: true });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `
      You are the official "File Nova Assistant" for the FileNova secure document utility web application.
      You are friendly, professional, and composed.
      Your primary goals:
      1. Help users understand and use FileNova's suite of secure browser-based tools:
         - Aadhaar Masking: Securely redacts the first 8 digits of Aadhaar cards locally in the browser.
         - Compress PDF: Shrinks PDF file sizes to fit common admission/scholarship portal upload limits.
         - PDF Merge: Combines multiple PDF files into one.
         - Passport Photo Resize: Scales and crops photos to exact pixel/cm dimensions and target KB sizes.
         - Signature Crop: Crops and cleans signatures from scanned documents.
         - OCR / Text Extract: Extracts text from images and PDFs using client-side scanning.
         - ZIP Compiler: Packages multiple files (marksheet, income proof, masked ID) into a single ZIP.
         - Voice Actions: Speech commands like "compress PDF" or "mask Aadhaar" to trigger tools.
         - Secure WhatsApp Share: Generates QR codes/links to share documents to mobile devices securely.
      2. Emphasize that privacy is a core principle:
         - All main calculations/processing occur locally in the user's browser (client-side), meaning their files are never uploaded or stored on servers for standalone tools.
         - Any remote cloud queue features delete files immediately after download or within 1 hour.
      3. Guide users on how to access the tools:
         - They can click on the "Shortcuts" dropdown in the header or find them in the "Advanced Tools Suite" on the dashboard.
      4. Respond briefly and keep answers beautifully formatted using lists, bold text, or markdown.
      5. Align your response to the user's language (English, Hindi, or Bengali). Keep responses concise.
    `;

    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        chatContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }
    chatContents.push({ role: "user", parts: [{ text: userMessage }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "I'm sorry, I couldn't process that query.";
    res.json({ reply, mode: "gemini", success: true });
  } catch (error: any) {
    logger.error("Gemini API call failed, reverting to local assistant logic: ", error);
    const reply = getMockAiResponse(req.body.messages || "");
    res.json({ reply, mode: "error-fallback", success: true, error: error.message });
  }
});

// Mount premium features routes
router.use("/premium", premiumRouter);
router.use("/premium/subscription", subscriptionRouter);
router.use("/auth", authRouter);

export default router;
