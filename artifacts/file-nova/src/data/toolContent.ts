/**
 * toolContent.ts
 * ──────────────────────────────────────────────────────────────
 * Central SEO content store for every dedicated tool landing page.
 * Edit this file to update tool copy, FAQs, steps, or related links
 * without touching any component code.
 *
 * Each key maps to a canonical URL slug:
 *   "compress-pdf"   →  filenova.in/compress-pdf
 *   "merge-pdf"      →  filenova.in/merge-pdf
 *   ... etc.
 */

export interface ToolStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface RelatedTool {
  slug: string;         // canonical slug, e.g. "merge-pdf"
  title: string;
  description: string;
  icon: string;         // emoji or lucide icon name hint
}

export interface ToolContent {
  /** canonical slug — matches the URL path segment */
  slug: string;
  /** Exact H1 text */
  h1: string;
  /** 1-sentence tool title for meta title tag */
  metaTitle: string;
  /** 150-160 char meta description */
  metaDescription: string;
  /** Comma-separated keywords */
  keywords: string;
  /** Short intro paragraph shown directly below H1 */
  intro: string;
  /** Breadcrumb parent label + slug, e.g. ["PDF Tools", "/tools"] */
  breadcrumb: [string, string];
  /** Tool colour theme accent for the page */
  accentColor: "indigo" | "purple" | "emerald" | "amber" | "rose" | "sky";
  /** 3-4 benefit bullets */
  benefits: ToolBenefit[];
  /** 3-5 numbered steps */
  steps: ToolStep[];
  /** 4-6 FAQ items — rendered inline in HTML (no lazy load) */
  faqs: ToolFaq[];
  /** 3-4 related tools shown at bottom */
  relatedTools: RelatedTool[];
  /** Schema.org applicationCategory for SoftwareApplication */
  schemaCategory: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOL CATALOG
// ─────────────────────────────────────────────────────────────────────────────

export const TOOL_CONTENT: Record<string, ToolContent> = {

  // ── 1. COMPRESS PDF ────────────────────────────────────────────────────────
  "compress-pdf": {
    slug: "compress-pdf",
    h1: "Compress PDF Online — Free, Fast & Secure",
    metaTitle: "Compress PDF Online Free — Reduce PDF Size Instantly | FileNova",
    metaDescription:
      "Compress PDF files to under 200KB instantly — no uploads, 100% browser-based. Perfect for OASIS, Banglar Shiksha, and government portals. Free forever.",
    keywords:
      "compress pdf, reduce pdf size, pdf compressor online, free pdf compressor, compress pdf under 200kb, pdf size reducer india, oasis pdf upload, banglar shiksha pdf",
    intro:
      "Need to fit a PDF into a government portal's strict file-size limit? FileNova's PDF compressor reduces any PDF to under 200KB — entirely inside your browser, with zero uploads to any server. Your documents stay private, processing is instant, and it's 100% free.",
    breadcrumb: ["PDF Tools", "/tools"],
    accentColor: "indigo",
    benefits: [
      {
        icon: "🔒",
        title: "100% Private",
        description: "All compression happens inside your browser. Your files never leave your device.",
      },
      {
        icon: "⚡",
        title: "Instant Results",
        description: "No queue, no wait. PDF compressed in seconds using client-side processing.",
      },
      {
        icon: "📱",
        title: "Works on Mobile",
        description: "Optimised for Android & iOS. Compress PDFs straight from your phone.",
      },
      {
        icon: "🆓",
        title: "Completely Free",
        description: "No sign-up, no watermarks, no limits. Always free for Indian students & CSC operators.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your PDF",
        description:
          "Click 'Upload PDF' or drag and drop your file into the workspace. Supports PDFs up to 50MB.",
      },
      {
        step: 2,
        title: "Choose compression level",
        description:
          "Select Low, Medium, or High compression. For portal uploads, 'High' typically outputs files under 200KB.",
      },
      {
        step: 3,
        title: "Click Compress",
        description:
          "Hit the Compress button. The PDF is processed instantly in your browser — no internet needed after load.",
      },
      {
        step: 4,
        title: "Download your file",
        description:
          "Download the compressed PDF directly. Check the new file size shown — ready for any portal upload.",
      },
    ],
    faqs: [
      {
        question: "How small can FileNova compress a PDF?",
        answer:
          "FileNova can typically reduce scanned PDFs by 60–80%. Most government documents that start at 2–5MB will compress to under 200KB on 'High' mode. Results vary based on the original content type (scanned images compress more than text-heavy PDFs).",
      },
      {
        question: "Is my PDF data safe?",
        answer:
          "Yes. FileNova processes everything inside your browser using JavaScript and WebAssembly. Your PDF is never uploaded to any server. Once you close the tab, no trace of your file remains.",
      },
      {
        question: "Which portals require compressed PDFs?",
        answer:
          "Common Indian government portals with file-size limits include OASIS Scholarship (West Bengal), Banglar Shiksha, NSP National Scholarship Portal, Kanyashree, SVMCM, and most state-level e-district portals. The 200KB limit is the most common restriction.",
      },
      {
        question: "Will compressing reduce PDF quality?",
        answer:
          "Text-based PDFs retain full quality. Scanned image PDFs will see slight image quality reduction at higher compression, but text remains readable. Use 'Medium' compression for the best quality-to-size ratio.",
      },
      {
        question: "Does this work offline?",
        answer:
          "Yes, once the page loads. FileNova uses service workers, so after the first visit you can compress PDFs even without an internet connection.",
      },
    ],
    relatedTools: [
      {
        slug: "merge-pdf",
        title: "Merge PDF",
        description: "Combine multiple PDFs into one file",
        icon: "📄",
      },
      {
        slug: "image-to-pdf",
        title: "Image to PDF",
        description: "Convert JPG/PNG photos to PDF",
        icon: "🖼️",
      },
      {
        slug: "ocr",
        title: "OCR PDF Scanner",
        description: "Extract text from scanned PDFs",
        icon: "🔍",
      },
      {
        slug: "word-to-pdf",
        title: "Word to PDF",
        description: "Convert DOCX files to PDF",
        icon: "📝",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 2. MERGE PDF ───────────────────────────────────────────────────────────
  "merge-pdf": {
    slug: "merge-pdf",
    h1: "Merge PDF Files Online — Free & Instant",
    metaTitle: "Merge PDF Files Free Online — Combine PDFs in Seconds | FileNova",
    metaDescription:
      "Merge multiple PDF files into one document instantly. 100% free, browser-based, no file uploads. Reorder pages, combine certificates, and download in seconds.",
    keywords:
      "merge pdf, combine pdf files, join pdf online, pdf merger free, merge pdf online india, combine pdf without upload, free pdf joiner",
    intro:
      "Combine any number of PDF documents into a single, organised file — instantly, for free, and without uploading anything to a server. Perfect for combining income certificates, marksheets, Aadhaar cards, and bank passbooks into one PDF for scholarship applications.",
    breadcrumb: ["PDF Tools", "/tools"],
    accentColor: "purple",
    benefits: [
      {
        icon: "📦",
        title: "Combine unlimited files",
        description: "Merge 2, 5, or 20 PDFs into a single document with drag-to-reorder support.",
      },
      {
        icon: "🔒",
        title: "No server uploads",
        description: "Merging happens 100% locally in your browser. Documents are never exposed.",
      },
      {
        icon: "↕️",
        title: "Reorder freely",
        description: "Drag and drop files to set your exact page order before merging.",
      },
      {
        icon: "🆓",
        title: "Forever free",
        description: "No registration, no watermarks, no hidden costs. Just merge and download.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your PDF files",
        description:
          "Click 'Upload PDFs' or drag multiple PDF files into the workspace. You can add as many as needed.",
      },
      {
        step: 2,
        title: "Arrange page order",
        description:
          "Drag the files into the order you want them to appear in the merged document.",
      },
      {
        step: 3,
        title: "Click Merge PDF",
        description:
          "Hit the Merge button. All PDFs are combined instantly in your browser.",
      },
      {
        step: 4,
        title: "Download merged PDF",
        description:
          "Download your merged PDF file. File is automatically cleared after 1 hour for privacy.",
      },
    ],
    faqs: [
      {
        question: "How many PDFs can I merge at once?",
        answer:
          "FileNova supports merging unlimited PDFs in a single session, though performance is best for files totalling under 100MB. For scholarship applications, you rarely need more than 5–10 documents.",
      },
      {
        question: "Can I reorder pages in the merged PDF?",
        answer:
          "Yes. Before merging, you can drag and drop the uploaded files to reorder them. The final PDF will follow exactly the order you set.",
      },
      {
        question: "Is this useful for scholarship applications?",
        answer:
          "Absolutely. Many portals like NSP, OASIS, and SVMCM require all documents submitted as a single PDF. Use FileNova to merge your income certificate, Aadhaar, marksheet, and bank passbook into one file.",
      },
      {
        question: "Will the merged PDF maintain the original quality?",
        answer:
          "Yes. FileNova merges PDFs without re-encoding content, so text sharpness, image quality, and embedded fonts remain unchanged.",
      },
      {
        question: "Can I merge password-protected PDFs?",
        answer:
          "Currently FileNova does not support merging password-protected PDFs. You'll need to unlock them first using the PDF Unlock tool, then merge.",
      },
    ],
    relatedTools: [
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Reduce PDF size after merging",
        icon: "📉",
      },
      {
        slug: "image-to-pdf",
        title: "Image to PDF",
        description: "Convert photos to PDF before merging",
        icon: "🖼️",
      },
      {
        slug: "scholarship-zip",
        title: "Scholarship ZIP",
        description: "Pack all docs into a portal-ready ZIP",
        icon: "🎓",
      },
      {
        slug: "ocr",
        title: "OCR Scanner",
        description: "Extract text from scanned certificates",
        icon: "🔍",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 3. IMAGE TO PDF ────────────────────────────────────────────────────────
  "image-to-pdf": {
    slug: "image-to-pdf",
    h1: "Convert Images to PDF Online — JPG, PNG & WebP",
    metaTitle: "Image to PDF Converter Free — JPG PNG to PDF Online | FileNova",
    metaDescription:
      "Convert multiple JPG, PNG, or WebP images into a single PDF file in seconds. Free, browser-based, no uploads. Perfect for combining scanned certificates.",
    keywords:
      "image to pdf, jpg to pdf, png to pdf, convert image to pdf, photos to pdf, multiple images to pdf, free image pdf converter online",
    intro:
      "Turn your scanned photos, certificates, and ID images into a clean, single PDF — instantly, in your browser. Whether you photographed your marksheet on your phone or scanned an income certificate, FileNova converts and combines images to PDF without any upload.",
    breadcrumb: ["PDF Tools", "/tools"],
    accentColor: "emerald",
    benefits: [
      {
        icon: "📸",
        title: "Multiple image formats",
        description: "Supports JPG, JPEG, PNG, WebP, and BMP. Mix formats in a single PDF.",
      },
      {
        icon: "📐",
        title: "Auto-fit to A4",
        description: "Images are automatically fitted to A4 page dimensions for standard document output.",
      },
      {
        icon: "🔒",
        title: "Browser-only processing",
        description: "Images never leave your device. All conversion happens locally.",
      },
      {
        icon: "🆓",
        title: "Free & unlimited",
        description: "No registration required. Convert as many images as you need.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your images",
        description:
          "Click 'Upload Images' or drag your JPG/PNG/WebP files. You can select multiple images at once.",
      },
      {
        step: 2,
        title: "Arrange image order",
        description:
          "Drag images to set the order they'll appear as pages in the final PDF.",
      },
      {
        step: 3,
        title: "Convert to PDF",
        description:
          "Click 'Convert to PDF'. Each image becomes a page in your new PDF document.",
      },
      {
        step: 4,
        title: "Download your PDF",
        description:
          "Download the ready-to-submit PDF. Compress it next if a size limit applies.",
      },
    ],
    faqs: [
      {
        question: "Which image formats are supported?",
        answer:
          "FileNova supports JPG, JPEG, PNG, WebP, and BMP. You can mix different formats in a single conversion — for example, combine a JPG photo with PNG screenshots.",
      },
      {
        question: "How many images can I convert at once?",
        answer:
          "There is no hard limit. Practically, converting up to 30–40 images works smoothly on most devices. For very large batches, processing may take 10–20 seconds.",
      },
      {
        question: "Will the image quality be preserved in the PDF?",
        answer:
          "Yes. FileNova embeds your images at their original resolution. No automatic quality downgrade happens during conversion unless you apply compression separately.",
      },
      {
        question: "Can I convert a single photo to PDF?",
        answer:
          "Yes. Upload just one image and convert it to a single-page PDF. This is commonly used to make phone-photographed certificates submission-ready.",
      },
      {
        question: "What should I do if the PDF file size is too large after conversion?",
        answer:
          "Use the Compress PDF tool after converting. You can compress the resulting PDF to meet portal file-size limits like 200KB or 500KB.",
      },
    ],
    relatedTools: [
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Shrink the converted PDF to fit portal limits",
        icon: "📉",
      },
      {
        slug: "merge-pdf",
        title: "Merge PDF",
        description: "Combine this PDF with other documents",
        icon: "📄",
      },
      {
        slug: "resize-image",
        title: "Resize Image",
        description: "Resize photos to exact dimensions first",
        icon: "🖼️",
      },
      {
        slug: "pdf-to-image",
        title: "PDF to Image",
        description: "Convert PDF pages back to images",
        icon: "🔄",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 4. PDF TO IMAGE ────────────────────────────────────────────────────────
  "pdf-to-image": {
    slug: "pdf-to-image",
    h1: "Convert PDF to Image Online — Free PDF to JPG/PNG",
    metaTitle: "PDF to Image Converter Free — PDF to JPG/PNG Online | FileNova",
    metaDescription:
      "Convert PDF pages to high-quality JPG or PNG images online. 100% free, browser-based, no sign-up. Extract individual pages or convert entire PDFs to images.",
    keywords:
      "pdf to image, pdf to jpg, pdf to png, convert pdf to image, pdf page to image, extract pdf pages as images, free pdf image converter",
    intro:
      "Extract any page from a PDF as a high-quality JPG or PNG image — without any software or server upload. Use this to grab a certificate page, extract a signature, or convert a scanned PDF into editable image files.",
    breadcrumb: ["PDF Tools", "/tools"],
    accentColor: "sky",
    benefits: [
      {
        icon: "📄",
        title: "Page-by-page extraction",
        description: "Convert all pages or select specific pages to extract as individual images.",
      },
      {
        icon: "🎯",
        title: "High resolution output",
        description: "Get crisp 150dpi+ images suitable for printing or re-uploading.",
      },
      {
        icon: "🔒",
        title: "Private & local",
        description: "PDFs are processed in your browser. No files sent to any server.",
      },
      {
        icon: "🆓",
        title: "No registration",
        description: "Completely free. No account, no watermarks, no limits.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your PDF",
        description: "Click 'Upload PDF' or drag your PDF file into the workspace.",
      },
      {
        step: 2,
        title: "Select pages to convert",
        description: "Choose to convert all pages or select specific page numbers.",
      },
      {
        step: 3,
        title: "Choose output format",
        description: "Select JPG for smaller file size or PNG for transparency support.",
      },
      {
        step: 4,
        title: "Download your images",
        description: "Download images individually or as a ZIP file if converting multiple pages.",
      },
    ],
    faqs: [
      {
        question: "What image formats can I export to?",
        answer:
          "FileNova currently exports PDF pages as JPG (smaller file size, great for photos) or PNG (supports transparency, better for text-heavy documents).",
      },
      {
        question: "Can I convert only specific pages?",
        answer:
          "Yes. You can specify a page range (e.g., pages 1–3) or select individual pages to extract instead of converting the entire document.",
      },
      {
        question: "What resolution are the output images?",
        answer:
          "Output images are generated at 150dpi by default, which provides good quality for most purposes. This is sufficient for re-uploading to government portals.",
      },
      {
        question: "Is there a limit on PDF file size?",
        answer:
          "FileNova handles PDFs up to ~50MB efficiently in-browser. Very large PDFs may take longer to process depending on your device's RAM.",
      },
      {
        question: "Can I use this to extract a signature from a PDF?",
        answer:
          "Yes. Convert the relevant PDF page to a PNG image, then crop the signature using any image editor. This is commonly done for signature extraction from bank documents.",
      },
    ],
    relatedTools: [
      {
        slug: "image-to-pdf",
        title: "Image to PDF",
        description: "Convert images back to PDF",
        icon: "🖼️",
      },
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Reduce PDF size before conversion",
        icon: "📉",
      },
      {
        slug: "resize-image",
        title: "Resize Image",
        description: "Resize the extracted images to required dimensions",
        icon: "📐",
      },
      {
        slug: "ocr",
        title: "OCR Scanner",
        description: "Extract text from PDF pages directly",
        icon: "🔍",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 5. OCR ─────────────────────────────────────────────────────────────────
  "ocr": {
    slug: "ocr",
    h1: "OCR PDF Scanner — Extract Text from Scanned Documents",
    metaTitle: "OCR PDF Online Free — Extract Text from Scanned Certificates | FileNova",
    metaDescription:
      "Extract editable text from scanned PDFs, Aadhaar cards, and certificates using AI-powered OCR. Free, browser-based, no server upload required.",
    keywords:
      "ocr pdf, ocr online free, extract text from pdf, scan to text, pdf text extraction, aadhaar ocr, certificate text extraction, ocr tool india",
    intro:
      "Pull editable text out of any scanned PDF, certificate image, or photo using AI-powered OCR (Optical Character Recognition). No server uploads, no subscription — just accurate text extraction in seconds. Ideal for digitising Aadhaar cards, mark sheets, and government certificates.",
    breadcrumb: ["AI Tools", "/tools"],
    accentColor: "purple",
    benefits: [
      {
        icon: "🤖",
        title: "AI-powered accuracy",
        description: "Advanced OCR engine handles handwritten notes, printed certificates, and stamps.",
      },
      {
        icon: "📋",
        title: "Copy-ready text",
        description: "Extracted text is formatted and ready to copy-paste into any form or document.",
      },
      {
        icon: "🔒",
        title: "Zero server upload",
        description: "OCR processing happens locally. Your scanned documents stay on your device.",
      },
      {
        icon: "🌐",
        title: "Multi-language support",
        description: "Works with English and Hindi text in scanned documents.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your scanned PDF or image",
        description: "Upload any scanned document — PDF, JPG, or PNG — using the upload button.",
      },
      {
        step: 2,
        title: "Select language (if needed)",
        description: "Choose English or Hindi for better accuracy on regional documents.",
      },
      {
        step: 3,
        title: "Run OCR scan",
        description: "Click 'Extract Text'. The AI engine analyses every character on the page.",
      },
      {
        step: 4,
        title: "Copy or download the text",
        description: "Review the extracted text, copy it directly, or download as a .txt file.",
      },
    ],
    faqs: [
      {
        question: "What types of documents work best with OCR?",
        answer:
          "Printed documents with clear contrast work best — certificates, Aadhaar cards, bank statements, and mark sheets. Handwritten content can be extracted but with lower accuracy.",
      },
      {
        question: "Does OCR work on Hindi or regional language PDFs?",
        answer:
          "Yes. FileNova's OCR supports English and Hindi. Other regional Indian languages are partially supported. For best results, use clean, high-contrast scans.",
      },
      {
        question: "How accurate is the OCR?",
        answer:
          "For standard printed documents, accuracy is typically 90–98%. For low-quality scans, faded ink, or handwriting, accuracy may be lower. You can edit the extracted text before copying.",
      },
      {
        question: "Can I extract text from a photographed document?",
        answer:
          "Yes. Upload a JPG or PNG photo of a document. For best results, photograph in good lighting and ensure the document is flat and fully in frame.",
      },
      {
        question: "Is the extracted text searchable?",
        answer:
          "The extracted text is plain text that you can copy, paste, search through, or export as a .txt file. It is not embedded back into the PDF as searchable text (PDF/A format) in the current version.",
      },
    ],
    relatedTools: [
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Compress the scanned PDF after extraction",
        icon: "📉",
      },
      {
        slug: "pdf-to-image",
        title: "PDF to Image",
        description: "Convert PDF pages to images for editing",
        icon: "🖼️",
      },
      {
        slug: "ai-pdf-summary",
        title: "AI PDF Summarizer",
        description: "Summarise the extracted text with AI",
        icon: "🤖",
      },
      {
        slug: "merge-pdf",
        title: "Merge PDF",
        description: "Combine scanned PDFs into one document",
        icon: "📄",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 6. RESIZE IMAGE ────────────────────────────────────────────────────────
  "resize-image": {
    slug: "resize-image",
    h1: "Resize Image Online Free — Photo & Signature Resizer",
    metaTitle: "Resize Image Online Free — Resize Photo & Signature for Portals | FileNova",
    metaDescription:
      "Resize passport photos, signatures, and ID images to exact dimensions for government, scholarship, and job portals. Free, instant, no uploads.",
    keywords:
      "resize image online, resize photo free, resize signature online, passport photo resize, photo resize kb, government portal photo size, resize image to kb",
    intro:
      "Resize any photo or signature image to the exact pixel dimensions or file size required by government portals, job applications, and scholarship forms. Supports custom width/height, preset portal sizes, and file-size compression — all in your browser.",
    breadcrumb: ["Image Tools", "/tools"],
    accentColor: "emerald",
    benefits: [
      {
        icon: "📏",
        title: "Exact pixel dimensions",
        description: "Set precise width and height in pixels to match any portal's requirements.",
      },
      {
        icon: "🎯",
        title: "Portal presets",
        description: "One-click presets for passport photo (200×230px), signature (280×80px), and Aadhaar (856×540px).",
      },
      {
        icon: "📦",
        title: "File-size control",
        description: "Compress the output to a target file size like 20KB, 50KB, or 100KB.",
      },
      {
        icon: "🔒",
        title: "No upload needed",
        description: "Resizing is done entirely in your browser. Your photos are never sent anywhere.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your image",
        description: "Click 'Upload Image' or drag a JPG, PNG, or WebP file into the workspace.",
      },
      {
        step: 2,
        title: "Set target dimensions",
        description:
          "Enter the required width and height in pixels, or choose a preset like 'Passport Photo 200×230'.",
      },
      {
        step: 3,
        title: "Choose output format",
        description: "Select JPG, PNG, or WebP. JPG is recommended for photos; PNG for signatures.",
      },
      {
        step: 4,
        title: "Download resized image",
        description: "Download your resized image. Check the KB file size — compress further if needed.",
      },
    ],
    faqs: [
      {
        question: "What is the standard passport photo size for Indian portals?",
        answer:
          "Most Indian government portals require passport photos at 200×230 pixels with a file size under 100KB in JPG format. FileNova has a one-click preset for this.",
      },
      {
        question: "What is the standard signature size for online applications?",
        answer:
          "The most common signature requirement is 280×80 pixels or 280×90 pixels, under 30KB in JPG or PNG format. Use the 'Signature' preset in FileNova.",
      },
      {
        question: "Can I resize an image to a specific file size (KB)?",
        answer:
          "Yes. After setting dimensions, you can also specify a maximum file size target in KB. FileNova will adjust JPEG quality automatically to meet that target.",
      },
      {
        question: "Does resizing reduce image quality?",
        answer:
          "Resizing to smaller dimensions does reduce pixel count, which may soften very fine detail. For most application photo use-cases, the quality reduction is not noticeable.",
      },
      {
        question: "Can I resize a signature image from a scanned document?",
        answer:
          "Yes. Upload a photo or scan of your physical signature, resize it to the required dimensions, and save as PNG with a transparent or white background. This is ready for form upload.",
      },
    ],
    relatedTools: [
      {
        slug: "image-to-pdf",
        title: "Image to PDF",
        description: "Convert resized images to PDF",
        icon: "📄",
      },
      {
        slug: "remove-background",
        title: "Remove Background",
        description: "Get a transparent background for passport photos",
        icon: "✂️",
      },
      {
        slug: "aadhaar-mask",
        title: "Aadhaar Masking",
        description: "Mask your Aadhaar card for secure uploads",
        icon: "🛡️",
      },
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Compress documents after creating PDFs",
        icon: "📉",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 7. REMOVE BACKGROUND ──────────────────────────────────────────────────
  "remove-background": {
    slug: "remove-background",
    h1: "Remove Image Background Online Free — AI Background Remover",
    metaTitle: "Remove Image Background Free Online — AI BG Remover | FileNova",
    metaDescription:
      "Remove photo backgrounds instantly with AI. Get a transparent PNG in seconds — no sign-up, no Photoshop needed. Perfect for passport photos and product images.",
    keywords:
      "remove background online, ai background remover, remove bg free, transparent background, photo background removal, remove image background free, passport photo transparent",
    intro:
      "Instantly remove the background from any photo using AI — no Photoshop, no design skills needed. Get a clean transparent PNG in seconds. Perfect for passport photo creation, product images, profile pictures, and scholarship portal uploads.",
    breadcrumb: ["Image Tools", "/tools"],
    accentColor: "rose",
    benefits: [
      {
        icon: "🤖",
        title: "AI-powered precision",
        description: "Our AI model handles hair, fingers, and complex edges with remarkable accuracy.",
      },
      {
        icon: "⚡",
        title: "Seconds, not minutes",
        description: "Background removal completes in under 10 seconds for most photos.",
      },
      {
        icon: "🎨",
        title: "Replace with any colour",
        description: "Add a white, red, blue, or custom background colour after removal.",
      },
      {
        icon: "🆓",
        title: "No watermarks",
        description: "Download the full-resolution result without any watermark, completely free.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your photo",
        description: "Click 'Upload Image' or drag your JPG/PNG photo into the workspace.",
      },
      {
        step: 2,
        title: "AI removes the background",
        description: "FileNova's AI model analyses the image and removes the background automatically.",
      },
      {
        step: 3,
        title: "Optionally add a new background",
        description: "Choose a solid colour (e.g., white for passport photos) or keep it transparent.",
      },
      {
        step: 4,
        title: "Download your image",
        description: "Download the result as a high-quality PNG with transparent or coloured background.",
      },
    ],
    faqs: [
      {
        question: "What types of images work best?",
        answer:
          "Photos with a clear subject (person, product, animal) against a relatively uniform background work best. Studio-style photos on plain backgrounds yield near-perfect results.",
      },
      {
        question: "Can I add a white background for passport photos?",
        answer:
          "Yes. After removing the background, select 'White' in the background colour picker. This creates a standard passport photo background required by most Indian government portals.",
      },
      {
        question: "Is the background removal 100% accurate?",
        answer:
          "For most subject types, accuracy is very high (85–99%). Complex backgrounds, camouflage clothing, or very fine hair may require minor manual touch-up.",
      },
      {
        question: "Does my photo get uploaded to a server?",
        answer:
          "Background removal runs through an on-device AI model (ONNX Runtime). Your image never leaves your browser. This is completely private.",
      },
      {
        question: "What resolution is the output?",
        answer:
          "The output PNG is at the same resolution as your input photo. No quality is lost during the background removal process.",
      },
    ],
    relatedTools: [
      {
        slug: "resize-image",
        title: "Resize Image",
        description: "Resize to passport photo dimensions after removal",
        icon: "📐",
      },
      {
        slug: "image-to-pdf",
        title: "Image to PDF",
        description: "Convert the result to PDF",
        icon: "📄",
      },
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Compress documents for portal upload",
        icon: "📉",
      },
      {
        slug: "aadhaar-mask",
        title: "Aadhaar Masking",
        description: "Secure your Aadhaar card for submission",
        icon: "🛡️",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 8. AADHAAR MASKING ────────────────────────────────────────────────────
  "aadhaar-mask": {
    slug: "aadhaar-mask",
    h1: "Aadhaar Card Masking Tool — Hide First 8 Digits Online",
    metaTitle: "Aadhaar Card Masking Free Online — UIDAI Compliant | FileNova",
    metaDescription:
      "Mask the first 8 digits of your Aadhaar card for safe portal uploads. UIDAI-compliant, 100% browser-based, zero server uploads. Trusted by 10,000+ users.",
    keywords:
      "aadhaar masking, aadhaar card mask online, hide aadhaar number, uidai masked aadhaar, masked aadhaar download, aadhaar privacy, aadhaar first 8 digits hide",
    intro:
      "Protect your Aadhaar card privacy by masking the first 8 of 12 digits — exactly as required by UIDAI guidelines. This masked version is accepted by all government portals for identity verification. Processing is 100% local; your Aadhaar image never reaches any server.",
    breadcrumb: ["Indian Portal Tools", "/tools"],
    accentColor: "amber",
    benefits: [
      {
        icon: "🛡️",
        title: "UIDAI-compliant masking",
        description: "Masks exactly the first 8 digits, leaving the last 4 visible as per UIDAI norms.",
      },
      {
        icon: "🔒",
        title: "Zero data exposure",
        description: "Your Aadhaar is processed entirely in your browser. No image is ever uploaded.",
      },
      {
        icon: "✅",
        title: "Accepted by all portals",
        description: "The masked output is accepted by NSP, OASIS, Banglar Shiksha, and all state portals.",
      },
      {
        icon: "⚡",
        title: "Instant download",
        description: "Download your masked Aadhaar card image in under 5 seconds.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your Aadhaar card image",
        description: "Upload a JPG or PNG photo or scan of your Aadhaar card (front side).",
      },
      {
        step: 2,
        title: "Automatic digit detection",
        description: "FileNova detects the 12-digit Aadhaar number and highlights the first 8 digits.",
      },
      {
        step: 3,
        title: "Confirm masking area",
        description:
          "Review the auto-detected masking. Manually adjust the mask position if needed.",
      },
      {
        step: 4,
        title: "Download masked Aadhaar",
        description: "Download your masked Aadhaar card image in the original format (JPG or PNG).",
      },
    ],
    faqs: [
      {
        question: "Why should I mask my Aadhaar?",
        answer:
          "UIDAI (the Aadhaar authority) recommends sharing only a 'masked' Aadhaar where the first 8 digits are hidden, especially for online submissions. This reduces the risk of identity theft if the document is intercepted.",
      },
      {
        question: "Is masked Aadhaar accepted by government portals?",
        answer:
          "Yes. All major portals — NSP, OASIS, Banglar Shiksha, Kanyashree, SVMCM, and e-district portals — accept masked Aadhaar for identity verification purposes.",
      },
      {
        question: "Does this tool upload my Aadhaar anywhere?",
        answer:
          "Absolutely not. The entire masking process runs in your browser using client-side JavaScript and Canvas API. Your Aadhaar image is never transmitted to any server.",
      },
      {
        question: "What if the tool doesn't detect my Aadhaar number correctly?",
        answer:
          "You can manually drag to position the black masking rectangle over the first 8 digits. This always works regardless of the scan quality or Aadhaar card version.",
      },
      {
        question: "Can I mask both front and back of Aadhaar?",
        answer:
          "Yes. Process each side separately. Most portals only require the front side with masked digits, but you can mask both for extra security.",
      },
    ],
    relatedTools: [
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Compress Aadhaar PDF for portal upload",
        icon: "📉",
      },
      {
        slug: "resize-image",
        title: "Resize Image",
        description: "Resize Aadhaar image to portal dimensions",
        icon: "📐",
      },
      {
        slug: "scholarship-zip",
        title: "Scholarship ZIP",
        description: "Pack Aadhaar with other docs into a ZIP",
        icon: "🎓",
      },
      {
        slug: "image-to-pdf",
        title: "Image to PDF",
        description: "Convert masked Aadhaar image to PDF",
        icon: "📄",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 9. PAN CARD RESIZE ────────────────────────────────────────────────────
  "pan-card-resize": {
    slug: "pan-card-resize",
    h1: "PAN Card Photo & Signature Resize for NSDL/UTI Upload",
    metaTitle: "PAN Card Photo Resize Free — NSDL UTI Upload Ready | FileNova",
    metaDescription:
      "Resize PAN card photos and signatures to exact NSDL/UTI specifications instantly. Free, browser-based. 200×230px photo and 280×80px signature ready in seconds.",
    keywords:
      "pan card photo resize, nsdl photo size, uti pan signature size, pan application photo size, resize pan card photo online, nsdl upload photo size",
    intro:
      "Resize your photo and signature to the exact pixel dimensions required by NSDL and UTI PAN card application portals. No guesswork — just upload, auto-resize, and download. Your file never leaves your browser.",
    breadcrumb: ["Indian Portal Tools", "/tools"],
    accentColor: "amber",
    benefits: [
      {
        icon: "📋",
        title: "Pre-configured NSDL specs",
        description: "One-click resize to 200×230px (photo) and 280×80px (signature) — NSDL/UTI ready.",
      },
      {
        icon: "⚡",
        title: "Instant processing",
        description: "Resize and compress both photo and signature in under 3 seconds.",
      },
      {
        icon: "🔒",
        title: "Local processing",
        description: "Files processed in-browser. Your PAN card photos are never uploaded to a server.",
      },
      {
        icon: "🆓",
        title: "Completely free",
        description: "Free for all users. No sign-up, no watermarks.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your photo",
        description:
          "Upload a clear, white-background passport photo in JPG or PNG format.",
      },
      {
        step: 2,
        title: "Select NSDL or UTI preset",
        description: "Choose the 'NSDL Photo' or 'UTI Photo' preset. Dimensions are applied automatically.",
      },
      {
        step: 3,
        title: "Upload and resize your signature",
        description: "Separately upload your signature image and apply the signature resize preset (280×80px).",
      },
      {
        step: 4,
        title: "Download both files",
        description: "Download your resized photo and signature. Both are now PAN portal upload-ready.",
      },
    ],
    faqs: [
      {
        question: "What size should a PAN card application photo be?",
        answer:
          "NSDL requires photos at 200×230 pixels, in JPG format, under 50KB. UTI requires a similar specification. FileNova's NSDL preset handles all of this automatically.",
      },
      {
        question: "What size should the PAN card signature be?",
        answer:
          "The standard PAN signature dimension is 280×80 pixels, under 30KB in JPG/PNG format. The Signature preset in FileNova sets this up in one click.",
      },
      {
        question: "What if my signature has a dark background?",
        answer:
          "Remove the background first using the Remove Background tool, then resize the resulting transparent PNG. This gives a clean white-background signature as required.",
      },
      {
        question: "Will the resized photo pass portal validation?",
        answer:
          "Yes, as long as the original photo has good lighting, a plain white or off-white background, and the face is clearly visible. Portal validation checks dimensions and file size — both of which FileNova sets correctly.",
      },
    ],
    relatedTools: [
      {
        slug: "remove-background",
        title: "Remove Background",
        description: "Get white-background passport photos",
        icon: "✂️",
      },
      {
        slug: "resize-image",
        title: "Resize Image",
        description: "Custom dimension resizing for any portal",
        icon: "📐",
      },
      {
        slug: "aadhaar-mask",
        title: "Aadhaar Masking",
        description: "Mask your Aadhaar for PAN application",
        icon: "🛡️",
      },
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Compress your PAN application PDF",
        icon: "📉",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 10. WORD TO PDF ───────────────────────────────────────────────────────
  "word-to-pdf": {
    slug: "word-to-pdf",
    h1: "Convert Word to PDF Online — DOCX to PDF Free",
    metaTitle: "Word to PDF Converter Free Online — DOCX to PDF | FileNova",
    metaDescription:
      "Convert Microsoft Word DOCX files to PDF instantly in your browser. Free, no upload, no software needed. Preserve formatting, fonts, and images.",
    keywords:
      "word to pdf, docx to pdf, convert word to pdf, docx pdf converter, free word to pdf online, word document to pdf no upload",
    intro:
      "Convert any Microsoft Word (.docx) document to a professional PDF instantly — no software installation, no server upload. Formatting, fonts, tables, and images are all preserved in the resulting PDF. Download your PDF in under 10 seconds.",
    breadcrumb: ["Office Tools", "/tools"],
    accentColor: "sky",
    benefits: [
      {
        icon: "📝",
        title: "Preserves formatting",
        description: "Fonts, tables, bullet points, and images are faithfully preserved in the output PDF.",
      },
      {
        icon: "🔒",
        title: "No cloud upload",
        description: "Word files are converted entirely in-browser. Your documents stay private.",
      },
      {
        icon: "⚡",
        title: "Fast conversion",
        description: "Most DOCX files convert to PDF in 2–5 seconds regardless of length.",
      },
      {
        icon: "🆓",
        title: "Completely free",
        description: "No Microsoft 365 subscription needed. Free forever on FileNova.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your DOCX file",
        description: "Click 'Upload Word File' or drag your .docx file into the workspace.",
      },
      {
        step: 2,
        title: "Convert to PDF",
        description: "Click 'Convert to PDF'. The file is processed instantly in your browser.",
      },
      {
        step: 3,
        title: "Preview the output",
        description: "Preview the converted PDF to ensure formatting looks correct.",
      },
      {
        step: 4,
        title: "Download your PDF",
        description: "Download the PDF. Compress it with our PDF compressor if needed.",
      },
    ],
    faqs: [
      {
        question: "Does this support .doc (older Word format)?",
        answer:
          "FileNova's current converter supports .docx (Word 2007 and later) format. For older .doc files, you can first open them in Google Docs or LibreOffice and save as .docx before converting.",
      },
      {
        question: "Will my formatting be preserved?",
        answer:
          "Most formatting is preserved, including headings, bold/italic text, numbered lists, and basic tables. Complex formatting with custom fonts or embedded macros may render slightly differently.",
      },
      {
        question: "Is there a file size limit?",
        answer:
          "FileNova handles DOCX files up to 20MB efficiently in-browser. Very large files with many embedded high-resolution images may take longer.",
      },
      {
        question: "Can I convert a password-protected DOCX?",
        answer:
          "No. Password-protected documents cannot be converted without first removing the password. Remove protection in Microsoft Word or LibreOffice, then convert.",
      },
    ],
    relatedTools: [
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Reduce the converted PDF size",
        icon: "📉",
      },
      {
        slug: "merge-pdf",
        title: "Merge PDF",
        description: "Combine the PDF with other documents",
        icon: "📄",
      },
      {
        slug: "ocr",
        title: "OCR Scanner",
        description: "Extract text from scanned documents",
        icon: "🔍",
      },
      {
        slug: "image-to-pdf",
        title: "Image to PDF",
        description: "Convert images to PDF alongside",
        icon: "🖼️",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 11. SCHOLARSHIP ZIP ───────────────────────────────────────────────────
  "scholarship-zip": {
    slug: "scholarship-zip",
    h1: "Scholarship ZIP Maker — SVMCM, OASIS, Kanyashree Docs",
    metaTitle: "Scholarship ZIP Maker Free — OASIS SVMCM Kanyashree Documents | FileNova",
    metaDescription:
      "Compile all scholarship documents — income certificate, marksheet, Aadhaar, bank passbook, photo, and signature — into a portal-ready ZIP file. Free.",
    keywords:
      "scholarship zip maker, oasis scholarship documents, svmcm zip file, kanyashree documents pack, annapurna bhandar scheme zip, scholarship document compiler",
    intro:
      "Compile all required scholarship documents — income certificate, marksheet, Aadhaar card, bank passbook, passport photo, and signature — into a single portal-ready ZIP file with correct file names. One tool, zero confusion.",
    breadcrumb: ["Indian Portal Tools", "/tools"],
    accentColor: "indigo",
    benefits: [
      {
        icon: "🎓",
        title: "Portal-specific presets",
        description: "Presets for OASIS, SVMCM, Kanyashree, NSP, and Annapurna Bhandar Scheme.",
      },
      {
        icon: "📂",
        title: "Auto-named files",
        description: "Files inside the ZIP are named exactly as the portal expects — no renaming needed.",
      },
      {
        icon: "🔒",
        title: "100% local processing",
        description: "ZIP creation happens in your browser. Your scholarship documents never leave your device.",
      },
      {
        icon: "🆓",
        title: "Completely free",
        description: "No subscription needed. This tool is free for all students.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Select your scholarship portal",
        description:
          "Choose your scholarship scheme from the dropdown: OASIS, SVMCM, Kanyashree, NSP, or Annapurna Bhandar.",
      },
      {
        step: 2,
        title: "Upload required documents",
        description:
          "Upload each required document (income certificate, marksheet, Aadhaar, bank passbook, photo, signature).",
      },
      {
        step: 3,
        title: "Verify file sizes",
        description:
          "FileNova checks each file size against portal limits and alerts you if any need compression.",
      },
      {
        step: 4,
        title: "Download your ZIP",
        description:
          "Download the portal-ready ZIP with all documents correctly named and organised.",
      },
    ],
    faqs: [
      {
        question: "Which scholarship portals are supported?",
        answer:
          "FileNova currently supports OASIS (West Bengal), SVMCM, Kanyashree, National Scholarship Portal (NSP), and Annapurna Bhandar Scheme. More portals are being added regularly.",
      },
      {
        question: "What documents are typically required?",
        answer:
          "Most scholarship portals require: Income Certificate, Marksheet (last year), Aadhaar Card, Bank Passbook (first page), Passport Photo (JPG, under 100KB), and Signature (JPG, under 30KB). FileNova provides the full checklist for each portal.",
      },
      {
        question: "Will the ZIP file be accepted by the portal?",
        answer:
          "Yes, provided your documents meet the size and format requirements shown in the checklist. FileNova auto-names files as required by each portal, which is a common source of rejection errors.",
      },
      {
        question: "What if a file is too large for the portal?",
        answer:
          "FileNova shows a warning if any file exceeds the portal's limit. Use the Compress PDF or Resize Image tool to reduce the file size, then replace it in the ZIP maker.",
      },
      {
        question: "Is my scholarship data stored anywhere?",
        answer:
          "No. All document processing and ZIP creation happens locally in your browser. Nothing is stored on any server. Your documents are cleared when you close the tab.",
      },
    ],
    relatedTools: [
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Reduce PDF size to meet portal limits",
        icon: "📉",
      },
      {
        slug: "aadhaar-mask",
        title: "Aadhaar Masking",
        description: "Mask Aadhaar before adding to ZIP",
        icon: "🛡️",
      },
      {
        slug: "resize-image",
        title: "Resize Image",
        description: "Resize photo and signature to required sizes",
        icon: "📐",
      },
      {
        slug: "merge-pdf",
        title: "Merge PDF",
        description: "Combine documents into one PDF if needed",
        icon: "📄",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },

  // ── 12. AI PDF SUMMARY ────────────────────────────────────────────────────
  "ai-pdf-summary": {
    slug: "ai-pdf-summary",
    h1: "AI PDF Summarizer — Summarise Long PDFs Instantly",
    metaTitle: "AI PDF Summarizer Free — Summarise PDF Documents Online | FileNova",
    metaDescription:
      "Generate structured, concise summaries of long PDF documents using AI. Free, browser-based. Perfect for research papers, government circulars, and reports.",
    keywords:
      "ai pdf summarizer, pdf summary generator, summarise pdf online, ai document summary, pdf to summary free, extract key points from pdf",
    intro:
      "Paste or upload any PDF and get a clean, structured summary in seconds — key points, section headings, and main conclusions. Powered by AI, completely free, and no document upload required.",
    breadcrumb: ["AI Tools", "/tools"],
    accentColor: "purple",
    benefits: [
      {
        icon: "🤖",
        title: "AI-powered summaries",
        description: "Extracts key points, headings, and conclusions — not just a first-paragraph grab.",
      },
      {
        icon: "⚡",
        title: "Summaries in seconds",
        description: "A 50-page research paper summarised in under 20 seconds.",
      },
      {
        icon: "📋",
        title: "Structured output",
        description: "Summary is organised into sections with bullet points for easy reading.",
      },
      {
        icon: "🔒",
        title: "Private processing",
        description: "Document text is analysed locally. No full document is sent to external servers.",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload your PDF",
        description: "Upload any PDF — research paper, government circular, report, or textbook chapter.",
      },
      {
        step: 2,
        title: "Select summary length",
        description: "Choose 'Brief' (5 bullet points), 'Standard' (1 page), or 'Detailed' summary.",
      },
      {
        step: 3,
        title: "Generate summary",
        description: "Click 'Summarise'. The AI extracts key information and structures it clearly.",
      },
      {
        step: 4,
        title: "Copy or download",
        description: "Copy the summary to clipboard or download as a .txt file.",
      },
    ],
    faqs: [
      {
        question: "What types of PDFs work best?",
        answer:
          "Text-based PDFs (research papers, reports, articles, circulars) work best. Scanned PDFs with images of text require OCR first — use the OCR tool, then summarise the extracted text.",
      },
      {
        question: "How long can the PDF be?",
        answer:
          "FileNova handles PDFs up to 100 pages efficiently. Very long documents (200+ pages) may produce less accurate summaries as the AI focuses on key sections.",
      },
      {
        question: "Can it summarise government orders or circulars?",
        answer:
          "Yes. Government PDFs with formal language are well-handled. The summary highlights key decisions, dates, and action points — especially useful for understanding new scheme rules quickly.",
      },
      {
        question: "Is this the same as ChatGPT summarisation?",
        answer:
          "FileNova uses a specialised document summarisation model optimised for structured document content. It is not a general chatbot — it focuses specifically on extracting key information from document structure.",
      },
    ],
    relatedTools: [
      {
        slug: "ocr",
        title: "OCR Scanner",
        description: "Extract text from scanned PDFs first",
        icon: "🔍",
      },
      {
        slug: "compress-pdf",
        title: "Compress PDF",
        description: "Reduce PDF size before sharing",
        icon: "📉",
      },
      {
        slug: "merge-pdf",
        title: "Merge PDF",
        description: "Combine multiple documents to summarise",
        icon: "📄",
      },
      {
        slug: "word-to-pdf",
        title: "Word to PDF",
        description: "Convert Word reports to PDF first",
        icon: "📝",
      },
    ],
    schemaCategory: "UtilitiesApplication",
  },
};

/** Returns content for a given canonical slug, or null if not found */
export function getToolContent(slug: string): ToolContent | null {
  return TOOL_CONTENT[slug] ?? null;
}

/** All tool slugs — used for sitemap generation and route listing */
export const ALL_TOOL_SLUGS = Object.keys(TOOL_CONTENT);

/** Map of old /tools/:toolId paths → new canonical slug */
export const LEGACY_TOOL_REDIRECTS: Record<string, string> = {
  "compress-pdf":   "compress-pdf",
  "merge-pdf":      "merge-pdf",
  "images-to-pdf":  "image-to-pdf",
  "pdf-to-images":  "pdf-to-image",
  "pdf-ocr":        "ocr",
  "resize-photo":   "resize-image",
  "remove-bg":      "remove-background",
  "aadhaar-masking":"aadhaar-mask",
  "pan-card":       "pan-card-resize",
  "docx-to-pdf":    "word-to-pdf",
  "scholarship-zip":"scholarship-zip",
  "ai-summarize":   "ai-pdf-summary",
};
