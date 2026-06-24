import { memo } from "react";
import { useHead } from "@unhead/react";
import { useLocation } from "wouter";
import { TOOL_META } from "./toolMeta";

const SITE_URL = "https://filenova.in";
const SITE_NAME = "FileNova";

function lookupMeta(pathname: string) {
  if (TOOL_META[pathname]) return TOOL_META[pathname];
  if (pathname.startsWith("/tools/")) {
    const subPath = "/" + pathname.slice("/tools/".length);
    return TOOL_META[subPath] ?? TOOL_META["/"];
  }
  return TOOL_META["/"];
}

const NON_INDEXABLE_PATHS = new Set([
  "/beta-test", "/operator-dashboard", "/ref", "/nova-control",
  "/nova-login", "/admin/analytics", "/admin/upi-payments",
  "/admin/coupons", "/admin/discount-codes", "/dashboard", "/history",
]);

function shouldIndex(pathname: string) {
  if (pathname.startsWith("/admin") || pathname.startsWith("/nova")) return false;
  if (NON_INDEXABLE_PATHS.has(pathname)) return false;
  if (pathname.startsWith("/ref/") || pathname === "/ref") return false;
  return true;
}

const TOOL_PATHS = new Set([
  "/aadhaar-mask-pdf", "/aadhaar-mask", "/pan-card-resize",
  "/scholarship-zip", "/compress-pdf", "/compress-pdf-for-upload",
  "/merge-pdf", "/split-pdf", "/protect-pdf", "/unlock-pdf",
  "/rotate-pdf", "/resize-pdf", "/pdf-to-word", "/pdf-to-jpg",
  "/jpg-to-pdf", "/word-to-pdf", "/resize-photo", "/resize-image",
  "/compress-image", "/remove-background", "/ocr", "/compress-doc",
  "/ai-ppt-maker", "/ai-pdf-summary", "/government-form-fill",
  "/tools", "/pdf-tools", "/image-tools", "/video-tools",
  "/document-tools", "/india-tools", "/tools/compress-pan-card",
]);

function isToolOrCategoryPage(pathname: string) {
  if (TOOL_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/tools/") && pathname !== "/tools") {
    const subPath = "/" + pathname.slice("/tools/".length);
    return TOOL_PATHS.has(subPath);
  }
  return false;
}

function extractName(title: string): string {
  return title.split("–")[0].split("|")[0].trim();
}

const CATEGORY_ITEMS_MAP: Record<string, Array<{ name: string; url: string; description: string }>> = {
  "/pdf-tools": [
    { name: "Merge PDF", url: "https://filenova.in/merge-pdf", description: "Combine multiple PDF documents into one online free." },
    { name: "Split PDF", url: "https://filenova.in/split-pdf", description: "Extract pages or split a PDF into separate files." },
    { name: "Compress PDF", url: "https://filenova.in/compress-pdf", description: "Reduce PDF file size locally in your browser." },
    { name: "Rotate PDF", url: "https://filenova.in/rotate-pdf", description: "Fix layout orientation of PDF document pages." },
    { name: "Protect PDF", url: "https://filenova.in/protect-pdf", description: "Add password protection to secure your PDF." },
    { name: "Unlock PDF", url: "https://filenova.in/unlock-pdf", description: "Remove password restrictions from protected PDFs." },
    { name: "PDF to Word", url: "https://filenova.in/pdf-to-word", description: "Convert PDF documents to editable Microsoft Word files." },
    { name: "PDF to JPG", url: "https://filenova.in/pdf-to-jpg", description: "Extract PDF pages as clean JPG images." },
  ],
  "/image-tools": [
    { name: "Compress Image", url: "https://filenova.in/compress-image", description: "Reduce photo file size under 50KB or 20KB." },
    { name: "Resize Image", url: "https://filenova.in/resize-photo", description: "Resize image dimensions online free." },
    { name: "Remove Background", url: "https://filenova.in/remove-background", description: "AI background remover with transparent PNG output." },
    { name: "JPG to PDF", url: "https://filenova.in/jpg-to-pdf", description: "Convert images or scans to high-quality PDF files." },
  ],
  "/document-tools": [
    { name: "Word to PDF", url: "https://filenova.in/word-to-pdf", description: "Convert Word DOCX files to standard PDFs." },
    { name: "Compress Doc", url: "https://filenova.in/compress-doc", description: "Shrink office Word documents size free." },
    { name: "AI PPT Maker", url: "https://filenova.in/ai-ppt-maker", description: "Generate beautiful presentation slides with AI." },
    { name: "OCR scan-to-text", url: "https://filenova.in/ocr", description: "Extract editable text from scanned pages and images." },
    { name: "AI PDF Summarizer", url: "https://filenova.in/ai-pdf-summary", description: "Summarize PDF documents in a few bullet points." },
  ],
  "/video-tools": [
    { name: "Trim Video", url: "https://filenova.in/trim", description: "Trim and cut video clips online free." },
    { name: "Compress Video", url: "https://filenova.in/compress-video", description: "Reduce MP4 and WebM video size free." },
    { name: "Extract Audio", url: "https://filenova.in/video-to-audio", description: "Turn videos into high-quality MP3 audio files." },
    { name: "Video to GIF", url: "https://filenova.in/video-to-gif", description: "Convert videos to animated GIFs online free." },
    { name: "Compress Audio", url: "https://filenova.in/compress-audio", description: "Compress MP3, M4A, or WAV audio files online free." },
  ],
  "/india-tools": [
    { name: "Mask Aadhaar PDF", url: "https://filenova.in/aadhaar-mask-pdf", description: "Mask first 8 digits of Aadhaar UIDAI compliant." },
    { name: "PAN Card Resize", url: "https://filenova.in/pan-card-resize", description: "Resize photo & signature for NSDL/UTI application." },
    { name: "Government Form Fill", url: "https://filenova.in/government-form-fill", description: "Fill common government and exam portal PDF forms." },
    { name: "Compress for Upload", url: "https://filenova.in/compress-pdf-for-upload", description: "Shrink PDFs to exact portal limits like 100KB or 200KB." },
    { name: "Scholarship ZIP Maker", url: "https://filenova.in/scholarship-zip", description: "Bundle files into SVMCM/OASIS portal-ready ZIP files." },
  ],
};

