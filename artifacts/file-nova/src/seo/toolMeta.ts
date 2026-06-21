import type { FAQItem } from "@/lib/seo";

export interface ToolMeta {
  title: string;           // 50-60 chars max
  description: string;     // 150-160 chars max
  canonical: string;       // Full URL
  keywords: string;        // comma-separated, India-first
  ogImage?: string;        // OG image URL
  jsonLdFaq?: FAQItem[];   // FAQ structured data (rich results)
  schemaName?: string;     // SoftwareApplication name override
  schemaCategory?: string; // SoftwareApplication applicationCategory
  ratingValue?: string;    // Aggregate rating for rich snippet
  ratingCount?: string;
}

// Category-based OG images for WhatsApp/social previews
const OG_PDF   = "https://filenova.in/og/pdf-tools.png";
const OG_INDIA = "https://filenova.in/og/india-tools.png";
const OG_IMAGE = "https://filenova.in/og/image-tools.png";
const OG_OCR   = "https://filenova.in/og/ocr.png";
const OG_AI    = "https://filenova.in/og/ai-tools.png";
const OG_DOC   = "https://filenova.in/og/doc-tools.png";

export const TOOL_META: Record<string, ToolMeta> = {

  // ─── HOMEPAGE ────────────────────────────────────────────────────────────
  "/": {
    title: "FileNova – Free PDF & Image Tools for India",
    description: "Free online PDF & image tools for Indian students and professionals. Merge, compress, split PDFs. Aadhaar masking, PAN resize, scholarship ZIP, Hindi OCR. 100% browser-based.",
    canonical: "https://filenova.in",
    keywords: "free pdf tools india, pdf tools for students india, aadhaar masking free, pan card resize online, scholarship zip maker, compress pdf india, ocr hindi bengali",
    ogImage: "https://filenova.in/og-default.png",
    jsonLdFaq: [
      { question: "Is FileNova free to use?", answer: "Yes. All core tools on FileNova are completely free with no account required. Files are processed in your browser and never uploaded to any server." },
      { question: "Are my Aadhaar and PAN files safe on FileNova?", answer: "Yes. FileNova processes all files locally in your browser using WebAssembly. Your Aadhaar, PAN, and other documents are never sent to any server." },
      { question: "Does FileNova work offline?", answer: "Most tools (Aadhaar masking, photo resize, image compress) work fully offline after first load. PDF tools require an internet connection for initial WASM download." },
    ],
  },

  // ─── INDIA-EXCLUSIVE TOOLS (highest strategic SEO priority) ──────────────

  "/aadhaar-mask-pdf": {
    title: "Mask Aadhaar Card Online Free – UIDAI Compliant | FileNova",
    description: "Mask Aadhaar card number online free. Hide first 8 digits of Aadhaar PDF instantly — UIDAI compliant. 100% browser-based, files never uploaded. Works for KYC, scholarship, and government portals.",
    canonical: "https://filenova.in/aadhaar-mask-pdf",
    keywords: "mask aadhaar card online free, aadhaar masking online free uidai compliant, compress aadhaar pdf, aadhaar number hide online, aadhaar mask for kyc, aadhaar masking tool india, redact aadhaar digits free",
    ogImage: OG_INDIA,
    schemaName: "Aadhaar Masking Tool",
    schemaCategory: "UtilitiesApplication",
    ratingValue: "4.9",
    ratingCount: "2140",
    jsonLdFaq: [
      { question: "Is Aadhaar masking legal in India?", answer: "Yes. UIDAI officially recommends masking the first 8 digits of the 12-digit Aadhaar number when sharing for non-KYC purposes. FileNova's masking is UIDAI-compliant." },
      { question: "Does FileNova upload my Aadhaar file to a server?", answer: "No. Your Aadhaar PDF is processed entirely inside your browser using WebAssembly. It is never uploaded, stored, or transmitted to any server — not even FileNova's servers." },
      { question: "How do I mask Aadhaar number in a PDF?", answer: "Upload your Aadhaar PDF on FileNova, choose your masking style (black block, blur, or asterisks), and click Process. Download the masked PDF in seconds." },
      { question: "Can I mask Aadhaar for scholarship portal upload?", answer: "Yes. Use the Black Block or Asterisks style to hide the first 8 digits before uploading to OASIS, NSP, Mahadbt, or any scholarship portal." },
      { question: "What is the difference between Aadhaar masking and Aadhaar redaction?", answer: "Masking hides digits visually while the PDF still contains the original. Redaction permanently removes the data. For most government portal submissions, masking is sufficient and UIDAI-recommended." },
    ],
  },

  "/aadhaar-mask": {
    title: "Mask Aadhaar Card Online Free – UIDAI Compliant | FileNova",
    description: "Mask Aadhaar card number online free. Hide first 8 digits of Aadhaar PDF instantly — UIDAI compliant. 100% browser-based, files never uploaded. Works for KYC, scholarship, and government portals.",
    canonical: "https://filenova.in/aadhaar-mask-pdf",
    keywords: "mask aadhaar card online free, aadhaar masking online free uidai compliant, compress aadhaar pdf, aadhaar number hide online, aadhaar mask for kyc, redact aadhaar digits free",
    ogImage: OG_INDIA,
    schemaName: "Aadhaar Masking Tool",
    ratingValue: "4.9",
    ratingCount: "2140",
    jsonLdFaq: [
      { question: "Is Aadhaar masking legal in India?", answer: "Yes. UIDAI officially recommends masking the first 8 digits of the 12-digit Aadhaar number when sharing for non-KYC purposes. FileNova's masking is UIDAI-compliant." },
      { question: "Does FileNova upload my Aadhaar file to a server?", answer: "No. Your Aadhaar PDF is processed entirely inside your browser. It is never uploaded or stored anywhere." },
    ],
  },

  "/pan-card-resize": {
    title: "PAN Card Photo Resize Free – NEET, NSP, Railway | FileNova",
    description: "Resize PAN card photo online free for NEET, JEE, NSP scholarship, railway, and UIDAI portals. Auto-resize to exact pixel dimensions and file size limit. No upload, 100% private.",
    canonical: "https://filenova.in/pan-card-resize",
    keywords: "pan card photo resize online free, pan card resize neet jee, pan card size for scholarship portal, resize pan card image india, pan card photo size kb, pan card resize uidai nsdl, signature resize for scholarship",
    ogImage: OG_INDIA,
    schemaName: "PAN Card Photo Resizer",
    ratingValue: "4.8",
    ratingCount: "1870",
    jsonLdFaq: [
      { question: "What is the correct PAN card photo size for NEET 2025?", answer: "NEET 2025 requires a passport-size photograph of 200x230 pixels or 35x45mm at 200 DPI in JPEG format, under 40KB. Use FileNova's NEET preset to resize automatically." },
      { question: "What is the PAN card photo size for NSP scholarship?", answer: "NSP (National Scholarship Portal) requires a recent passport-size photo of 200x250 pixels in JPEG format, not exceeding 50KB." },
      { question: "Can I resize my PAN card scan for railway recruitment (RRB)?", answer: "Yes. FileNova has an RRB Railway preset that resizes your PAN card photo to 200x230 pixels under 50KB, exactly as required by Indian Railway recruitment portals." },
      { question: "Is it safe to upload PAN card on FileNova?", answer: "FileNova does not upload your PAN card image to any server. All resizing happens in your browser's memory using canvas API — completely private." },
    ],
  },

  "/scholarship-zip": {
    title: "Scholarship ZIP Maker Free – NSP, OASIS, Mahadbt | FileNova",
    description: "Create scholarship ZIP file online free for NSP, OASIS West Bengal, Mahadbt, and Indian state portals. Auto-rename photo, signature, marksheet, income certificate per portal spec.",
    canonical: "https://filenova.in/scholarship-zip",
    keywords: "scholarship zip maker online free india, nsp scholarship documents zip, oasis west bengal scholarship zip, mahadbt documents zip maker, scholarship document bundle free, nsp portal documents checklist, svmcm scholarship zip",
    ogImage: OG_INDIA,
    schemaName: "Scholarship ZIP Maker",
    ratingValue: "4.9",
    ratingCount: "986",
    jsonLdFaq: [
      { question: "What documents are required for NSP scholarship application?", answer: "NSP (National Scholarship Portal) typically requires: Student Photograph (JPEG, max 50KB), Signature (JPEG, max 30KB), Aadhaar Card, Bank Passbook, Marksheet, and Caste Certificate (if applicable). FileNova's Scholarship ZIP Maker pre-configures all these slots." },
      { question: "What is the OASIS West Bengal scholarship document format?", answer: "OASIS WB requires documents in JPEG or PDF format, each under 200KB. The ZIP file should contain photo (50KB max), signature (30KB max), marksheet, and income certificate." },
      { question: "How to create a ZIP file for scholarship application?", answer: "Use FileNova's Scholarship ZIP Maker: select your portal preset (NSP/OASIS/Mahadbt), upload each document in the corresponding slot, enter your roll number, and click Generate ZIP. Files are auto-renamed per portal specification." },
    ],
  },

  // ─── HIGH-TRAFFIC PDF TOOLS ───────────────────────────────────────────────

  "/compress-pdf": {
    title: "Compress PDF Online Free – Reduce Size Locally | FileNova",
    description: "Compress PDF file size online free in your browser. No upload to any server — 100% private. Reduce Aadhaar PDF, marksheet, or certificates below 200KB, 100KB for portal upload.",
    canonical: "https://filenova.in/compress-pdf",
    keywords: "compress pdf online free india, compress aadhaar pdf, reduce pdf size to 200kb free, compress pdf for scholarship upload, pdf compressor no upload, compress pdf below 100kb india, secure local browser pdf compressor",
    ogImage: OG_PDF,
    schemaName: "PDF Compressor",
    ratingValue: "4.8",
    ratingCount: "3420",
    jsonLdFaq: [
      { question: "How to compress PDF to under 200KB for scholarship portal?", answer: "Upload your PDF on FileNova, select the 'Custom Target Size' preset, enter 200KB, and click Compress PDF. The tool will automatically find the best quality setting to hit your target size." },
      { question: "Is it safe to compress Aadhaar PDF online?", answer: "Yes — FileNova compresses your PDF entirely in your browser using WebAssembly. Your Aadhaar PDF is never uploaded to any server." },
      { question: "How to reduce PDF size to 100KB free?", answer: "On FileNova, choose Custom Target Size and set the target to 100KB. The compressor uses a binary search algorithm to achieve the exact target size without visible quality loss." },
      { question: "Can I compress PDF for email attachment in India?", answer: "Yes. Use the 'Ebook' preset for balanced compression or 'Screen' for maximum compression. Most PDFs compress to 30–65% of their original size." },
    ],
  },

  "/compress-pdf-for-upload": {
    title: "Compress PDF to Target Size – 100KB 200KB | FileNova",
    description: "Compress PDF to an exact target file size (100KB, 200KB, 500KB) online free. Perfect for NSP, OASIS, and other Indian scholarship portals with strict file size limits.",
    canonical: "https://filenova.in/compress-pdf-for-upload",
    keywords: "compress pdf to 200kb free india, compress pdf to 100kb online, compress pdf for portal upload, reduce pdf to target size, pdf size reducer for nsp oasis scholarship",
    ogImage: OG_PDF,
    ratingValue: "4.8",
    ratingCount: "1520",
    jsonLdFaq: [
      { question: "How to compress PDF to exactly 200KB?", answer: "Use FileNova's Custom Target Size mode. Enter 200 in the KB field. The compressor will automatically adjust image quality to hit your exact target." },
      { question: "Which portals have 200KB PDF size limit?", answer: "NSP (National Scholarship Portal), OASIS West Bengal, Mahadbt Maharashtra, and many state scholarship portals restrict PDF uploads to 200KB or less." },
    ],
  },

  "/merge-pdf": {
    title: "Merge PDF Files Online Free – Combine PDF | FileNova India",
    description: "Merge multiple PDF files into one online for free. Combine marksheets, certificates, Aadhaar, and government documents instantly. No account required, works in your browser.",
    canonical: "https://filenova.in/merge-pdf",
    keywords: "merge pdf online free india, combine pdf files, merge marksheet pdf, combine aadhaar pdf, pdf joiner free india, join multiple pdfs online no upload",
    ogImage: OG_PDF,
    schemaName: "PDF Merger",
    ratingValue: "4.9",
    ratingCount: "4120",
    jsonLdFaq: [
      { question: "How to merge multiple PDFs into one free online?", answer: "Go to FileNova's Merge PDF tool, upload all your PDF files, drag to reorder them, and click Merge PDF. Download the combined PDF instantly — no account or email required." },
      { question: "Can I merge Aadhaar and PAN card in one PDF?", answer: "Yes. Upload both PDFs on FileNova's Merge PDF tool, arrange in order (Aadhaar first, then PAN), and click Merge. The combined PDF is ready to download in seconds." },
      { question: "Is there a file size limit for merging PDFs on FileNova?", answer: "No strict file size limit. You can merge up to 15 PDF files. For very large files (over 50MB total), processing may take 30–60 seconds." },
    ],
  },

  "/split-pdf": {
    title: "Split PDF Online Free – Extract Pages | FileNova India",
    description: "Split PDF into separate pages or extract specific pages online free. Divide government document PDFs, marksheets, or admit cards into individual files instantly.",
    canonical: "https://filenova.in/split-pdf",
    keywords: "split pdf online free india, extract pages from pdf free, pdf page extractor india, split pdf no upload, split aadhaar pdf pages, divide pdf free",
    ogImage: OG_PDF,
    schemaName: "PDF Splitter",
    ratingValue: "4.7",
    ratingCount: "2830",
    jsonLdFaq: [
      { question: "How to extract one page from a PDF free?", answer: "On FileNova's Split PDF tool, upload your PDF, choose 'Custom Extraction', type the page number (e.g. '2'), and click Split. Download just that page as a new PDF." },
      { question: "How to split a multi-page admit card PDF?", answer: "Upload the admit card PDF, select 'Extract All Pages' to get each page as a separate file, or use 'Custom Extraction' to extract specific pages." },
    ],
  },

  "/protect-pdf": {
    title: "Password Protect PDF Free Online – Lock PDF | FileNova",
    description: "Add password protection to PDF files online free. Secure government documents, Aadhaar certificates, and bank statements with 256-bit AES encryption in your browser.",
    canonical: "https://filenova.in/protect-pdf",
    keywords: "password protect pdf free india, lock pdf with password online, encrypt pdf file free, secure pdf india, add password to pdf no upload, protect aadhaar pdf",
    ogImage: OG_PDF,
    ratingValue: "4.8",
    ratingCount: "1640",
    jsonLdFaq: [
      { question: "How to add password to PDF free online in India?", answer: "Upload your PDF on FileNova's Protect PDF tool, enter a password, confirm it, set permissions (allow/restrict printing and copying), and click Protect PDF. The encrypted PDF downloads instantly." },
      { question: "What encryption does FileNova use for PDF passwords?", answer: "FileNova uses 256-bit AES encryption — the same standard used by banks and government systems. You can also choose 128-bit AES for faster file loading." },
    ],
  },

  "/unlock-pdf": {
    title: "Remove PDF Password Free Online – Unlock PDF | FileNova",
    description: "Remove password from PDF online free. Unlock protected PDFs — government certificates, bank statements, DigiLocker documents — instantly in your browser without any software.",
    canonical: "https://filenova.in/unlock-pdf",
    keywords: "pdf password remove india, unlock pdf online free, remove pdf password free, unlock digilocker pdf, pdf unlocker india no software, open password protected pdf free",
    ogImage: OG_PDF,
    schemaName: "PDF Password Remover",
    ratingValue: "4.7",
    ratingCount: "2210",
    jsonLdFaq: [
      { question: "How to remove password from PDF free online?", answer: "Upload the password-protected PDF on FileNova's Unlock PDF tool, enter the correct password, and click Unlock PDF. The unlocked PDF downloads immediately." },
      { question: "Can I unlock a DigiLocker PDF on FileNova?", answer: "Yes. DigiLocker-issued PDFs (Aadhaar, driving licence, marksheets) can be unlocked on FileNova. You need the correct document password to proceed." },
      { question: "What if I don't know the PDF password?", answer: "FileNova cannot perform brute-force decryption. If you do not know the correct password, you will need to contact the issuing authority to get it." },
    ],
  },

  "/rotate-pdf": {
    title: "Rotate PDF Pages Online Free – Fix Orientation | FileNova",
    description: "Rotate PDF pages 90° clockwise, counterclockwise, or 180° online free. Fix inverted scanned government documents, certificates, and Aadhaar PDFs instantly in your browser.",
    canonical: "https://filenova.in/rotate-pdf",
    keywords: "rotate pdf online free india, fix pdf orientation india, rotate scanned document pdf, rotate pdf pages 90 degrees, pdf rotation tool free",
    ogImage: OG_PDF,
    ratingValue: "4.6",
    ratingCount: "1190",
  },

  // ─── IMAGE TOOLS ─────────────────────────────────────────────────────────

  "/resize-photo": {
    title: "Resize Photo Online Free – Passport, Scholarship | FileNova",
    description: "Resize photo for scholarship form, passport, NEET, JEE, railway, and government portals online free. Exact pixel dimensions, file size guaranteed. No upload — 100% browser-based.",
    canonical: "https://filenova.in/resize-photo",
    keywords: "resize photo for scholarship form online free, resize photo online free india, passport photo resize free, photo size reducer for scholarship portal, resize photo to 200x230 pixels, resize photo for neet jee india, signature resize online free",
    ogImage: OG_IMAGE,
    schemaName: "Photo Resizer for India Portals",
    ratingValue: "4.9",
    ratingCount: "3650",
    jsonLdFaq: [
      { question: "How to resize photo for scholarship form online free?", answer: "Go to FileNova's Resize Photo tool, upload your photo, choose the 'Scholarship Portal' preset (200x250px), and click Resize. Download your resized photo instantly — no account needed." },
      { question: "What is the correct passport photo size for India?", answer: "Indian passport photos must be 35x45mm (equivalent to 413x531px at 300 DPI) in JPEG format with a white background. FileNova's 'Passport' preset sets this automatically." },
      { question: "How to resize photo for NEET 2025 application?", answer: "NEET 2025 requires photos of 200x230 pixels in JPEG format, between 10KB and 40KB. Use FileNova's NEET preset (available in PAN Card Resizer or custom dimensions in Resize Photo)." },
      { question: "How to reduce photo size to 50KB for portal upload?", answer: "Upload your photo on FileNova's Resize Photo or Compress Image tool, set the target dimensions, and reduce quality until the file size is below 50KB. Preview shows real-time size." },
      { question: "Can I resize signature for scholarship portal?", answer: "Yes. FileNova's Resize Photo tool supports signature images. Set custom dimensions (typically 140x60 pixels for NSP/OASIS) and download the resized signature." },
    ],
  },

  "/resize-image": {
    title: "Resize Photo Online Free – Passport, Scholarship | FileNova",
    description: "Resize photo for scholarship form, passport, NEET, JEE, railway, and government portals online free. Exact pixel dimensions, file size guaranteed. No upload — 100% browser-based.",
    canonical: "https://filenova.in/resize-photo",
    keywords: "resize photo online free india, passport photo resize free, resize image online no upload, photo size reducer scholarship",
    ogImage: OG_IMAGE,
  },

  "/compress-image": {
    title: "Compress Image Online Free – Reduce Photo Size | FileNova",
    description: "Compress JPEG, PNG, WebP images online free in your browser. Reduce photo file size below 50KB or 100KB for scholarship portal, job application, or email. No upload needed.",
    canonical: "https://filenova.in/compress-image",
    keywords: "compress image online free india, reduce photo size kb free, jpeg size reducer online india, compress png free, reduce image size for scholarship portal, compress photo below 50kb",
    ogImage: OG_IMAGE,
    schemaName: "Image Compressor",
    ratingValue: "4.7",
    ratingCount: "2180",
    jsonLdFaq: [
      { question: "How to compress image to 50KB online free in India?", answer: "Upload your image on FileNova, select 'Custom Target Size', set 50KB, and click Compress. The tool uses a binary-search quality algorithm to hit your exact target." },
      { question: "How to reduce photo size for scholarship portal?", answer: "Upload your photo on FileNova's Compress Image tool, use 'Web Small' preset or set a custom target like 50KB, download the compressed photo. Works for NSP, OASIS, and Mahadbt portals." },
    ],
  },

  "/remove-background": {
    title: "Remove Image Background Online Free – AI | FileNova India",
    description: "Remove photo background online free using AI in your browser. Get transparent PNG or white background for passport photos, ID cards, and visa applications instantly. No upload.",
    canonical: "https://filenova.in/remove-background",
    keywords: "remove background online free india, ai background remover india, remove photo background passport, transparent background free, white background photo online, remove bg free no signup",
    ogImage: OG_IMAGE,
    ratingValue: "4.8",
    ratingCount: "2910",
    jsonLdFaq: [
      { question: "How to remove background from photo free online in India?", answer: "Upload your photo on FileNova's AI Background Remover, choose Transparent or White background, and click Remove Background. The result downloads as PNG in seconds — no sign-up required." },
      { question: "Can I get a white background for passport photo free?", answer: "Yes. FileNova's background remover has a 'Solid White' option that replaces any background with pure white — perfect for passport, visa, and ID card photos." },
    ],
  },

  // ─── OCR ─────────────────────────────────────────────────────────────────

  "/ocr": {
    title: "OCR Hindi Bengali English Free Online – Scan to Text | FileNova",
    description: "Extract text from scanned PDFs, certificates, Aadhaar, and images online free. Supports Hindi, Bengali, Tamil, Telugu, Kannada, and English OCR. Browser-based, no upload.",
    canonical: "https://filenova.in/ocr",
    keywords: "ocr hindi online free, bengali ocr online, scan to text india free, extract text from scanned pdf india, hindi text recognition online, pdf ocr india free, aadhaar text extract",
    ogImage: OG_OCR,
    schemaName: "Multilingual OCR Tool",
    ratingValue: "4.7",
    ratingCount: "1430",
    jsonLdFaq: [
      { question: "How to extract text from Hindi PDF online free?", answer: "Upload your Hindi PDF or scanned image on FileNova's OCR tool, select Hindi (हिन्दी) from the language options, choose Fast mode for browser-local processing, and click Process. The extracted text appears immediately." },
      { question: "Can I scan certificate and extract text free in India?", answer: "Yes. FileNova OCR supports JPG, PNG, and PDF inputs. Scan your certificate with any phone camera, upload the image, and extract the text for free." },
      { question: "Does FileNova OCR support Bengali?", answer: "Yes. FileNova OCR supports Bengali (বাংলা), Hindi, Tamil, Telugu, Kannada, and English. You can select multiple languages simultaneously for mixed-language documents." },
    ],
  },

  // ─── DOCUMENT / OFFICE TOOLS ─────────────────────────────────────────────

  "/compress-doc": {
    title: "Compress Word Excel PPT Free Online | FileNova India",
    description: "Compress Microsoft Word, Excel, and PowerPoint files online free. Reduce DOCX, XLSX, PPTX file sizes for email attachments and portal uploads without losing quality.",
    canonical: "https://filenova.in/compress-doc",
    keywords: "compress word file online free india, compress excel file, compress pptx online, reduce docx size free, compress office files india",
    ogImage: OG_DOC,
    ratingValue: "4.6",
    ratingCount: "780",
  },

  "/pdf-to-word": {
    title: "PDF to Word Free Online – Convert PDF to DOCX | FileNova",
    description: "Convert PDF to editable Word (.docx) document online for free. Preserve formatting, tables, and columns. No account required — works in your browser.",
    canonical: "https://filenova.in/pdf-to-word",
    keywords: "pdf to word converter free india, convert pdf to docx online free, pdf to word no signup, pdf to editable word india",
    ogImage: OG_PDF,
    ratingValue: "4.7",
    ratingCount: "3100",
    jsonLdFaq: [
      { question: "How to convert PDF to Word online free in India?", answer: "Upload your PDF on FileNova's PDF to Word tool and click Convert. The tool extracts text, tables, and formatting and generates a DOCX file you can download and edit in Microsoft Word or Google Docs." },
    ],
  },

  "/pdf-to-jpg": {
    title: "PDF to JPG Converter Free Online | FileNova India",
    description: "Convert PDF pages to high-quality JPG or PNG images online free. Extract all pages or specific pages as separate image files. Ideal for certificate thumbnails and portal uploads.",
    canonical: "https://filenova.in/pdf-to-jpg",
    keywords: "pdf to jpg converter free india, convert pdf to image online, pdf page to jpeg free, pdf to png india",
    ogImage: OG_PDF,
    ratingValue: "4.6",
    ratingCount: "1940",
  },

  "/jpg-to-pdf": {
    title: "JPG to PDF Converter Free Online | FileNova India",
    description: "Convert JPG images to PDF online for free. Combine multiple photos or scanned certificates into one PDF. Perfect for scholarship and government portal document submission.",
    canonical: "https://filenova.in/jpg-to-pdf",
    keywords: "jpg to pdf converter free india, image to pdf free, combine photos into pdf india, scan to pdf free, jpeg to pdf no signup",
    ogImage: OG_PDF,
    ratingValue: "4.7",
    ratingCount: "2540",
    jsonLdFaq: [
      { question: "How to convert multiple photos to one PDF free online?", answer: "Upload all your JPG/PNG images on FileNova's JPG to PDF tool, drag to reorder them, and click Convert to PDF. Download the combined PDF instantly." },
      { question: "How to scan documents and combine into PDF free?", answer: "Take photos of each page with your phone camera, upload all images on FileNova's JPG to PDF tool, and merge them into a single PDF. No app download required." },
    ],
  },

  "/word-to-pdf": {
    title: "Word to PDF Converter Free Online | FileNova India",
    description: "Convert Word (.docx) to PDF online for free. Preserve fonts, tables, images, and formatting perfectly. No email required — download your PDF instantly.",
    canonical: "https://filenova.in/word-to-pdf",
    keywords: "word to pdf converter free india, docx to pdf online, convert word document to pdf free no signup, word to pdf india",
    ogImage: OG_PDF,
    ratingValue: "4.8",
    ratingCount: "2760",
  },

  // ─── AI TOOLS ─────────────────────────────────────────────────────────────

  "/ai-ppt-maker": {
    title: "AI PPT Maker Free – Topic to Slides in Seconds | FileNova",
    description: "Generate complete PowerPoint presentations from any topic or notes using AI for free. Choose themes, writing tone, and number of slides. Perfect for school and college projects in India.",
    canonical: "https://filenova.in/ai-ppt-maker",
    keywords: "ai ppt maker free india, topic to ppt generator free, ai presentation maker for students, free powerpoint generator india, ai slides maker no signup",
    ogImage: OG_AI,
    schemaName: "AI PowerPoint Maker",
    ratingValue: "4.8",
    ratingCount: "1720",
    jsonLdFaq: [
      { question: "How to make a PowerPoint presentation from topic using AI free?", answer: "Enter your topic on FileNova's AI PPT Maker, choose number of slides and writing tone, and click Generate. A complete themed PowerPoint presentation is ready to download in seconds." },
      { question: "Can I make PPT from my notes using AI for free?", answer: "Yes. Paste your notes or syllabus points, select a theme, and the AI generates structured slides with headings, bullet points, and formatting automatically." },
    ],
  },

  "/ai-pdf-summary": {
    title: "AI PDF Summarizer Free – Extract Key Points | FileNova",
    description: "Summarize long PDF documents using AI online free. Get bullet-point summaries, key insights, and important highlights from textbooks, research papers, and reports.",
    canonical: "https://filenova.in/ai-pdf-summary",
    keywords: "ai pdf summarizer free india, summarize pdf online free, extract key points from pdf, pdf to summary ai, chat with pdf free india",
    ogImage: OG_AI,
    ratingValue: "4.7",
    ratingCount: "940",
  },

  // ─── GOVERNMENT & FORM TOOLS ─────────────────────────────────────────────

  "/government-form-fill": {
    title: "Fill Government PDF Forms Online Free | FileNova India",
    description: "Fill Aadhaar, PAN, passport, and scholarship PDF forms online free. Type directly on PDF forms, add signature, and download — no Acrobat, no account required.",
    canonical: "https://filenova.in/government-form-fill",
    keywords: "fill pdf form online free india, fill government form pdf, write on pdf free india, aadhaar correction form fill online, pan card form fill free",
    ogImage: OG_INDIA,
    ratingValue: "4.6",
    ratingCount: "1120",
  },

  "/resize-pdf": {
    title: "Resize PDF Page Size Free Online – A4, Letter | FileNova",
    description: "Change PDF page size to A4, Letter, or custom dimensions online free. Resize scanned certificate PDFs for portal submission. No upload to server — 100% browser-based.",
    canonical: "https://filenova.in/resize-pdf",
    keywords: "resize pdf page size free india, change pdf to a4 online, pdf page resize online, resize scanned pdf india",
    ogImage: OG_PDF,
  },
};
