import React, { useState, useEffect } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Image as ImageIcon, Sliders, Shield } from "lucide-react";
import { toast } from "sonner";

export const PANCardResizeWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing,
    isUploading,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
  } = useToolProcessor("pan-card-resize", "pan-resize");

  // Local configurations
  const [uploadType, setUploadType] = useState<"photo" | "scan">("scan");
  const [preset, setPreset] = useState<"uidai" | "scholarship" | "neet" | "railway" | "custom">("uidai");
  const [format, setFormat] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [quality, setQuality] = useState(85);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);
  const [maxKb, setMaxKb] = useState(50);

  // Sync preset parameters
  useEffect(() => {
    if (preset === "uidai") {
      setWidth(200);
      setHeight(200);
      setMaxKb(30);
    } else if (preset === "scholarship") {
      setWidth(300);
      setHeight(400);
      setMaxKb(50);
    } else if (preset === "neet") {
      // NEET/JEE standard photograph format
      setWidth(350);
      setHeight(450);
      setMaxKb(40);
    } else if (preset === "railway") {
      setWidth(200);
      setHeight(230);
      setMaxKb(50);
    }
  }, [preset]);

  const isReady = files.length > 0;

  useEffect(() => {
    if (isReady && typeof window !== "undefined" && window.history.state?.autoProcess) {
      window.history.replaceState({ ...window.history.state, autoProcess: false }, "");
      handleProcess();
    }
  }, [files, isReady]);

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
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d")!;
            
            // Draw background fill (white in case of transparency on JPEG conversion)
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(
              async (blob) => {
                if (blob) {
                  // If size exceeds target maxKb, compress further
                  let compressedBlob = blob;
                  if (compressedBlob.size > maxKb * 1024 && format === "image/jpeg") {
                    const extraQuality = Math.max(20, Math.round(quality * (maxKb * 1024 / compressedBlob.size)));
                    await new Promise<void>((r2) => {
                      canvas.toBlob((b2) => {
                        if (b2) compressedBlob = b2;
                        r2();
                      }, "image/jpeg", extraQuality / 100);
                    });
                  }
                  
                  await runProcessing({}, compressedBlob);
                  resolve();
                } else {
                  reject(new Error("Canvas export failed"));
                }
              },
              format,
              quality / 100
            );
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to crop/resize image.");
    }
  };

  const getEstimatedSize = () => {
    if (files.length === 0) return "0 KB";
    const totalW = width;
    const totalH = height;
    const estBytes = (totalW * totalH * 4) * (quality / 100) * 0.08;
    const kb = Math.min(maxKb, Math.round(estBytes / 1024));
    return `${kb} KB`;
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Privacy Warning Bento Card */}
      <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2 text-left">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <Shield className="h-4 w-4" />
          <span>Local Document Processing</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal">
          This PAN Card is resized entirely inside your web browser. Your sensitive identity records are processed 100% locally and are never sent to any servers. Read our{" "}
          <a href="/security" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Security Statement</a>.
        </p>
      </div>

      {/* Photo vs Scan preset */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Card Upload Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {["photograph", "PAN Card Scan"].map((label, idx) => {
            const key = idx === 0 ? "photo" : "scan";
            return (
              <button
                key={key}
                onClick={() => setUploadType(key as any)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                  uploadType === key
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card hover:bg-muted text-foreground/80"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset selections */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Standard India Form Presets</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: "uidai", label: "UIDAI" },
            { id: "scholarship", label: "Scholarship" },
            { id: "neet", label: "NEET/JEE" },
            { id: "railway", label: "Railway" },
            { id: "custom", label: "Custom px" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPreset(item.id as any)}
              className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold text-center hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                preset === item.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Inputs (if custom selected) */}
      {preset === "custom" && (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 200)}
              className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
              title="Width in pixels"
              placeholder="200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 200)}
              className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
              title="Height in pixels"
              placeholder="200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Max Size (KB)</label>
            <input
              type="number"
              value={maxKb}
              onChange={(e) => setMaxKb(parseInt(e.target.value) || 50)}
              className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
              title="Maximum size in KB"
              placeholder="50"
            />
          </div>
        </div>
      )}

      {/* Quality slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-primary" />
            Compression Quality
          </label>
          <span className="text-primary font-black font-mono">{quality}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          title="Compression Quality"
        />
      </div>

      {/* Output format presets */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">File Output Format</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
            <input
              type="radio"
              name="format"
              checked={format === "image/jpeg"}
              onChange={() => setFormat("image/jpeg")}
              className="text-primary focus:ring-0 cursor-pointer"
            />
            <span>JPEG</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
            <input
              type="radio"
              name="format"
              checked={format === "image/png"}
              onChange={() => setFormat("image/png")}
              className="text-primary focus:ring-0 cursor-pointer"
            />
            <span>PNG</span>
          </label>
        </div>
      </div>

      {/* Live Estimated details */}
      {files.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center justify-between text-xs font-medium">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Output bounds</span>
            <span className="text-foreground/90 font-bold block">{width} × {height} px</span>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Est. Size</span>
            <span className="text-primary font-black block">&lt; {getEstimatedSize()}</span>
          </div>
        </div>
      )}
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="pan-card-resize" options={{ width, height }} />
  );

  return (
    <ToolWorkspace
      toolName="PAN Card Resizer"
      toolDescription="Crop and resize photographs or PAN Card scans to standard Indian government online application specs."
      toolIcon={<ImageIcon className="h-5 w-5" />}
      accentColor="indigo"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      isUploading={isUploading}
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
export default PANCardResizeWorkspace;
