import React from "react";

export type EditorFileType = "image" | "pdf" | "document";

export interface Annotation {
  type: "path" | "text";
  color: string;
  points?: { x: number; y: number }[];
  text?: string;
  x?: number;
  y?: number;
  fontSize?: number;
  width?: number;
}

export interface EditorSection {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  component: React.ComponentType<SectionProps>;
  defaultOpen?: boolean;
  advanced?: boolean;
}

export interface SectionProps {
  file: File | null;
  fileType: EditorFileType;
  config: Record<string, any>;
  onConfigChange: (key: string, value: any) => void;
  onStatusMessage: (msg: string) => void;
  onBusy: (busy: boolean) => void;
  disabled?: boolean;
}

export interface EditorPlugin {
  id: string;
  name: string;
  sections: EditorSection[];
  rightPanel?: React.ComponentType<SectionProps>;
  previewType?: "image" | "pdf" | "auto";
  onSave?: (file: File, config: Record<string, any>, annotations: Annotation[], canvasRef?: React.RefObject<HTMLCanvasElement | null>) => Promise<Blob>;
  onProcessAction?: (file: File, config: Record<string, any>, onStatus: (msg: string) => void, onBusy: (b: boolean) => void) => Promise<Blob>;
}

export interface EditorFrameworkHandle {
  save: () => Promise<void>;
}

export interface PluginFactory {
  (): EditorPlugin;
}
