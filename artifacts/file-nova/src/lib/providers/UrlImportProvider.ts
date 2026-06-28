import React from "react";
import type { CloudProvider } from "./types";
import { Link } from "lucide-react";

const MAX_SIZE = 100 * 1024 * 1024;
const TIMEOUT_MS = 30000;

const ALLOWED_MIMES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/bmp", "image/tiff",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/zip", "application/x-zip-compressed",
  "text/csv", "text/plain", "text/html", "text/markdown",
  "video/mp4", "video/webm",
  "audio/mpeg", "audio/wav", "audio/ogg",
];

const ALLOWED_EXTENSIONS = [
  ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".tiff", ".tif",
  ".docx", ".xlsx", ".pptx", ".doc", ".xls", ".ppt",
  ".zip", ".csv", ".txt", ".md", ".html",
  ".mp4", ".webm", ".mp3", ".wav", ".ogg",
];

function isAllowed(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, reason: "Only HTTP and HTTPS URLs are supported" };
    }
    const ext = parsed.pathname.toLowerCase().split(".").pop();
    if (ext && !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
      return { valid: false, reason: `File extension .${ext} is not supported` };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: "Invalid URL format" };
  }
}

export class UrlImportProvider implements CloudProvider {
  id = "url-import";
  name = "URL Import";
  icon = React.createElement(Link, { className: "h-5 w-5" });

  isAvailable() { return true; }
  supportsImageOnly() { return false; }

  async isConnected() { return true; }
  async authenticate() {}
  async disconnect() {}

  validate(url: string): { valid: boolean; reason?: string } {
    return isAllowed(url);
  }

  async pickFiles(options?: { multiple?: boolean }): Promise<File[]> {
    throw new Error("Use pickFromUrl() instead");
  }

  async pickFromUrl(url: string): Promise<File | null> {
    const check = isAllowed(url);
    if (!check.valid) throw new Error(check.reason!);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { "Accept": ALLOWED_MIMES.join(",") },
      });
      clearTimeout(timeoutId);

      if (response.status === 404) throw new Error("File not found (404)");
      if (response.status === 403) throw new Error("Access denied (403)");
      if (!response.ok) throw new Error(`Server error (${response.status})`);

      const contentType = response.headers.get("content-type") || "";
      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > MAX_SIZE) {
        throw new Error(`File too large (${(parseInt(contentLength) / 1024 / 1024).toFixed(1)}MB). Max 100MB.`);
      }

      const blob = await response.blob();
      if (blob.size > MAX_SIZE) throw new Error(`File too large (${(blob.size / 1024 / 1024).toFixed(1)}MB). Max 100MB.`);

      const fileName = url.split("/").pop()?.split("?")[0] || "download";

      if (!ALLOWED_MIMES.includes(blob.type) && !ALLOWED_EXTENSIONS.some((e) => fileName.toLowerCase().endsWith(e))) {
        throw new Error(`Unsupported file type: ${blob.type || "unknown"}`);
      }

      return new File([blob], fileName, { type: blob.type || contentType });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") throw new Error("Request timed out");
      throw err;
    }
  }
}

export const urlImportProvider = new UrlImportProvider();
