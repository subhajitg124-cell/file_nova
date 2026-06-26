export interface FAQItem {
  q: string;
  a: string;
}

export interface StepByStepItem {
  title: string;
  description: string;
  icon?: string;
}

export interface RelatedTool {
  label: string;
  slug: string;
  icon: string;
}

export interface ToolContent {
  slug: string;
  title: string;               // <title> tag
  h1: string;                  // <h1> on page
  metaDescription: string;
  keywords: string;
  toolName: string;            // schema toolName
  toolDescription: string;     // schema description
  seoBody: string[];           // paragraphs (200+ words total)
  faqs: FAQItem[];
  relatedTools: RelatedTool[];
  badge?: string;              // e.g. "India Exclusive"
  steps?: StepByStepItem[];    // Step-by-step guide for HowTo schema
  howToName?: string;          // Name for HowTo schema
  toolCategory?: 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'ocr' | 'form';
  features?: { icon: string; title: string; description: string }[];
  useCases?: { title: string; description: string }[];
}

export const toolContentMap: Record<string, ToolContent> = {

  "merge-pdf": {
    slug: "merge-pdf",
    title: "Merge PDF – Free Online PDF Merger | FileNova",
    h1: "Merge PDF – Free Online PDF Merger",
    metaDescription:
      "Merge PDF files online for free. Combine multiple PDF documents into one in seconds. No signup needed. Works on any device — try FileNova's free PDF merger now.",
    keywords:
      "merge pdf, combine pdf online, pdf merger free, merge pdf files, combine pdf files, merge pdf online india",
    toolName: "FileNova PDF Merger",
    toolDescription:
      "Free online tool to merge multiple PDF files into one combined document instantly, with no signup required.",
    seoBody: [
      "Merging PDF files is one of the most common document tasks — whether you're combining scanned pages, joining chapters of a report, or assembling multiple invoices into a single file for submission.",
      "FileNova's free PDF merger lets you upload multiple PDF files, arrange them in any order using drag-and-drop, and download the merged result instantly. No account creation, no watermarks, no file size tricks.",
      "This tool is especially useful for Indian users who need to combine documents for government portal submissions — like clubbing your Aadhaar, PAN, and income proof into a single PDF for scholarship or loan applications.",
      "All files are processed securely in your browser or on our encrypted servers, and permanently deleted after download. FileNova never stores your documents.",
      "After merging, you might also need to [Compress PDF](compress-pdf) for reducing file size or [Split PDF](split-pdf) to extract specific pages from the combined file.",
    ],
    faqs: [
      {
        q: "How do I merge PDF files online for free?",
        a: "Upload your PDF files to FileNova's Merge PDF tool, drag to arrange them in the order you want, then click 'Merge PDF'. Your combined file downloads instantly — no account needed.",
      },
      {
        q: "Is there a limit on how many PDFs I can merge?",
        a: "Free users can merge up to 5 PDF files per task. FileNova Pro users get unlimited file merging with no size restrictions.",
      },
      {
        q: "Is FileNova's PDF merger safe to use?",
        a: "Yes. Files are processed using encrypted connections and deleted from our servers immediately after your download. We never share or store your documents.",
      },
      {
        q: "Can I merge PDFs on my phone?",
        a: "Yes. FileNova works on Android, iPhone, tablet, and desktop browsers. No app download is required — just open the website and use it.",
      },
      {
        q: "Can I reorder pages after merging?",
        a: "You can reorder the input PDF files before merging. For page-level reordering within a merged document, use FileNova's PDF editor after merging.",
      },
    ],
    relatedTools: [
      { label: "Split PDF", slug: "split-pdf", icon: "scissors" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
      { label: "Rotate PDF", slug: "rotate-pdf", icon: "rotate" },
    ],
    features: [
      { icon: "files", title: "Combine Up to 5 Files", description: "Upload and merge up to 5 PDF files in one task. Pro users get unlimited merging with no file count restrictions." },
      { icon: "move", title: "Drag-and-Drop Reordering", description: "Arrange your PDFs in any order using intuitive drag-and-drop. The first file becomes the first page of the merged document." },
      { icon: "zap", title: "Instant Processing", description: "No queues, no waiting. Your merged PDF is ready to download within seconds, even for large documents." },
    ],
    useCases: [
      { title: "Government Document Submission", description: "Combine Aadhaar, PAN, income proof, and address proof into a single PDF for scholarship applications, loan applications, or college admissions." },
      { title: "Business Invoice Consolidation", description: "Merge multiple monthly invoices into one PDF for client billing, audit trails, or accounting record-keeping." },
    ],
    steps: [
      { title: "Upload your PDF files", description: "Click the upload area or drag and drop multiple PDF files you want to merge. You can upload up to 5 files for free, or unlimited with Pro.", icon: "upload" },
      { title: "Arrange file order", description: "Drag the file cards to set the order you want in the merged PDF. The first file will appear first in the output.", icon: "configure" },
      { title: "Merge and download", description: "Click 'Merge PDF' to combine all files into one. Your merged PDF will be ready to download instantly.", icon: "download" },
    ],
    howToName: "Merge PDF Files Online",
    toolCategory: "pdf",
  },

  "split-pdf": {
    slug: "split-pdf",
    title: "Split PDF – Free Online PDF Splitter | FileNova",
    h1: "Split PDF – Split PDF Files Online Free",
    metaDescription:
      "Split a PDF into multiple files online for free. Extract specific pages or divide large PDFs instantly. No signup. Works on any device.",
    keywords:
      "split pdf, split pdf online free, pdf splitter, extract pdf pages, divide pdf, split pdf india",
    toolName: "FileNova PDF Splitter",
    toolDescription:
      "Free online PDF splitter to divide a single PDF into multiple files or extract specific page ranges.",
    seoBody: [
      "Need to extract just a few pages from a large PDF report? Or split a combined document into separate files for different recipients? FileNova's Split PDF tool makes this instant and free.",
      "Choose from three split modes: split every page into a separate PDF, split by page ranges (e.g. pages 1–5, 6–12), or extract specific individual pages. Download all output files as a ZIP.",
      "This is especially handy for Indian students and professionals who receive combined mark sheets, certificates, or government letters in a single PDF and need to share specific pages separately.",
      "No installation required. Works entirely in your browser on any device — Android phone, iPhone, Windows PC, or Mac.",
      "After splitting, you can [Merge PDF](merge-pdf) to combine relevant pages back together, or [Compress PDF](compress-pdf) to reduce individual file sizes.",
    ],
    faqs: [
      {
        q: "How do I split a PDF into multiple files?",
        a: "Upload your PDF to FileNova's Split PDF tool, choose your split method (by page range, every page, or custom pages), and click Split. Download the resulting files as a ZIP archive.",
      },
      {
        q: "Can I extract just one page from a PDF?",
        a: "Yes. Use the 'Extract pages' option, enter the page number you want, and FileNova will create a new PDF with only that page.",
      },
      {
        q: "Is splitting PDFs free on FileNova?",
        a: "Yes, splitting PDFs is completely free. Free users can split PDFs up to a certain file size. Pro users get unlimited splitting with no restrictions.",
      },
      {
        q: "Will splitting a PDF reduce its quality?",
        a: "No. FileNova splits PDFs without re-rendering or compressing the content, so all text, images, and formatting remain identical to the original.",
      },
    ],
    relatedTools: [
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Rotate PDF", slug: "rotate-pdf", icon: "rotate" },
      { label: "PDF to JPG", slug: "pdf-to-jpg", icon: "photo" },
    ],
    features: [
      { icon: "scissors", title: "Three Split Methods", description: "Split every page into separate PDFs, extract by page range, or pick custom individual pages. Choose what works for your task." },
      { icon: "file-archive", title: "ZIP Bulk Download", description: "Download all split files individually or get a single ZIP archive containing every extracted page for convenience." },
      { icon: "copy", title: "Lossless Splitting", description: "Pages are extracted without re-rendering or quality loss — text, images, and formatting remain identical to the original." },
    ],
    useCases: [
      { title: "Share Specific Pages from a Report", description: "Extract only relevant pages from a large PDF report before sharing with colleagues instead of sending the entire document." },
      { title: "Extract Certificate from Marksheet", description: "Split a combined marksheet PDF to separate each semester or board certificate into individual files for different applications." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select or drag and drop the PDF file you want to split.", icon: "upload" },
      { title: "Choose split mode", description: "Pick how you want to split: every page into separate files, by page range, or extract specific pages.", icon: "configure" },
      { title: "Download split files", description: "Click Split to process. Download individual files or get all pages as a ZIP archive.", icon: "download" },
    ],
    howToName: "Split PDF Files Online",
    toolCategory: "pdf",
  },

  "compress-pdf": {
    slug: "compress-pdf",
    title: "Compress PDF – Reduce PDF File Size Free | FileNova",
    h1: "Compress PDF – Reduce PDF File Size Online Free",
    metaDescription:
      "Compress PDF files online and reduce file size without losing quality. Shrink PDFs for email, WhatsApp, or government portal uploads. Free, fast, no signup.",
    keywords:
      "compress pdf, reduce pdf size, compress pdf online free, shrink pdf, pdf compressor india, compress pdf under 100kb",
    toolName: "FileNova PDF Compressor",
    toolDescription:
      "Free online PDF compressor that reduces file size without significant quality loss, ideal for email attachments and government portal uploads.",
    seoBody: [
      "Large PDF files are a constant headache — email attachments get rejected, WhatsApp has a 100MB limit, and government portals like DigiLocker or IRCTC often cap uploads at 200KB or 1MB.",
      "FileNova's PDF compressor intelligently reduces file size by optimizing embedded images, removing redundant metadata, and compressing fonts — while preserving the readability of your document.",
      "You can choose your compression level: Low (best quality), Medium (balanced), or High (smallest file size). For most government document uploads, Medium compression will bring a 2–3MB PDF down to under 500KB.",
      "No watermarks. No quality surprise. No account needed. Just upload, compress, and download.",
      "Need more file size control? Try [Compress for Upload](compress-pdf-for-upload) to hit an exact KB target, or [Merge PDF](merge-pdf) to combine multiple compressed files.",
    ],
    faqs: [
      {
        q: "How do I compress a PDF without losing quality?",
        a: "Upload your PDF to FileNova's Compress PDF tool and select 'Low' compression for maximum quality preservation. The tool optimizes the file without visibly degrading text or images.",
      },
      {
        q: "Can I compress a PDF to under 100KB?",
        a: "Yes, for most scanned or image-heavy PDFs, selecting 'High' compression will reduce the file to under 200KB, and often under 100KB. For text-only PDFs, results vary.",
      },
      {
        q: "Will compressing a PDF remove text or images?",
        a: "No. FileNova's compressor does not remove content. It compresses the encoding of images and fonts to reduce file size while keeping all content intact.",
      },
      {
        q: "Is PDF compression free on FileNova?",
        a: "Yes. Compressing PDFs is completely free for all users. Pro users get batch compression and higher upload size limits.",
      },
    ],
    relatedTools: [
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Compress for Upload", slug: "compress-pdf-for-upload", icon: "cloud-upload" },
      { label: "PDF to JPG", slug: "pdf-to-jpg", icon: "photo" },
      { label: "Resize PDF", slug: "resize-pdf", icon: "resize" },
    ],
    features: [
      { icon: "gauge", title: "Three Compression Levels", description: "Choose Low for maximum quality, Medium for balanced output, or High for the smallest file size. Preview the estimated size before downloading." },
      { icon: "file-text", title: "Preserves Readability", description: "Text remains sharp and readable at every compression level. Only images are optimized — your document content stays intact." },
      { icon: "eye", title: "Real-Time Size Preview", description: "See the estimated file size before you download. No trial-and-error — pick the compression level that meets your portal's limit." },
    ],
    useCases: [
      { title: "Compress for Portal Upload", description: "Reduce a scanned document from 3MB to under 200KB for scholarship, DigiLocker, or IRCTC uploads that have strict file size caps." },
      { title: "Shrink for Instant Messaging", description: "Compress large PDFs before sending over WhatsApp or email where file size limits often cause failed deliveries." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the PDF file you want to compress. Larger files may take slightly longer to process.", icon: "upload" },
      { title: "Choose compression level", description: "Select Low for best quality, Medium for balanced, or High for smallest file size. For most uses, Medium works great.", icon: "configure" },
      { title: "Compress and download", description: "Click 'Compress PDF' and wait a few seconds. Your compressed file will be ready to download.", icon: "download" },
    ],
    howToName: "Compress PDF Files Online",
    toolCategory: "pdf",
  },

  "pdf-to-word": {
    slug: "pdf-to-word",
    title: "PDF to Word – Convert PDF to DOC/DOCX Free | FileNova",
    h1: "PDF to Word – Convert PDF to Editable Word Document",
    metaDescription:
      "Convert PDF to Word (DOCX) online for free. Preserve formatting, tables, and images. Edit your PDF content in Microsoft Word or Google Docs instantly.",
    keywords:
      "pdf to word, pdf to docx, convert pdf to word online free, pdf to word converter, pdf to editable word",
    toolName: "FileNova PDF to Word Converter",
    toolDescription:
      "Convert PDF files to editable Word DOCX format online for free, preserving formatting and layout.",
    seoBody: [
      "Need to edit a PDF but only have Microsoft Word or Google Docs? FileNova's PDF to Word converter extracts all text, tables, and formatting from your PDF and produces a fully editable DOCX file.",
      "This is essential for editing scanned government letters, updating resume PDFs, or repurposing report content without retyping everything from scratch.",
      "FileNova uses advanced layout analysis to preserve multi-column layouts, embedded tables, bullet points, and headings — giving you a Word document that closely mirrors the original PDF structure.",
      "Works with Hindi and regional language PDFs too (Unicode-supported fonts). Converted files can be opened directly in MS Word, LibreOffice, or uploaded to Google Docs.",
      "For scanned PDFs that need text extraction first, try our [OCR](ocr) tool, or [Compress PDF](compress-pdf) to reduce the converted file size.",
    ],
    faqs: [
      {
        q: "How do I convert a PDF to Word for free?",
        a: "Upload your PDF to FileNova's PDF to Word tool and click Convert. Your DOCX file will be ready to download in seconds — no account or payment required.",
      },
      {
        q: "Will the formatting be preserved when converting PDF to Word?",
        a: "FileNova does its best to preserve layout, tables, fonts, and images. Complex multi-column or heavily formatted PDFs may need minor manual adjustments after conversion.",
      },
      {
        q: "Can I convert a scanned PDF to Word?",
        a: "Yes. FileNova uses OCR (optical character recognition) to convert scanned PDFs into editable Word documents. For best results, use a high-resolution scan.",
      },
      {
        q: "Is PDF to Word conversion free on FileNova?",
        a: "Yes, up to a certain number of conversions per day for free users. Pro users get unlimited conversions with priority processing.",
      },
    ],
    relatedTools: [
      { label: "PDF to JPG", slug: "pdf-to-jpg", icon: "photo" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "OCR PDF", slug: "ocr", icon: "scan" },
    ],
    features: [
      { icon: "file-text", title: "Preserves Tables and Layout", description: "Advanced layout analysis keeps multi-column text, tables, bullet points, and heading hierarchy intact in the output Word document." },
      { icon: "languages", title: "Regional Language Support", description: "Works with Hindi, Bengali, Tamil, Telugu, and other Unicode-supported Indian language PDFs. Converted files open in MS Word or Google Docs." },
      { icon: "scan", title: "Scanned PDF Support", description: "Upload scanned PDFs too — the tool applies OCR to extract text from images before converting to an editable Word format." },
    ],
    useCases: [
      { title: "Edit Government Letters", description: "Convert a scanned government notice letter to Word format to edit and repurpose the content instead of retyping from scratch." },
      { title: "Repurpose Report Content", description: "Extract text and tables from a PDF report into an editable Word document for reuse in presentations, emails, or new documents." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the PDF file you want to convert to Word. Supports scanned PDFs with OCR.", icon: "upload" },
      { title: "Convert to DOCX", description: "Click 'Convert to Word'. FileNova extracts text, tables, and formatting into a DOCX file.", icon: "process" },
      { title: "Download Word file", description: "Your editable Word document is ready. Download and open in MS Word, Google Docs, or LibreOffice.", icon: "download" },
    ],
    howToName: "Convert PDF to Word Online",
    toolCategory: "document",
  },

  "pdf-to-jpg": {
    slug: "pdf-to-jpg",
    title: "PDF to JPG – Convert PDF Pages to Images Free | FileNova",
    h1: "PDF to JPG – Convert PDF Pages to Images Online",
    metaDescription:
      "Convert PDF pages to JPG images online for free. Extract high-quality images from any PDF. No signup needed. Download individually or as a ZIP.",
    keywords:
      "pdf to jpg, pdf to image, convert pdf to jpg online free, extract images from pdf, pdf to jpeg",
    toolName: "FileNova PDF to JPG Converter",
    toolDescription:
      "Convert PDF pages to high-quality JPG images online for free, with options for resolution and output quality.",
    seoBody: [
      "Converting PDF pages to JPG images is useful when you need to share a specific page as an image, embed PDF content in a presentation, or upload a document page to a portal that only accepts image files.",
      "FileNova converts each page of your PDF to a separate JPG or PNG image at your chosen resolution — 72 DPI for web use or 300 DPI for print-quality output.",
      "Indian users frequently need this for uploading signature pages, certificates, or photo IDs as image files for scholarship portals, bank KYC, or college admissions.",
      "All pages are converted in bulk and available as individual downloads or packaged in a ZIP file for convenience.",
      "After converting to images, use [Remove Background](remove-background) to clean up photos, or [Compress Image](compress-image) to reduce file sizes for portal uploads.",
    ],
    faqs: [
      {
        q: "How do I convert a PDF to JPG online?",
        a: "Upload your PDF to FileNova's PDF to JPG tool, choose the output resolution, and click Convert. Download individual page images or all pages as a ZIP file.",
      },
      {
        q: "What resolution are the output JPG images?",
        a: "You can choose from 72 DPI (web quality) or 300 DPI (print quality). Higher DPI gives sharper images but larger file sizes.",
      },
      {
        q: "Can I convert just one page of a PDF to JPG?",
        a: "Yes. After uploading, you can select specific pages to convert rather than converting the entire document.",
      },
    ],
    relatedTools: [
      { label: "JPG to PDF", slug: "jpg-to-pdf", icon: "file-text" },
      { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Remove Background", slug: "remove-background", icon: "eraser" },
    ],
    features: [
      { icon: "sliders-horizontal", title: "Choose Output Resolution", description: "Select 72 DPI for web-friendly images or 300 DPI for print-quality output. Higher DPI gives sharper images for certificates and documents." },
      { icon: "layers", title: "Select Specific Pages", description: "Convert all pages or pick only the ones you need. Each page becomes a separate JPG or PNG image with full control." },
      { icon: "file-archive", title: "Individual or Bulk Download", description: "Download each page image separately or get all pages packaged in a single ZIP file for convenience." },
    ],
    useCases: [
      { title: "Upload Certificate Images to Portals", description: "Convert a PDF certificate page to JPG for uploading to forms and portals that accept only image file formats, not PDFs." },
      { title: "Extract Slides for Presentations", description: "Convert each slide of a PDF presentation to high-quality images for embedding in PowerPoint, Google Slides, or social media posts." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the PDF whose pages you want to extract as images.", icon: "upload" },
      { title: "Choose output settings", description: "Select resolution (72 DPI for web, 300 DPI for print) and image format.", icon: "configure" },
      { title: "Convert and download", description: "Click Convert. Download individual page images or all as a ZIP.", icon: "download" },
    ],
    howToName: "Convert PDF to JPG Online",
    toolCategory: "image",
  },

  "jpg-to-pdf": {
    slug: "jpg-to-pdf",
    title: "JPG to PDF – Convert Images to PDF Free | FileNova",
    h1: "JPG to PDF – Convert Images to PDF Online Free",
    metaDescription:
      "Convert JPG, PNG, or any image to PDF online for free. Combine multiple images into one PDF. Perfect for documents, certificates, and forms.",
    keywords:
      "jpg to pdf, image to pdf, convert jpg to pdf online free, png to pdf, photo to pdf",
    toolName: "FileNova JPG to PDF Converter",
    toolDescription:
      "Convert JPG, PNG, and other image formats to PDF online for free. Combine multiple images into a single PDF document.",
    seoBody: [
      "Need to send multiple scanned photos or images as a single PDF document? FileNova's JPG to PDF converter lets you upload multiple images and combine them into one professional PDF in seconds.",
      "Supports JPG, PNG, WebP, and BMP formats. You can reorder the images before converting, and choose the output page size — A4, Letter, or auto-fit to image dimensions.",
      "This is the go-to tool for Indian students scanning handwritten assignments, or anyone needing to submit photo proofs as a single PDF to government portals, colleges, or employers.",
      "After converting to PDF, use [Compress PDF](compress-pdf) to reduce the file size, or [Merge PDF](merge-pdf) to combine with other documents before submission.",
    ],
    faqs: [
      {
        q: "How do I convert JPG to PDF for free?",
        a: "Upload your JPG or image files to FileNova's JPG to PDF tool, arrange them in order, and click Convert. Your PDF downloads instantly.",
      },
      {
        q: "Can I convert multiple images to one PDF?",
        a: "Yes. Upload multiple images at once and FileNova will combine them into a single PDF, one image per page, in your chosen order.",
      },
      {
        q: "What image formats does FileNova support for PDF conversion?",
        a: "FileNova supports JPG, JPEG, PNG, WebP, and BMP image formats for conversion to PDF.",
      },
    ],
    relatedTools: [
      { label: "PDF to JPG", slug: "pdf-to-jpg", icon: "photo" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Remove Background", slug: "remove-background", icon: "eraser" },
    ],
    features: [
      { icon: "layers", title: "Combine Multiple Images", description: "Upload several JPG, PNG, WebP, or BMP images and combine them all into a single PDF — one image per page." },
      { icon: "move", title: "Drag-and-Drop Reordering", description: "Rearrange the order of images before converting. Drag thumbnails to set the sequence you want in the output PDF." },
      { icon: "file-text", title: "Multiple Page Size Options", description: "Choose A4, Letter, or auto-fit page size. Auto-fit adjusts the PDF canvas to match each image's native dimensions." },
    ],
    useCases: [
      { title: "Submit Handwritten Assignments", description: "Convert photos of handwritten assignment pages into a single PDF for submission to online learning portals." },
      { title: "Combine Product Photos for Catalog", description: "Merge multiple product images into one PDF catalog to share with clients or upload to e-commerce platforms." },
    ],
    steps: [
      { title: "Upload your images", description: "Upload JPG, PNG, WebP, or BMP files. You can upload multiple images at once.", icon: "upload" },
      { title: "Arrange and configure", description: "Drag to reorder images. Choose output page size: A4, Letter, or auto-fit to image dimensions.", icon: "configure" },
      { title: "Convert to PDF", description: "Click 'Convert to PDF'. Your combined PDF will be ready to download instantly.", icon: "download" },
    ],
    howToName: "Convert JPG to PDF Online",
    toolCategory: "image",
  },

  "rotate-pdf": {
    slug: "rotate-pdf",
    title: "Rotate PDF – Rotate PDF Pages Online Free | FileNova",
    h1: "Rotate PDF – Rotate PDF Pages Online",
    metaDescription:
      "Rotate PDF pages online for free. Fix upside-down or sideways pages easily. Rotate all pages or individual pages in any direction.",
    keywords:
      "rotate pdf, rotate pdf pages online, fix pdf orientation, rotate pdf free, flip pdf pages",
    toolName: "FileNova PDF Rotator",
    toolDescription:
      "Rotate individual or all pages of a PDF file clockwise or counter-clockwise online for free.",
    seoBody: [
      "Scanned documents often end up with pages rotated the wrong way. FileNova's Rotate PDF tool lets you fix any page orientation without converting or editing the content.",
      "Rotate all pages at once, or select individual pages to rotate in different directions. Supports 90°, 180°, and 270° rotations clockwise and counter-clockwise.",
      "Particularly useful when you've scanned physical documents using your phone camera and some pages are landscape while others are portrait.",
      "After fixing the orientation, you may want to [Compress PDF](compress-pdf) to reduce file size or [Split PDF](split-pdf) to extract specific pages.",
    ],
    faqs: [
      {
        q: "How do I rotate pages in a PDF online?",
        a: "Upload your PDF to FileNova's Rotate PDF tool, select the pages to rotate and the direction, then click Rotate. Download the corrected PDF instantly.",
      },
      {
        q: "Can I rotate just one page in a PDF?",
        a: "Yes. You can rotate individual pages independently — for example, rotate only page 3 by 90° while keeping all other pages unchanged.",
      },
    ],
    relatedTools: [
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Split PDF", slug: "split-pdf", icon: "scissors" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "PDF to JPG", slug: "pdf-to-jpg", icon: "photo" },
    ],
    features: [
      { icon: "rotate-cw", title: "Individual or Global Rotation", description: "Rotate every page in one click or select specific pages and rotate each independently in different directions." },
      { icon: "refresh-cw", title: "Full Direction Support", description: "Rotate 90° clockwise, 90° counter-clockwise, or 180° upside-down. Covers every possible orientation fix you might need." },
      { icon: "copy", title: "No Quality Loss", description: "Rotation is applied at the metadata level without re-encoding the document, so your PDF content stays perfectly intact." },
    ],
    useCases: [
      { title: "Fix Phone-Scanned Documents", description: "Correct pages captured sideways or upside-down when you scan physical documents using your phone camera instead of a scanner." },
      { title: "Standardize Mixed Orientations", description: "Fix PDFs that combine landscape and portrait originals, making all pages consistent before printing or binding." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the PDF file with pages that need rotation.", icon: "upload" },
      { title: "Select pages and direction", description: "Choose which pages to rotate. Select 90°, 180°, or 270° clockwise or counter-clockwise.", icon: "configure" },
      { title: "Rotate and download", description: "Click Rotate to process. Your corrected PDF downloads instantly.", icon: "download" },
    ],
    howToName: "Rotate PDF Pages Online",
    toolCategory: "pdf",
  },

  "unlock-pdf": {
    slug: "unlock-pdf",
    title: "Unlock PDF – Remove PDF Password Free | FileNova",
    h1: "Unlock PDF – Remove PDF Password Online",
    metaDescription:
      "Remove password from PDF files online for free. Unlock protected PDFs instantly if you know the password. No software needed.",
    keywords:
      "unlock pdf, remove pdf password, pdf password remover, unlock protected pdf free, decrypt pdf",
    toolName: "FileNova PDF Unlocker",
    toolDescription:
      "Remove the password from a password-protected PDF file online for free, once the correct password is provided.",
    seoBody: [
      "Received a password-protected PDF and need to save it without the password prompt? FileNova's Unlock PDF tool removes restrictions from PDFs once you provide the correct password.",
      "This is completely legal — you're simply decrypting a file you're authorized to access. Common use cases include bank statements, salary slips, and government letters that are automatically password-protected.",
      "Note: FileNova does not crack or brute-force unknown passwords. You must provide the correct password — we simply remove the lock so you don't have to enter it every time.",
      "After unlocking, you can [Protect PDF](protect-pdf) with a new password or [Compress PDF](compress-pdf) to reduce the file size.",
    ],
    faqs: [
      {
        q: "How do I remove a password from a PDF?",
        a: "Upload your password-protected PDF to FileNova's Unlock PDF tool, enter the correct password when prompted, and click Unlock. The unlocked PDF downloads immediately.",
      },
      {
        q: "Can FileNova crack a PDF password I've forgotten?",
        a: "No. FileNova can only unlock PDFs if you provide the correct password. We do not crack or brute-force passwords.",
      },
      {
        q: "Why are PDFs from banks password protected?",
        a: "Banks password-protect PDFs like bank statements and salary slips for security. The password is often your date of birth or account number — check the document source for instructions.",
      },
    ],
    relatedTools: [
      { label: "Protect PDF", slug: "protect-pdf", icon: "lock" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
    ],
    features: [
      { icon: "lock-open", title: "Remove Both Password Types", description: "Removes both 'open' passwords (required to view) and 'permissions' passwords (restricting printing or editing) from protected PDFs." },
      { icon: "shield", title: "Legal and Secure", description: "Decrypts files you're authorized to access — bank statements, salary slips, and government letters. No password cracking or brute-force is performed." },
      { icon: "zap", title: "Instant Decryption", description: "Once you provide the correct password, the PDF is decrypted and ready to download in seconds. No waiting for server-side processing." },
    ],
    useCases: [
      { title: "Remove Bank Statement Password", description: "Bank PDFs often come password-protected. Unlock them once so you can print, archive, or email copies without re-entering the password." },
      { title: "Unlock Government Letters for Editing", description: "Some government-issued PDFs are locked against editing. Unlock them legally with the correct password to fill forms or add signatures." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the password-protected PDF you want to unlock.", icon: "upload" },
      { title: "Enter the password", description: "Type the correct password for the PDF. FileNova will use it to decrypt the file.", icon: "configure" },
      { title: "Download unlocked PDF", description: "Click Unlock and download your password-free PDF instantly.", icon: "download" },
    ],
    howToName: "Unlock PDF Files Online",
    toolCategory: "pdf",
  },

  "protect-pdf": {
    slug: "protect-pdf",
    title: "Protect PDF – Add Password to PDF Free | FileNova",
    h1: "Protect PDF – Add Password to PDF Online",
    metaDescription:
      "Add a password to your PDF files online for free. Protect sensitive documents before sharing. Set open password or restrict editing and printing.",
    keywords:
      "protect pdf, add password to pdf, pdf password protect free, encrypt pdf, secure pdf online",
    toolName: "FileNova PDF Protector",
    toolDescription:
      "Add password protection to PDF files online for free to secure sensitive documents before sharing.",
    seoBody: [
      "Need to share a sensitive document but want to control who can open it? FileNova's Protect PDF tool lets you add a password to any PDF so it can only be opened by people who know the password.",
      "You can set an 'open' password (required to view the file) and/or a permissions password (to restrict printing, copying, or editing). Ideal for salary slips, legal agreements, and personal documents.",
      "The encryption used is AES 128-bit, the same standard used by banks and government portals across India.",
      "After protecting, you might also want to [Compress PDF](compress-pdf) to reduce size or [Unlock PDF](unlock-pdf) to remove protection when no longer needed.",
    ],
    faqs: [
      {
        q: "How do I add a password to a PDF?",
        a: "Upload your PDF to FileNova's Protect PDF tool, enter a password of your choice, and click Protect. Your password-encrypted PDF downloads immediately.",
      },
      {
        q: "Can I restrict printing or editing of a PDF?",
        a: "Yes. FileNova lets you set a permissions password that restricts printing, copying text, or making edits — separate from the open password.",
      },
    ],
    relatedTools: [
      { label: "Unlock PDF", slug: "unlock-pdf", icon: "lock-open" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Aadhaar Mask", slug: "aadhaar-mask-pdf", icon: "id-badge" },
    ],
    features: [
      { icon: "lock", title: "Dual Password Protection", description: "Set an 'open' password to control who can view the file, plus a separate 'permissions' password to restrict printing, copying, or editing." },
      { icon: "shield-alert", title: "AES 128-Bit Encryption", description: "Bank-grade encryption used by financial institutions and government portals across India. Your document is secured with industry-standard protection." },
      { icon: "settings", title: "Granular Permission Controls", description: "Choose exactly what users can do — allow printing only, allow viewing only, or restrict all actions except viewing." },
    ],
    useCases: [
      { title: "Secure Salary Slips Before Emailing", description: "Password-protect salary slips and confidential HR documents before sharing over email or messaging apps to prevent unauthorized access." },
      { title: "Restrict Editing on Legal Agreements", description: "Send legal contracts with editing and copying restrictions while allowing clients to view and print the document." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the PDF you want to password-protect.", icon: "upload" },
      { title: "Set password and permissions", description: "Choose an open password and optionally set permissions to restrict printing, copying, or editing.", icon: "configure" },
      { title: "Download protected PDF", description: "Click Protect. Your encrypted PDF downloads instantly and can only be opened with the password.", icon: "download" },
    ],
    howToName: "Protect PDF Files Online",
    toolCategory: "pdf",
  },

  "resize-pdf": {
    slug: "resize-pdf",
    title: "Resize PDF – Change PDF Page Size Online Free | FileNova",
    h1: "Resize PDF – Change PDF Page Size Online",
    metaDescription:
      "Resize PDF pages to A4, A3, Letter, or custom dimensions online for free. Change PDF page size without losing content quality.",
    keywords:
      "resize pdf, change pdf page size, pdf resize online, pdf to a4, resize pdf pages free",
    toolName: "FileNova PDF Resizer",
    toolDescription:
      "Change the page size of a PDF to A4, A3, Letter, or custom dimensions online for free.",
    seoBody: [
      "PDF page size mismatches cause printing issues and look unprofessional when submitting documents. FileNova's Resize PDF tool lets you convert any PDF to a standard page size — A4, A3, Letter, or custom dimensions.",
      "This is particularly useful when you have a PDF exported from a web page or design tool with odd dimensions and need it in A4 format for printing or government submission.",
      "Content is automatically scaled or repositioned to fit the new page size. You can choose to scale content proportionally or maintain its original size within the new page.",
      "After resizing, you can [Compress PDF](compress-pdf) to reduce file size or [Rotate PDF](rotate-pdf) to fix page orientation.",
    ],
    faqs: [
      {
        q: "How do I resize a PDF page to A4?",
        a: "Upload your PDF to FileNova's Resize PDF tool, select A4 as the target page size, and click Resize. The converted PDF downloads with all pages in A4 format.",
      },
      {
        q: "Will resizing a PDF change its content?",
        a: "Resizing adjusts the page dimensions. You can choose to scale the content proportionally, so nothing gets cut off.",
      },
    ],
    relatedTools: [
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Rotate PDF", slug: "rotate-pdf", icon: "rotate" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Compress for Upload", slug: "compress-pdf-for-upload", icon: "cloud-upload" },
    ],
    features: [
      { icon: "maximize", title: "Multiple Standard Sizes", description: "Convert PDF pages to A4, A3, Letter, Legal, or enter custom dimensions. Pick the exact size required by your portal or printer." },
      { icon: "crop", title: "Intelligent Content Scaling", description: "Choose to scale content proportionally to fit the new page size or keep content at its original size with repositioning." },
      { icon: "copy", title: "Preserves Content Quality", description: "Resizing adjusts only the page canvas — your text, images, and vector graphics remain at their original resolution." },
    ],
    useCases: [
      { title: "Standardize for Printing", description: "Convert web-exported PDFs with odd dimensions to standard A4 or Letter size so they print correctly without cutting off content." },
      { title: "Meet Portal Submission Requirements", description: "Government portals often require documents in specific page sizes. Resize your PDF to match the prescribed format before uploading." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the PDF whose page size you want to change.", icon: "upload" },
      { title: "Select target page size", description: "Choose A4, A3, Letter, or enter custom dimensions. Content will be scaled proportionally.", icon: "configure" },
      { title: "Resize and download", description: "Click Resize. Your PDF with new page dimensions downloads instantly.", icon: "download" },
    ],
    howToName: "Resize PDF Pages Online",
    toolCategory: "pdf",
  },

  "pan-card-resize": {
    slug: "pan-card-resize",
    title: "PAN Card Photo Resize Online Free – Passport Size | FileNova",
    h1: "PAN Card Photo Resize – Resize PAN Card Photo Online Free",
    metaDescription:
      "Resize PAN card photo to exact required dimensions online for free. Get passport-size or application-size PAN card photo in seconds. No signup needed.",
    keywords:
      "pan card photo resize, pan card photo size, resize pan card photo online, pan card passport size photo, pan card photo dimensions",
    toolName: "FileNova PAN Card Photo Resizer",
    toolDescription:
      "Resize and crop photos to the exact PAN card application dimensions online for free, with live preview.",
    badge: "India Exclusive",
    seoBody: [
      "PAN card applications through NSDL or UTIITSL require photos in a specific size — typically 3.5cm × 2.5cm at 200 DPI, or equivalent pixel dimensions. Getting this wrong means your application gets rejected.",
      "FileNova's PAN Card Photo Resizer lets you upload any photo and instantly crop and resize it to the exact PAN card specifications. You get a live preview before downloading, so you know exactly what you're submitting.",
      "This tool is especially useful for first-time PAN card applicants, name-change applications, and duplicate PAN card requests where fresh photos are needed. Works on Android phone photos, selfies, or scanned photographs.",
      "No photography studio visit needed. Upload your photo, adjust the crop, and download the correctly sized image — ready to attach to your PAN application form.",
      "Need to also resize your signature or other documents? Try [Resize Image](resize-image) for custom dimensions or [Compress Image](compress-image) to meet file size limits.",
    ],
    faqs: [
      {
        q: "What is the required photo size for a PAN card application?",
        a: "The NSDL/UTIITSL PAN card application requires a color photograph of 3.5cm × 2.5cm (width × height) at 200 DPI. In pixels this is approximately 276 × 354 pixels.",
      },
      {
        q: "Can I use a selfie for my PAN card photo?",
        a: "Yes, as long as it has a plain white or light background, your face is clearly visible, and there are no glasses or head coverings. FileNova's tool will crop and resize it to the required dimensions.",
      },
      {
        q: "Is FileNova's PAN card resizer free?",
        a: "Yes, completely free. No account, no watermark, no payment required.",
      },
      {
        q: "What format should the PAN card photo be?",
        a: "JPEG/JPG format is preferred for PAN card applications. FileNova outputs JPEG files by default.",
      },
      {
        q: "Is it safe to upload my photos to FileNova?",
        a: "Yes. FileNova processes all image resizing and cropping locally in your browser cache. Your photographs never upload to our servers.",
      },
    ],
    relatedTools: [
      { label: "Aadhaar Mask PDF", slug: "aadhaar-mask-pdf", icon: "id-badge" },
      { label: "JPG to PDF", slug: "jpg-to-pdf", icon: "file-text" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Government Form Fill", slug: "government-form-fill", icon: "clipboard" },
    ],
    features: [
      { icon: "credit-card", title: "Exact PAN Card Dimensions", description: "Automatically crops and resizes to the precise 3.5cm × 2.5cm (276 × 354 pixel) specification required by NSDL and UTIITSL." },
      { icon: "eye", title: "Live Preview Before Download", description: "See exactly how your photo will look in the PAN card frame before downloading. Adjust the crop area in real-time." },
      { icon: "smartphone", title: "Works from Any Photo Source", description: "Upload selfies, scanned photographs, or studio photos. The tool adjusts any image to meet the official PAN card photo requirements." },
    ],
    useCases: [
      { title: "NSDL PAN Card Application", description: "Prepare the correct-size photo for a new PAN card application without visiting a photography studio. Works with selfies from any phone." },
      { title: "Duplicate PAN Card Request", description: "When applying for a duplicate or corrected PAN card, resize your photo to the exact specifications to avoid application rejection." },
    ],
    steps: [
      { title: "Upload your photo", description: "Select a photo from your device — a selfie, scanned photo, or existing image.", icon: "upload" },
      { title: "Adjust the crop", description: "Drag and zoom the image to fit exactly within the PAN card photo frame (3.5cm × 2.5cm).", icon: "configure" },
      { title: "Download resized photo", description: "Click Download to get your passport-size PAN card photo as a JPEG file ready to upload.", icon: "download" },
    ],
    howToName: "Resize Photo for PAN Card",
    toolCategory: "image",
  },

  "aadhaar-mask-pdf": {
    slug: "aadhaar-mask-pdf",
    title: "Mask Aadhaar Number in PDF – Free Aadhaar Masking Tool | FileNova",
    h1: "Aadhaar Mask PDF – Mask Aadhaar Number Online Free",
    metaDescription:
      "Mask your Aadhaar card number in a PDF online for free. Hide the first 8 digits for secure sharing. UIDAI-compliant masked Aadhaar PDF — no signup needed.",
    keywords:
      "mask aadhaar number, aadhaar masking online, masked aadhaar pdf, hide aadhaar number pdf, aadhaar card mask free india",
    toolName: "FileNova Aadhaar Masking Tool",
    toolDescription:
      "Mask the first 8 digits of your Aadhaar number in a PDF as per UIDAI guidelines for safe sharing online.",
    badge: "India Exclusive",
    seoBody: [
      "Sharing your Aadhaar card online carries identity theft risk. UIDAI recommends sharing only a 'masked' version of your Aadhaar card, where the first 8 digits of the 12-digit Aadhaar number are replaced with 'XXXX-XXXX' — only the last 4 digits remain visible.",
      "FileNova's Aadhaar Masking tool automatically detects the Aadhaar number in your uploaded PDF and masks the first 8 digits as per UIDAI guidelines. The output is a UIDAI-compliant masked Aadhaar PDF that is safe to share with landlords, employers, portals, and third-party service providers.",
      "This tool is completely offline-processed in your browser — your Aadhaar data never leaves your device. There is zero risk of your Aadhaar number being logged or stored.",
      "Accepted at most Indian portals, banks, and KYC processes that ask for a 'masked Aadhaar' or 'partially masked Aadhaar' as identity proof.",
      "After masking, [Compress PDF](compress-pdf) your Aadhaar for portal uploads, or use [Government Form Fill](government-form-fill) to fill supporting application forms.",
    ],
    faqs: [
      {
        q: "What is a masked Aadhaar card?",
        a: "A masked Aadhaar card shows only the last 4 digits of your 12-digit Aadhaar number, with the first 8 digits replaced by 'XXXX XXXX'. This is the UIDAI-recommended format for safe online sharing.",
      },
      {
        q: "Is masked Aadhaar accepted as valid identity proof?",
        a: "Yes. UIDAI has explicitly stated that masked Aadhaar is a valid identity document and should be accepted at banks, service providers, and portals as per their guidelines.",
      },
      {
        q: "Is it safe to upload my Aadhaar to FileNova?",
        a: "FileNova's Aadhaar masking is processed directly in your browser using JavaScript — your Aadhaar PDF never gets uploaded to any server. Your data stays on your device.",
      },
      {
        q: "How is FileNova's masked Aadhaar different from the UIDAI mAadhaar app?",
        a: "The UIDAI mAadhaar app generates a masked PDF from UIDAI's servers. FileNova masks your existing Aadhaar PDF locally in your browser — useful if you already have the PDF and want to mask it without logging into UIDAI.",
      },
    ],
    relatedTools: [
      { label: "PAN Card Resize", slug: "pan-card-resize", icon: "credit-card" },
      { label: "Protect PDF", slug: "protect-pdf", icon: "lock" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Government Form Fill", slug: "government-form-fill", icon: "clipboard" },
    ],
    features: [
      { icon: "id-badge", title: "Automatic Number Detection", description: "The tool automatically identifies the 12-digit Aadhaar number in your PDF and masks the first 8 digits — no manual selection required." },
      { icon: "shield", title: "100% Offline Processing", description: "All Aadhaar masking happens directly in your browser. Your sensitive personal data never reaches any server — zero transmission risk." },
      { icon: "check-circle", title: "UIDAI-Compliant Format", description: "Output follows UIDAI's official masked Aadhaar format with 'XXXX XXXX' replacing the first 8 digits. Accepted at banks, portals, and KYC checks." },
    ],
    useCases: [
      { title: "Share Aadhaar with Employer", description: "Mask your Aadhaar before submitting it to employer portals, HR systems, or verification platforms for background checks." },
      { title: "Upload to Rental or Service Portals", description: "Property rental agreements, broadband connections, and utility providers ask for Aadhaar proof. Share only a masked version to protect your identity." },
    ],
    steps: [
      { title: "Upload your Aadhaar PDF", description: "Select the Aadhaar card PDF you want to mask. Your file is processed locally in your browser.", icon: "upload" },
      { title: "Auto-mask applied", description: "FileNova automatically detects and masks the first 8 digits of your Aadhaar number with XXXX-XXXX.", icon: "process" },
      { title: "Download masked PDF", description: "Download your UIDAI-compliant masked Aadhaar PDF, safe to share with landlords, employers, and portals.", icon: "download" },
    ],
    howToName: "Mask Aadhaar Number in PDF",
    toolCategory: "pdf",
  },

  "government-form-fill": {
    slug: "government-form-fill",
    title: "Fill Government Forms Online Free – Aadhaar, PAN, Passport | FileNova",
    h1: "Government Form Fill – Fill Indian Government PDF Forms Online",
    metaDescription:
      "Fill Indian government PDF forms online for free — Aadhaar update, PAN correction, passport, railway, scholarship and more. No Adobe Acrobat needed.",
    keywords:
      "fill government form online, pdf form fill india, aadhaar form fill, pan form fill, government pdf forms india",
    toolName: "FileNova Government Form Filler",
    toolDescription:
      "Fill common Indian government PDF forms online for free, with pre-loaded templates for Aadhaar, PAN, passport, and more.",
    badge: "India Exclusive",
    seoBody: [
      "Indian government forms — Aadhaar correction, PAN card application, passport renewal, railway concession, scholarship applications — are distributed as PDF files that often cannot be filled digitally without Adobe Acrobat.",
      "FileNova's Government Form Fill tool lets you upload any fillable PDF form and type directly into the fields on your browser — no software download, no Acrobat license needed. Save and download the filled form as a PDF ready for submission.",
      "We also maintain a library of pre-loaded common government forms so you can start filling immediately without searching for the right form on government websites.",
      "Supports Hindi, Bengali, Tamil, Telugu, and other regional language forms with Unicode text input. Download filled forms as print-ready PDFs.",
      "After filling your form, [Compress PDF](compress-pdf-for-upload) it to meet portal size limits, or use [Aadhaar Mask PDF](aadhaar-mask-pdf) to secure personal data before sharing.",
    ],
    faqs: [
      {
        q: "Can I fill a government PDF form online without Adobe Acrobat?",
        a: "Yes. FileNova's form filler works entirely in your browser. Upload the PDF form, click on fields, type your information, and download the completed form — no software installation needed.",
      },
      {
        q: "Which government forms can I fill on FileNova?",
        a: "FileNova supports all standard fillable PDF forms including Aadhaar update forms, PAN card correction forms, passport renewal forms, railway concession forms, and scholarship application forms.",
      },
      {
        q: "Can I save a partially filled form and continue later?",
        a: "Yes. FileNova Pro users can save form progress and return to complete it. Free users can download the partially filled form and re-upload it later.",
      },
    ],
    relatedTools: [
      { label: "Aadhaar Mask PDF", slug: "aadhaar-mask-pdf", icon: "id-badge" },
      { label: "PAN Card Resize", slug: "pan-card-resize", icon: "credit-card" },
      { label: "Compress for Upload", slug: "compress-pdf-for-upload", icon: "cloud-upload" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
    ],
    features: [
      { icon: "pen-tool", title: "Browser-Based Form Filling", description: "Type directly into any fillable PDF form field in your browser. No Adobe Acrobat license or software installation required." },
      { icon: "library", title: "Pre-Loaded Form Templates", description: "Access a library of common government forms — Aadhaar update, PAN correction, passport renewal — ready to fill without hunting for the right PDF." },
      { icon: "languages", title: "Regional Language Input", description: "Supports Hindi, Bengali, Tamil, Telugu, and other Indian languages using Unicode text input. Fill forms in your preferred language." },
    ],
    useCases: [
      { title: "Complete Aadhaar Update Form", description: "Fill the Aadhaar correction/enrolment update form online without needing paid PDF editing software. Download and submit at the nearest Aadhaar center." },
      { title: "Prepare PAN Correction Form", description: "Edit and complete the PAN card correction form digitally, save as a print-ready PDF, and submit to NSDL or UTIITSL without handwritten errors." },
    ],
    steps: [
      { title: "Upload a form", description: "Upload any fillable PDF form — Aadhaar update, PAN correction, passport, railway, or scholarship form.", icon: "upload" },
      { title: "Fill in the fields", description: "Click on form fields and type your information. Use our library of pre-loaded common government forms.", icon: "configure" },
      { title: "Save and download", description: "Save your completed form as a print-ready PDF, ready to submit or print.", icon: "download" },
    ],
    howToName: "Fill Government Forms Online",
    toolCategory: "form",
  },

  "compress-pdf-for-upload": {
    slug: "compress-pdf-for-upload",
    title: "Compress PDF for Government Portal Upload – Under 100KB/200KB/1MB | FileNova",
    h1: "Compress PDF for Upload – Reduce PDF to 100KB, 200KB, or 1MB",
    metaDescription:
      "Compress PDF files to a specific size for government portal uploads. Get your PDF under 100KB, 200KB, 500KB, or 1MB for DigiLocker, IRCTC, scholarship portals, and bank KYC.",
    keywords:
      "compress pdf for upload, compress pdf under 100kb, pdf size reducer for government portal, compress pdf 200kb, compress pdf 1mb india",
    toolName: "FileNova PDF Compressor for Upload",
    toolDescription:
      "Compress PDF files to a target size for Indian government portal uploads — DigiLocker, IRCTC, scholarship portals, and bank KYC.",
    badge: "India Exclusive",
    seoBody: [
      "Every Indian government portal seems to have a different file size limit: DigiLocker allows up to 1MB, many scholarship portals cap at 200KB, IRCTC requires photos under 100KB, and bank KYC portals vary widely.",
      "FileNova's upload-focused compressor lets you set a target file size rather than a compression level. Just enter '200 KB' as your target, upload your PDF, and the tool will automatically find the right compression ratio to get your file under that threshold.",
      "This eliminates the frustrating trial-and-error of adjusting compression manually and re-uploading until your file meets the portal's limit.",
      "Supports all PDF types — scanned documents, photo collages, certificate PDFs, and text-heavy application forms.",
      "After compressing, you can [Merge PDF](merge-pdf) multiple files into one or use [Scholarship ZIP](scholarship-zip) to bundle all documents for submission.",
    ],
    faqs: [
      {
        q: "How do I compress a PDF to under 200KB for a government portal?",
        a: "Upload your PDF to FileNova's 'Compress for Upload' tool, set 200KB as the target size, and click Compress. The tool automatically adjusts compression to meet your target.",
      },
      {
        q: "Which portals require a PDF under 100KB?",
        a: "IRCTC concession applications, some scholarship portals, and certain bank online account opening forms require documents under 100KB. Check your specific portal's guidelines.",
      },
      {
        q: "What if my PDF can't be compressed to the target size?",
        a: "If a PDF cannot be compressed below a certain threshold without destroying readability, FileNova will notify you and suggest the minimum achievable size. You may need to scan at lower DPI or reduce image quality.",
      },
    ],
    relatedTools: [
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Government Form Fill", slug: "government-form-fill", icon: "clipboard" },
      { label: "Aadhaar Mask PDF", slug: "aadhaar-mask-pdf", icon: "id-badge" },
    ],
    features: [
      { icon: "crosshair", title: "Set Exact Target Size", description: "Enter your target file size — 100KB, 200KB, 500KB, or 1MB. The tool automatically finds the optimal compression to hit your target." },
      { icon: "gauge", title: "No More Trial-and-Error", description: "Skip the frustration of adjusting compression manually and rechecking. Set your target once and let the tool dial in the right settings." },
      { icon: "upload-cloud", title: "Portal-Specific Presets", description: "Built-in presets for common Indian portals: DigiLocker (1MB), NSP scholarship (200KB), IRCTC (100KB), and bank KYC (varies)." },
    ],
    useCases: [
      { title: "Scholarship Portal Compliance", description: "Compress income certificates and caste certificates to under 200KB for National Scholarship Portal (NSP) and state scholarship applications." },
      { title: "IRCTC Concession Application", description: "Reduce scanned documents to under 100KB for IRCTC railway concession applications for students and senior citizens." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the PDF you want to compress for a specific upload limit.", icon: "upload" },
      { title: "Set target size", description: "Enter your target size — e.g., 100KB, 200KB, 500KB, or 1MB. FileNova finds the right compression automatically.", icon: "configure" },
      { title: "Download optimized PDF", description: "Get your compressed PDF that meets the exact size requirement for your portal.", icon: "download" },
    ],
    howToName: "Compress PDF for Upload",
    toolCategory: "pdf",
  },

  "ocr": {
    slug: "ocr",
    title: "OCR PDF – Extract Text from Scanned PDF Free | FileNova",
    h1: "OCR PDF – Convert Scanned PDF to Searchable Text",
    metaDescription:
      "Extract text from scanned PDFs using OCR online for free. Make scanned documents searchable and editable. Supports English, Hindi, and more.",
    keywords:
      "ocr pdf, ocr online free, extract text from pdf, scanned pdf to text, pdf ocr india",
    toolName: "FileNova PDF OCR",
    toolDescription:
      "Use OCR to extract and recognize text from scanned PDFs, making them searchable and editable online for free.",
    seoBody: [
      "Scanned documents are images — they look like PDFs but the text inside them isn't selectable or searchable. OCR (Optical Character Recognition) solves this by analyzing the image and extracting actual text.",
      "FileNova's OCR tool processes your scanned PDF and returns a searchable, copy-paste-friendly PDF where the text is recognized and embedded as actual text characters.",
      "Supports English and a growing list of Indian regional languages including Hindi, Bengali, Tamil, and Telugu.",
      "After extracting text, use [AI PDF Summary](ai-pdf-summary) to get a summary or [PDF to Word](pdf-to-word) to create an editable document from the recognized text.",
    ],
    faqs: [
      {
        q: "What is OCR and why do I need it for PDFs?",
        a: "OCR (Optical Character Recognition) converts scanned images of text into actual machine-readable text. You need it when your PDF is a scan and you can't search or copy text from it.",
      },
      {
        q: "Does FileNova OCR support Hindi?",
        a: "Yes. FileNova's OCR supports Hindi and several other Indian regional languages in addition to English.",
      },
    ],
    relatedTools: [
      { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "AI PDF Summary", slug: "ai-pdf-summary", icon: "sparkles" },
    ],
    features: [
      { icon: "scan", title: "Converts Images to Text", description: "Transforms scanned PDF pages — which are just images — into documents with selectable, searchable, and copy-paste-friendly text." },
      { icon: "languages", title: "Multi-Language Support", description: "Recognize text in English, Hindi, Bengali, Tamil, Telugu, and more. Works with printed and clear typewritten documents." },
      { icon: "search", title: "Searchable Output", description: "The OCR output PDF lets you search for keywords, copy paragraphs, and extract text — turning a static scan into a usable digital document." },
    ],
    useCases: [
      { title: "Digitize Old Contracts and Records", description: "Scan paper contracts, agreements, or school records and convert them to searchable PDFs for easy digital archiving and quick retrieval." },
      { title: "Extract Text from Hindi Documents", description: "Convert scanned Hindi language textbooks, government notifications, or legal documents into editable and searchable text." },
    ],
    steps: [
      { title: "Upload your scanned PDF", description: "Select the scanned PDF document you want to make searchable.", icon: "upload" },
      { title: "Select language and pages", description: "Choose the document language (English, Hindi, etc.) and optionally select specific pages.", icon: "configure" },
      { title: "Extract text and download", description: "Click Extract Text. Your searchable, copy-paste-friendly PDF downloads instantly.", icon: "download" },
    ],
    howToName: "Extract Text from Scanned PDF",
    toolCategory: "ocr",
  },

  "remove-background": {
    slug: "remove-background",
    title: "Remove Background from Image Free Online | FileNova",
    h1: "Remove Background – Remove Image Background Online Free",
    metaDescription:
      "Remove background from photos online for free. Get transparent PNG or white background instantly. Perfect for passport photos, product images, and PAN card photos.",
    keywords:
      "remove background, remove background online free, background remover, transparent background, remove photo background india",
    toolName: "FileNova Background Remover",
    toolDescription:
      "Remove image backgrounds online for free to get transparent PNG or white background photos instantly.",
    seoBody: [
      "Remove backgrounds from photos instantly — no Photoshop, no design skills needed. FileNova's AI-powered background remover works on portraits, product photos, ID photos, and more.",
      "Especially useful for creating passport-size photos with a white background for PAN card, passport, Aadhaar, or college admission applications.",
      "After removing the background, [Resize Image](resize-image) to the right dimensions, or use [JPG to PDF](jpg-to-pdf) to convert to a PDF document.",
    ],
    faqs: [
      {
        q: "How do I remove a background from a photo online?",
        a: "Upload your image to FileNova's Remove Background tool and the AI automatically removes the background. Download as transparent PNG or with a white background.",
      },
      {
        q: "Can I use this for passport or PAN card photos?",
        a: "Yes. This tool is perfect for creating white-background passport-size photos required for PAN card, passport, Aadhaar, and other Indian government applications.",
      },
    ],
    relatedTools: [
      { label: "PAN Card Resize", slug: "pan-card-resize", icon: "credit-card" },
      { label: "JPG to PDF", slug: "jpg-to-pdf", icon: "file-text" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "PDF to JPG", slug: "pdf-to-jpg", icon: "photo" },
    ],
    features: [
      { icon: "wand", title: "AI-Powered Background Removal", description: "The AI automatically identifies the subject and separates it from the background in seconds. No manual selection or masking tools needed." },
      { icon: "image", title: "Transparent or White Output", description: "Download your result as a transparent PNG for design use, or as a JPEG with a clean white background for official document photos." },
      { icon: "zap", title: "Instant Processing", description: "Background removal completes in seconds for most images. Batch process multiple photos at once with a Pro subscription." },
    ],
    useCases: [
      { title: "Create Passport-Style Photos", description: "Remove background from selfies to create white-background passport photos for PAN card, passport, Aadhaar, or college application forms." },
      { title: "Clean Up Product Images for E-Commerce", description: "Remove distracting backgrounds from product photos to create clean, professional listings for e-commerce platforms and marketplaces." },
    ],
    steps: [
      { title: "Upload your photo", description: "Select the image you want to remove the background from — portrait, product photo, ID photo, etc.", icon: "upload" },
      { title: "AI processes background", description: "FileNova's AI automatically detects and removes the background. You can replace it with transparent or white.", icon: "process" },
      { title: "Download result", description: "Download your image with background removed as PNG (transparent) or JPEG (white background).", icon: "download" },
    ],
    howToName: "Remove Background from Image",
    toolCategory: "image",
  },

  "ai-pdf-summary": {
    slug: "ai-pdf-summary",
    title: "AI PDF Summary – Summarize PDF with AI Free | FileNova",
    h1: "AI PDF Summary – Summarize Any PDF Instantly",
    metaDescription:
      "Summarize long PDF documents with AI for free. Get key points, chapter summaries, and insights from any PDF in seconds.",
    keywords:
      "ai pdf summary, summarize pdf online, pdf summarizer free, ai pdf tool, summarize document online",
    toolName: "FileNova AI PDF Summarizer",
    toolDescription:
      "Use AI to summarize long PDF documents into key points and chapter summaries online for free.",
    seoBody: [
      "Reading a 50-page PDF report? Let AI do it for you. FileNova's AI PDF Summary tool reads your document and returns a structured summary with the key points, arguments, and conclusions — saving you hours.",
      "Useful for students summarizing textbook chapters, professionals reading research papers, and anyone who needs the gist of a document fast.",
      "After summarizing, use [OCR](ocr) to extract text from scanned PDFs or [PDF to Word](pdf-to-word) to create an editable document.",
    ],
    faqs: [
      {
        q: "How does AI PDF summarization work?",
        a: "FileNova extracts text from your PDF and sends it to an AI model that identifies and summarizes the key points, section by section. The result is a concise, structured summary.",
      },
      {
        q: "What length PDFs can FileNova summarize?",
        a: "FileNova can summarize PDFs up to 50 pages for free users, and up to 200 pages for Pro users.",
      },
    ],
    relatedTools: [
      { label: "OCR PDF", slug: "ocr", icon: "scan" },
      { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
    ],
    features: [
      { icon: "sparkles", title: "AI-Powered Summarization", description: "Advanced AI reads your entire document and extracts the most important points, arguments, and conclusions in seconds." },
      { icon: "book-open", title: "Structured Chapter Summary", description: "Get a section-by-section breakdown with key takeaways from each part of your document — ideal for textbooks and research papers." },
      { icon: "clock", title: "Saves Hours of Reading", description: "Summarize a 50-page report in under a minute. Focus on what matters instead of spending hours reading every word." },
    ],
    useCases: [
      { title: "Research Paper Literature Review", description: "Quickly summarize multiple research papers to identify relevant studies without reading each one in full. Extract key findings and methodology." },
      { title: "Government Report Overview", description: "Get a concise summary of lengthy government reports, budget documents, or policy papers to quickly understand the key implications." },
    ],
    steps: [
      { title: "Upload your PDF", description: "Select the PDF document you want to summarize. Supports up to 50 pages for free users, 200 pages for Pro.", icon: "upload" },
      { title: "AI analyzes the document", description: "FileNova's AI reads your document and identifies key points, sections, and conclusions. Processing time depends on document length.", icon: "process" },
      { title: "Read your summary", description: "View the structured summary with key takeaways. Download or copy the summary for use in your work.", icon: "download" },
    ],
    toolCategory: "document",
  },

  "scholarship-zip": {
    slug: "scholarship-zip",
    title: "Scholarship Document ZIP – Bundle Documents for Application | FileNova",
    h1: "Scholarship ZIP – Bundle All Scholarship Documents in One ZIP",
    metaDescription:
      "Bundle all your scholarship application documents — Aadhaar, marksheet, income certificate, caste certificate — into a single ZIP file online free.",
    keywords:
      "scholarship document zip, scholarship documents bundle, scholarship application pdf, bundle documents online india",
    toolName: "FileNova Scholarship ZIP Tool",
    toolDescription:
      "Bundle multiple scholarship application documents into a single ZIP file online for free.",
    badge: "India Exclusive",
    seoBody: [
      "Scholarship portals like NSP (National Scholarship Portal), state scholarship portals, and private foundations often require you to upload multiple documents at once. FileNova's Scholarship ZIP tool bundles all your documents into a single ZIP file formatted for these portals.",
      "Upload your Aadhaar card, marksheets, income certificate, caste certificate, and bonafide certificate — FileNova renames and organizes them in the correct format and packages them into a download-ready ZIP.",
      "After bundling, [Mask Aadhaar](aadhaar-mask-pdf) to protect your privacy or [Compress PDF](compress-pdf-for-upload) each document for portal size limits.",
    ],
    faqs: [
      {
        q: "Which scholarships support ZIP file document upload?",
        a: "NSP (National Scholarship Portal), several state government scholarship portals, and many private scholarships accept or require ZIP file uploads. Check your specific portal's submission guidelines.",
      },
      {
        q: "What documents are typically needed for scholarship applications?",
        a: "Common requirements include Aadhaar card, latest marksheets, income certificate, caste certificate (if applicable), bank passbook, and bonafide certificate from your institution.",
      },
      {
        q: "Is it safe to compile documents in Scholarship ZIP Maker?",
        a: "Yes. All file selections, renaming, and ZIP packing take place entirely inside your web browser. Sensitive certificates and documents are never sent to external servers.",
      },
    ],
    relatedTools: [
      { label: "Aadhaar Mask PDF", slug: "aadhaar-mask-pdf", icon: "id-badge" },
      { label: "Compress for Upload", slug: "compress-pdf-for-upload", icon: "cloud-upload" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Government Form Fill", slug: "government-form-fill", icon: "clipboard" },
    ],
    features: [
      { icon: "file-archive", title: "Smart File Renaming", description: "Documents are automatically renamed to the standard format expected by NSP and other scholarship portals — no manual renaming needed." },
      { icon: "package", title: "One-Click Bundling", description: "Upload all required documents and get a single ZIP file. No need to individually upload each document to the portal." },
      { icon: "lock", title: "100% Browser-Based", description: "All file packaging happens locally in your browser. Your sensitive scholarship documents never leave your device." },
    ],
    useCases: [
      { title: "NSP Scholarship Application", description: "Bundle Aadhaar, marksheet, income certificate, caste certificate, and bank passbook into one ZIP for National Scholarship Portal submission." },
      { title: "Bank Loan Document Organization", description: "Organize all KYC and income documents required for education loans into a single, well-named ZIP file for bank submission." },
    ],
    steps: [
      { title: "Upload your documents", description: "Upload all required scholarship documents: Aadhaar, marksheet, income certificate, caste certificate, etc.", icon: "upload" },
      { title: "Auto-rename and organize", description: "FileNova automatically renames files to the standard format required by NSP and other portals.", icon: "configure" },
      { title: "Download ZIP bundle", description: "Get a single ZIP file containing all documents, ready to upload to your scholarship portal.", icon: "download" },
    ],
    howToName: "Bundle Scholarship Documents",
    toolCategory: "document",
  },

  "resize-image": {
    slug: "resize-image",
    title: "Resize Image – Resize Photos Online Free | FileNova",
    h1: "Resize Image – Resize Photos Online Free",
    metaDescription:
      "Resize images online for free. Change photo dimensions, reduce file size, or scale images for social media, web, or print. Supports JPG, PNG, WebP.",
    keywords:
      "resize image, resize photo online, image resizer free, resize jpg, reduce image size, resize image online india",
    toolName: "FileNova Image Resizer",
    toolDescription:
      "Resize and scale images online for free — change dimensions, reduce file size, or convert formats for any use case.",
    seoBody: [
      "Whether you need to resize a photo for social media, shrink an image for a website, or reduce file size for email attachment, FileNova's image resizer handles it all in seconds.",
      "Upload any JPG, PNG, or WebP image and set custom dimensions. The aspect ratio lock ensures your image doesn't get distorted. You can also adjust quality to balance file size and visual fidelity.",
      "Perfect for Indian users who need passport-size photos, profile pictures, or documents resized for government portal uploads.",
      "After resizing, [Compress Image](compress-image) to reduce file size or [Remove Background](remove-background) for a cleaner look.",
    ],
    faqs: [
      {
        q: "How do I resize an image online for free?",
        a: "Upload your image to FileNova, enter the desired width and height, and click Resize. Your resized image downloads instantly.",
      },
      {
        q: "Will resizing reduce image quality?",
        a: "Resizing changes dimensions but preserves original quality. Reducing file size via quality compression may cause slight quality loss, which you can control with the quality slider.",
      },
      {
        q: "Can I resize images for passport photos?",
        a: "Yes. Use FileNova's PAN Card Resize tool for exact passport/PAN photo dimensions, or use this tool for custom sizes.",
      },
    ],
    relatedTools: [
      { label: "PAN Card Resize", slug: "pan-card-resize", icon: "credit-card" },
      { label: "Remove Background", slug: "remove-background", icon: "eraser" },
      { label: "JPG to PDF", slug: "jpg-to-pdf", icon: "file-text" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
    ],
    features: [
      { icon: "maximize", title: "Custom Pixel Dimensions", description: "Set exact width and height in pixels. The aspect ratio lock prevents distortion when you need to maintain proportions." },
      { icon: "image", title: "Multiple Format Support", description: "Works with JPG, PNG, and WebP input formats. Download your resized image in any of these output formats." },
      { icon: "sliders-horizontal", title: "Quality Control", description: "Adjust output quality with a slider to balance file size against visual fidelity. Preview the result before downloading." },
    ],
    useCases: [
      { title: "Social Media Profile Photos", description: "Resize photos to exact dimensions required by different social media platforms — LinkedIn, Instagram, Facebook, Twitter." },
      { title: "Website Image Optimization", description: "Scale down high-resolution camera photos to web-friendly dimensions before uploading to your website or blog." },
    ],
    steps: [
      { title: "Upload your image", description: "Select the JPG, PNG, or WebP image you want to resize.", icon: "upload" },
      { title: "Set dimensions", description: "Enter the target width and height in pixels. Toggle aspect ratio lock to prevent distortion.", icon: "configure" },
      { title: "Download resized image", description: "Click Resize and download your scaled image in your chosen format.", icon: "download" },
    ],
    howToName: "Resize an Image Online",
    toolCategory: "image",
  },

  "compress-image": {
    slug: "compress-image",
    title: "Compress Image – Reduce JPG/PNG/WEBP File Size Free | FileNova",
    h1: "Compress Image – Reduce Image File Size Online Free",
    metaDescription:
      "Compress images online for free. Reduce the file size of JPG, PNG, and WebP photos without losing quality. Perfect for online applications and government portals.",
    keywords:
      "compress image, reduce image size, compress photo online, shrink jpeg size, image compressor free, compress image under 50kb",
    toolName: "FileNova Image Compressor",
    toolDescription:
      "Free online tool to compress and reduce the file size of JPG, PNG, and WebP images. Optimize your photos instantly while maintaining high visual quality.",
    seoBody: [
      "Compressing image files is a necessary step when uploading photos, certificates, or signatures to online forms and government portals in India. Large file sizes are often rejected, prompting users to find ways to compress them without making them unreadable.",
      "FileNova's free image compressor solves this problem directly in your browser. Since all processing runs locally on your device, your private photographs and signature scans never touch our servers.",
      "You can choose from low, medium, or high quality presets, or fine-tune quality parameters manually using the interactive slider. You can also specify target formats (like JPEG or WebP) and maximum pixel limits.",
      "No registration or email is required. Simply drag your photo, adjust the quality settings, and download the compressed image instantly."
    ],
    faqs: [
      {
        q: "How do I compress image files online for free?",
        a: "Upload your image to FileNova's Image Compressor, choose a compression level (low, medium, or high), and click Compress. Your optimized image will be ready to download instantly."
      },
      {
        q: "Can I convert formats while compressing images?",
        a: "Yes. You can select your desired output format (JPEG, PNG, or WebP) in the options panel, and the compressor will handle conversion and size reduction in a single step."
      },
      {
        q: "Are my photos uploaded to a server?",
        a: "No. FileNova processes all image compression locally in your browser using the Canvas API. Your files remain completely secure on your device."
      }
    ],
    relatedTools: [
      { label: "Resize Image", slug: "resize-image", icon: "resize" },
      { label: "PAN Card Resize", slug: "pan-card-resize", icon: "credit-card" },
      { label: "Remove Background", slug: "remove-background", icon: "eraser" },
      { label: "JPG to PDF", slug: "jpg-to-pdf", icon: "photo" },
    ],
    features: [
      { icon: "gauge", title: "Three Quality Presets", description: "Choose Low, Medium, or High compression preset, or fine-tune with the manual quality slider for exact control over the output." },
      { icon: "lock", title: "Private Browser Processing", description: "All image compression runs locally using the Canvas API — your photos never leave your device. Safe for sensitive documents." },
      { icon: "refresh-cw", title: "Format Conversion Included", description: "Compress and convert between JPEG, PNG, and WebP in one step. Reduce file size while changing to a more efficient format." },
    ],
    useCases: [
      { title: "Compress Signature for Forms", description: "Reduce a scanned signature image to under 50KB for uploading to online application forms with strict file size limits." },
      { title: "Optimize Photos for Email", description: "Compress high-resolution holiday or product photos before emailing, to keep attachments small enough to send without cloud links." },
    ],
    steps: [
      { title: "Upload your image", description: "Select or drag and drop your JPEG, PNG, or WebP photo into the workspace.", icon: "upload" },
      { title: "Configure compression", description: "Choose a balanced quality preset, change the target format, or limit max pixel dimensions.", icon: "configure" },
      { title: "Download optimized file", description: "Click 'Compress Image' and save your compressed file instantly.", icon: "download" }
    ],
    howToName: "Compress Images Online",
    toolCategory: "image"
  },

  "compress-doc": {
    slug: "compress-doc",
    title: "Compress Word, Excel, PPT Files Free | FileNova",
    h1: "Compress Word, Excel & PowerPoint Files Online Free",
    metaDescription:
      "Compress Microsoft Word (DOCX), Excel (XLSX), and PowerPoint (PPTX) files online for free. Reduce office document sizes for email attachments and portal uploads.",
    keywords:
      "compress word file, compress excel file, compress pptx online, reduce docx size free, compress office files, shrink xlsx file size",
    toolName: "FileNova Office Document Compressor",
    toolDescription:
      "Free online tool to compress Microsoft Word, Excel, and PowerPoint files by optimizing images and removing redundant metadata.",
    seoBody: [
      "Office documents — Word reports, Excel sheets, and PowerPoint presentations — can quickly become too large to email or upload. Embedded images, high-resolution charts, and leftover metadata from revisions all add to file size.",
      "FileNova's office document compressor shrinks DOCX, XLSX, and PPTX files by optimizing embedded images, stripping unnecessary metadata, and cleaning up internal formatting — without affecting the content you care about.",
      "This is especially useful for Indian students and professionals who need to email assignments, upload project reports to college portals, or share business proposals within attachment size limits.",
      "All processing happens directly in your browser. Your documents never leave your device, keeping sensitive financial data, academic work, and business information completely private.",
      "After compressing, you can [Word to PDF](word-to-pdf) to convert to PDF format, or [Merge PDF](merge-pdf) to combine with other documents."
    ],
    faqs: [
      {
        q: "How do I compress a Word document online for free?",
        a: "Upload your DOCX file to FileNova's Compress Doc tool and click Compress. The tool optimizes embedded images and metadata to reduce file size. Download your compressed file instantly."
      },
      {
        q: "Will compressing an Excel file remove my formulas or data?",
        a: "No. Compressing only optimizes embedded images and removes unnecessary metadata. All formulas, macros, cell data, and formatting remain completely intact."
      },
      {
        q: "Can I compress PowerPoint files with embedded videos?",
        a: "Yes. FileNova compresses images and cleans metadata inside PPTX files. For embedded video files, consider compressing the video separately before inserting it into your presentation."
      },
      {
        q: "Is it safe to upload sensitive office documents?",
        a: "Yes. All compression runs locally in your browser. Your Word, Excel, and PowerPoint files never upload to any server — they stay on your device."
      }
    ],
    relatedTools: [
      { label: "Word to PDF", slug: "word-to-pdf", icon: "file-text" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "Compress Image", slug: "compress-image", icon: "image" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" }
    ],
    features: [
      { icon: "file-text", title: "Multi-Format Support", description: "Compress DOCX, XLSX, and PPTX files. One tool handles all Microsoft Office document formats for your convenience." },
      { icon: "image", title: "Smart Image Optimization", description: "Embedded images are intelligently compressed to reduce file size while keeping them clear enough for screen viewing and printing." },
      { icon: "trash-2", title: "Metadata Cleanup", description: "Removes redundant revision history, hidden comments, and embedded thumbnails that bloat office document files over time." }
    ],
    useCases: [
      { title: "Email Large Reports", description: "Compress a Word report or Excel spreadsheet before emailing to clients or colleagues when the file exceeds typical attachment size limits." },
      { title: "Upload to College Portals", description: "Reduce project reports and presentation files to meet college and university portal upload size restrictions without losing content quality." }
    ],
    steps: [
      { title: "Upload your document", description: "Select your DOCX, XLSX, or PPTX file. The tool automatically detects the format and applies the right compression strategy.", icon: "upload" },
      { title: "Compress automatically", description: "FileNova optimizes embedded images and removes redundant metadata. The document content stays unchanged.", icon: "process" },
      { title: "Download compressed file", description: "Get your smaller, email-friendly document. All original formatting, formulas, and content are preserved.", icon: "download" }
    ],
    howToName: "Compress Office Documents Online",
    toolCategory: "document"
  },

  "ai-ppt-maker": {
    slug: "ai-ppt-maker",
    title: "AI PPT Maker – Generate Presentations from Topic Free | FileNova",
    h1: "AI PPT Maker – Create PowerPoint Presentations with AI",
    metaDescription:
      "Generate complete PowerPoint presentations from any topic or notes using AI for free. Choose themes, tone, and slide count. Perfect for school and college projects in India.",
    keywords:
      "ai ppt maker free, ai presentation generator, topic to ppt, ai slides maker, free powerpoint generator india, ai presentation maker no signup",
    toolName: "FileNova AI Presentation Maker",
    toolDescription:
      "Generate complete PowerPoint presentations from any topic or notes using AI online for free, with customizable themes and writing tone.",
    seoBody: [
      "Creating a presentation from scratch takes time — choosing a layout, writing slide content, picking visuals, and formatting everything consistently. FileNova's AI PPT Maker does all of this for you in seconds.",
      "Just enter your topic or paste your notes, select the number of slides, choose a theme color, and pick a writing tone (formal, conversational, or student-friendly). The AI generates a complete, downloadable PowerPoint file with structured slides, bullet points, and consistent formatting.",
      "This is ideal for Indian college and school students working on project presentations, seminar slides, or assignment submissions where a well-structured PPT is expected. No design skills or PowerPoint expertise needed.",
      "Each presentation is generated fresh from your input — you get original content, not template filler. After downloading, you can open the PPTX file in Microsoft PowerPoint, Google Slides, or LibreOffice Impress.",
      "After generating your presentation, use [Compress Doc](compress-doc) to reduce file size for emailing, or [Word to PDF](word-to-pdf) to convert to PDF format."
    ],
    faqs: [
      {
        q: "How to make a PPT from a topic using AI for free?",
        a: "Enter your topic on FileNova's AI PPT Maker, choose the number of slides and writing tone, and click Generate. A complete themed PowerPoint downloads in seconds."
      },
      {
        q: "Can I generate a presentation from my own notes?",
        a: "Yes. Paste your notes, bullet points, or syllabus content into the input area. The AI structures your notes into well-organized slides with headings and sub-points."
      },
      {
        q: "What themes and styles are available?",
        a: "You can choose from multiple color themes and three writing tones — formal (for business/professional), conversational (for general audiences), and student-friendly (for academic presentations)."
      },
      {
        q: "Is the AI PPT Maker really free?",
        a: "Yes. Free users can generate presentations up to a certain number of slides per day. Pro and Elite users get unlimited generation with more theme options and longer presentations."
      },
      {
        q: "Can I edit the generated presentation after downloading?",
        a: "Yes. The downloaded PPTX file opens in Microsoft PowerPoint, Google Slides, or LibreOffice Impress. You can edit, add images, change text, and customize as needed."
      }
    ],
    relatedTools: [
      { label: "Compress Doc", slug: "compress-doc", icon: "file-zip" },
      { label: "Word to PDF", slug: "word-to-pdf", icon: "file-text" },
      { label: "AI PDF Summary", slug: "ai-pdf-summary", icon: "sparkles" },
      { label: "OCR PDF", slug: "ocr", icon: "scan" }
    ],
    features: [
      { icon: "wand-2", title: "Topic-to-Slides in Seconds", description: "Enter any topic or paste your notes, and the AI generates a complete multi-slide presentation with headings, bullet points, and structured content." },
      { icon: "palette", title: "Customizable Themes & Tone", description: "Choose from multiple color themes and three writing tones — formal, conversational, or student-friendly — to match your audience." },
      { icon: "download", title: "Real PPTX Download", description: "Download a real .pptx file that opens in Microsoft PowerPoint, Google Slides, or LibreOffice. Edit it further like any normal presentation." }
    ],
    useCases: [
      { title: "College Project Presentations", description: "Generate a well-structured presentation for your college project or seminar in seconds. Choose a student-friendly tone and academic theme for best results." },
      { title: "Business Proposal Decks", description: "Quickly create a professional proposal or pitch deck from bullet points. Select formal tone and corporate theme for client-ready presentations." }
    ],
    steps: [
      { title: "Enter your topic or notes", description: "Type your presentation topic or paste your notes, bullet points, or outline. The AI uses this to generate slide content.", icon: "upload" },
      { title: "Customize settings", description: "Choose the number of slides, color theme, and writing tone. Preview the structure before generating.", icon: "configure" },
      { title: "Generate and download", description: "Click Generate. Your PowerPoint file downloads as a PPTX ready to open, edit, and present.", icon: "download" }
    ],
    howToName: "Create a Presentation with AI",
    toolCategory: "document"
  },

  "word-to-pdf": {
    slug: "word-to-pdf",
    title: "Word to PDF – Convert DOC/DOCX to PDF Free | FileNova",
    h1: "Word to PDF – Convert Word Document to PDF Online",
    metaDescription:
      "Convert Word documents (DOC/DOCX) to PDF online for free. Preserve formatting, fonts, and layout. Works with MS Word, Google Docs, LibreOffice files.",
    keywords:
      "word to pdf, doc to pdf, docx to pdf, convert word to pdf online free, ms word to pdf converter",
    toolName: "FileNova Word to PDF Converter",
    toolDescription:
      "Convert Microsoft Word documents (DOC/DOCX) to PDF online for free, preserving formatting and layout.",
    seoBody: [
      "Need to share a Word document that looks the same on every device? FileNova's Word to PDF converter transforms your DOC or DOCX files into professional PDFs that preserve fonts, images, tables, and page layout exactly.",
      "This is essential for submitting resumes, assignments, reports, or government forms where you need guaranteed formatting. PDFs opened on any device look identical to the original.",
      "Works with files created in MS Word, Google Docs, LibreOffice Writer, or any word processor that exports DOCX. Batch convert multiple documents at once with Pro.",
      "After converting to PDF, you can [Compress PDF](compress-pdf) to reduce size or [Merge PDF](merge-pdf) with other documents before submission.",
    ],
    faqs: [
      {
        q: "How do I convert a Word document to PDF for free?",
        a: "Upload your DOC or DOCX file to FileNova's Word to PDF tool and click Convert. Your PDF downloads instantly — no account needed.",
      },
      {
        q: "Will the formatting be preserved?",
        a: "Yes. FileNova preserves fonts, images, tables, bullet points, and page layout. Complex documents with headers/footers may need minor adjustments.",
      },
      {
        q: "Can I convert DOCX files from Google Docs?",
        a: "Yes. Download your Google Docs file as DOCX, then upload it to FileNova to convert to PDF.",
      },
    ],
    relatedTools: [
      { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
      { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
      { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
      { label: "PDF to JPG", slug: "pdf-to-jpg", icon: "photo" },
    ],
    features: [
      { icon: "file-text", title: "Formatting Preservation", description: "Fonts, images, tables, headers, footers, and page layout are preserved exactly. The output PDF looks identical to your original Word document." },
      { icon: "file", title: "Multi-Source Compatibility", description: "Works with DOCX files from Microsoft Word, Google Docs, LibreOffice Writer, WPS Office, and any word processor that exports DOCX format." },
      { icon: "zap", title: "One-Click Conversion", description: "Upload and convert in one click. No software installation, no account creation, no hidden limits for most document sizes." },
    ],
    useCases: [
      { title: "Professional Resume Submission", description: "Convert your Word-format resume to PDF before submitting to job portals. Ensures recruiters see your formatting exactly as intended." },
      { title: "Client Report Delivery", description: "Convert internal Word reports to professional PDF format for client delivery, preserving all formatting, charts, and branding." },
    ],
    steps: [
      { title: "Upload your Word document", description: "Select your DOC or DOCX file from your device.", icon: "upload" },
      { title: "Convert to PDF", description: "Click Convert. FileNova processes your document while preserving all formatting.", icon: "process" },
      { title: "Download PDF", description: "Your PDF file is ready to download — compatible with all PDF readers and printers.", icon: "download" },
    ],
    howToName: "Convert Word to PDF",
    toolCategory: "document",
  },
};
