import { Router } from "express";

const SITE_BASE = "https://filenova.in";

interface SitemapUrl {
  loc: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

const SITEMAP_URLS: SitemapUrl[] = [
  // Homepage
  { loc: "/",                                      changefreq: "daily",  priority: 1.0 },

  // India-Exclusive Tools (highest priority)
  { loc: "/aadhaar-mask-pdf",                      changefreq: "weekly", priority: 1.0 },
  { loc: "/pan-card-resize",                       changefreq: "weekly", priority: 1.0 },
  { loc: "/scholarship-zip",                       changefreq: "weekly", priority: 1.0 },
  { loc: "/government-form-fill",                  changefreq: "weekly", priority: 0.9 },

  // High-Traffic PDF Tools
  { loc: "/compress-pdf",                          changefreq: "weekly", priority: 0.95 },
  { loc: "/compress-pdf-for-upload",               changefreq: "weekly", priority: 0.9 },
  { loc: "/merge-pdf",                             changefreq: "weekly", priority: 0.95 },
  { loc: "/split-pdf",                             changefreq: "weekly", priority: 0.9 },
  { loc: "/protect-pdf",                           changefreq: "weekly", priority: 0.85 },
  { loc: "/unlock-pdf",                            changefreq: "weekly", priority: 0.85 },
  { loc: "/rotate-pdf",                            changefreq: "weekly", priority: 0.8 },
  { loc: "/resize-pdf",                            changefreq: "weekly", priority: 0.8 },

  // PDF Conversion
  { loc: "/pdf-to-word",                           changefreq: "weekly", priority: 0.9 },
  { loc: "/pdf-to-jpg",                            changefreq: "weekly", priority: 0.85 },
  { loc: "/jpg-to-pdf",                            changefreq: "weekly", priority: 0.9 },
  { loc: "/word-to-pdf",                           changefreq: "weekly", priority: 0.85 },

  // Image Tools
  { loc: "/resize-photo",                          changefreq: "weekly", priority: 0.95 },
  { loc: "/compress-image",                        changefreq: "weekly", priority: 0.9 },
  { loc: "/remove-background",                     changefreq: "weekly", priority: 0.85 },

  // OCR
  { loc: "/ocr",                                   changefreq: "weekly", priority: 0.9 },

  // AI Tools
  { loc: "/ai-ppt-maker",                          changefreq: "weekly", priority: 0.9 },
  { loc: "/ai-pdf-summary",                        changefreq: "weekly", priority: 0.85 },

  // Office Tools
  { loc: "/compress-doc",                          changefreq: "weekly", priority: 0.8 },

  // Catalog Pages
  { loc: "/tools",                                 changefreq: "daily",  priority: 0.95 },
  { loc: "/pdf-tools",                             changefreq: "daily",  priority: 0.9 },
  { loc: "/image-tools",                           changefreq: "daily",  priority: 0.9 },
  { loc: "/video-tools",                           changefreq: "weekly", priority: 0.8 },
  { loc: "/document-tools",                        changefreq: "weekly", priority: 0.85 },
  { loc: "/india-tools",                           changefreq: "weekly", priority: 0.85 },
  { loc: "/workflows",                             changefreq: "weekly", priority: 0.75 },

  // Static Pages
  { loc: "/pricing",                               changefreq: "weekly", priority: 0.9 },
  { loc: "/premium",                               changefreq: "weekly", priority: 0.8 },
  { loc: "/blog",                                  changefreq: "daily",  priority: 0.85 },
  { loc: "/resources",                             changefreq: "weekly", priority: 0.8 },
  { loc: "/contact",                               changefreq: "monthly",priority: 0.7 },
  { loc: "/student-offer",                         changefreq: "weekly", priority: 0.8 },
  { loc: "/referral",                              changefreq: "monthly",priority: 0.6 },
  { loc: "/privacy",                               changefreq: "monthly",priority: 0.5 },
  { loc: "/terms",                                 changefreq: "monthly",priority: 0.5 },
  { loc: "/cookie-policy",                         changefreq: "monthly",priority: 0.4 },

  // Blog Posts
  { loc: "/blog/compress-pdf-free-online",          changefreq: "monthly", priority: 0.7 },
  { loc: "/blog/merge-pdf-files-online",            changefreq: "monthly", priority: 0.7 },
  { loc: "/blog/image-to-pdf-mobile",               changefreq: "monthly", priority: 0.7 },
  { loc: "/blog/free-pdf-tools-students-india",     changefreq: "monthly", priority: 0.7 },
  { loc: "/blog/fill-aadhaar-form-online",          changefreq: "monthly", priority: 0.7 },
  { loc: "/blog/aadhaar-masking-privacy-india",     changefreq: "monthly", priority: 0.7 },
  { loc: "/blog/optimize-photos-indian-portals",    changefreq: "monthly", priority: 0.7 },
];

function buildSitemapXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${SITE_BASE}${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority.toFixed(1)}</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

export const sitemapRouter = Router();

sitemapRouter.get("/sitemap.xml", (_req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.status(200).send(buildSitemapXml(SITEMAP_URLS));
});
