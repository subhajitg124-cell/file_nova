import React, { useState, useEffect, useRef } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileArchive, Sparkles, Sliders, Settings, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const CompressImageWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset: resetProcessor,
    runProcessing,
  } = useToolProcessor("compress-image", "compress");

  // Local configurations
  const [compressMode, setCompressMode] = useState<"quality" | "target">("quality");
  const [preset, setPreset] = useState<"web" | "balanced" | "high" | "custom">("balanced");
  const [quality, setQuality] = useState(82);
  const [targetFormat, setTargetFormat] = useState<"original" | "webp" | "jpeg" | "png">("original");
  const [targetSizeKb, setTargetSizeKb] = useState(200);

  // Preview Object URLs
  const [origUrl, setOrigUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const isReady = files.length > 0;

  // Handle Preset changes
  useEffect(() => {
    if (preset === "web") {
      setQuality(50);
    } else if (preset === "balanced") {
      setQuality(80);
    } else if (preset === "high") {
      setQuality(95);
    }
  }, [preset]);

  // Handle initial file selection to create Object URL
  useEffect(() => {
    if (rawFiles.length > 0) {
      const url = URL.createObjectURL(rawFiles[0]);
      setOrigUrl(url);
      setCompressedUrl(null);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setOrigUrl(null);
      setCompressedUrl(null);
    }
  }, [rawFiles]);

  // Handle result file generation to create Object URL
  useEffect(() => {
    if (result) {
      setCompressedUrl(result.url);
    }
  }, [result]);

  const handleProcess = async () => {
    if (rawFiles.length === 0) return;
    const file = rawFiles[0];

    try {
      // Determine format mime type
      let mimeType = file.type;
      if (targetFormat === "webp") mimeType = "image/webp";
      else if (targetFormat === "jpeg") mimeType = "image/jpeg";
      else if (targetFormat === "png") mimeType = "image/png";

      const img = new Image();
      img.src = URL.createObjectURL(file);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            reject(new Error("Canvas context initialization failed"));
            return;
          }

          ctx.drawImage(img, 0, 0);

          if (compressMode === "target") {
            // Target size mode: iterate compression quality to hit the KB limit
            let q = 0.95;
            const targetBytes = targetSizeKb * 1024;
            
            const checkQuality = () => {
              canvas.toBlob(
                async (blob) => {
                  if (!blob) {
                    reject(new Error("Compression iteration failed"));
                    return;
                  }

                  if (blob.size <= targetBytes || q <= 0.15) {
                    await runProcessing({}, blob);
                    resolve();
                  } else {
                    q -= 0.05;
                    checkQuality();
                  }
                },
                mimeType,
                q
              );
            };
            checkQuality();
          } else {
            // Standard preset/quality slider mode
            canvas.toBlob(
              async (blob) => {
                if (blob) {
                  await runProcessing({}, blob);
                  resolve();
                } else {
                  reject(new Error("Compression failed"));
                }
              },
              mimeType,
              quality / 100
            );
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      });
    } catch (err: any) {
      toast.error(err.message || "Image compression failed.");
    }
  };

  const handleReset = () => {
    setCompressedUrl(null);
    resetProcessor();
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getCompressionSavings = () => {
    if (!result || rawFiles.length === 0) return null;
    const originalSize = rawFiles[0].size;
    const outputBytes = result.size.includes("MB")
      ? parseFloat(result.size) * 1024 * 1024
      : parseFloat(result.size) * 1024;
    
    const savings = Math.max(0, originalSize - outputBytes);
    const pct = Math.round((savings / originalSize) * 100);
    return {
      orig: formatSize(originalSize),
      comp: result.size,
      pct,
    };
  };

  const savings = getCompressionSavings();

  const configPanel = (
    <div className="space-y-6">
      {/* Target Format Selector */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Target Format</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "original", label: "Original" },
            { id: "webp", label: "WebP" },
            { id: "jpeg", label: "JPEG" },
            { id: "png", label: "PNG" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTargetFormat(item.id as any)}
              className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer text-center ${
                targetFormat === item.id
                  ? "border-emerald-500 bg-emerald-500/10 text-white"
                  : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compress Mode selector */}
      <div className="flex gap-2 p-1 bg-slate-950/60 border border-white/5 rounded-2xl">
        <button
          onClick={() => setCompressMode("quality")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            compressMode === "quality"
              ? "bg-emerald-600 text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Preset & Quality
        </button>
        <button
          onClick={() => setCompressMode("target")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            compressMode === "target"
              ? "bg-emerald-600 text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Target Size
        </button>
      </div>

      {compressMode === "quality" ? (
        <div className="space-y-5">
          {/* Preset Chips */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">Quality Preset</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "web", label: "Web Small", desc: "Highest savings" },
                { id: "balanced", label: "Balanced", desc: "Default" },
                { id: "high", label: "High Quality", desc: "Best fidelity" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPreset(item.id as any)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                    preset === item.id
                      ? "border-emerald-500 bg-emerald-500/10 text-white"
                      : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-300"
                  }`}
                >
                  <span className="text-xs font-black leading-none">{item.label}</span>
                  <span className="text-[9px] text-slate-500 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-400">
              <span>Image Quality</span>
              <span className="text-emerald-400 font-bold">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => {
                setPreset("custom");
                setQuality(Number(e.target.value));
              }}
              title="Compression Quality"
              className="w-full h-1 mt-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      ) : (
        /* Target Size constraints input */
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            Compress to under size (KB)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={10}
              max={5000}
              value={targetSizeKb}
              onChange={(e) => setTargetSizeKb(parseInt(e.target.value) || 200)}
              className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
              placeholder="e.g. 200"
            />
            <span className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-450 flex items-center justify-center">
              KB
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            FileNova will automatically iterate through quality ratios to output a file size under your specified KB limit.
          </p>
        </div>
      )}

      {/* Savings Summary */}
      {savings && (
        <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-2 animate-fade-up">
          <div className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Compression Summary
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold font-mono">
            <div className="p-2 bg-slate-900/50 rounded-xl border border-white/5">
              <span className="text-[8px] block text-slate-500 uppercase">Original</span>
              <span className="text-slate-300 block truncate">{savings.orig}</span>
            </div>
            <div className="p-2 bg-slate-900/50 rounded-xl border border-white/5">
              <span className="text-[8px] block text-slate-500 uppercase">Compressed</span>
              <span className="text-emerald-400 block truncate">{savings.comp}</span>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 flex flex-col justify-center">
              <span className="text-[8px] block text-slate-500 uppercase">Savings</span>
              <span className="block">{savings.pct}% smaller</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const previewPanel = (
    <div className="w-full">
      {origUrl ? (
        <BeforeAfterSlider
          beforeTitle="Raw Input Photo"
          afterTitle="Optimized Output"
          beforeImage={origUrl}
          afterImage={compressedUrl || origUrl}
          mode={compressedUrl ? "slider" : "side-by-side"}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl min-h-[150px] text-slate-500 text-xs">
          <FileArchive className="h-8 w-8 mb-2 stroke-[1.5] animate-pulse" />
          <span>Upload an image to see visual compression slider.</span>
        </div>
      )}
    </div>
  );

  return (
    <ToolWorkspace
      toolName="Compress Image"
      toolDescription="Reduce photo sizes locally on your device with visual slider verification."
      toolIcon={<FileArchive className="h-5 w-5" />}
      accentColor="emerald"
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
export default CompressImageWorkspace;
