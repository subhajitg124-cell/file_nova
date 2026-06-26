import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://filenova.in";
const today = new Date().toISOString().split("T")[0];

// ── Page definitions ──────────────────────────────────────────────
// Priority: 1.0 = homepage, 0.9-0.95 = flagship tools, 0.7-0.85 = tools, 0.4-0.6 = info

const toolPages = [
  // ── India-exclusive tools (priority 1.0-0.9)
  { path: "/aadhaar-mask-pdf",       priority: 1.0, image: { loc: "/aadhaar_mask_mockup.png", title: "Aadhaar Masking Tool – Hide Aadhaar Number Online Free" } },
  { path: "/pan-card-resize",        priority: 1.0, image: { loc: "/portal_photo_resize_guide.png", title: "PAN Card Photo Resizer – NEET, NSP, Railway Presets" } },
  { path: "/scholarship-zip",         priority: 0.95 },
  { path: "/resize-photo",            priority: 0.95, image: { loc: "/photo_resize_mockup.png", title: "Resize Photo for Scholarship Form Online Free" } },
  { path: "/government-form-fill",    priority: 0.9 },
  { path: "/compress-pdf-for-upload",     priority: 0.85 },
  // ── PDF Tools (priority 0.95-0.75)
  { path: "/compress-pdf",            priority: 0.95 },
  { path: "/merge-pdf",               priority: 0.95 },
  { path: "/split-pdf",               priority: 0.9 },
  { path: "/unlock-pdf",              priority: 0.9 },
  { path: "/protect-pdf",             priority: 0.85 },
  { path: "/rotate-pdf",              priority: 0.8 },
  { path: "/resize-pdf",              priority: 0.75 },
  // ── Conversion tools (priority 0.9-0.8)
  { path: "/pdf-to-word",             priority: 0.9 },
  { path: "/pdf-to-jpg",              priority: 0.85 },
  { path: "/jpg-to-pdf",              priority: 0.9 },
  { path: "/word-to-pdf",             priority: 0.85 },
  // ── Image tools (priority 0.85-0.8)
  { path: "/compress-image",          priority: 0.85, image: { loc: "/photo_resize_mockup.png", title: "Compress Image Online Free – Reduce Photo Size Under 50KB" } },
  { path: "/remove-background",       priority: 0.85, image: { loc: "/document_processing_mockup.png", title: "AI Background Remover – Transparent or White Background Free" } },
  // ── OCR (priority 0.9)
  { path: "/ocr",                     priority: 0.9 },
  // ── AI tools (priority 0.9-0.85)
  { path: "/ai-ppt-maker",            priority: 0.9 },
  { path: "/ai-pdf-summary",          priority: 0.85 },
  // ── Office tools (priority 0.8)
  { path: "/compress-doc",            priority: 0.8 },
];

const extendedToolPages = [
  // ── PDF Advanced (priority 0.8)
  { path: "/tools/scan-to-pdf",       priority: 0.8 },
  { path: "/tools/pdf-reorder",       priority: 0.8 },
  { path: "/tools/pdf-rotate",        priority: 0.8 },
  { path: "/tools/pdf-delete",        priority: 0.8 },
  { path: "/tools/pdf-crop",          priority: 0.8 },
  { path: "/tools/pdf-annotate",      priority: 0.8 },
  { path: "/tools/pdf-sign",          priority: 0.8 },
  { path: "/tools/pdf-watermark",     priority: 0.8 },
  { path: "/tools/pdf-page-numbers",  priority: 0.8 },
  { path: "/tools/pdf-insert-link",   priority: 0.8 },
  { path: "/tools/pdf-insert-image",  priority: 0.8 },
  { path: "/tools/pdf-insert-shape",  priority: 0.8 },
  { path: "/tools/pdf-forms",         priority: 0.8 },
  { path: "/tools/pdf-redact",        priority: 0.8 },
  { path: "/tools/pdf-to-docx",       priority: 0.8 },
  { path: "/tools/pdf-to-pptx",       priority: 0.8 },
  { path: "/tools/pdf-to-excel",      priority: 0.8 },
  { path: "/tools/pdf-to-images",     priority: 0.8 },
  { path: "/tools/pdf-to-pdfa",       priority: 0.8 },
  { path: "/tools/pdf-compare",       priority: 0.8 },
  { path: "/tools/pdf-translate",     priority: 0.8 },
  // ── Image Advanced (priority 0.8-0.75)
  { path: "/tools/enhance",           priority: 0.8 },
  { path: "/tools/image-crop",        priority: 0.8 },
  { path: "/tools/image-rotate",      priority: 0.8 },
  { path: "/tools/image-watermark",   priority: 0.8 },
  { path: "/tools/convert-format",    priority: 0.75 },
  { path: "/tools/to-ico",            priority: 0.75 },
  { path: "/tools/svg-to-png",        priority: 0.75 },
  // ── Document Advanced (priority 0.8-0.75)
  { path: "/tools/merge-docs",        priority: 0.8 },
  { path: "/tools/pptx-to-pdf",       priority: 0.8 },
  { path: "/tools/xlsx-to-csv",       priority: 0.75 },
  { path: "/tools/csv-to-xlsx",       priority: 0.75 },
  { path: "/tools/md-to-html",        priority: 0.75 },
  { path: "/tools/html-to-md",        priority: 0.75 },
  { path: "/tools/html-to-zip",       priority: 0.75 },
  { path: "/tools/compress-doc",      priority: 0.75, skipPrimary: true },
  { path: "/tools/docx-cleanup",      priority: 0.75 },
  // ── Media tools (priority 0.75)
  { path: "/tools/trim",              priority: 0.75 },
  { path: "/tools/video-to-audio",    priority: 0.75 },
  { path: "/tools/video-to-gif",      priority: 0.75 },
  { path: "/tools/compress-audio",    priority: 0.75 },
  // ── Utility tools (priority 0.85-0.8)
  { path: "/tools/passport-photo",    priority: 0.85 },
  { path: "/tools/signature-resize",  priority: 0.85 },
  { path: "/tools/compress-pan-card", priority: 0.85 },
];

