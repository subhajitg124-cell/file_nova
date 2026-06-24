import type { EditorPlugin } from "../types";
import { compressPlugin } from "./CompressPlugin";
import { mergePlugin } from "./MergePlugin";
import { splitPlugin } from "./SplitPlugin";
import { rotatePlugin } from "./RotatePlugin";
import { protectPlugin } from "./ProtectPlugin";
import { watermarkPlugin } from "./WatermarkPlugin";
import { imageAdjustPlugin } from "./ImageAdjustPlugin";
import { ocrPlugin } from "./OcrPlugin";
import { exportPlugin } from "./ExportPlugin";
import { annotatePlugin } from "./AnnotatePlugin";
import { qrPlugin } from "./QrPlugin";
import { defaultPlugin } from "./DefaultPlugin";

export const pluginRegistry: Record<string, EditorPlugin> = {
  "compress": compressPlugin,
  "merge": mergePlugin,
  "split": splitPlugin,
  "rotate": rotatePlugin,
  "protect": protectPlugin,
  "unlock": protectPlugin,
  "watermark": watermarkPlugin,
  "image-adjust": imageAdjustPlugin,
  "ocr": ocrPlugin,
  "export": exportPlugin,
  "annotate": annotatePlugin,
  "qr": qrPlugin,
  "default": defaultPlugin,
};

export function getPlugin(toolType: string): EditorPlugin {
  return pluginRegistry[toolType] || pluginRegistry["default"];
}

export {
  compressPlugin,
  mergePlugin,
  splitPlugin,
  rotatePlugin,
  protectPlugin,
  watermarkPlugin,
  imageAdjustPlugin,
  ocrPlugin,
  exportPlugin,
  annotatePlugin,
  qrPlugin,
  defaultPlugin,
};
