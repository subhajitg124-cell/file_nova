import { useHead } from "@unhead/react";
import { useLocation } from "wouter";
import { TOOL_META } from "./toolMeta";

export function ToolSEO() {
  const [pathname] = useLocation();
  const meta = TOOL_META[pathname] ?? TOOL_META["/"];

  useHead({
    title: meta.title,
    meta: [
      { name: "description", content: meta.description },
      { name: "keywords", content: meta.keywords },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      // Open Graph (WhatsApp previews)
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:url", content: meta.canonical },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FileNova" },
      { property: "og:image", content: meta.ogImage ?? "https://filenova.in/og-default.png" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: meta.title },
      { name: "twitter:description", content: meta.description },
      { name: "twitter:image", content: meta.ogImage ?? "https://filenova.in/og-default.png" },
    ],
    link: [
      { rel: "canonical", href: meta.canonical },
      // Only self-referencing en-IN and x-default are safe short term
      { rel: "alternate", hreflang: "en-IN", href: meta.canonical },
      { rel: "alternate", hreflang: "x-default", href: meta.canonical },
    ],
  });

  return null;
}
