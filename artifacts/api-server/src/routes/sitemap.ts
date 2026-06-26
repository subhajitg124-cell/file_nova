import { Router } from "express";

const SITE_BASE = "https://filenova.in";

interface SitemapUrl {
  loc: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  lastmod?: string;
}

const SITEMAP_URLS: SitemapUrl[] = [
  // Homepage
  { loc: "/",                                      changefreq: "daily",  priority: 1.0,   lastmod: "2026-06-26" },

  // India-Exclusive Tools (highest priority)
  { loc: "/aadhaar-mask-pdf",                      changefreq: "weekly", priority: 1.0,   lastmod: "2026-06-20" },
  { loc: "/pan-card-resize",                       changefreq: "weekly", priority: 1.0,   lastmod: "2026-06-20" },
  { loc: "/scholarship-zip",                       changefreq: "weekly", priority: 1.0,   lastmod: "2026-06-15" },
  { loc: "/government-form-fill",                  changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-10" },

  // High-Traffic PDF Tools
  { loc: "/compress-pdf",                          changefreq: "weekly", priority: 0.95,  lastmod: "2026-06-25" },
  { loc: "/compress-pdf-for-upload",               changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-20" },
  { loc: "/merge-pdf",                             changefreq: "weekly", priority: 0.95,  lastmod: "2026-06-25" },
  { loc: "/split-pdf",                             changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-20" },
  { loc: "/protect-pdf",                           changefreq: "weekly", priority: 0.85,  lastmod: "2026-06-15" },
  { loc: "/unlock-pdf",                            changefreq: "weekly", priority: 0.85,  lastmod: "2026-06-15" },
  { loc: "/rotate-pdf",                            changefreq: "weekly", priority: 0.8,   lastmod: "2026-06-10" },
  { loc: "/resize-pdf",                            changefreq: "weekly", priority: 0.8,   lastmod: "2026-06-10" },

  // PDF Conversion
  { loc: "/pdf-to-word",                           changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-25" },
  { loc: "/pdf-to-jpg",                            changefreq: "weekly", priority: 0.85,  lastmod: "2026-06-20" },
  { loc: "/jpg-to-pdf",                            changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-25" },
  { loc: "/word-to-pdf",                           changefreq: "weekly", priority: 0.85,  lastmod: "2026-06-20" },

  // Image Tools
  { loc: "/resize-photo",                          changefreq: "weekly", priority: 0.95,  lastmod: "2026-06-25" },
  { loc: "/compress-image",                        changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-20" },
  { loc: "/remove-background",                     changefreq: "weekly", priority: 0.85,  lastmod: "2026-06-15" },

  // OCR
  { loc: "/ocr",                                   changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-15" },

  // AI Tools
  { loc: "/ai-ppt-maker",                          changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-20" },
  { loc: "/ai-pdf-summary",                        changefreq: "weekly", priority: 0.85,  lastmod: "2026-06-20" },

  // Office Tools
  { loc: "/compress-doc",                          changefreq: "weekly", priority: 0.8,   lastmod: "2026-06-10" },

  // Catalog Pages
  { loc: "/tools",                                 changefreq: "daily",  priority: 0.95,  lastmod: "2026-06-25" },
  { loc: "/pdf-tools",                             changefreq: "daily",  priority: 0.9,   lastmod: "2026-06-25" },
  { loc: "/image-tools",                           changefreq: "daily",  priority: 0.9,   lastmod: "2026-06-25" },
  { loc: "/video-tools",                           changefreq: "weekly", priority: 0.8,   lastmod: "2026-06-15" },
  { loc: "/document-tools",                        changefreq: "weekly", priority: 0.85,  lastmod: "2026-06-15" },
  { loc: "/india-tools",                           changefreq: "weekly", priority: 0.85,  lastmod: "2026-06-20" },
  { loc: "/workflows",                             changefreq: "weekly", priority: 0.75,  lastmod: "2026-06-10" },

  // Static Pages
  { loc: "/pricing",                               changefreq: "weekly", priority: 0.9,   lastmod: "2026-06-20" },
  { loc: "/premium",                               changefreq: "weekly", priority: 0.8,   lastmod: "2026-06-20" },
  { loc: "/blog",                                  changefreq: "daily",  priority: 0.85,  lastmod: "2026-06-26" },
  { loc: "/resources",                             changefreq: "weekly", priority: 0.8,   lastmod: "2026-06-10" },
  { loc: "/contact",                               changefreq: "monthly",priority: 0.7,   lastmod: "2026-06-01" },
  { loc: "/student-offer",                         changefreq: "weekly", priority: 0.8,   lastmod: "2026-06-15" },
  { loc: "/referral",                              changefreq: "monthly",priority: 0.6,   lastmod: "2026-05-01" },
  { loc: "/privacy",                               changefreq: "monthly",priority: 0.5,   lastmod: "2026-01-15" },
  { loc: "/terms",                                 changefreq: "monthly",priority: 0.5,   lastmod: "2026-01-15" },
  { loc: "/cookie-policy",                         changefreq: "monthly",priority: 0.4,   lastmod: "2026-01-15" },

  // Blog Posts
  { loc: "/blog/compress-pdf-free-online",          changefreq: "monthly", priority: 0.7,   lastmod: "2026-01-08" },
  { loc: "/blog/merge-pdf-files-online",            changefreq: "monthly", priority: 0.7,   lastmod: "2026-01-09" },
  { loc: "/blog/image-to-pdf-mobile",               changefreq: "monthly", priority: 0.7,   lastmod: "2026-01-10" },
  { loc: "/blog/free-pdf-tools-students-india",     changefreq: "monthly", priority: 0.7,   lastmod: "2026-01-11" },
  { loc: "/blog/fill-aadhaar-form-online",          changefreq: "monthly", priority: 0.7,   lastmod: "2026-01-12" },
  { loc: "/blog/aadhaar-masking-privacy-india",     changefreq: "monthly", priority: 0.7,   lastmod: "2026-02-15" },
  { loc: "/blog/optimize-photos-indian-portals",    changefreq: "monthly", priority: 0.7,   lastmod: "2026-03-01" },
];

function buildSitemapXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map((u) => {
      let entry = `  <url>\n    <loc>${SITE_BASE}${u.loc}</loc>`;
      if (u.lastmod) entry += `\n    <lastmod>${u.lastmod}</lastmod>`;
      entry += `\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority.toFixed(1)}</priority>\n  </url>`;
      return entry;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

export const sitemapRouter = Router();

sitemapRouter.get("/sitemap.xml", (_req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.status(200).send(buildSitemapXml(SITEMAP_URLS));
});
