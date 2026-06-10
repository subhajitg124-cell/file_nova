import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Zap, Sliders, Settings, CheckCircle2 } from "lucide-react";

export const CompressPDFWorkspace: React.FC = () => {
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
  } = useToolProcessor("compress-pdf", "compress");

  // Local state configurations
  const [level, setLevel] = useState<"screen" | "ebook" | "print">("ebook");
  const [targetSize, setTargetSize] = useState<string>("");
  const [compressImages, setCompressImages] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);

  const isReady = files.length > 0;

  const handleProcess = async () => {
    const options = {
      level,
      targetSizeKb: targetSize ? parseInt(targetSize) : undefined,
      compressImages,
      removeMetadata,
      dpi: level === "screen" ? 72 : level === "ebook" ? 150 : 300,
    };
    await runProcessing(options);
  };

  const getEstimatedSize = () => {
    if (files.length === 0) return "";
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const multiplier = level === "screen" ? 0.35 : level === "ebook" ? 0.6 : 0.85;
    const est = totalSize * multiplier;
    if (est > 1024 * 1024) return (est / (1024 * 1024)).toFixed(1) + " MB";
    return Math.round(est / 1024) + " KB";
  };

  const configPanel = (
    <div className="space-y-6">
      {/* 3-Stop preset selector */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Compression Preset</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "screen", label: "Screen", desc: "Max Compression", quality: "72 DPI" },
            { id: "ebook", label: "Ebook", desc: "Balanced Size", quality: "150 DPI" },
            { id: "print", label: "Print", desc: "High Quality", quality: "300 DPI" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setLevel(preset.id as any)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                level === preset.id
                  ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5 text-white"
                  : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black uppercase tracking-wider">{preset.label}</span>
                {level === preset.id && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium leading-none">{preset.desc}</p>
                <p className="text-[9px] text-slate-500 font-mono mt-1">{preset.quality}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Target Size (optional) */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
          Target File Size Limit (Optional)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={targetSize}
            onChange={(e) => setTargetSize(e.target.value)}
            placeholder="e.g. 200"
            className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
          <span className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 flex items-center justify-center">
            KB
          </span>
        </div>
        <p className="text-[10px] text-slate-500 leading-normal">
          Useful for web portals like IRCTC (100KB), CSC / Scholarships (200KB), NEET/JEE.
        </p>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-3 border-t border-white/[0.05]">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-2">
          <Settings className="h-3.5 w-3.5 text-emerald-400" />
          Advanced Options
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-300">
          <input
            type="checkbox"
            checked={compressImages}
            onChange={(e) => setCompressImages(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 text-emerald-600 focus:ring-0 cursor-pointer"
          />
          <span>Downsample and compress images inside PDF</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-300">
          <input
            type="checkbox"
            checked={removeMetadata}
            onChange={(e) => setRemoveMetadata(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 text-emerald-600 focus:ring-0 cursor-pointer"
          />
          <span>Strip XML metadata & annotations</span>
        </label>
      </div>

      {/* Side by side size prediction */}
      {files.length > 0 && (
        <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-4 flex items-center justify-between text-xs font-medium">
          <div className="space-y-1">
            <span className="text-slate-500 uppercase text-[9px] font-black tracking-wider block">Estimated Output</span>
            <span className="text-emerald-400 font-black text-sm">{getEstimatedSize()}</span>
          </div>
          <div className="text-right space-y-1">
            <span className="text-slate-500 uppercase text-[9px] font-black tracking-wider block">Savings</span>
            <span className="text-slate-200 font-bold">~{level === "screen" ? "65%" : level === "ebook" ? "40%" : "15%"} smaller</span>
          </div>
        </div>
      )}
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="compress-pdf" options={{ level }} />
  );

  return (
    <ToolWorkspace
      toolName="Compress PDF"
      toolDescription="Reduce the file size of your PDF documents while keeping optimal text and image quality."
      toolIcon={<Zap className="h-5 w-5" />}
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
      acceptedTypes={[".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};
export default CompressPDFWorkspace;
