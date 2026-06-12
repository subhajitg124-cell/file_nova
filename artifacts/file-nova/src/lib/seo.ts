/**
 * SEO meta helper — sets document.title, meta description, canonical link,
 * and injects JSON-LD structured data for each tool page.
 *
 * Usage:
 *   import { setPageMeta } from "@/lib/seo";
 *   setPageMeta({ title: "Compress PDF | FileNova", description: "...", canonical: "/tools/compress-pdf" });
 */

export interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** Upsert a <meta> tag by name or property */
function upsertMeta(attrName: "name" | "property", attrValue: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Upsert a <link rel="..."> tag */
function upsertLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Inject / replace JSON-LD <script> tags for structured data */
function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  // Remove all existing data-filenova JSON-LD scripts to avoid stale tags on page transition
  const existing = document.querySelectorAll('script[type="application/ld+json"][data-filenova]');
  existing.forEach(el => el.remove());

  const items = Array.isArray(data) ? data : [data];
  items.forEach((item, index) => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-filenova", String(index));
    el.textContent = JSON.stringify(item);
    document.head.appendChild(el);
  });
}

/** Main entry point — call this from a useEffect in any page component */
export function setPageMeta({ title, description, canonical, keywords, jsonLd }: PageMeta) {
  // Title
  document.title = title;

  // Standard meta
  upsertMeta("name", "description", description);
  if (keywords) upsertMeta("name", "keywords", keywords);

  // Open Graph
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", "FileNova");
  upsertMeta("property", "og:image", "https://filenova.in/og-image.png");

  // Twitter card
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);

  // Canonical & og:url
  if (canonical) {
    const base = "https://filenova.in";
    const fullUrl = `${base}${canonical}`;
    upsertLink("canonical", fullUrl);
    upsertMeta("property", "og:url", fullUrl);
  }

  // JSON-LD
  if (jsonLd) {
    upsertJsonLd(jsonLd);
  }
}

/** Prebuilt JSON-LD for a tool page (SoftwareApplication schema) */
export function toolJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: opts.category ?? "UtilitiesApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    provider: {
      "@type": "Organization",
      name: "FileNova",
      url: "https://filenova.in",
    },
  };
}

/** Prebuilt JSON-LD for a BreadcrumbList */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `https://filenova.in${item.url}`,
    })),
  };
}

/** Prebuilt JSON-LD for FAQPage */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Per-tool metadata catalog — returns title/description/keywords for each toolId */
export const TOOL_META: Record<string, { title: string; description: string; keywords: string }> = {
  "compress-pdf": {
    title: "Compress PDF Online Free | FileNova",
    description: "Reduce PDF file size to under 200KB instantly. No uploads, 100% browser-based. Perfect for government portals like OASIS, Banglar Shiksha.",
    keywords: "compress pdf, reduce pdf size, pdf compressor, free pdf compressor india",
  },
  "merge-pdf": {
    title: "Merge PDF Files Free Online | FileNova",
    description: "Combine multiple PDF documents into one file in seconds. Free, secure, and browser-only processing.",
    keywords: "merge pdf, combine pdf, join pdf files, pdf merger free",
  },
  "aadhaar-masking": {
    title: "Aadhaar Card Masking Tool | FileNova",
    description: "Mask the first 8 digits of your Aadhaar card for safe document uploads. UIDAI-compliant privacy protection.",
    keywords: "aadhaar masking, aadhaar card mask, uidai aadhaar privacy, aadhaar number hide",
  },
  "pan-card": {
    title: "PAN Card Photo & Signature Resize | FileNova",
    description: "Resize PAN card photos and signatures to exact NSDL/UTI portal specifications instantly.",
    keywords: "pan card resize, nsdl pan upload, uti pan photo size, pan application photo",
  },
  "resize-photo": {
    title: "Resize Photo & Signature Online | FileNova",
    description: "Resize passport photos, signatures, and ID images to custom dimensions for any government or scholarship portal.",
    keywords: "resize photo online, passport photo resize, signature resize, government portal photo",
  },
  "scholarship-zip": {
    title: "Scholarship ZIP Maker | FileNova",
    description: "Compile income certificate, marksheet, bank passbook, photo and signature into a single ZIP for SVMCM, OASIS, Kanyashree, Annapurna Bhandar Scheme applications.",
    keywords: "scholarship zip, svmcm documents, oasis scholarship, kanyashree documents, annapurna bhandar",
  },
  "remove-bg": {
    title: "AI Background Remover Free | FileNova",
    description: "Remove image backgrounds automatically with AI. Get a transparent PNG instantly — no sign-up needed.",
    keywords: "remove background, ai background remover, transparent png, photo background removal",
  },
  "docx-to-pdf": {
    title: "DOCX to PDF Converter Free | FileNova",
    description: "Convert Microsoft Word (.docx) files to PDF instantly in your browser. No server upload required.",
    keywords: "docx to pdf, word to pdf, convert word pdf, docx pdf converter free",
  },
  "pdf-ocr": {
    title: "OCR PDF Scanner — Extract Text | FileNova",
    description: "Extract editable text from scanned certificates, Aadhaar PDFs, and images using AI-powered OCR.",
    keywords: "ocr pdf, scan to text, pdf text extraction, certificate ocr, aadhaar text extract",
  },
  "ai-summarize": {
    title: "AI PDF Summarizer | FileNova",
    description: "Generate concise, structured summaries of long PDF documents using AI. Great for research papers and reports.",
    keywords: "pdf summarizer, ai summary, document summary, pdf to summary",
  },
  "images-to-pdf": {
    title: "Images to PDF Converter | FileNova",
    description: "Combine multiple JPG/PNG/WebP images into a single PDF file instantly.",
    keywords: "images to pdf, jpg to pdf, png to pdf, photo to pdf",
  },
};

/** Fallback meta for unknown tool IDs */
export const DEFAULT_META: PageMeta = {
  title: "FileNova — Free Document Tools for India",
  description: "Process PDFs, compress images, mask Aadhaar, compile scholarship ZIPs and more — 100% free, browser-based, and privacy-first.",
  canonical: "/",
  keywords: "file tools india, pdf tools, scholarship documents, aadhaar masking, csc portal tools",
};