const infoPages = [
  // ── Category/listing pages (priority 0.95-0.8)
  { path: "/",                        priority: 1.0,  changefreq: "weekly" },
  { path: "/tools",                   priority: 0.95, changefreq: "weekly" },
  { path: "/pdf-tools",               priority: 0.9,  changefreq: "weekly" },
  { path: "/image-tools",             priority: 0.9,  changefreq: "weekly" },
  { path: "/video-tools",             priority: 0.8,  changefreq: "weekly" },
  { path: "/document-tools",          priority: 0.85, changefreq: "weekly" },
  // ── Static info pages (priority 0.9-0.4)
  { path: "/pricing",                 priority: 0.9,  changefreq: "monthly" },
  { path: "/premium",                 priority: 0.8,  changefreq: "monthly" },
  { path: "/student-offer",           priority: 0.8,  changefreq: "monthly" },
  { path: "/resources",               priority: 0.8,  changefreq: "weekly" },
  { path: "/contact",                 priority: 0.7,  changefreq: "monthly" },
  { path: "/referral",                priority: 0.6,  changefreq: "monthly" },
  { path: "/privacy",                 priority: 0.5,  changefreq: "monthly" },
  { path: "/terms",                   priority: 0.5,  changefreq: "monthly" },
  { path: "/cookie-policy",           priority: 0.4,  changefreq: "monthly" },
  { path: "/workspace",               priority: 0.8,  changefreq: "weekly" },
  { path: "/workflows",               priority: 0.75, changefreq: "weekly" },
  { path: "/india-tools",             priority: 0.85, changefreq: "weekly" },
];

const blogPages = [
  { path: "/blog",                    priority: 0.85, changefreq: "weekly" },
  { path: "/blog/compress-pdf-free-online",     priority: 0.7, changefreq: "monthly" },
  { path: "/blog/merge-pdf-files-online",        priority: 0.7, changefreq: "monthly" },
  { path: "/blog/image-to-pdf-mobile",           priority: 0.7, changefreq: "monthly" },
  { path: "/blog/free-pdf-tools-students-india", priority: 0.7, changefreq: "monthly" },
  { path: "/blog/fill-aadhaar-form-online",      priority: 0.7, changefreq: "monthly" },
  { path: "/blog/aadhaar-masking-privacy-india", priority: 0.7, changefreq: "monthly" },
  { path: "/blog/optimize-photos-indian-portals",priority: 0.7, changefreq: "monthly" },
];