export const ToolSEO = memo(function ToolSEO() {
  const [pathname] = useLocation();
  const meta = lookupMeta(pathname);
  const indexable = shouldIndex(pathname);

  const jsonLdScripts: Record<string, unknown>[] = [];

  // Helper: push a script
  const ld = (obj: Record<string, unknown>) => jsonLdScripts.push(obj);

  // ── 1. WebPage (every indexable page) ──────────────────────────────
  if (indexable) {
    ld({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: meta.title,
      description: meta.description,
      url: meta.canonical,
      inLanguage: ["en-IN", "hi-IN", "bn-IN"],
      isAccessibleForFree: true,
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    });
  }

  // ── 2. Organization (homepage) ─────────────────────────────────────
  if (pathname === "/") {
    ld({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      alternateName: "FileNova AI",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "Free online PDF and image tools built for India — Aadhaar masking, PAN resize, scholarship ZIP, OCR, AI PDF tools.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["English", "Hindi", "Bengali"],
      },
      sameAs: [
        "https://twitter.com/filenovaapp",
        "https://www.linkedin.com/company/filenova",
      ],
    });

    ld({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: "FileNova AI",
      url: SITE_URL,
      description: "Free online PDF and image tools for Indian students and professionals.",
      inLanguage: ["en-IN", "hi-IN", "bn-IN"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });
  }

  // ── 3. SoftwareApplication (only for actual tool/category pages) ───
  if (isToolOrCategoryPage(pathname) && meta.schemaName) {
    ld({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: meta.schemaName,
      description: meta.description,
      url: meta.canonical,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Windows, macOS, Linux, Android, iOS, ChromeOS",
      inLanguage: ["en-IN", "hi-IN", "bn-IN"],
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
          "https://twitter.com/filenovaapp",
          "https://www.linkedin.com/company/filenova",
        ],
      },
    });
  }

  // ── 4. FAQPage ─────────────────────────────────────────────────────
  if (meta.jsonLdFaq && meta.jsonLdFaq.length > 0) {
    ld({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: meta.jsonLdFaq.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  // ── 5. BreadcrumbList ──────────────────────────────────────────────
  const pathParts = pathname.split("/").filter(Boolean);
  if (pathParts.length > 0 && pathname !== "/" && indexable) {
    ld({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: meta.schemaName ?? extractName(meta.title),
          item: meta.canonical,
        },
      ],
    });
  }

  // ── 6. ItemList (Category Pages Schema) ────────────────────────────
  if (indexable) {
    if (CATEGORY_ITEMS_MAP[pathname]) {
      ld({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: meta.schemaName ?? extractName(meta.title),
        description: meta.description,
        url: meta.canonical,
        numberOfItems: CATEGORY_ITEMS_MAP[pathname].length,
        itemListElement: CATEGORY_ITEMS_MAP[pathname].map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: item.url,
          name: item.name,
          description: item.description,
        })),
      });
    } else if (pathname === "/tools") {
      const allTools = Object.values(CATEGORY_ITEMS_MAP).flat();
      ld({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "FileNova Tools Directory",
        description: meta.description,
        url: meta.canonical,
        numberOfItems: allTools.length,
        itemListElement: allTools.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: item.url,
          name: item.name,
          description: item.description,
        })),
      });
    }
  }

  // ── robots / meta ──────────────────────────────────────────────────
  const robotsContent = indexable
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    : "noindex, nofollow";

  const noIndexMeta = indexable ? [] : [{ name: "googlebot", content: "noindex, nofollow" }];

  useHead({
    title: meta.title,
    meta: [
      { name: "description", content: meta.description },
      { name: "keywords", content: meta.keywords },
      { name: "robots", content: robotsContent },
      { name: "geo.region", content: "IN" },
      { name: "geo.country", content: "India" },
      ...noIndexMeta,
      // Open Graph
      { property: "og:title", content: meta.ogTitle ?? meta.title },
      { property: "og:description", content: meta.ogDescription ?? meta.description },
      { property: "og:url", content: meta.canonical },
      { property: "og:type", content: pathname.startsWith("/blog/") ? "article" : "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:image", content: meta.ogImage ?? `${SITE_URL}/opengraph.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: meta.ogDescription ?? meta.description },
      { property: "og:locale", content: "en_IN" },
      // Twitter / X Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@filenovaapp" },
      { name: "twitter:title", content: meta.ogTitle ?? meta.title },
      { name: "twitter:description", content: meta.ogDescription ?? meta.description },
      { name: "twitter:image", content: meta.ogImage ?? `${SITE_URL}/opengraph.jpg` },
    ],
    link: [
      { rel: "canonical", href: meta.canonical },
      { rel: "alternate", hreflang: "en-IN", href: meta.canonical },
      { rel: "alternate", hreflang: "x-default", href: meta.canonical },
    ],
    script: jsonLdScripts.map((ld, i) => ({
      type: "application/ld+json",
      key: `jsonld-${i}`,
      innerHTML: JSON.stringify(ld),
    })),
  });

  return null;
});