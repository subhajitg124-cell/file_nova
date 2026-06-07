import { useEffect } from "react";

export interface FAQItem {
  q: string;
  a: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
  ogImage?: string;
  toolName?: string;
  toolDescription?: string;
  faqs?: FAQItem[];
  isHomepage?: boolean;
}

function setMeta(name: string, content: string, useProperty = false) {
  const attr = useProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function injectJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    const {
      title,
      description,
      canonical,
      keywords,
      ogImage = "https://filenova.in/og-default.png",
      toolName,
      toolDescription,
      faqs,
      isHomepage = false,
    } = config;

    document.title = title;

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setLink("canonical", canonical);

    // Open Graph
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", canonical, true);
    setMeta("og:type", "website", true);
    setMeta("og:image", ogImage, true);
    setMeta("og:site_name", "FileNova", true);

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // SoftwareApplication schema for tool pages
    if (toolName && toolDescription && !isHomepage) {
      injectJsonLd("schema-tool", {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: toolName,
        url: canonical,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web, Android, iOS",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        description: toolDescription,
        creator: {
          "@type": "Organization",
          name: "FileNova",
          url: "https://filenova.in",
        },
      });
    } else {
      removeJsonLd("schema-tool");
    }

    // FAQPage schema
    if (faqs && faqs.length > 0) {
      injectJsonLd("schema-faq", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      });
    } else {
      removeJsonLd("schema-faq");
    }

    // WebSite + SearchAction for homepage only
    if (isHomepage) {
      injectJsonLd("schema-website", {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FileNova",
        url: "https://filenova.in",
        description:
          "Free online PDF tools and Indian document automation platform. Merge, split, compress, convert PDFs and manage Aadhaar, PAN, government forms.",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://filenova.in/?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      });

      injectJsonLd("schema-org", {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "FileNova",
        url: "https://filenova.in",
        logo: "https://filenova.in/logo.png",
        sameAs: [],
      });
    } else {
      removeJsonLd("schema-website");
      removeJsonLd("schema-org");
    }

    // BreadcrumbList for tool pages
    if (!isHomepage && toolName) {
      injectJsonLd("schema-breadcrumb", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://filenova.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: toolName,
            item: canonical,
          },
        ],
      });
    } else {
      removeJsonLd("schema-breadcrumb");
    }

    return () => {
      // Clean up injected schemas on unmount
      removeJsonLd("schema-tool");
      removeJsonLd("schema-faq");
      removeJsonLd("schema-breadcrumb");
    };
  }, [config.canonical]);
}
