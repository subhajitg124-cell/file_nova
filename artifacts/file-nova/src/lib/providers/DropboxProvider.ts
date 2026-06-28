import React from "react";
import type { CloudProvider } from "./types";

const DROPBOX_JS_SRC = "https://www.dropbox.com/static/api/2/dropins.js";

let loadPromise: Promise<void> | null = null;

function ensureLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    if (document.getElementById("dropboxjs")) { resolve(); return; }
    const script = document.createElement("script");
    script.id = "dropboxjs";
    script.src = DROPBOX_JS_SRC;
    script.setAttribute("data-app-key", import.meta.env.VITE_DROPBOX_APP_KEY || "3crmlb7g779pcsc");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Dropbox SDK failed to load"));
    document.body.appendChild(script);
  });
  return loadPromise;
}

const DBX_ICON = React.createElement("svg", { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
  React.createElement("path", { d: "M6 2L2 6L6 10L10 6L6 2Z", fill: "#0061FE" }),
  React.createElement("path", { d: "M18 2L14 6L18 10L22 6L18 2Z", fill: "#0061FE" }),
  React.createElement("path", { d: "M2 14L6 18L10 14L6 10L2 14Z", fill: "#0061FE" }),
  React.createElement("path", { d: "M14 14L18 18L22 14L18 10L14 14Z", fill: "#0061FE" }),
  React.createElement("path", { d: "M6 20.5L12 24.5L18 20.5L12 16.5L6 20.5Z", fill: "#0061FE" }),
);

export class DropboxProvider implements CloudProvider {
  id = "dropbox";
  name = "Dropbox";
  icon = DBX_ICON;

  isAvailable() { return true; }
  supportsImageOnly() { return false; }

  async isConnected() { return !!(window as any).Dropbox; }

  async authenticate() { await ensureLoaded(); }

  async disconnect() {}

  async pickFiles(options?: { multiple?: boolean }): Promise<File[]> {
    await ensureLoaded();
    const dbx = (window as any).Dropbox;
    if (!dbx) throw new Error("Dropbox SDK not loaded");

    return new Promise((resolve, reject) => {
      dbx.choose({
        success: async (files: any[]) => {
          if (!files || files.length === 0) { resolve([]); return; }
          const results: File[] = [];
          for (const f of files) {
            try {
              const res = await fetch(f.link);
              if (!res.ok) throw new Error(`Download failed: ${res.status}`);
              const blob = await res.blob();
              results.push(new File([blob], f.name, { type: blob.type || "" }));
            } catch (err: any) {
              console.warn(`Dropbox: skip "${f.name}": ${err.message}`);
            }
          }
          resolve(results);
        },
        cancel: () => resolve([]),
        linkType: "direct",
        multiselect: options?.multiple ?? true,
        extensions: [".pdf", ".docx", ".pptx", ".xlsx", ".jpg", ".png", ".jpeg", ".gif", ".webp", ".zip", ".csv", ".txt", ".md", ".html", ".svg", ".mp4", ".webm", ".mp3", ".wav"],
      });
    });
  }
}

export const dropboxProvider = new DropboxProvider();
