import React from "react";
import type { CloudProvider } from "./types";

const GPHOTOS_ICON = React.createElement("svg", { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
  React.createElement("circle", { cx: "12", cy: "12", r: "10", fill: "#FBBC05" }),
  React.createElement("circle", { cx: "12", cy: "12", r: "6", fill: "#fff" }),
  React.createElement("rect", { x: "11", y: "2", width: "2", height: "20", fill: "#EA4335", rx: "1" }),
);

export class GooglePhotosProvider implements CloudProvider {
  id = "google-photos";
  name = "Google Photos";
  icon = GPHOTOS_ICON;
  private _accessToken: string | null = null;

  isAvailable() { return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID); }
  supportsImageOnly() { return true; }

  async isConnected() { return !!this._accessToken; }

  async authenticate() {
    if (window.google?.accounts?.oauth2) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID not set");
      return new Promise<void>((resolve, reject) => {
        const tc = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
          callback: (resp: any) => {
            if (resp.error) { reject(new Error(resp.error)); return; }
            this._accessToken = resp.access_token;
            resolve();
          },
        });
        tc.requestAccessToken({ prompt: "consent" });
      });
    }
    throw new Error("Google Identity Services not loaded");
  }

  async disconnect() { this._accessToken = null; }

  async pickFiles(options?: { multiple?: boolean }): Promise<File[]> {
    if (!this._accessToken) await this.authenticate();
    const token = this._accessToken!;
    const results: File[] = [];
    let pageToken: string | undefined;

    try {
      while (results.length < (options?.multiple ? 50 : 1)) {
        const params = new URLSearchParams({
          pageSize: options?.multiple ? "50" : "1",
          ...(pageToken ? { pageToken } : {}),
        });
        const res = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Google Photos API: ${res.status}`);
        const data = await res.json();
        const items = data.mediaItems || [];
        for (const item of items) {
          if (!item.mimeType?.startsWith("image/")) continue;
          try {
            const dl = await fetch(`${item.baseUrl}=d`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!dl.ok) continue;
            const blob = await dl.blob();
            results.push(new File([blob], item.filename, { type: item.mimeType }));
            if (!options?.multiple) break;
          } catch { /* skip failed item */ }
        }
        pageToken = data.nextPageToken;
        if (!pageToken || (!options?.multiple && results.length > 0)) break;
      }
    } catch (err: any) {
      console.warn("Google Photos: error during fetch:", err.message);
    }
    return results;
  }
}

export const googlePhotosProvider = new GooglePhotosProvider();
