import React, { useState, useEffect } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Image as ImageIcon, Sparkles, Scale } from "lucide-react";
import { toast } from "sonner";

export const ResizePhotoWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
  } = useToolProcessor("resize-photo", "photo-resize");

  // Local configurations
  const [preset, setPreset] = useState<"passport" | "scholarship" | "custom">("passport");
  const [unit, setUnit] = useState<"px" | "mm">("mm");
  const [width, setWidth] = useState(35);
  const [height, setHeight] = useState(45);
  const [dpi, setDpi] = useState<96 | 150 | 300>(300);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [lockAspect, setLockAspect] = useState(true);
  const [quality, setQuality] = useState(90);

  // Preset rules
  useEffect(() => {
    if (preset === "passport") {
      setUnit("mm");
      setWidth(35);
      setHeight(45);
      setDpi(300);
      setBgColor("#ffffff");
    } else if (preset === "scholarship") {
      setUnit("px");
      setWidth(200);
      setHeight(250);
      setDpi(150);
      setBgColor("#ffffff");
    }
  }, [preset]);

  const isReady = files.length > 0;

  // Convert mm dimensions to pixels based on DPI
  const getPixels = (val: number, currentUnit: "px" | "mm", currentDpi: number) => {
    if (currentUnit === "px") return val;
    return Math.round((val / 25.4) * currentDpi);
  };

  const pixelWidth = getPixels(width, unit, dpi);
  const pixelHeight = getPixels(height, unit, dpi);

  const handleProcess = async () => {
    if (rawFiles.length === 0) return;
    
    try {
      const file = rawFiles[0];
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
            const ctx = canvas.getContext("2d")!;
            
            // Draw background fill color
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, pixelWidth, pixelHeight);
            
            // Draw image scaled to fill/fit the passport crop box
            const imgAspect = img.width / img.height;
            const canvasAspect = pixelWidth / pixelHeight;
            
            let drawW = pixelWidth;
            let drawH = pixelHeight;
            let offsetX = 0;
            let offsetY = 0;
            
            if (imgAspect > canvasAspect) {
              drawW = pixelHeight * imgAspect;
              offsetX = (pixelWidth - drawW) / 2;
            } else {
              drawH = pixelWidth / imgAspect;
              offsetY = (pixelHeight - drawH) / 2;
            }
            
            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
            
            canvas.toBlob(
              async (blob) => {
                if (blob) {
                  await runProcessing({}, blob);
                  resolve();
                } else {
                  reject(new Error("Canvas export failed"));
                }
              },
              bgColor === "transparent" ? "image/png" : "image/jpeg",
              quality / 100
            );
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to resize photo.");
    }
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Preset Selectors */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Photo Presets</label>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: "passport", label: "Passport", desc: "35x45 mm" },
            { id: "scholarship", label: "Scholarship Portal", desc: "200x250 px" },
            { id: "custom", label: "Custom Setup", desc: "User dimensions" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPreset(item.id as any)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                preset === item.id
                  ? "border-sky-500 bg-sky-500/10 text-white"
                  : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-300"
              }`}
            >
              <span className="text-xs font-black">{item.label}</span>
              <span className="text-[10px] text-slate-500 mt-1">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Coordinates Controls (Custom only) */}
      {preset === "custom" && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-300">
              <input type="radio" checked={unit === "mm"} onChange={() => setUnit("mm")} className="text-sky-500" />
              Millimeters (mm)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-300">
              <input type="radio" checked={unit === "px"} onChange={() => setUnit("px")} className="text-sky-500" />
              Pixels (px)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* DPI settings */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Target Print Resolution (DPI)</label>
        <div className="flex gap-2">
          {[96, 150, 300].map((d) => (
            <button
              key={d}
              onClick={() => setDpi(d as any)}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                dpi === d
                  ? "border-sky-500 bg-sky-500/10 text-white"
                  : "border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {d} DPI
            </button>
          ))}
        </div>
      </div>

      {/* Background fill picker */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Background Tint</label>
        <div className="flex gap-3 flex-wrap">
          {[
            { value: "#ffffff", name: "White fill" },
            { value: "transparent", name: "Transparent" },
            { value: "#3b82f6", name: "Blue tint" },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => setBgColor(c.value)}
              className={`py-1.5 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                bgColor === c.value
                  ? "border-sky-500 bg-sky-500/10 text-white"
                  : "border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-white/10"
                style={{ backgroundColor: c.value === "transparent" ? "#00000000" : c.value }}
              />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time metrics values details */}
      {files.length > 0 && (
        <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between text-xs font-medium">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Output pixel bounds</span>
            <span className="text-slate-200 font-bold block">{pixelWidth} × {pixelHeight} px</span>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Format</span>
            <span className="text-sky-400 font-black block">{bgColor === "transparent" ? "PNG" : "JPEG"}</span>
          </div>
        </div>
      )}
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="resize-photo" options={{ width: pixelWidth, height: pixelHeight }} />
  );

  return (
    <ToolWorkspace
      toolName="Resize Photo"
      toolDescription="Configure, resize and compile student photos to standard passport or portal dimensions locally."
      toolIcon={<Scale className="h-5 w-5" />}
      accentColor="sky"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleReset}
      maxFiles={1}
      acceptedTypes={["image/*"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};
export default ResizePhotoWorkspace;
