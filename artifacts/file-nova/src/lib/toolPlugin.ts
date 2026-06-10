import React from "react";

export enum WorkspaceType {
  PDF_EDITOR,
  CONVERTER,
  IMAGE,
  GOVERNMENT,
  AI,
  BATCH,
  UTILITY
}

export enum PreviewType {
  PDF,
  IMAGE,
  TEXT,
  COMPARISON,
  TABLE,
  NONE
}

export interface ToolCapabilities {
  preview: boolean;
  batchProcessing: boolean;
  beforeAfter: boolean;
  undoRedo: boolean;
  dragDrop: boolean;
  exportCenter: boolean;
  offlineReady: boolean; // Added in Phase 3
}

export interface ToolMetadata {
  keywords: string[];
  synonyms: string[];
  useCases: string[];
  difficulty: "easy" | "medium" | "hard";
}

export interface SEOOverride {
  title: string;
  description: string;
  faq?: Array<{ q: string; a: string }>;
}

export interface ToolRegistryItem {
  id: string;
  name: string;
  category: 'pdf' | 'image' | 'video' | 'document' | 'ocr' | 'ai';
  workspaceType: WorkspaceType;
  previewType: PreviewType;
  capabilities: ToolCapabilities;
  metadata: ToolMetadata;
  errorStrategies: string[];
  icon: string;
  title: string;
  description: string;
  relatedTools: string[];
  seoOverride?: SEOOverride;
  premiumFeatures?: string[];
}

export const featureFlags = {
  copilot: true,
  analytics: true,
  workflowEngine: true,
  indexedDb: true,
  commandPalette: true,
  beforeAfterSlider: true,
  privacyDashboard: true,
};

