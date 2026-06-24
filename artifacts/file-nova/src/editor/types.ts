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

export interface PresetDefinition {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  config: Record<string, any>;
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
  mode?: "beginner" | "advanced";
}

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: "pdf" | "image" | "document" | "ai" | "convert" | "security" | "utility" | "ocr";
  icon: React.ReactNode;
  color: string;
}

export interface EditorPlugin {
  id: string;
  name: string;
  description?: string;
  metadata?: ToolMetadata;
  sections: EditorSection[];
  presets?: PresetDefinition[];
  rightPanel?: React.ComponentType<SectionProps>;
  previewType?: "image" | "pdf" | "auto";
  defaultMode?: "beginner" | "advanced";
  onSave?: (file: File, config: Record<string, any>, annotations: Annotation[], canvasRef?: React.RefObject<HTMLCanvasElement | null>) => Promise<Blob>;
  onProcessAction?: (file: File, config: Record<string, any>, onStatus: (msg: string) => void, onBusy: (b: boolean) => void) => Promise<Blob>;
}

export interface EditorFrameworkHandle {
  save: () => Promise<void>;
}

export interface PluginFactory {
  (): EditorPlugin;
}
