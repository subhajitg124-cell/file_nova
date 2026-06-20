export interface ToolMeta {
  title: string;           // 50-60 chars max
  description: string;     // 150-160 chars max
  canonical: string;       // Full URL
  keywords: string;        // comma-separated
  ogImage?: string;        // OG image URL
}

// Category-based default OG images for WhatsApp/social share previews
const OG_PDF = "https://filenova.in/og/pdf-tools.png";
const OG_INDIA = "https://filenova.in/og/india-tools.png";
const OG_IMAGE = "https://filenova.in/og/image-tools.png";
const OG_OCR = "https://filenova.in/og/ocr.png";

export const TOOL_META: Record<string, ToolMeta> = {
  "/merge-pdf": {
    title: "Merge PDF Free Online – FileNova India",
    description: "Combine multiple PDF files into one online for free. No upload needed — works in your browser. Ideal for students, CSC operators, and government portals.",
    canonical: "https://filenova.in/merge-pdf",
    keywords: "merge pdf online free india, combine pdf files, pdf joiner free",
    ogImage: OG_PDF,
  },
  "/split-pdf": {
    title: "Split PDF Free Online – FileNova India",
    description: "Split PDF into separate pages or extract specific pages online. Free, fast, and secure — your files never leave your browser.",
    canonical: "https://filenova.in/split-pdf",
    keywords: "split pdf online free india, extract pdf pages, pdf splitter",
    ogImage: OG_PDF,
  },
  "/compress-pdf": {
    title: "Secure Local Browser PDF Compressor Free – FileNova",
    description: "Use our secure local browser PDF compressor to reduce file sizes instantly. 100% private offline calculations with zero upload latency.",
    canonical: "https://filenova.in/compress-pdf",
    keywords: "secure local browser pdf compressor, compress pdf online free india, reduce pdf size, pdf compressor for scholarship",
    ogImage: OG_PDF,
  },
  "/rotate-pdf": {
    title: "Rotate PDF Pages Free Online – FileNova India",
    description: "Rotate PDF pages 90° or 180° online for free. Fix scanned documents and orientation issues instantly in your browser.",
    canonical: "https://filenova.in/rotate-pdf",
    keywords: "rotate pdf online free, fix pdf orientation, rotate pdf pages india",
    ogImage: OG_PDF,
  },
  "/protect-pdf": {
    title: "Password Protect PDF Free Online – FileNova",
    description: "Add password protection to your PDF files online for free. Secure sensitive documents with 256-bit AES encryption directly in your browser.",
    canonical: "https://filenova.in/protect-pdf",
    keywords: "password protect pdf free india, encrypt pdf online, lock pdf file",
    ogImage: OG_PDF,
  },
  "/unlock-pdf": {
    title: "Unlock PDF Free Online – Remove PDF Password | FileNova",
    description: "Remove password from PDF files online for free. Unlock protected PDFs instantly in your browser without any software.",
    canonical: "https://filenova.in/unlock-pdf",
    keywords: "unlock pdf online free india, remove pdf password, pdf unlocker",
    ogImage: OG_PDF,
  },
  "/aadhaar-mask": {
    title: "Aadhaar Masking Online Free UIDAI Compliant – FileNova",
    description: "Aadhaar masking online free UIDAI compliant tool. Hide first 8 digits of your Aadhaar card scan. 100% private offline calculations in your browser.",
    canonical: "https://filenova.in/aadhaar-mask",
    keywords: "aadhaar masking online free uidai compliant, aadhaar masking online free, mask aadhaar card, uidai aadhaar mask",
    ogImage: OG_INDIA,
  },
  "/aadhaar-mask-pdf": {
    title: "Aadhaar Masking Online Free UIDAI Compliant – FileNova",
    description: "Aadhaar masking online free UIDAI compliant tool. Hide first 8 digits of your Aadhaar card scan. 100% private offline calculations in your browser.",
    canonical: "https://filenova.in/aadhaar-mask-pdf",
    keywords: "aadhaar masking online free uidai compliant, aadhaar masking online free, mask aadhaar card, uidai aadhaar mask",
    ogImage: OG_INDIA,
  },
  "/pan-card-resize": {
    title: "PAN Card Photo Resize Free – Scholarship & Portal Ready | FileNova",
    description: "Resize PAN card photo online free for NEET, JEE, NSP, railway forms and scholarship portals. Exact pixel dimensions and file size guaranteed.",
    canonical: "https://filenova.in/pan-card-resize",
    keywords: "pan card resize online free india, pan card photo size for scholarship, pan card resize neet jee",
    ogImage: OG_INDIA,
  },
  "/scholarship-zip": {
    title: "Scholarship ZIP Maker Free – NSP, OASIS, Mahadbt | FileNova",
    description: "Create scholarship document ZIP files online free for NSP, OASIS West Bengal, Mahadbt, and other Indian portals. Auto-rename files per portal requirements.",
    canonical: "https://filenova.in/scholarship-zip",
    keywords: "scholarship zip maker online free india, nsp documents zip, oasis scholarship zip west bengal",
    ogImage: OG_INDIA,
  },
  "/ocr": {
    title: "OCR Scan to Text Free Online – Hindi Bengali English | FileNova",
    description: "Extract text from scanned PDFs and images online free. Supports Hindi, Bengali, Tamil, Telugu, English and more Indian languages.",
    canonical: "https://filenova.in/ocr",
    keywords: "ocr scan to text free india, hindi ocr online, bengali ocr, extract text from scanned pdf",
    ogImage: OG_OCR,
  },
  "/resize-photo": {
    title: "Offline Passport Photo Resizer Free Online – FileNova",
    description: "Offline passport photo resizer to resize photo & signature to exact portal requirements. Secure browser-based tool with zero upload latency.",
    canonical: "https://filenova.in/resize-photo",
    keywords: "offline passport photo resizer, resize photo online free india, passport photo resize, scholarship photo resize, photo size reducer",
    ogImage: OG_IMAGE,
  },
  "/resize-image": {
    title: "Offline Passport Photo Resizer Free Online – FileNova",
    description: "Offline passport photo resizer to resize photo & signature to exact portal requirements. Secure browser-based tool with zero upload latency.",
    canonical: "https://filenova.in/resize-photo", // Points to primary
    keywords: "offline passport photo resizer, resize photo online free india, passport photo resize, scholarship photo resize, photo size reducer",
    ogImage: OG_IMAGE,
  },
  "/ai-background-remover": {
    title: "AI Background Remover Free Online – FileNova India",
    description: "Remove photo background online free using AI. Get a transparent background or white background instantly. Perfect for passport photos and ID cards.",
    canonical: "https://filenova.in/ai-background-remover",
    keywords: "remove background online free india, ai background remover, transparent background photo",
    ogImage: OG_IMAGE,
  },
  "/remove-background": {
    title: "AI Background Remover Free Online – FileNova India",
    description: "Remove photo background online free using AI. Get a transparent background or white background instantly. Perfect for passport photos and ID cards.",
    canonical: "https://filenova.in/remove-background",
    keywords: "remove background online free india, ai background remover, transparent background photo",
    ogImage: OG_IMAGE,
  },
  "/pdf-to-word": {
    title: "PDF to Word Converter Free Online – FileNova India",
    description: "Convert PDF to editable Word (.docx) document online for free. Preserve formatting, tables, and text. No signup required.",
    canonical: "https://filenova.in/pdf-to-word",
    keywords: "pdf to word converter free india, convert pdf to docx online, pdf to word online free",
    ogImage: OG_PDF,
  },
  "/pdf-to-jpg": {
    title: "PDF to JPG Converter Free Online – FileNova India",
    description: "Convert PDF pages to high-quality JPG images online for free. Extract all pages or specific pages as images instantly.",
    canonical: "https://filenova.in/pdf-to-jpg",
    keywords: "pdf to jpg converter free india, convert pdf to image online, pdf to png free",
    ogImage: OG_PDF,
  },
  "/jpg-to-pdf": {
    title: "JPG to PDF Converter Free Online – FileNova India",
    description: "Convert JPG images to PDF online for free. Combine multiple images into one PDF. Supports JPEG, PNG formats.",
    canonical: "https://filenova.in/jpg-to-pdf",
    keywords: "jpg to pdf converter free india, image to pdf online, combine images to pdf free",
    ogImage: OG_PDF,
  },
  "/word-to-pdf": {
    title: "Word to PDF Converter Free Online – FileNova India",
    description: "Convert Word (.docx) documents to PDF online for free. Preserve all formatting, fonts, and layout perfectly.",
    canonical: "https://filenova.in/word-to-pdf",
    keywords: "word to pdf converter free india, docx to pdf online, convert word document to pdf",
    ogImage: OG_PDF,
  },
  "/compress-pdf-for-upload": {
    title: "Secure Local Browser PDF Compressor to Target Size – FileNova",
    description: "Secure local browser PDF compressor to target size (under 100KB, 200KB). 100% private offline calculations with zero latency over ilovepdf/smallpdf.",
    canonical: "https://filenova.in/compress-pdf-for-upload",
    keywords: "secure local browser pdf compressor target size, compress pdf to target size, reduce pdf size to 200kb, compress pdf to 100kb free",
    ogImage: OG_PDF,
  },
  "/resize-pdf": {
    title: "Resize PDF Pages Online Free – Change PDF Dimensions | FileNova",
    description: "Resize PDF page dimensions online free. Change page size to A4, Letter, or custom width and height instantly in your browser.",
    canonical: "https://filenova.in/resize-pdf",
    keywords: "resize pdf page, change pdf page size free, resize pdf to A4 online, pdf layout resizer",
    ogImage: OG_PDF,
  },
  "/ai-pdf-summary": {
    title: "AI PDF Summarizer Free – Extract Key Insights Online | FileNova",
    description: "Summarize PDF documents online free using AI. Get quick summaries, bulleted insights, and key takeaways instantly from large PDFs.",
    canonical: "https://filenova.in/ai-pdf-summary",
    keywords: "ai pdf summarizer, summarize pdf online free, extract insights from pdf, chat with pdf free",
    ogImage: "https://filenova.in/og/ai-tools.png",
  },
  "/compress-image": {
    title: "Compress Image Free Online – Reduce Photo File Size | FileNova",
    description: "Compress images and reduce photo file size online for free. Support JPG, PNG, WebP format compression. Adjust quality and download instantly.",
    canonical: "https://filenova.in/compress-image",
    keywords: "compress image online free, reduce photo size kb, jpeg size reducer online, compress png webp",
    ogImage: OG_IMAGE,
  },
  "/government-form-fill": {
    title: "Fill Government PDF Forms Online – FileNova India",
    description: "Fill Aadhaar, PAN, passport, and scholarship forms online for free. Complete PDF application forms instantly in your browser.",
    canonical: "https://filenova.in/government-form-fill",
    keywords: "fill pdf forms, government form filler online, write on pdf form",
    ogImage: OG_INDIA,
  },
  "/ai-ppt-maker": {
    title: "AI PPT Maker Free – Topic to Presentation | FileNova",
    description: "Generate a complete, themed PowerPoint presentation from any topic or your notes for free. Choose theme and writing tone. Perfect for school & college projects.",
    canonical: "https://filenova.in/ai-ppt-maker",
    keywords: "ai ppt maker free india, topic to presentation generator, ai presentation maker for students, free powerpoint generator",
    ogImage: "https://filenova.in/og/ai-tools.png",
  },
  // Homepage
  "/": {
    title: "FileNova – Free Online PDF Tools for India | Aadhaar, PAN, Scholarship",
    description: "Free online PDF tools built for India. Merge, split, compress, convert PDFs. Aadhaar masking, PAN card resize, scholarship ZIP maker, Hindi OCR. Works offline.",
    canonical: "https://filenova.in",
    keywords: "free pdf tools india, pdf tools for students, aadhaar masking, pan card resize, scholarship zip maker india",
    ogImage: "https://filenova.in/og-default.png",
  },
};
