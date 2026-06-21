import { useHead } from "@unhead/react";
import { useLocation } from "wouter";
import { TOOL_META } from "./toolMeta";

export function ToolSEO() {
  const [pathname] = useLocation();
  const meta = TOOL_META[pathname] ?? TOOL_META["/"];

  // Build JSON-LD array: SoftwareApplication + FAQPage (if present) + BreadcrumbList
  const jsonLdScripts: Record<string, unknown>[] = [];

  // 1. SoftwareApplication schema
  const softwareApp: Record<string, unknown> = {
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
  };

  // Aggregate rating (social proof, increases click-through)
  if (meta.ratingValue && meta.ratingCount) {
    softwareApp.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: meta.ratingValue,
      ratingCount: meta.ratingCount,
      bestRating: "5",
      worstRating: "1",
    };
  }
  jsonLdScripts.push(softwareApp);

  // 2. FAQPage schema (enables rich results accordion in Google SERP)
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
  if (pathParts.length > 0) {
    jsonLdScripts.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "FileNova",
          item: "https://filenova.in",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: meta.schemaName ?? pathParts[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          item: meta.canonical,
        },
      ],
    });
  }

  // 4. WebSite schema with SearchAction (sitelinks search box)
  if (pathname === "/") {
    jsonLdScripts.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "FileNova",
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

    // Organization schema (homepage only)
    jsonLdScripts.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "FileNova",
      url: "https://filenova.in",
      logo: "https://filenova.in/logo.png",
      description: "Free online PDF and image tools built for India — Aadhaar masking, PAN resize, scholarship ZIP, OCR.",
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

  useHead({
    title: meta.title,
    meta: [
      { name: "description", content: meta.description },
      { name: "keywords", content: meta.keywords },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow" },
      // Geographic targeting — India
      { name: "geo.region", content: "IN" },
      { name: "geo.country", content: "India" },
      { name: "language", content: "en-IN" },
      // Open Graph (WhatsApp / Facebook previews)
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:url", content: meta.canonical },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FileNova" },
      { property: "og:image", content: meta.ogImage ?? "https://filenova.in/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_IN" },
      // Twitter / X Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@filenovaapp" },
      { name: "twitter:title", content: meta.title },
      { name: "twitter:description", content: meta.description },
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