export const TOOL_REGISTRY: Record<string, ToolRegistryItem> = {
  "merge-pdf": {
    id: "merge-pdf",
    name: "Merge PDF",
    category: "pdf",
    workspaceType: WorkspaceType.PDF_EDITOR,
    previewType: PreviewType.PDF,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: false,
      undoRedo: true,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["merge pdf", "combine pdf", "join pdf"],
      synonyms: ["combine", "join", "union"],
      useCases: ["Combine student credentials", "Join report chapters"],
      difficulty: "easy"
    },
    errorStrategies: ["repair-pdf", "retry", "extract-pages"],
    icon: "Files",
    title: "Merge PDF Files Online",
    description: "Combine multiple PDF files into one document in your preferred order.",
    relatedTools: ["split-pdf", "compress-pdf", "rotate-pdf"],
    seoOverride: {
      title: "Merge PDF – Free Online PDF Merger | FileNova",
      description: "Merge PDF files online for free. Combine multiple PDF documents into one in seconds. No signup needed.",
    }
  },
  "split-pdf": {
    id: "split-pdf",
    name: "Split PDF",
    category: "pdf",
    workspaceType: WorkspaceType.PDF_EDITOR,
    previewType: PreviewType.PDF,
    capabilities: {
      preview: true,
      batchProcessing: false,
      beforeAfter: false,
      undoRedo: true,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["split pdf", "extract pdf", "cut pdf"],
      synonyms: ["divide", "cut", "extract"],
      useCases: ["Extract sign page", "Separate combined bills"],
      difficulty: "easy"
    },
    errorStrategies: ["retry", "repair-pdf"],
    icon: "Scissors",
    title: "Split PDF Online",
    description: "Extract specific page ranges or split a PDF into separate files.",
    relatedTools: ["merge-pdf", "compress-pdf", "rotate-pdf"],
  },
  "compress-pdf": {
    id: "compress-pdf",
    name: "Compress PDF",
    category: "pdf",
    workspaceType: WorkspaceType.UTILITY,
    previewType: PreviewType.COMPARISON,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: true,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["compress pdf", "shrink pdf", "pdf size reducer"],
      synonyms: ["shrink", "optimize", "reduce size"],
      useCases: ["Submit under 200kb limit", "Email size optimization"],
      difficulty: "easy"
    },
    errorStrategies: ["repair-pdf", "retry"],
    icon: "FileArchive",
    title: "Compress PDF Document",
    description: "Reduce PDF file size while maintaining text and image quality.",
    relatedTools: ["merge-pdf", "split-pdf", "resize-pdf"],
    seoOverride: {
      title: "Compress PDF – Reduce PDF File Size Free | FileNova",
      description: "Compress PDF files online and reduce file size without losing quality. Shrink PDFs for email, WhatsApp, or government portal uploads.",
    }
  },
  "pdf-to-word": {
    id: "pdf-to-word",
    name: "PDF to Word",
    category: "document",
    workspaceType: WorkspaceType.CONVERTER,
    previewType: PreviewType.TEXT,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: true,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: false
    },
    metadata: {
      keywords: ["pdf to word", "pdf to docx", "convert pdf"],
      synonyms: ["docx", "editable doc", "convert"],
      useCases: ["Edit scanned report", "Modify pdf layout"],
      difficulty: "easy"
    },
    errorStrategies: ["ocr", "retry"],
    icon: "FileSpreadsheet",
    title: "Convert PDF to Word",
    description: "Convert PDF documents to editable Microsoft Word files.",
    relatedTools: ["word-to-pdf", "pdf-to-jpg", "ocr"],
  },
  "pdf-to-jpg": {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    category: "image",
    workspaceType: WorkspaceType.CONVERTER,
    previewType: PreviewType.IMAGE,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: false,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["pdf to jpg", "pdf to image", "extract image"],
      synonyms: ["jpeg", "image", "export"],
      useCases: ["Upload certificate page", "Save slides as photos"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "Image",
    title: "Convert PDF to JPG",
    description: "Extract pages from a PDF as high-quality JPEG images.",
    relatedTools: ["jpg-to-pdf", "pdf-to-word", "compress-pdf"],
  },
  "jpg-to-pdf": {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    category: "image",
    workspaceType: WorkspaceType.CONVERTER,
    previewType: PreviewType.PDF,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: false,
      undoRedo: true,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["jpg to pdf", "image to pdf", "photos to pdf"],
      synonyms: ["combine images", "compile pdf", "convert photo"],
      useCases: ["Combine assignment pages", "Scan bill receipts"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "FileImage",
    title: "Convert JPG to PDF",
    description: "Convert images to PDF documents and combine them into a single file.",
    relatedTools: ["pdf-to-jpg", "merge-pdf", "compress-pdf"],
  },
  "rotate-pdf": {
    id: "rotate-pdf",
    name: "Rotate PDF",
    category: "pdf",
    workspaceType: WorkspaceType.PDF_EDITOR,
    previewType: PreviewType.PDF,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: false,
      undoRedo: true,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["rotate pdf", "flip pdf", "rotate orientation"],
      synonyms: ["flip", "spin", "turn"],
      useCases: ["Fix sideways scan", "Align upside-down page"],
      difficulty: "easy"
    },
    errorStrategies: ["retry", "repair-pdf"],
    icon: "RotateCw",
    title: "Rotate PDF Pages",
    description: "Rotate pages clockwise or counter-clockwise and save orientation.",
    relatedTools: ["merge-pdf", "split-pdf", "compress-pdf"],
  },
  "unlock-pdf": {
    id: "unlock-pdf",
    name: "Unlock PDF",
    category: "pdf",
    workspaceType: WorkspaceType.UTILITY,
    previewType: PreviewType.NONE,
    capabilities: {
      preview: false,
      batchProcessing: false,
      beforeAfter: false,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["unlock pdf", "remove password", "decrypt pdf"],
      synonyms: ["decrypt", "remove protection", "unlocker"],
      useCases: ["Unlock bank statement", "Decrypt payslip"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "Unlock",
    title: "Unlock PDF Document",
    description: "Remove security password protection from PDF files.",
    relatedTools: ["protect-pdf", "compress-pdf"],
  },
  "protect-pdf": {
    id: "protect-pdf",
    name: "Protect PDF",
    category: "pdf",
    workspaceType: WorkspaceType.UTILITY,
    previewType: PreviewType.PDF,
    capabilities: {
      preview: true,
      batchProcessing: false,
      beforeAfter: false,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["protect pdf", "password pdf", "encrypt pdf"],
      synonyms: ["encrypt", "lock pdf", "secure file"],
      useCases: ["Secure contract details", "Lock payslip PDF"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "Lock",
    title: "Password Protect PDF",
    description: "Add password security protection to your PDF files.",
    relatedTools: ["unlock-pdf", "compress-pdf"],
  },
  "resize-pdf": {
    id: "resize-pdf",
    name: "Resize PDF",
    category: "pdf",
    workspaceType: WorkspaceType.UTILITY,
    previewType: PreviewType.PDF,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: false,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["resize pdf", "pdf page size", "change page size"],
      synonyms: ["scale", "a4 converter", "letter fit"],
      useCases: ["Fit to standard printing A4", "Format weird boundaries"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "Maximize",
    title: "Resize PDF Page Dimensions",
    description: "Change PDF page sizes to A4, Letter, A3, or custom sizes.",
    relatedTools: ["compress-pdf", "rotate-pdf", "merge-pdf"],
  },
  "pan-card-resize": {
    id: "pan-card-resize",
    name: "PAN Card Resize",
    category: "image",
    workspaceType: WorkspaceType.IMAGE,
    previewType: PreviewType.IMAGE,
    capabilities: {
      preview: true,
      batchProcessing: false,
      beforeAfter: true,
      undoRedo: true,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["pan card photo", "pan size", "utiitsl resize"],
      synonyms: ["pan card crop", "resize photo", "gov size"],
      useCases: ["NSDL photo size", "UTIITSL application crop"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "CreditCard",
    title: "Resize PAN Card Photo",
    description: "Resize and crop photographs to PAN card application sizes (3.5x2.5cm).",
    relatedTools: ["aadhaar-mask-pdf", "resize-image"],
  },
  "aadhaar-mask-pdf": {
    id: "aadhaar-mask-pdf",
    name: "Aadhaar Mask PDF",
    category: "pdf",
    workspaceType: WorkspaceType.GOVERNMENT,
    previewType: PreviewType.COMPARISON,
    capabilities: {
      preview: true,
      batchProcessing: false,
      beforeAfter: true,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["mask aadhaar", "uidai masking", "blur aadhaar"],
      synonyms: ["redact aadhaar", "secure pdf", "uidai guidelines"],
      useCases: ["Secure landlord copy", "Safe bank verification"],
      difficulty: "easy"
    },
    errorStrategies: ["retry", "repair-pdf"],
    icon: "Fingerprint",
    title: "Mask Aadhaar PDF",
    description: "Blackout or blur the first 8 digits of your Aadhaar card number in PDF.",
    relatedTools: ["pan-card-resize", "protect-pdf", "compress-pdf"],
    seoOverride: {
      title: "Mask Aadhaar Number in PDF – Free Aadhaar Masking Tool | FileNova",
      description: "Mask your Aadhaar card number in a PDF online for free. Hide the first 8 digits for secure sharing. UIDAI-compliant masked Aadhaar PDF.",
    }
  },
  "government-form-fill": {
    id: "government-form-fill",
    name: "Government Form Fill",
    category: "document",
    workspaceType: WorkspaceType.GOVERNMENT,
    previewType: PreviewType.PDF,
    capabilities: {
      preview: true,
      batchProcessing: false,
      beforeAfter: false,
      undoRedo: true,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["fill government form", "pdf filler", "aadhaar form"],
      synonyms: ["form filler", "pdf type", "pre-loaded form"],
      useCases: ["Fill school concession", "Type inside application form"],
      difficulty: "medium"
    },
    errorStrategies: ["retry"],
    icon: "FormInput",
    title: "Fill Government Forms",
    description: "Fill interactive fields inside official government application forms.",
    relatedTools: ["aadhaar-mask-pdf", "pan-card-resize"],
  },
  "compress-pdf-for-upload": {
    id: "compress-pdf-for-upload",
    name: "Compress for Upload",
    category: "pdf",
    workspaceType: WorkspaceType.BATCH,
    previewType: PreviewType.COMPARISON,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: true,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["target compress", "under 100kb", "under 200kb"],
      synonyms: ["compress target", "irctc compressor", "csc portal"],
      useCases: ["Submit to IRCTC portal", "Winnable scholarship upload"],
      difficulty: "easy"
    },
    errorStrategies: ["repair-pdf", "retry"],
    icon: "UploadCloud",
    title: "Target Size PDF Compressor",
    description: "Compress PDFs to fit target sizes under 100KB, 200KB, 500KB, or 1MB.",
    relatedTools: ["compress-pdf", "merge-pdf"],
  },
  "ocr": {
    id: "ocr",
    name: "OCR Scan to Text",
    category: "ocr",
    workspaceType: WorkspaceType.UTILITY,
    previewType: PreviewType.TEXT,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: true,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["ocr", "image to text", "extract text"],
      synonyms: ["scan converter", "parse text", "tesseract"],
      useCases: ["Copy from scanned paper", "Digitize image logs"],
      difficulty: "medium"
    },
    errorStrategies: ["retry"],
    icon: "ScanLine",
    title: "OCR Scanner PDF/Image",
    description: "Extract text from scanned PDF files and photos in English, Hindi, and Bengali.",
    relatedTools: ["pdf-to-word", "compress-pdf"],
  },
  "remove-background": {
    id: "remove-background",
    name: "Remove Background",
    category: "image",
    workspaceType: WorkspaceType.IMAGE,
    previewType: PreviewType.IMAGE,
    capabilities: {
      preview: true,
      batchProcessing: false,
      beforeAfter: true,
      undoRedo: true,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["remove bg", "transparent background", "background eraser"],
      synonyms: ["eraser", "transparent bg", "no background"],
      useCases: ["Prepare visa background", "Ecommerce photo listing"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "Eraser",
    title: "Remove Image Background",
    description: "Make image background transparent instantly using offline canvas tools.",
    relatedTools: ["resize-image", "pan-card-resize"],
  },
  "scholarship-zip": {
    id: "scholarship-zip",
    name: "Scholarship ZIP Maker",
    category: "document",
    workspaceType: WorkspaceType.GOVERNMENT,
    previewType: PreviewType.NONE,
    capabilities: {
      preview: false,
      batchProcessing: true,
      beforeAfter: false,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["scholarship zip", "credentials zip", "college zip"],
      synonyms: ["zip maker", "bundle documents", "wbscc zip"],
      useCases: ["Prepare scholarship package", "Zip verify documents"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "Archive",
    title: "Scholarship ZIP Creator",
    description: "Package and compress student credentials into a single uploadable archive.",
    relatedTools: ["aadhaar-mask-pdf", "pan-card-resize"],
  },
  "ai-pdf-summary": {
    id: "ai-pdf-summary",
    name: "AI Summarizer",
    category: "ai",
    workspaceType: WorkspaceType.AI,
    previewType: PreviewType.TEXT,
    capabilities: {
      preview: true,
      batchProcessing: false,
      beforeAfter: false,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: false
    },
    metadata: {
      keywords: ["ai summarizer", "pdf summary", "bullets generator"],
      synonyms: ["bullet points", "synopsis generator", "text summarize"],
      useCases: ["Summarize research paper", "Read contract synopsis"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "Sparkles",
    title: "AI Document Summarizer",
    description: "Generate summaries and key bullet points from large PDF files.",
    relatedTools: ["ocr", "pdf-to-word"],
  },
  "resize-image": {
    id: "resize-image",
    name: "Resize Image",
    category: "image",
    workspaceType: WorkspaceType.IMAGE,
    previewType: PreviewType.IMAGE,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: true,
      undoRedo: true,
      dragDrop: true,
      exportCenter: true,
      offlineReady: true
    },
    metadata: {
      keywords: ["resize image", "resizer photo", "pixels change"],
      synonyms: ["dpi resizer", "scale dimensions", "custom width"],
      useCases: ["Resize candidate photo", "Passport dimensions fit"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "Scale",
    title: "Resize Image Dimensions",
    description: "Configure, scale, and adjust photo resolutions to custom pixels.",
    relatedTools: ["remove-background", "pan-card-resize"],
  },
  "word-to-pdf": {
    id: "word-to-pdf",
    name: "Word to PDF",
    category: "document",
    workspaceType: WorkspaceType.CONVERTER,
    previewType: PreviewType.PDF,
    capabilities: {
      preview: true,
      batchProcessing: true,
      beforeAfter: false,
      undoRedo: false,
      dragDrop: true,
      exportCenter: true,
      offlineReady: false
    },
    metadata: {
      keywords: ["word to pdf", "docx to pdf", "convert docx"],
      synonyms: ["convert doc", "word converter", "docx fit"],
      useCases: ["Publish reports as PDF", "Export doc to secure pdf"],
      difficulty: "easy"
    },
    errorStrategies: ["retry"],
    icon: "FileCheck",
    title: "Convert Word to PDF",
    description: "Convert DOCX/DOC files to PDF files instantly.",
    relatedTools: ["pdf-to-word", "merge-pdf"],
  }
};
