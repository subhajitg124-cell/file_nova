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
import { aadhaarMaskPlugin } from "./AadhaarMaskPlugin";
import { panResizePlugin } from "./PanResizePlugin";
import { liveImagePlugin } from "./LiveImagePlugin";
import { passportPhotoPlugin } from "./PassportPhotoPlugin";
import { liveVideoPlugin } from "./LiveVideoPlugin";
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
  "aadhaar-mask": aadhaarMaskPlugin,
  "pan-resize": panResizePlugin,
  "live-image": liveImagePlugin,
  "passport-photo": passportPhotoPlugin,
  "live-video": liveVideoPlugin,
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
  aadhaarMaskPlugin,
  panResizePlugin,
  liveImagePlugin,
  passportPhotoPlugin,
  liveVideoPlugin,
  defaultPlugin,
};
