import React from "react";
import EditorFramework from "@/editor/EditorFramework";
import { getPlugin } from "@/editor/plugins";
import type { EditorFileType } from "@/editor/types";

interface EditingWindowProps {
  file: File | null;
  fileType: "image" | "pdf" | "document";
  onClose: () => void;
  onDone: (result: Blob) => void;
  toolType?: string;
  totalPages?: number;
}

const TOOL_PLUGIN_MAP: Record<string, string> = {
  compress: "compress",
  merge: "merge",
  split: "split",
  rotate: "rotate",
  protect: "protect",
  unlock: "unlock",
  watermark: "watermark",
  "aadhaar-mask": "aadhaar-mask",
  "pan-resize": "pan-resize",
  "image-adjust": "image-adjust",
  ocr: "ocr",
  qr: "qr",
  annotate: "annotate",
  default: "default",
};

export const EditingWindow: React.FC<EditingWindowProps> = ({
  file, fileType, onClose, onDone, toolType = "default", totalPages,
}) => {
  const pluginId = TOOL_PLUGIN_MAP[toolType] || "default";
  const plugin = getPlugin(pluginId);

  return (
    <EditorFramework
      file={file}
      fileType={fileType as EditorFileType}
      plugin={plugin}
      onClose={onClose}
      onDone={onDone}
      totalPages={totalPages}
    />
  );
};

export default EditingWindow;
