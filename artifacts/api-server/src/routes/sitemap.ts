import { Router } from "express";

const SITE_BASE = "https://filenova.in";

interface SitemapUrl {
  loc: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

const SITEMAP_URLS: SitemapUrl[] = [
  { loc: "/",                          changefreq: "daily",  priority: 1.0 },
  { loc: "/merge-pdf",                 changefreq: "weekly", priority: 0.9 },
  { loc: "/split-pdf",                 changefreq: "weekly", priority: 0.9 },
  { loc: "/compress-pdf",              changefreq: "weekly", priority: 0.9 },
  { loc: "/pdf-to-word",               changefreq: "weekly", priority: 0.9 },
  { loc: "/pdf-to-jpg",                changefreq: "weekly", priority: 0.9 },
  { loc: "/jpg-to-pdf",                changefreq: "weekly", priority: 0.9 },
  { loc: "/rotate-pdf",                changefreq: "weekly", priority: 0.8 },
  { loc: "/resize-pdf",                changefreq: "weekly", priority: 0.8 },
  { loc: "/protect-pdf",               changefreq: "weekly", priority: 0.8 },
  { loc: "/unlock-pdf",                changefreq: "weekly", priority: 0.8 },
  { loc: "/pan-card-resize",           changefreq: "weekly", priority: 0.95 },
  { loc: "/aadhaar-mask-pdf",          changefreq: "weekly", priority: 0.95 },
  { loc: "/government-form-fill",      changefreq: "weekly", priority: 0.9 },
  { loc: "/compress-pdf-for-upload",   changefreq: "weekly", priority: 0.9 },
  { loc: "/scholarship-zip",           changefreq: "weekly", priority: 0.85 },
  { loc: "/ocr",                       changefreq: "weekly", priority: 0.85 },
  { loc: "/remove-background",         changefreq: "weekly", priority: 0.85 },
  { loc: "/ai-pdf-summary",            changefreq: "weekly", priority: 0.85 },
  { loc: "/compress-image",            changefreq: "weekly", priority: 0.9 },
  { loc: "/resize-photo",              changefreq: "weekly", priority: 0.85 },
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
