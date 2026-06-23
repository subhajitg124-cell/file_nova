import { useHead } from "@unhead/react";
import { useLocation } from "wouter";
import { TOOL_META } from "./toolMeta";

function lookupMeta(pathname: string) {
  if (TOOL_META[pathname]) return TOOL_META[pathname];
  if (pathname.startsWith("/tools/")) {
    const subPath = "/" + pathname.slice("/tools/".length);
    return TOOL_META[subPath] ?? TOOL_META["/"];
  }
  return TOOL_META["/"];
}

const NON_INDEXABLE_PATHS = [
  "/beta-test", "/operator-dashboard", "/ref", "/nova-control",
  "/nova-login", "/admin/analytics", "/admin/upi-payments",
  "/admin/coupons", "/admin/discount-codes",
];

function shouldIndex(pathname: string) {
  if (pathname.startsWith("/admin") || pathname.startsWith("/nova")) return false;
  if (NON_INDEXABLE_PATHS.includes(pathname)) return false;
  if (pathname.startsWith("/ref/") || pathname.startsWith("/ref")) return false;
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

export function ToolSEO() {
  const [pathname] = useLocation();
  const meta = lookupMeta(pathname);

  const siteName = "FileNova";

  const jsonLdScripts: Record<string, unknown>[] = [];

  // 1. SoftwareApplication schema (only for actual tool/category pages)
  if (isToolOrCategoryPage(pathname) && meta.schemaName) {
    jsonLdScripts.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: meta.schemaName ?? meta.title.split("–")[0].split("|")[0].trim(),
      description: meta.description,
      url: meta.canonical,
      applicationCategory: meta.schemaCategory ?? "UtilitiesApplication",
      operatingSystem: "Web Browser",
      inLanguage: ["en-IN", "hi-IN", "bn-IN"],
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: meta.ratingValue && meta.ratingCount ? {
        "@type": "AggregateRating",
        ratingValue: meta.ratingValue,
        ratingCount: meta.ratingCount,
        bestRating: "5",
        worstRating: "1",
      } : undefined,
      provider: {
        "@type": "Organization",
        name: "FileNova",
        url: "https://filenova.in",
        logo: "https://filenova.in/logo.png",
        sameAs: [
          "https://twitter.com/filenovaapp",
          "https://www.linkedin.com/company/filenova",
        ],
      },
    });
  }

  // 2. FAQPage schema
  if (meta.jsonLdFaq && meta.jsonLdFaq.length > 0) {
    jsonLdScripts.push({
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

  // 3. BreadcrumbList (skip for redirect stubs)
  const pathParts = pathname.split("/").filter(Boolean);
  if (pathParts.length > 0 && pathname !== "/" && shouldIndex(pathname)) {
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: "FileNova",
        item: "https://filenova.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: meta.schemaName ?? meta.title.split("–")[0].split("|")[0].trim(),
        item: meta.canonical,
      },
    ];
    jsonLdScripts.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    });
  }

  // 4. WebSite schema with SearchAction (homepage only for unique schema)
  if (pathname === "/") {
    jsonLdScripts.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "FileNova",
      alternateName: "FileNova AI",
      url: "https://filenova.in",
      description: "Free online PDF and image tools for Indian students and professionals.",
      inLanguage: ["en-IN", "hi-IN", "bn-IN"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://filenova.in/tools?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    });

    jsonLdScripts.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "FileNova",
      alternateName: "FileNova AI",
      url: "https://filenova.in",
      logo: "https://filenova.in/logo.png",
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
  }

  // Determine index/follow rules
  const indexable = shouldIndex(pathname);
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
      { property: "og:site_name", content: siteName },
      { property: "og:image", content: meta.ogImage ?? "https://filenova.in/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_IN" },
      // Twitter / X Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@filenovaapp" },
      { name: "twitter:title", content: meta.ogTitle ?? meta.title },
      { name: "twitter:description", content: meta.ogDescription ?? meta.description },
      { name: "twitter:image", content: meta.ogImage ?? "https://filenova.in/og-default.png" },
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
}
