import "./prerender-polyfill";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { createHead, UnheadProvider, renderSSRHead } from "@unhead/react/server";
import App from "./App";

function parseHTMLHead(html: string) {
  const elements: any[] = [];
  const tagRegex = /<([a-zA-Z0-9:-]+)([^>]*?)(?:>([\s\S]*?)<\/\1>|\/>|>)/g;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const type = match[1].toLowerCase();
    const attrsRaw = match[2];
    const children = match[3] || '';
    
    const props: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9:-]+)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsRaw)) !== null) {
      const name = attrMatch[1];
      const val = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4];
      props[name] = val;
    }
    
    elements.push({ type, props, children });
  }
  return elements;
}

export async function prerender({ url }: { url: string }) {
  const head = createHead();
  const html = renderToString(
    <UnheadProvider value={head}>
      <Router base="" ssrPath={url}>
        <App ssrPath={url} />
      </Router>
    </UnheadProvider>
  );

  // Collect head tags injected during render using Unhead SSR renderer
  const headPayload = renderSSRHead(head);
  const headTagsStr = headPayload.headTags;

  // Extract lang from htmlAttrs
  const langMatch = headPayload.htmlAttrs.match(/lang="([^"]+)"/);
  const lang = langMatch ? langMatch[1] : 'en';

  // Parse HTML tags
  const rawElements = parseHTMLHead(headTagsStr);

  let title = '';
  const elements = new Set<any>();

  for (const el of rawElements) {
    if (el.type === 'title') {
      title = el.children;
    } else if (el.type === 'meta' && el.props.charset) {
      // Skip charset
    } else if (el.type === 'meta' && el.props.name === 'viewport') {
      // Skip viewport
    } else {
      elements.add({
        type: el.type,
        props: el.props,
        children: el.children
      });
    }
  }

  return {
    html,
    head: {
      title,
      lang,
      elements
    }
  };
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
  "/compress-pdf-for-upload",
  "/government-form-fill",
];
