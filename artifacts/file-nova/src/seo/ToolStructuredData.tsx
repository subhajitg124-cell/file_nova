import { useHead } from "@unhead/react";
import { useLocation } from "wouter";
import { TOOL_META } from "./toolMeta";
import { toolContentMap } from "@/data/toolContent";

export function ToolStructuredData() {
  const [pathname] = useLocation();
  const meta = TOOL_META[pathname] ?? TOOL_META["/"];

  const isHomepage = pathname === "/";

  // Slug mapping to handle redirects/aliases and fetch the correct FAQs/steps
  const slugMap: Record<string, string> = {
    "aadhaar-mask": "aadhaar-mask-pdf",
    "resize-photo": "resize-image",
    "ai-background-remover": "remove-background",
  };
  const rawSlug = pathname.replace(/^\//, "");
  const slug = slugMap[rawSlug] ?? rawSlug;
  const content = toolContentMap[slug];

  // Tool name from title (strip suffix)
  const toolName = meta.title.split("–")[0].trim().split("|")[0].trim();
  const toolUrl = meta.canonical;

  const scripts: any[] = [];

  if (isHomepage) {
    // WebSite schema with SearchAction for sitelinks search box
    const webSiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "FileNova",
      "url": "https://filenova.in",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://filenova.in/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    };

    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "FileNova",
      "url": "https://filenova.in",
      "logo": "https://filenova.in/logo.png",
      "sameAs": ["https://github.com/subhajitg124-cell/file_nova"],
    };

    const siteNavigationSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "FileNova Navigation Menu",
      "description": "Main navigation links for FileNova tools and pages.",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "All Tools",
          "url": "https://filenova.in/tools"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Premium Pricing",
          "url": "https://filenova.in/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Resources & Blog",
          "url": "https://filenova.in/resources"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Contact Support",
          "url": "https://filenova.in/contact"
        }
      ]
    };

    scripts.push(
      {
        key: "ld-website",
        type: "application/ld+json",
        innerHTML: JSON.stringify(webSiteSchema),
      },
      {
        key: "ld-org",
        type: "application/ld+json",
        innerHTML: JSON.stringify(orgSchema),
      },
      {
        key: "ld-sitenav",
        type: "application/ld+json",
        innerHTML: JSON.stringify(siteNavigationSchema),
      }
    );
  } else {
    // WebApplication schema
    const webAppSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": toolName,
      "url": toolUrl,
      "applicationCategory": "UtilityApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "2480"
      },
      "description": meta.description,
      "inLanguage": ["en", "hi", "bn"],
      "provider": {
        "@type": "Organization",
        "name": "FileNova",
        "url": "https://filenova.in",
      },
    };

    // BreadcrumbList schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://filenova.in",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": toolName,
          "item": toolUrl,
        },
      ],
    };

    scripts.push(
      {
        key: "ld-webapp",
        type: "application/ld+json",
        innerHTML: JSON.stringify(webAppSchema),
      },
      {
        key: "ld-breadcrumb",
        type: "application/ld+json",
        innerHTML: JSON.stringify(breadcrumbSchema),
      }
    );

    // FAQPage schema from toolContentMap if present
    if (content && content.faqs && content.faqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": content.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a,
          },
        })),
      };

      scripts.push({
        key: "ld-faq",
        type: "application/ld+json",
        innerHTML: JSON.stringify(faqSchema),
      });
    }

    // HowTo schema from toolContentMap if present
    if (content && content.steps && content.steps.length > 0) {
      const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": content.howToName || `How to use ${toolName}`,
        "step": content.steps.map((step, index) => ({
          "@type": "HowToStep",
          "position": index + 1,
          "name": step.title,
          "text": step.description,
          "url": `${toolUrl}#step-${index + 1}`
        }))
      };

      scripts.push({
        key: "ld-howto",
        type: "application/ld+json",
        innerHTML: JSON.stringify(howToSchema),
      });
    }
  }

  useHead({
    script: scripts,
  });

  return null;
}