// ── Image mapping for image sitemap ────────────────────────────────
// Each entry: which page the image belongs to, and image metadata
const imageEntries = [
  // Homepage images
  { page: "/",         loc: "/opengraph.jpg",           title: "FileNova – Free Online PDF & Image Tools" },
  { page: "/",         loc: "/logo.png",                title: "FileNova Logo" },
  { page: "/",         loc: "/logo.svg",                title: "FileNova Logo SVG" },
  // Tool mockups
  { page: "/aadhaar-mask-pdf",   loc: "/aadhaar_mask_mockup.png",      title: "Aadhaar Masking Tool Preview" },
  { page: "/aadhaar-mask",       loc: "/aadhaar_mask_mockup.png",      title: "Aadhaar Masking Tool Preview" },
  { page: "/pan-card-resize",    loc: "/portal_photo_resize_guide.png", title: "PAN Card Photo Resizer Preview" },
  { page: "/resize-photo",       loc: "/photo_resize_mockup.png",       title: "Resize Photo for Scholarship Form Preview" },
  { page: "/resize-image",       loc: "/photo_resize_mockup.png",       title: "Resize Image Online Free Preview" },
  { page: "/compress-image",     loc: "/photo_resize_mockup.png",       title: "Compress Image Online Preview" },
  { page: "/remove-background",  loc: "/document_processing_mockup.png", title: "AI Background Remover Preview" },
  { page: "/aadhaar-mask-pdf",   loc: "/aadhaar_privacy_guide.png",     title: "Aadhaar Privacy Guide" },
  // Payment/pricing
  { page: "/pricing",            loc: "/upi-qr.png",                    title: "UPI QR Code – FileNova Payment" },
  { page: "/pricing",            loc: "/upi-qr.jpeg",                   title: "UPI QR Code – FileNova Payment" },
  // Blog and other
  { page: "/blog/aadhaar-masking-privacy-india", loc: "/aadhaar_privacy_guide.png", title: "Aadhaar Privacy Guide" },
  { page: "/blog/free-pdf-tools-students-india", loc: "/document_processing_mockup.png", title: "Free PDF Tools for Students" },
];

// ── Generators ─────────────────────────────────────────────────────

function urlTag({ path, priority, changefreq = "monthly", image }) {
  const freq = changefreq || (priority >= 0.9 ? "monthly" : priority >= 0.7 ? "monthly" : "monthly");
  let xml = `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n`;
  if (image) {
    xml += `    <image:image>\n      <image:loc>${SITE_URL}${image.loc}</image:loc>\n      <image:title>${escapeXml(image.title)}</image:title>\n    </image:image>\n`;
  }
  xml += `  </url>`;
  return xml;
}

function imageSitemapEntry({ page, loc, title }) {
  return `  <url>\n    <loc>${SITE_URL}${page}</loc>\n    <image:image>\n      <image:loc>${SITE_URL}${loc}</image:loc>\n      <image:title>${escapeXml(title)}</image:title>\n    </image:image>\n  </url>`;
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function generateToolsSitemap() {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
  ];
  for (const p of toolPages) {
    lines.push(urlTag(p));
  }
  for (const p of extendedToolPages) {
    if (!p.skipPrimary) lines.push(urlTag(p));
  }
  lines.push(`</urlset>`);
  return lines.join("\n") + "\n";
}

function generatePagesSitemap() {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ];
  for (const p of infoPages) {
    lines.push(urlTag(p));
  }
  for (const p of blogPages) {
    lines.push(urlTag(p));
  }
  lines.push(`</urlset>`);
  return lines.join("\n") + "\n";
}

function generateImagesSitemap() {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
  ];
  const seen = new Set();
  for (const img of imageEntries) {
    const key = `${img.page}|${img.loc}`;
    if (!seen.has(key)) {
      seen.add(key);
      lines.push(imageSitemapEntry(img));
    }
  }
  lines.push(`</urlset>`);
  return lines.join("\n") + "\n";
}

function generateSitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${SITE_URL}/sitemap-tools.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${SITE_URL}/sitemap-pages.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n  <sitemap>\n    <loc>${SITE_URL}/sitemap-images.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n</sitemapindex>\n`;
}

// ── File I/O ───────────────────────────────────────────────────────

const sitemaps = {
  "sitemap.xml": generateSitemapIndex,
  "sitemap-tools.xml": generateToolsSitemap,
  "sitemap-pages.xml": generatePagesSitemap,
  "sitemap-images.xml": generateImagesSitemap,
};

function writeSitemaps(targetDir) {
  if (!existsSync(targetDir)) {
    console.log(`Skipping ${targetDir} (not found)`);
    return;
  }
  for (const [filename, generator] of Object.entries(sitemaps)) {
    const filePath = join(targetDir, filename);
    writeFileSync(filePath, generator(), "utf8");
    console.log(`Written ${filePath}`);
  }
}

writeSitemaps(join(__dirname, "../public"));
writeSitemaps(join(__dirname, "../dist"));
