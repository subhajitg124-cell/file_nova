import "./prerender-polyfill";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { createHead, UnheadProvider, renderSSRHead } from "@unhead/react/server";
import App from "./App";

export async function prerender(url: string) {
  const head = createHead();
  const html = renderToString(
    <UnheadProvider value={head}>
      <Router base="" ssrPath={url}>
        <App ssrPath={url} />
      </Router>
    </UnheadProvider>
  );

  // Collect head tags injected during render using Unhead SSR renderer
  const headPayload = await renderSSRHead(head);
  return { html, head: headPayload.headTags };
}

// Export all routes to prerender
export const prerenderRoutes = [
  "/",
  "/merge-pdf",
  "/split-pdf",
  "/compress-pdf",
  "/rotate-pdf",
  "/protect-pdf",
  "/unlock-pdf",
  "/aadhaar-mask",
  "/aadhaar-mask-pdf",       // alias — must be listed separately
  "/pan-card-resize",
  "/scholarship-zip",
  "/ocr",
  "/resize-photo",
  "/resize-image",           // alias
  "/ai-background-remover",
  "/remove-background",      // alias
  "/pdf-to-word",
  "/pdf-to-jpg",
  "/jpg-to-pdf",
  "/word-to-pdf",
  "/compress-for-upload",
  "/government-form-fill",
];
