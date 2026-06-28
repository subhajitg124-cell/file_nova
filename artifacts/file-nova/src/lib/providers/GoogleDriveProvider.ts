import React from "react";
import type { CloudProvider, GoogleDriveFile } from "./types";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const GAPI_SRC = "https://apis.google.com/js/api.js";

let gisLoaded = false;
let gapiLoaded = false;
let pickerLoaded = false;
let loadPromise: Promise<void> | null = null;
let cachedToken: string | null = null;

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

async function ensureLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    if (!gisLoaded) { await loadScript(GIS_SRC, "google-gis-js"); gisLoaded = true; }
    if (!gapiLoaded) { await loadScript(GAPI_SRC, "google-gapi-js"); gapiLoaded = true; }
    const gapi = window.gapi;
    if (!gapi) throw new Error("Google API client library failed to load");
    if (!pickerLoaded) {
      await new Promise<void>((resolve, reject) => {
        gapi.load("picker", {
          callback: () => { pickerLoaded = true; resolve(); },
          onerror: () => reject(new Error("Google Picker load failed")),
        });
      });
    }
  })();
  return loadPromise;
}

function getClientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!id) throw new Error("VITE_GOOGLE_CLIENT_ID not set");
  return id;
}

async function getToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const tc = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (resp: any) => {
          if (resp.error) { reject(new Error(resp.error)); return; }
          cachedToken = resp.access_token;
          resolve(resp.access_token);
        },
      });
      tc.requestAccessToken({ prompt: "consent" });
    } catch (err: any) {
      reject(new Error(`Google auth failed: ${err.message}`));
    }
  });
}

function openPicker(accessToken: string, imageOnly: boolean): Promise<GoogleDriveFile[]> {
  return new Promise((resolve, reject) => {
    try {
      const builder = new window.google.picker.PickerBuilder()
        .setOAuthToken(accessToken)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) resolve(data.docs);
          else if (data.action === window.google.picker.Action.CANCEL) resolve([]);
        });
      if (imageOnly) {
        builder.addView(window.google.picker.ViewId.DOCS_IMAGES);
      } else {
        builder.addView(window.google.picker.ViewId.DOCS);
        builder.addView(window.google.picker.ViewId.DOCS_IMAGES);
        builder.addView(window.google.picker.ViewId.DOCS_VIDEOS);
        builder.addView(window.google.picker.ViewId.PDFS);
      }
      builder.build().setVisible(true);
    } catch (err: any) {
      reject(new Error(`Picker failed: ${err.message}`));
    }
  });
}

const GOOGLE_WORKSPACE_MAP: Record<string, string> = {
  "application/vnd.google-apps.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.google-apps.spreadsheet": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.google-apps.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.google-apps.drawing": "image/png",
};

function isGoogleWorkspace(mime: string) { return mime.startsWith("application/vnd.google-apps."); }

function getDownloadUrl(file: GoogleDriveFile): string {
  if (isGoogleWorkspace(file.mimeType)) {
    const exportMime = GOOGLE_WORKSPACE_MAP[file.mimeType] || "application/pdf";
    return `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent(exportMime)}`;
  }
  return `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
}

function getOutputMime(file: GoogleDriveFile): string {
  return isGoogleWorkspace(file.mimeType)
    ? (GOOGLE_WORKSPACE_MAP[file.mimeType] || "application/pdf")
    : file.mimeType;
}

async function downloadFile(file: GoogleDriveFile, token: string): Promise<File> {
  const url = getDownloadUrl(file);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Download "${file.name}" failed: ${res.status}`);
  const blob = await res.blob();
  return new File([blob], file.name, { type: getOutputMime(file) || blob.type });
}

const GDRIVE_ICON = React.createElement("svg", { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
  React.createElement("path", { d: "M12.24 10.285L9.36 15.285H15.12L12.24 10.285Z", fill: "#0F9D58" }),
  React.createElement("path", { d: "M15.12 15.285H20.88L15.12 5.285H9.36L15.12 15.285Z", fill: "#4285F4" }),
  React.createElement("path", { d: "M9.36 15.285L3.6 5.285H9.36L15.12 15.285Z", fill: "#FFC107" }),
);

export class GoogleDriveProvider implements CloudProvider {
  id = "google-drive";
  name = "Google Drive";
  icon = GDRIVE_ICON;
  private _token: string | null = null;

  isAvailable() { return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID); }
  supportsImageOnly() { return true; }

  async isConnected() { return !!cachedToken; }

  async authenticate() {
    await ensureLoaded();
    const clientId = getClientId();
    this._token = await getToken(clientId);
  }

  async disconnect() {
    this._token = null;
    cachedToken = null;
  }

  async pickFiles(options?: { multiple?: boolean; imageOnly?: boolean }): Promise<File[]> {
    await ensureLoaded();
    const clientId = getClientId();
    this._token = await getToken(clientId);
    const picked = await openPicker(this._token, options?.imageOnly ?? false);
    if (!picked || picked.length === 0) return [];
    if (!options?.multiple) picked.splice(1);
    const results: File[] = [];
    for (const file of picked) {
      try {
        results.push(await downloadFile(file, this._token!));
      } catch (err: any) {
        console.warn(`Google Drive: skip "${file.name}": ${err.message}`);
      }
    }
    return results;
  }
}

export const googleDriveProvider = new GoogleDriveProvider();
