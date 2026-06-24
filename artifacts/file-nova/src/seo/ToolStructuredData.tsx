import { useHead } from "@unhead/react";
import { useLocation } from "wouter";
import { TOOL_META } from "./toolMeta";
import { toolContentMap } from "@/data/toolContent";

const SITE_URL = "https://filenova.in";

export function ToolStructuredData() {
  const [pathname] = useLocation();
  const meta = TOOL_META[pathname] ?? TOOL_META["/"];

  const slugMap: Record<string, string> = {
    "aadhaar-mask": "aadhaar-mask-pdf",
    "resize-photo": "resize-image",
    "ai-background-remover": "remove-background",
  };
  const rawSlug = pathname.replace(/^\//, "");
  const slug = slugMap[rawSlug] ?? rawSlug;
  const content = toolContentMap[slug];

  const toolName = meta.title.split("–")[0].trim().split("|")[0].trim();
  const toolUrl = meta.canonical;

  const scripts: any[] = [];

  // 1. HowTo schema from toolContentMap if present
  if (content?.steps?.length) {
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: content.howToName || `How to use ${toolName}`,
      step: content.steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.description,
        url: `${toolUrl}#step-${index + 1}`,
      })),
    };

    scripts.push({
      key: "ld-howto",
      type: "application/ld+json",
      innerHTML: JSON.stringify(howToSchema),
    });
  }

  // 2. Product schema for pricing page (genuine data, no fake aggregate ratings)
  if (pathname === "/pricing") {
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "FileNova Premium Plans",
      description: "Premium document processing plans for Indian users. Free, Basic ₹49/mo, Pro ₹99/mo, Elite ₹199/mo.",
      brand: {
        "@type": "Brand",
        name: "FileNova",
      },
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/pricing`,
        },
        {
          "@type": "Offer",
          name: "Basic Desk",
          price: "49",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/pricing`,
        },
        {
          "@type": "Offer",
          name: "Pro Desk",
          price: "99",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/pricing`,
        },
        {
          "@type": "Offer",
          name: "Elite Console",
          price: "199",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/pricing`,
        },
      ],
    };

    scripts.push({
      key: "ld-product",
      type: "application/ld+json",
      innerHTML: JSON.stringify(productSchema),
    });
  }

  useHead({
    script: scripts,
  });

  return null;
}