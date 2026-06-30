import type { FAQItem } from "@/lib/seo";

export interface ToolMeta {
  title: string;
  description: string;
  canonical: string;
  keywords: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  jsonLdFaq?: FAQItem[];
  schemaName?: string;
}

const OG_DEFAULT = "https://filenova.in/opengraph.jpg";

export const TOOL_META: Record<string, ToolMeta> = {

  // ─── HOMEPAGE ──────────────────────────────────────────────────────────────
  "/": {
    title: "FileNova – AI PDF & Image Tools | Fast, Secure & Free",
    description: "FileNova offers 30+ free online PDF and image tools for Indian students and professionals. Merge PDF, compress PDF, Aadhaar masking, PAN resize, scholarship ZIP, OCR in Hindi & Bengali. 100% browser-based, files never uploaded.",
    canonical: "https://filenova.in",
    keywords: "filenova, free pdf tools india, ai pdf tools, pdf editor online free, pdf compressor, pdf merger, image tools online, aadhaar masking free, pan card resize, scholarship zip maker, ocr hindi bengali free",
    ogImage: OG_DEFAULT,
    ogTitle: "FileNova – AI PDF & Image Tools | Fast, Secure & Free",
    ogDescription: "30+ free online PDF and image tools. Merge, compress, convert PDFs. Aadhaar masking, PAN resize, scholarship ZIP, OCR. 100% browser-based, files never uploaded.",
    jsonLdFaq: [
      { question: "Is FileNova free to use?", answer: "Yes. All core tools on FileNova are completely free with no account required. Files are processed in your browser and never uploaded to any server." },
      { question: "Is FileNova safe for Aadhaar and PAN documents?", answer: "Yes. FileNova processes all files locally in your browser using WebAssembly. Your Aadhaar, PAN, and other sensitive documents are never sent to any server." },
      { question: "Does FileNova work offline?", answer: "Most tools (Aadhaar masking, photo resize, image compress) work fully offline after first load. PDF tools require an internet connection for initial WASM download." },
    ],
  },

  // ─── INDIA-EXCLUSIVE TOOLS ─────────────────────────────────────────────────

  "/aadhaar-mask-pdf": {
    title: "Mask Aadhaar Card Online Free – UIDAI Compliant | FileNova",
    description: "Mask Aadhaar card number online free. Hide first 8 digits of Aadhaar PDF instantly in your browser — UIDAI compliant. 100% secure, files never uploaded. Works for KYC, scholarship, and government portals.",
    canonical: "https://filenova.in/aadhaar-mask-pdf",
    keywords: "mask aadhaar card online free, aadhaar masking online free uidai compliant, hide aadhaar number online, aadhaar mask for kyc, aadhaar masking tool india, redact aadhaar digits free, secure aadhaar masking",
    ogImage: "https://filenova.in/aadhaar_mask_mockup.png",
    ogTitle: "Mask Aadhaar Card Online Free – UIDAI Compliant | FileNova",
    ogDescription: "Hide first 8 digits of your Aadhaar PDF instantly. UIDAI-compliant masking. 100% browser-based, files never uploaded. Free and secure.",
    schemaName: "Aadhaar Masking Tool",
    jsonLdFaq: [
      { question: "Is Aadhaar masking legal in India?", answer: "Yes. UIDAI officially recommends masking the first 8 digits of the 12-digit Aadhaar number when sharing for non-KYC purposes. FileNova's masking is UIDAI-compliant." },
      { question: "Does FileNova upload my Aadhaar file to a server?", answer: "No. Your Aadhaar PDF is processed entirely inside your browser using WebAssembly. It is never uploaded, stored, or transmitted to any server." },
      { question: "How do I mask Aadhaar number in a PDF?", answer: "Upload your Aadhaar PDF on FileNova, choose your masking style (black block, blur, or asterisks), and click Process. Download the masked PDF in seconds." },
      { question: "Can I mask Aadhaar for scholarship portal upload?", answer: "Yes. Use the Black Block or Asterisks style to hide the first 8 digits before uploading to OASIS, NSP, Mahadbt, or any scholarship portal." },
    ],
  },

  "/aadhaar-mask": {
    title: "Aadhaar Number Mask Online – Hide Digits Instantly | FileNova",
    description: "Hide first 8 digits of your Aadhaar number online instantly. UIDAI-compliant PDF masking tool. 100% browser-based, files never uploaded. Redirects to Aadhaar Mask PDF tool.",
    canonical: "https://filenova.in/aadhaar-mask-pdf",
    keywords: "aadhaar number mask online, hide aadhaar digits, aadhaar privacy tool, uidai compliant masking",
    ogImage: "https://filenova.in/aadhaar_mask_mockup.png",
    ogTitle: "Aadhaar Number Mask Online | FileNova",
    ogDescription: "Hide first 8 digits of your Aadhaar number. UIDAI-compliant masking. Files never uploaded.",
    schemaName: "Aadhaar Masking Tool",
  },

  "/pan-card-resize": {
    title: "PAN Card Photo Resize Free – NEET, NSP, Railway | FileNova",
    description: "Resize PAN card photo online free for NEET, JEE, NSP scholarship, railway, and UIDAI portals. Auto-resize to exact pixel dimensions and file size limits. No upload, 100% private browser-based tool.",
    canonical: "https://filenova.in/pan-card-resize",
    keywords: "pan card photo resize online free, pan card resize neet jee, pan card size for scholarship portal, resize pan card image india, pan card photo size kb, signature resize for scholarship",
    ogImage: "https://filenova.in/portal_photo_resize_guide.png",
    ogTitle: "PAN Card Photo Resize Free – NEET, NSP, Railway | FileNova",
    ogDescription: "Resize PAN card photos for NEET, JEE, NSP, and railway portals. Exact pixel dimensions and file size. 100% private browser-based tool.",
    schemaName: "PAN Card Photo Resizer",
    jsonLdFaq: [
      { question: "What is the correct PAN card photo size for NEET 2025?", answer: "NEET 2025 requires a passport-size photograph of 200x230 pixels or 35x45mm at 200 DPI in JPEG format, under 40KB. Use FileNova's NEET preset to resize automatically." },
      { question: "What is the PAN card photo size for NSP scholarship?", answer: "NSP (National Scholarship Portal) requires a recent passport-size photo of 200x250 pixels in JPEG format, not exceeding 50KB." },
      { question: "Can I resize my PAN card scan for railway recruitment (RRB)?", answer: "Yes. FileNova has an RRB Railway preset that resizes your PAN card photo to 200x230 pixels under 50KB, exactly as required by Indian Railway recruitment portals." },
    ],
  },

  "/scholarship-zip": {
    title: "Scholarship ZIP Maker Free – NSP, OASIS, Mahadbt | FileNova",
    description: "Create scholarship ZIP file online free for NSP, OASIS West Bengal, Mahadbt, and Indian state portals. Auto-rename photo, signature, marksheet, income certificate per portal specifications.",
    canonical: "https://filenova.in/scholarship-zip",
    keywords: "scholarship zip maker online free india, nsp scholarship documents zip, oasis west bengal scholarship zip, mahadbt documents zip maker, scholarship document bundle free",
    ogImage: OG_DEFAULT,
    ogTitle: "Scholarship ZIP Maker Free – NSP, OASIS, Mahadbt | FileNova",
    ogDescription: "Create scholarship ZIP files for NSP, OASIS, Mahadbt portals. Auto-rename documents per portal specs. Free and easy to use.",
    schemaName: "Scholarship ZIP Maker",
    jsonLdFaq: [
      { question: "What documents are required for NSP scholarship application?", answer: "NSP (National Scholarship Portal) typically requires: Student Photograph (JPEG, max 50KB), Signature (JPEG, max 30KB), Aadhaar Card, Bank Passbook, Marksheet, and Caste Certificate (if applicable). FileNova's Scholarship ZIP Maker pre-configures all these slots." },
      { question: "What is the OASIS West Bengal scholarship document format?", answer: "OASIS WB requires documents in JPEG or PDF format, each under 200KB. The ZIP file should contain photo (50KB max), signature (30KB max), marksheet, and income certificate." },
    ],
  },

  // ─── HIGH-TRAFFIC PDF TOOLS ───────────────────────────────────────────────

  "/compress-pdf": {
    title: "Compress PDF Online Free – Reduce Size Locally | FileNova",
    description: "Compress PDF file size online free in your browser. No upload to any server — 100% private. Reduce Aadhaar PDF, marksheet, or certificates below 200KB for scholarship portal upload. Fast and secure.",
    canonical: "https://filenova.in/compress-pdf",
    keywords: "compress pdf online free india, reduce pdf size, pdf compressor no upload, compress aadhaar pdf, compress pdf for scholarship upload, reduce pdf to 200kb free, secure pdf compressor",
    ogImage: OG_DEFAULT,
    ogTitle: "Compress PDF Online Free – Reduce Size Locally | FileNova",
    ogDescription: "Compress PDF files online free in your browser. Reduce to 200KB for scholarship portals. No upload, 100% private. Fast and secure PDF compression.",
    schemaName: "PDF Compressor",
    jsonLdFaq: [
      { question: "How to compress PDF to under 200KB for scholarship portal?", answer: "Upload your PDF on FileNova, select the 'Custom Target Size' preset, enter 200KB, and click Compress PDF. The tool will automatically find the best quality setting to hit your target size." },
      { question: "Is it safe to compress Aadhaar PDF online?", answer: "Yes — FileNova compresses your PDF entirely in your browser using WebAssembly. Your Aadhaar PDF is never uploaded to any server." },
    ],
  },

  "/compress-pdf-for-upload": {
    title: "Compress PDF to Target Size – 100KB 200KB | FileNova",
    description: "Compress PDF to an exact target file size (100KB, 200KB, 500KB) online free. Perfect for NSP, OASIS, and other Indian scholarship portals with strict file size limits.",
    canonical: "https://filenova.in/compress-pdf-for-upload",
    keywords: "compress pdf to 200kb free india, compress pdf to 100kb online, compress pdf for portal upload, reduce pdf to target size, nsp oasis pdf compressor",
    ogImage: OG_DEFAULT,
    ogTitle: "Compress PDF to Target Size – 100KB 200KB | FileNova",
    ogDescription: "Compress PDF to exact target file size (100KB, 200KB, 500KB). Perfect for NSP, OASIS scholarship portals with strict file size limits.",
    jsonLdFaq: [
      { question: "How to compress PDF to exactly 200KB?", answer: "Use FileNova's Custom Target Size mode. Enter 200 in the KB field. The compressor will automatically adjust image quality to hit your exact target." },
      { question: "Which portals have 200KB PDF size limit?", answer: "NSP (National Scholarship Portal), OASIS West Bengal, Mahadbt Maharashtra, and many state scholarship portals restrict PDF uploads to 200KB or less." },
    ],
  },

  "/merge-pdf": {
    title: "Merge PDF Files Online Free – Combine PDF | FileNova",
    description: "Merge multiple PDF files into one online for free. Combine marksheets, certificates, Aadhaar, and government documents instantly. No account required, works in your browser. Fast and secure PDF merger.",
    canonical: "https://filenova.in/merge-pdf",
    keywords: "merge pdf online free india, combine pdf files, merge marksheet pdf, combine aadhaar pdf, pdf joiner free india, join multiple pdfs online",
    ogImage: OG_DEFAULT,
    ogTitle: "Merge PDF Files Online Free | FileNova",
    ogDescription: "Combine multiple PDF files into one online free. Merge marksheets, certificates, and government documents. No account required.",
    schemaName: "PDF Merger",
    jsonLdFaq: [
      { question: "How to merge multiple PDFs into one free online?", answer: "Go to FileNova's Merge PDF tool, upload all your PDF files, drag to reorder them, and click Merge PDF. Download the combined PDF instantly — no account or email required." },
      { question: "Can I merge Aadhaar and PAN card in one PDF?", answer: "Yes. Upload both PDFs on FileNova's Merge PDF tool, arrange in order (Aadhaar first, then PAN), and click Merge. The combined PDF is ready to download in seconds." },
    ],
  },

  "/split-pdf": {
    title: "Split PDF Online Free – Extract Pages | FileNova",
    description: "Split PDF into separate pages or extract specific pages online free. Divide government document PDFs, marksheets, or admit cards into individual files instantly. No upload needed.",
    canonical: "https://filenova.in/split-pdf",
    keywords: "split pdf online free india, extract pages from pdf free, pdf page extractor, split aadhaar pdf pages, divide pdf free online",
    ogImage: OG_DEFAULT,
    ogTitle: "Split PDF Online Free – Extract Pages | FileNova",
    ogDescription: "Split PDF into separate pages or extract specific pages online free. Perfect for government documents and marksheets.",
    schemaName: "PDF Splitter",
    jsonLdFaq: [
      { question: "How to extract one page from a PDF free?", answer: "On FileNova's Split PDF tool, upload your PDF, choose 'Custom Extraction', type the page number, and click Split. Download just that page as a new PDF." },
      { question: "How to split a multi-page admit card PDF?", answer: "Upload the admit card PDF, select 'Extract All Pages' to get each page as a separate file, or use 'Custom Extraction' to extract specific pages." },
    ],
  },

  "/protect-pdf": {
    title: "Password Protect PDF Free Online – Lock PDF | FileNova",
    description: "Add password protection to PDF files online free. Secure government documents, Aadhaar certificates, and bank statements with 256-bit AES encryption in your browser.",
    canonical: "https://filenova.in/protect-pdf",
    keywords: "password protect pdf free india, lock pdf with password online, encrypt pdf file free, secure pdf india, add password to pdf no upload",
    ogImage: OG_DEFAULT,
    ogTitle: "Password Protect PDF Free Online | FileNova",
    ogDescription: "Add password protection to PDF files with 256-bit AES encryption. Secure government documents and bank statements in your browser.",
    schemaName: "PDF Protector",
    jsonLdFaq: [
      { question: "How to add password to PDF free online in India?", answer: "Upload your PDF on FileNova's Protect PDF tool, enter a password, confirm it, set permissions, and click Protect PDF. The encrypted PDF downloads instantly." },
      { question: "What encryption does FileNova use for PDF passwords?", answer: "FileNova uses 256-bit AES encryption — the same standard used by banks and government systems." },
    ],
  },

  "/unlock-pdf": {
    title: "Remove PDF Password Free Online – Unlock PDF | FileNova",
    description: "Remove password from PDF online free. Unlock protected PDFs — government certificates, bank statements, DigiLocker documents — instantly in your browser without any software.",
    canonical: "https://filenova.in/unlock-pdf",
    keywords: "remove pdf password india, unlock pdf online free, unlock digilocker pdf, pdf unlocker india no software, open password protected pdf free",
    ogImage: OG_DEFAULT,
    ogTitle: "Remove PDF Password Free Online | FileNova",
    ogDescription: "Unlock password-protected PDFs online free. Remove passwords from DigiLocker documents, bank statements, and certificates.",
    schemaName: "PDF Password Remover",
    jsonLdFaq: [
      { question: "How to remove password from PDF free online?", answer: "Upload the password-protected PDF on FileNova's Unlock PDF tool, enter the correct password, and click Unlock PDF. The unlocked PDF downloads immediately." },
      { question: "Can I unlock a DigiLocker PDF on FileNova?", answer: "Yes. DigiLocker-issued PDFs (Aadhaar, driving licence, marksheets) can be unlocked on FileNova. You need the correct document password to proceed." },
    ],
  },

  "/rotate-pdf": {
    title: "Rotate PDF Pages Online Free – Fix Orientation | FileNova",
    description: "Rotate PDF pages 90° clockwise, counterclockwise, or 180° online free. Fix inverted scanned government documents, certificates, and Aadhaar PDFs instantly in your browser.",
    canonical: "https://filenova.in/rotate-pdf",
    keywords: "rotate pdf online free india, fix pdf orientation, rotate scanned document pdf, rotate pdf pages 90 degrees, pdf rotation tool free",
    ogImage: OG_DEFAULT,
    ogTitle: "Rotate PDF Pages Online Free | FileNova",
    ogDescription: "Rotate PDF pages 90°, 180° online free. Fix inverted scanned documents and certificates in your browser instantly.",
    schemaName: "PDF Page Rotator",
  },

  // ─── PDF CONVERSION TOOLS ─────────────────────────────────────────────────

  "/pdf-to-word": {
    title: "PDF to Word Free Online – Convert PDF to DOCX | FileNova",
    description: "Convert PDF to editable Word (.docx) document online for free. Preserve formatting, tables, and columns. No account required — works in your browser. Fast PDF to DOCX converter.",
    canonical: "https://filenova.in/pdf-to-word",
    keywords: "pdf to word converter free india, convert pdf to docx online free, pdf to word no signup, pdf to editable word india, pdf to docx converter",
    ogImage: OG_DEFAULT,
    ogTitle: "PDF to Word Free Online | FileNova",
    ogDescription: "Convert PDF to editable Word DOCX online free. Preserves formatting and tables. No account required.",
    jsonLdFaq: [
      { question: "How to convert PDF to Word online free in India?", answer: "Upload your PDF on FileNova's PDF to Word tool and click Convert. The tool extracts text, tables, and formatting and generates a DOCX file you can download and edit in Microsoft Word or Google Docs." },
    ],
  },

  "/pdf-to-jpg": {
    title: "PDF to JPG Converter Free Online | FileNova",
    description: "Convert PDF pages to high-quality JPG or PNG images online free. Extract all pages or specific pages as separate image files. Ideal for certificate thumbnails and portal uploads.",
    canonical: "https://filenova.in/pdf-to-jpg",
    keywords: "pdf to jpg converter free india, convert pdf to image online, pdf page to jpeg free, pdf to png india, extract pdf as image",
    ogImage: OG_DEFAULT,
    ogTitle: "PDF to JPG Converter Free Online | FileNova",
    ogDescription: "Convert PDF pages to JPG or PNG images online free. Extract pages as images for certificates and portal uploads.",
  },

  "/jpg-to-pdf": {
    title: "JPG to PDF Converter Free Online | FileNova",
    description: "Convert JPG images to PDF online for free. Combine multiple photos or scanned certificates into one PDF. Perfect for scholarship and government portal document submission.",
    canonical: "https://filenova.in/jpg-to-pdf",
    keywords: "jpg to pdf converter free india, image to pdf free, combine photos into pdf india, scan to pdf free, multiple images to pdf",
    ogImage: OG_DEFAULT,
    ogTitle: "JPG to PDF Converter Free Online | FileNova",
    ogDescription: "Convert JPG images to PDF online free. Combine multiple photos into one PDF for scholarship and government portal submission.",
    jsonLdFaq: [
      { question: "How to convert multiple photos to one PDF free online?", answer: "Upload all your JPG/PNG images on FileNova's JPG to PDF tool, drag to reorder them, and click Convert to PDF. Download the combined PDF instantly." },
      { question: "How to scan documents and combine into PDF free?", answer: "Take photos of each page with your phone camera, upload all images on FileNova's JPG to PDF tool, and merge them into a single PDF." },
    ],
  },

  "/word-to-pdf": {
    title: "Word to PDF Converter Free Online | FileNova",
    description: "Convert Word (.docx) to PDF online for free. Preserve fonts, tables, images, and formatting perfectly. No email required — download your PDF instantly. Fast free DOCX to PDF converter.",
    canonical: "https://filenova.in/word-to-pdf",
    keywords: "word to pdf converter free india, docx to pdf online, convert word document to pdf free, word to pdf india, docx to pdf converter",
    ogImage: OG_DEFAULT,
    ogTitle: "Word to PDF Converter Free Online | FileNova",
    ogDescription: "Convert Word DOCX to PDF online free. Preserve fonts, tables, and formatting. No email required.",
  },

  "/resize-pdf": {
    title: "Resize PDF Page Size Free Online – A4, Letter | FileNova",
    description: "Change PDF page size to A4, Letter, or custom dimensions online free. Resize scanned certificate PDFs for portal submission. No upload to server — 100% browser-based PDF resizer.",
    canonical: "https://filenova.in/resize-pdf",
    keywords: "resize pdf page size free india, change pdf to a4 online, pdf page resize online, resize scanned pdf india, change pdf paper size",
    ogImage: OG_DEFAULT,
    ogTitle: "Resize PDF Page Size Free Online | FileNova",
    ogDescription: "Change PDF page size to A4, Letter, or custom dimensions. Resize scanned certificates for portal submission. 100% browser-based.",
  },

  // ─── IMAGE TOOLS ─────────────────────────────────────────────────────────

  "/resize-photo": {
    title: "Resize Photo Online Free – Passport, Scholarship | FileNova",
    description: "Resize photo for scholarship form, passport, NEET, JEE, railway, and government portals online free. Exact pixel dimensions, file size guaranteed. No upload — 100% browser-based photo resizer.",
    canonical: "https://filenova.in/resize-photo",
    keywords: "resize photo for scholarship form online free, resize photo online free india, passport photo resize free, photo size reducer for scholarship, resize photo to 200x230 pixels",
    ogImage: "https://filenova.in/photo_resize_mockup.png",
    ogTitle: "Resize Photo Online Free | FileNova",
    ogDescription: "Resize photos for scholarship forms, passports, NEET, JEE. Exact pixel dimensions guaranteed. 100% browser-based.",
    schemaName: "Photo Resizer for India Portals",
    jsonLdFaq: [
      { question: "How to resize photo for scholarship form online free?", answer: "Go to FileNova's Resize Photo tool, upload your photo, choose the 'Scholarship Portal' preset, and click Resize. Download your resized photo instantly — no account needed." },
      { question: "What is the correct passport photo size for India?", answer: "Indian passport photos must be 35x45mm (equivalent to 413x531px at 300 DPI) in JPEG format with a white background." },
      { question: "How to resize photo for NEET 2025 application?", answer: "NEET 2025 requires photos of 200x230 pixels in JPEG format, between 10KB and 40KB. Use FileNova's NEET preset." },
    ],
  },

  "/resize-image": {
    title: "Resize Image Online Free – Custom Dimensions | FileNova",
    description: "Resize images and photos to exact pixel or percentage dimensions online free. Perfect for passport, scholarship, NEET, JEE, and government portal uploads. 100% browser-based resize image tool.",
    canonical: "https://filenova.in/resize-photo",
    keywords: "resize image online free, photo size reducer, resize image dimensions, passport photo resize, image scaler free",
    ogImage: OG_DEFAULT,
    ogTitle: "Resize Image Online Free | FileNova",
    ogDescription: "Resize images to exact pixel dimensions for passports, scholarships, and government portals. No upload needed.",
  },

  "/ocr-pdf": {
    title: "OCR PDF Online Free – Extract Text from Scanned PDF | FileNova",
    description: "Extract text from scanned PDF documents online free. Supports Hindi, Bengali, Tamil, English OCR. Browser-based, no upload needed.",
    canonical: "https://filenova.in/ocr",
    keywords: "ocr pdf online free, extract text from scanned pdf, pdf ocr free, hindi ocr pdf, bengali ocr",
    ogImage: OG_DEFAULT,
    ogTitle: "OCR PDF Online Free | FileNova",
    ogDescription: "Extract text from scanned PDFs online free. Supports Hindi, Bengali, Tamil, English OCR.",
  },

  "/pdf-merge": {
    title: "PDF Merge Free Online – Combine PDF Files | FileNova",
    description: "Merge multiple PDF files into one online free. Combine marksheets, certificates, and documents instantly. No account required. Fast PDF merger.",
    canonical: "https://filenova.in/merge-pdf",
    keywords: "pdf merge free, combine pdf files online, merge pdf documents, pdf joiner free, combine marksheets",
    ogImage: OG_DEFAULT,
    ogTitle: "PDF Merge Free Online | FileNova",
    ogDescription: "Merge multiple PDFs into one file free online. Combine certificates and documents instantly.",
  },

  "/image-to-pdf": {
    title: "Image to PDF Converter Free Online | FileNova",
    description: "Convert JPG, PNG images to PDF online free. Combine multiple photos into one PDF for scholarship and government portal submissions.",
    canonical: "https://filenova.in/jpg-to-pdf",
    keywords: "image to pdf free, convert photo to pdf, jpg to pdf online, multiple images to pdf, picture to pdf",
    ogImage: OG_DEFAULT,
    ogTitle: "Image to PDF Converter Free Online | FileNova",
    ogDescription: "Convert JPG, PNG images to PDF online free. Combine photos into one PDF for portal submissions.",
  },

  "/pdf-to-image": {
    title: "PDF to Image Converter Free Online | FileNova",
    description: "Convert PDF pages to JPG or PNG images online free. Extract all pages or specific pages as separate image files for certificates and uploads.",
    canonical: "https://filenova.in/pdf-to-jpg",
    keywords: "pdf to image free, convert pdf to jpg, pdf page to png, extract pdf as image, pdf to picture converter",
    ogImage: OG_DEFAULT,
    ogTitle: "PDF to Image Converter Free Online | FileNova",
    ogDescription: "Convert PDF pages to JPG or PNG images online free. Extract pages for certificates and portal uploads.",
  },

  "/compress-image": {
    title: "Compress Image Online Free – Reduce Photo Size | FileNova",
    description: "Compress JPEG, PNG, WebP images online free in your browser. Reduce photo file size below 50KB or 100KB for scholarship portal, job application, or email. No upload needed.",
    canonical: "https://filenova.in/compress-image",
    keywords: "compress image online free india, reduce photo size kb free, jpeg size reducer india, compress png free, compress photo below 50kb, reduce image size for scholarship",
    ogImage: "https://filenova.in/photo_resize_mockup.png",
    ogTitle: "Compress Image Online Free | FileNova",
    ogDescription: "Compress JPEG, PNG, WebP images online free. Reduce photo size below 50KB for scholarship portals and job applications.",
    schemaName: "Image Compressor",
    jsonLdFaq: [
      { question: "How to compress image to 50KB online free in India?", answer: "Upload your image on FileNova, select 'Custom Target Size', set 50KB, and click Compress. The tool uses a binary-search quality algorithm to hit your exact target." },
      { question: "How to reduce photo size for scholarship portal?", answer: "Upload your photo on FileNova's Compress Image tool, use 'Web Small' preset or set a custom target like 50KB, download the compressed photo." },
    ],
  },

  "/remove-background": {
    title: "Remove Image Background Online Free – AI | FileNova",
    description: "Remove photo background online free using AI in your browser. Get transparent PNG or white background for passport photos, ID cards, and visa applications instantly. No upload required.",
    canonical: "https://filenova.in/remove-background",
    keywords: "remove background online free india, ai background remover india, remove photo background passport, transparent background free, white background photo online, remove bg free",
    ogImage: "https://filenova.in/document_processing_mockup.png",
    ogTitle: "Remove Image Background Online Free – AI | FileNova",
    ogDescription: "Remove photo background online free using AI. Get transparent or white background for passports and ID cards. No upload needed.",
    jsonLdFaq: [
      { question: "How to remove background from photo free online in India?", answer: "Upload your photo on FileNova's AI Background Remover, choose Transparent or White background, and click Remove Background. The result downloads as PNG in seconds." },
      { question: "Can I get a white background for passport photo free?", answer: "Yes. FileNova's background remover has a 'Solid White' option that replaces any background with pure white — perfect for passport, visa, and ID card photos." },
    ],
  },

  // ─── OCR ─────────────────────────────────────────────────────────────────

  "/ocr": {
    title: "OCR Hindi Bengali English Free Online – Scan to Text | FileNova",
    description: "Extract text from scanned PDFs, certificates, Aadhaar, and images online free. Supports Hindi, Bengali, Tamil, Telugu, Kannada, and English OCR. Browser-based, no upload required.",
    canonical: "https://filenova.in/ocr",
    keywords: "ocr hindi online free, bengali ocr online, scan to text india free, extract text from scanned pdf india, hindi text recognition, pdf ocr india, aadhaar text extract",
    ogImage: OG_DEFAULT,
    ogTitle: "OCR Hindi Bengali English Free Online | FileNova",
    ogDescription: "Extract text from scanned PDFs and images. Supports Hindi, Bengali, Tamil, Telugu, Kannada, English OCR. Browser-based, no upload.",
    schemaName: "Multilingual OCR Tool",
    jsonLdFaq: [
      { question: "How to extract text from Hindi PDF online free?", answer: "Upload your Hindi PDF or scanned image on FileNova's OCR tool, select Hindi from the language options, and click Process. The extracted text appears immediately." },
      { question: "Does FileNova OCR support Bengali?", answer: "Yes. FileNova OCR supports Bengali, Hindi, Tamil, Telugu, Kannada, and English. You can select multiple languages simultaneously for mixed-language documents." },
    ],
  },

  // ─── DOCUMENT / OFFICE TOOLS ─────────────────────────────────────────────

  "/compress-doc": {
    title: "Compress Word Excel PPT Free Online | FileNova",
    description: "Compress Microsoft Word, Excel, and PowerPoint files online free. Reduce DOCX, XLSX, PPTX file sizes for email attachments and portal uploads without losing quality.",
    canonical: "https://filenova.in/compress-doc",
    keywords: "compress word file online free india, compress excel file, compress pptx online, reduce docx size free, compress office files india",
    ogImage: OG_DEFAULT,
    ogTitle: "Compress Word Excel PPT Free Online | FileNova",
    ogDescription: "Compress Word, Excel, and PowerPoint files online free. Reduce DOCX, XLSX, PPTX sizes for email attachments.",
  },

  // ─── AI TOOLS ─────────────────────────────────────────────────────────────

  // AI PPT Maker entry disabled — uncomment to re-enable
  /*
  "/ai-ppt-maker": {
    title: "AI PPT Maker Free – Topic to Slides in Seconds | FileNova",
    description: "Generate complete PowerPoint presentations from any topic or notes using AI for free. Choose themes, writing tone, and number of slides. Perfect for school and college projects in India.",
    canonical: "https://filenova.in/ai-ppt-maker",
    keywords: "ai ppt maker free india, ai presentation maker, topic to ppt generator free, ai slides maker no signup, free powerpoint generator india",
    ogImage: OG_DEFAULT,
    ogTitle: "AI PPT Maker Free – Topic to Slides | FileNova",
    ogDescription: "Generate PowerPoint presentations from any topic using AI. Choose themes and tone. Perfect for school and college projects. Free to use.",
    schemaName: "AI PowerPoint Maker",
    jsonLdFaq: [
      { question: "How to make a PowerPoint presentation from topic using AI free?", answer: "Enter your topic on FileNova's AI PPT Maker, choose number of slides and writing tone, and click Generate. A complete themed PowerPoint presentation is ready to download in seconds." },
      { question: "Can I make PPT from my notes using AI for free?", answer: "Yes. Paste your notes or syllabus points, select a theme, and the AI generates structured slides with headings, bullet points, and formatting automatically." },
    ],
  },
  */

  "/ai-pdf-summary": {
    title: "AI PDF Summarizer Free – Extract Key Points | FileNova",
    description: "Summarize long PDF documents using AI online free. Get bullet-point summaries, key insights, and important highlights from textbooks, research papers, and reports in seconds.",
    canonical: "https://filenova.in/ai-pdf-summary",
    keywords: "ai pdf summarizer free india, summarize pdf online free, extract key points from pdf, pdf to summary ai, chat with pdf free india, ai document summary",
    ogImage: OG_DEFAULT,
    ogTitle: "AI PDF Summarizer Free | FileNova",
    ogDescription: "Summarize long PDF documents using AI. Get bullet-point summaries and key insights from textbooks and research papers.",
  },

  // ─── GOVERNMENT & FORM TOOLS ─────────────────────────────────────────────

  "/government-form-fill": {
    title: "Fill Government PDF Forms Online Free | FileNova",
    description: "Fill Aadhaar, PAN, passport, and scholarship PDF forms online free. Type directly on PDF forms, add signature, and download — no Acrobat, no account required.",
    canonical: "https://filenova.in/government-form-fill",
    keywords: "fill pdf form online free india, fill government form pdf, write on pdf free india, aadhaar correction form fill online, pan card form fill free",
    ogImage: OG_DEFAULT,
    ogTitle: "Fill Government PDF Forms Online Free | FileNova",
    ogDescription: "Fill Aadhaar, PAN, passport, and scholarship PDF forms online. Type directly on PDFs, add signature. No account required.",
  },

  // ─── STATIC PAGES ─────────────────────────────────────────────────────────

  "/pricing": {
    title: "FileNova Pricing – Affordable AI PDF Tools | ₹49/mo",
    description: "Choose the right FileNova plan for your needs. Free tier available. Basic ₹49/mo, Pro ₹99/mo, Elite ₹199/mo. Secure UPI and card payments. Bulk discounts for CSC and cyber cafes.",
    canonical: "https://filenova.in/pricing",
    keywords: "filenova pricing, pdf tools pricing india, document tools subscription, premium pdf tools india, csc center tools, cyber cafe software pricing",
    ogImage: "https://filenova.in/upi-qr.png",
    ogTitle: "FileNova Pricing – Affordable AI PDF Tools | ₹49/mo",
    ogDescription: "Choose your FileNova plan. Free tier, Basic ₹49/mo, Pro ₹99/mo, Elite ₹199/mo. Secure UPI payments. CSC and cyber cafe plans available.",
  },

  "/workspace": {
    title: "FileNova Workspace – Manage Documents Online",
    description: "FileNova workspace for processing PDFs, images, and office documents. Upload, process, and download files in one place. Supports batch processing and AI-powered tools.",
    canonical: "https://filenova.in/workspace",
    keywords: "document workspace, pdf workspace, online document editor, file processing, batch document processing",
    ogImage: OG_DEFAULT,
    ogTitle: "FileNova Workspace – Manage Documents Online",
    ogDescription: "Process PDFs, images, and office documents in one workspace. Upload, process, and download. Supports batch processing.",
  },

  "/dashboard": {
    title: "Dashboard | FileNova",
    description: "Your FileNova dashboard. View recent files, processing history, usage statistics, and quick access to your favorite tools. Manage your account and subscription.",
    canonical: "https://filenova.in/dashboard",
    keywords: "file dashboard, document history, recent files, account dashboard, file processing history",
    ogImage: OG_DEFAULT,
    ogTitle: "Dashboard | FileNova",
    ogDescription: "Your FileNova dashboard. View recent files, history, usage stats, and quick access to your favorite tools.",
  },

  "/login": {
    title: "Sign In – FileNova Account",
    description: "Sign in to your FileNova account. Access premium features, view document history, and manage your subscription. Sign in with email or Google.",
    canonical: "https://filenova.in/login",
    keywords: "filenova login, sign in, file account, document tools login",
    ogImage: OG_DEFAULT,
    ogTitle: "Sign In – FileNova Account",
    ogDescription: "Sign in to FileNova to access premium features, view history, and manage your subscription.",
  },

  "/referral": {
    title: "Refer & Earn – FileNova Rewards Program",
    description: "Refer friends to FileNova and earn rewards. Share your referral link and get premium features when your friends sign up. No limit on referrals.",
    canonical: "https://filenova.in/referral",
    keywords: "filenova referral, refer and earn, file referral program, share filenova, earn rewards india",
    ogImage: OG_DEFAULT,
    ogTitle: "Refer & Earn – FileNova Rewards Program",
    ogDescription: "Refer friends to FileNova and earn rewards. Share your link and get premium features when they sign up.",
  },

  "/history": {
    title: "File History – Recent Documents | FileNova",
    description: "View your recent file processing history on FileNova. Access previously processed PDFs, images, and documents. Re-download or re-process files.",
    canonical: "https://filenova.in/history",
    keywords: "file history, document history, recent files, processing history, download history",
    ogImage: OG_DEFAULT,
    ogTitle: "File History – Recent Documents | FileNova",
    ogDescription: "View your recent file processing history. Access, re-download, or re-process previously edited documents.",
  },

  "/blog": {
    title: "FileNova Blog – Document Tips & Guides",
    description: "Learn how to compress PDFs, mask Aadhaar, resize photos for scholarships, and more. FileNova blog with helpful guides for Indian students and professionals.",
    canonical: "https://filenova.in/blog",
    keywords: "filenova blog, pdf tips, document guides, aadhaar guide, scholarship guide, document processing tips india",
    ogImage: OG_DEFAULT,
    ogTitle: "FileNova Blog – Document Tips & Guides",
    ogDescription: "Learn how to compress PDFs, mask Aadhaar, resize photos for scholarships, and more. Helpful guides for Indian students.",
  },

  "/contact": {
    title: "Contact FileNova – Support & Feedback",
    description: "Get in touch with FileNova support. Contact us for help with PDF tools, image tools, account issues, or feedback. We respond within 24 hours.",
    canonical: "https://filenova.in/contact",
    keywords: "contact filenova, file support, document tools help, customer support india, feedback",
    ogImage: OG_DEFAULT,
    ogTitle: "Contact FileNova – Support & Feedback",
    ogDescription: "Contact FileNova support. Get help with PDF tools, account issues, or send feedback. We respond within 24 hours.",
  },

  "/resources": {
    title: "Resources – Guides & Tools | FileNova",
    description: "Explore FileNova resources including tool guides, document processing tips, scholarship application guides, and government portal submission help for Indian students.",
    canonical: "https://filenova.in/resources",
    keywords: "filenova resources, document guides, pdf tutorials, scholarship application guide, government portal help",
    ogImage: OG_DEFAULT,
    ogTitle: "Resources – Guides & Tools | FileNova",
    ogDescription: "Explore guides for document processing, scholarship applications, and government portal submissions.",
  },

  "/privacy": {
    title: "Privacy Policy – FileNova",
    description: "FileNova privacy policy. Learn how we protect your data. All document processing happens in your browser — files are never uploaded to our servers.",
    canonical: "https://filenova.in/privacy",
    keywords: "filenova privacy, privacy policy, data protection, file privacy india, secure document processing",
    ogImage: OG_DEFAULT,
    ogTitle: "Privacy Policy – FileNova",
    ogDescription: "FileNova privacy policy. Your documents are processed in your browser — files never leave your device.",
  },

  "/terms": {
    title: "Terms of Service – FileNova",
    description: "FileNova terms of service. Understand the terms governing your use of FileNova's document processing tools, subscriptions, and services.",
    canonical: "https://filenova.in/terms",
    keywords: "filenova terms, terms of service, terms and conditions, document tools terms",
    ogImage: OG_DEFAULT,
    ogTitle: "Terms of Service – FileNova",
    ogDescription: "FileNova terms of service governing use of our document processing tools and services.",
  },

  "/cookie-policy": {
    title: "Cookie Policy – FileNova",
    description: "FileNova cookie policy. Learn how we use cookies to improve your experience on our platform. Understand your cookie preferences and choices.",
    canonical: "https://filenova.in/cookie-policy",
    keywords: "filenova cookies, cookie policy, privacy cookies, file website cookies",
    ogImage: OG_DEFAULT,
    ogTitle: "Cookie Policy – FileNova",
    ogDescription: "Learn how FileNova uses cookies to improve your experience. Manage your cookie preferences.",
  },

  "/profile": {
    title: "Profile – Account Settings | FileNova",
    description: "Manage your FileNova account settings. Update your profile, change password, manage notifications, and view your subscription details.",
    canonical: "https://filenova.in/profile",
    keywords: "filenova profile, account settings, user profile, manage account",
    ogImage: OG_DEFAULT,
    ogTitle: "Profile – Account Settings | FileNova",
    ogDescription: "Manage your FileNova account settings, update profile, change password, and view subscription details.",
  },

  "/student-offer": {
    title: "Student Offer – Discounted Plans | FileNova",
    description: "Get exclusive FileNova student discounts on premium plans. Special pricing for Indian students. Verify your student status and save on document processing tools.",
    canonical: "https://filenova.in/student-offer",
    keywords: "filenova student offer, student discount, student plans india, discounted document tools, student subscription",
    ogImage: OG_DEFAULT,
    ogTitle: "Student Offer – Discounted Plans | FileNova",
    ogDescription: "Exclusive student discounts on FileNova premium plans. Special pricing for Indian students. Verify and save.",
  },

  "/india-tools": {
    title: "India-Specific Document Tools – Aadhaar, PAN, Scholarship | FileNova",
    description: "India-specific document tools by FileNova. Mask Aadhaar card, resize PAN card photo, create scholarship ZIP files, fill government forms. Built for Indian users.",
    canonical: "https://filenova.in/india-tools",
    keywords: "india specific tools, aadhaar tools, pan card tools, scholarship tools, india document tools, government form tools",
    ogImage: OG_DEFAULT,
    ogTitle: "India-Specific Tools – Aadhaar, PAN, Scholarship | FileNova",
    ogDescription: "India-specific document tools. Mask Aadhaar, resize PAN, create scholarship ZIPs. Built for Indian students and professionals.",
    jsonLdFaq: [
      { question: "Which portals are these tools optimized for?", answer: "Our tools are pre-configured to match the exact file size, dimension, and formatting requirements of portals like NSDL PAN, NSP, SVMCM, OASIS, Mahadbt, IRCTC, and UIDAI." },
      { question: "Does FileNova save my Aadhaar card number?", answer: "No. Aadhaar masking is executed entirely on your local machine using client-side WebAssembly. We never upload, transmit, view, or store any part of your Aadhaar card." },
      { question: "How does the Scholarship ZIP Maker work?", answer: "It automatically names, checks, and organizes required documents (such as marksheets, income certificate, student photo, signature) into a single zip bundle matching specifications of the SVMCM, NSP, or OASIS portals." }
    ],
  },

  "/workflows": {
    title: "Workflows – Automated Document Processing | FileNova",
    description: "Create automated document processing workflows with FileNova. Batch process PDFs, images, and documents with preset configurations for scholarships and government forms.",
    canonical: "https://filenova.in/workflows",
    keywords: "document workflows, automated processing, batch processing, scholarship workflow, document pipeline",
    ogImage: OG_DEFAULT,
    ogTitle: "Workflows – Automated Document Processing | FileNova",
    ogDescription: "Create automated document processing workflows. Batch process PDFs and images with presets for scholarships.",
  },

  "/premium": {
    title: "FileNova Premium – AI Document Tools & Features",
    description: "Unlock FileNova Premium features. Access batch processing, AI PDF summarizer, unlimited OCR, priority support, and advanced document tools. Upgrade your document workflow today.",
    canonical: "https://filenova.in/premium",
    keywords: "filenova premium, premium document tools, ai pdf tools premium, batch processing, unlimited ocr, priority support",
    ogImage: OG_DEFAULT,
    ogTitle: "FileNova Premium – AI Document Tools & Features",
    ogDescription: "Unlock Premium features: batch processing, AI summarizer, unlimited OCR, priority support. Upgrade your document workflow.",
  },

  "/tools/compress-pan-card": {
    title: "Compress PAN Card Photo Free Online | FileNova",
    description: "Compress PAN card photo and signature to exact KB size online free. Reduce PAN card image below 50KB for NEET, NSP, railway, and government portal uploads. 100% browser-based, no upload.",
    canonical: "https://filenova.in/tools/compress-pan-card",
    keywords: "compress pan card photo online free, reduce pan card image size, pan card photo under 50kb, pan card signature resize, portal upload pan card",
    ogImage: OG_DEFAULT,
    ogTitle: "Compress PAN Card Photo Free Online | FileNova",
    ogDescription: "Compress PAN card photo and signature to exact KB size for NEET, NSP, railway portals. 100% browser-based.",
    schemaName: "PAN Card Photo Compressor",
  },

  "/tools": {
    title: "All Document, PDF & Image Tools Online | FileNova",
    description: "Browse 30+ free online document, PDF, and image processing tools. Secure, browser-based, and no signup needed. Built for Indian students and CSC centers.",
    canonical: "https://filenova.in/tools",
    keywords: "filenova tools directory, free pdf tools, online image tools, document conversion, csc operator tools",
    ogImage: OG_DEFAULT,
    ogTitle: "All Document, PDF & Image Tools Online | FileNova",
    ogDescription: "Explore 30+ secure, fast, and free PDF, image, and document tools. Local browser-based processing.",
    jsonLdFaq: [
      { question: "What tools does FileNova offer?", answer: "FileNova provides a comprehensive suite of 30+ document automation tools including PDF tools (Merge, Compress, Split, Convert), Image Lab (Resize, Compress, Background Removal), Document Suite (Word to PDF), Video Studio, and pre-configured India-specific tools." },
      { question: "Are my files secure on FileNova?", answer: "Yes, 100%. FileNova uses local browser-based execution (via WebAssembly and Canvas APIs) to process your PDFs, images, and documents. Your confidential files never touch our servers." },
      { question: "Do I need to pay or register an account?", answer: "No. All core features and utility tools are completely free to use with no account or registration required." }
    ],
  },

  "/pdf-tools": {
    title: "PDF Tools Suite – Merge, Compress, Split & Convert | FileNova",
    description: "Complete online PDF toolkit. Merge PDF, compress PDF, split pages, protect, unlock, or convert PDFs to Word/JPG. Fast, secure, browser-based and free.",
    canonical: "https://filenova.in/pdf-tools",
    keywords: "free pdf tools, merge pdf online, compress pdf free, split pdf pages, pdf converter, secure pdf editor",
    ogImage: OG_DEFAULT,
    ogTitle: "PDF Tools Suite – Merge, Compress, Split & Convert | FileNova",
    ogDescription: "Fast, secure, and free online PDF tools. Combine, compress, split, convert, and protect documents locally.",
    jsonLdFaq: [
      { question: "Are these PDF tools completely free to use?", answer: "Yes, all core tools in the PDF Suite are free to use. Premium plans are available for larger file size limits and batch processing." },
      { question: "Are my PDF files safe from leakage?", answer: "Yes. FileNova processes documents client-side inside your browser. Your files are never uploaded to any remote server." },
      { question: "Can I use these PDF tools on my mobile phone?", answer: "Yes. All FileNova PDF tools are fully optimized for mobile browsers on Android and iOS devices." }
    ],
  },

  "/image-tools": {
    title: "Image Lab Suite – Compress, Resize, Remove BG | FileNova",
    description: "Optimize and edit images online free. Compress images under 50KB, resize photos, and remove background with AI. 100% private, browser-based processing.",
    canonical: "https://filenova.in/image-tools",
    keywords: "free image tools, compress image online, resize photo free, ai background remover, image converter",
    ogImage: OG_DEFAULT,
    ogTitle: "Image Lab Suite – Compress, Resize, Remove BG | FileNova",
    ogDescription: "Optimize, resize, and edit photos online free. High-quality AI background removal and image compression.",
    jsonLdFaq: [
      { question: "How do I compress images for Indian government portals?", answer: "Use the Compress Image tool. Select standard presets like under 50KB or 20KB for passport photos and signatures to match portal requirements." },
      { question: "What formats does the Image Lab support?", answer: "The Image Lab supports all common formats including JPEG, PNG, WebP, and SVG." }
    ],
  },

  "/document-tools": {
    title: "Document Tools Suite – Word, Excel, PPT Converter | FileNova",
    description: "Convert, merge, and clean office documents online free. Convert Word to PDF, Excel to CSV. 100% secure, browser-based.",
    canonical: "https://filenova.in/document-tools",
    keywords: "document tools online, word to pdf free, convert docx, clean docx online, excel to csv converter",
    ogImage: OG_DEFAULT,
    ogTitle: "Document Tools Suite – Word, Excel, PPT Converter | FileNova",
    ogDescription: "Convert and clean Word, Excel, and PowerPoint documents online free. Local browser-based conversion.",
    jsonLdFaq: [
      { question: "Can I convert Docx to PDF without formatting issues?", answer: "Yes. FileNova's converter preserves formatting, styles, and tables when converting Word documents to PDF." },
      { question: "Is my document data private?", answer: "Absolutely. All conversions happen securely inside your browser Sandbox using client-side libraries." }
    ],
  },

  "/video-tools": {
    title: "Video Studio Suite – Trim, Compress, Convert GIF | FileNova",
    description: "Edit and optimize video and audio online free. Trim video clips, compress MP4, extract audio to MP3, and convert video to GIF. 100% local processing.",
    canonical: "https://filenova.in/video-tools",
    keywords: "free video tools, trim video online, compress mp4 free, video to gif converter, extract audio mp3",
    ogImage: OG_DEFAULT,
    ogTitle: "Video Studio Suite – Trim, Compress, Convert GIF | FileNova",
    ogDescription: "Trim, compress, and convert video and audio files online free. Quick browser-based processing.",
    jsonLdFaq: [
      { question: "What formats can I compress with the Video Studio?", answer: "You can compress and optimize MP4, WebM, and other popular video formats directly in your browser." },
      { question: "Can I extract MP3 audio from a video?", answer: "Yes. Use our Extract Audio tool to instantly turn any video file into a download-ready MP3 file." }
    ],
  },

  "/trim": {
    title: "Trim Video Online Free – Cut MP4, WebM, MOV | FileNova",
    description: "Trim and cut video clips online free. Select start and end points to extract the part you need. Supports MP4, WebM, and MOV. No upload needed.",
    canonical: "https://filenova.in/trim",
    keywords: "trim video online free, cut video online, video trimmer, mp4 cutter, trim video without uploading",
    ogImage: OG_DEFAULT,
    ogTitle: "Trim Video Online Free | FileNova",
    ogDescription: "Trim and cut video clips online free. Select start and end points to extract the part you need from MP4, WebM, and MOV files.",
    schemaName: "Video Trimmer",
  },
  "/compress-video": {
    title: "Compress Video Online Free – Reduce MP4, WebM Size | FileNova",
    description: "Compress video files online free. Reduce MP4, WebM, and MOV file size without losing quality. Perfect for sharing on WhatsApp, email, and portals.",
    canonical: "https://filenova.in/compress-video",
    keywords: "compress video online free, reduce mp4 size, video compressor, shrink video file, compress video for whatsapp",
    ogImage: OG_DEFAULT,
    ogTitle: "Compress Video Online Free | FileNova",
    ogDescription: "Reduce MP4, WebM, and MOV video file size online free. Compress for WhatsApp, email, and portal uploads without losing quality.",
    schemaName: "Video Compressor",
  },
  "/video-to-audio": {
    title: "Extract Audio from Video – MP4 to MP3 Free | FileNova",
    description: "Extract audio from video files online free. Convert MP4 to MP3, extract soundtrack, or save audio from any video clip. Local browser processing.",
    canonical: "https://filenova.in/video-to-audio",
    keywords: "extract audio from video, mp4 to mp3, video to audio converter, extract music from video, mp4 audio extractor free",
    ogImage: OG_DEFAULT,
    ogTitle: "Extract Audio from Video – MP4 to MP3 | FileNova",
    ogDescription: "Extract audio from MP4, WebM, and MOV videos online free. Convert video to MP3 audio instantly in your browser.",
    schemaName: "Video to Audio Converter",
  },
  "/video-to-gif": {
    title: "Video to GIF – Convert MP4 to GIF Free Online | FileNova",
    description: "Convert video to animated GIF online free. Turn MP4, WebM clips into GIF images. Perfect for social media, memes, and presentations.",
    canonical: "https://filenova.in/video-to-gif",
    keywords: "video to gif, convert mp4 to gif, gif maker, video to gif converter, create gif from video free",
    ogImage: OG_DEFAULT,
    ogTitle: "Video to GIF – Convert MP4 to GIF | FileNova",
    ogDescription: "Convert video clips to animated GIFs online free. Turn MP4 and WebM into shareable GIF images for social media and presentations.",
    schemaName: "Video to GIF Converter",
  },
  "/compress-audio": {
    title: "Compress Audio Online Free – Reduce MP3, M4A, WAV Size | FileNova",
    description: "Compress audio files online free. Reduce MP3, M4A, WAV, and OGG file size for emails and uploads. Local browser-based processing.",
    canonical: "https://filenova.in/compress-audio",
    keywords: "compress audio online free, reduce mp3 size, audio compressor, shrink m4a file, compress audio for email",
    ogImage: OG_DEFAULT,
    ogTitle: "Compress Audio Online Free | FileNova",
    ogDescription: "Reduce MP3, M4A, WAV, and OGG audio file size online free. Compress audio for emails, uploads, and messaging apps.",
    schemaName: "Audio Compressor",
  },
};
