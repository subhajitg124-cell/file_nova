import { useHead } from "@unhead/react";
import { useLocation } from "wouter";
import { TOOL_META } from "./toolMeta";
import { useEffect } from "react";

export function ToolSEO() {
  const [pathname] = useLocation();
  const meta = TOOL_META[pathname] ?? TOOL_META["/"];

  const siteName = "FileNova";

  // Set document title with proper site name
  useEffect(() => {
    document.title = meta.title;
  }, [meta.title]);

  const jsonLdScripts: Record<string, unknown>[] = [];

  // 1. SoftwareApplication schema (for tool pages)
  const isToolPage = pathname !== "/" && !pathname.startsWith("/admin") && !pathname.startsWith("/nova");
  if (isToolPage && meta.schemaName) {
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

  // 3. BreadcrumbList
  const pathParts = pathname.split("/").filter(Boolean);
  if (pathParts.length > 0 && pathname !== "/") {
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
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/nova");
  const robotsContent = isAdmin ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  useHead({
    title: meta.title,
    meta: [
      { name: "description", content: meta.description },
      { name: "keywords", content: meta.keywords },
      { name: "robots", content: robotsContent },
      { name: "googlebot", content: isAdmin ? "noindex, nofollow" : "index, follow" },
      { name: "geo.region", content: "IN" },
      { name: "geo.country", content: "India" },
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
