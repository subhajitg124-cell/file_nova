import React from "react";

export interface CloudProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  authenticate(): Promise<void>;
  pickFiles(options?: { multiple?: boolean; imageOnly?: boolean }): Promise<File[]>;
  disconnect(): Promise<void>;
  isAvailable(): boolean;
  isConnected(): Promise<boolean>;
  supportsImageOnly(): boolean;
}

export interface CloudImportFile {
  id: string;
  name: string;
  size: number;
  type: string;
  source: string;
  importedAt: number;
  file?: File;
}

export interface CloudImportState {
  recentImports: CloudImportFile[];
  pinnedFiles: CloudImportFile[];
  lastUsedProvider: string | null;
  favoriteProvider: string | null;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  iconLink?: string;
  thumbnailLink?: string;
}

declare global {
  interface Window {
    gapi?: any;
    google?: any;
    Dropbox?: any;
  }
}
