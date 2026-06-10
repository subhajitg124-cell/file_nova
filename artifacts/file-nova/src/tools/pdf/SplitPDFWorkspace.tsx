import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Scissors, Sliders, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const SplitPDFWorkspace: React.FC = () => {
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
  } = useToolProcessor("split-pdf", "split");

  // Local configurations
  const [splitMode, setSplitMode] = useState<"all" | "extract" | "parts">("all");
  const [splitRange, setSplitRange] = useState("1-1");
  const [partsCount, setPartsCount] = useState(2);

  const isReady = files.length > 0;

  const handleProcess = async () => {
    const options = {
      split_mode: splitMode,
      split_range: splitMode === "extract" ? splitRange : undefined,
      parts_count: splitMode === "parts" ? partsCount : undefined,
    };
    await runProcessing(options);
  };

  const handlePageClick = (pageNum: number) => {
    // Interactive click adds page number to page range input list
    if (splitMode !== "extract") {
      setSplitMode("extract");
      setSplitRange(`${pageNum}`);
      return;
    }

    const currentRangeStr = splitRange.trim();
    if (!currentRangeStr) {
      setSplitRange(`${pageNum}`);
      return;
    }

    const pages = new Set<number>();
    const ranges = currentRangeStr.split(",");
    
    // Check if page already exists in range. If yes, toggle it off
    let existed = false;
    const cleanRanges = ranges.map((r) => {
      const parts = r.trim().split("-");
      if (parts.length === 1) {
        const val = parseInt(parts[0]);
        if (val === pageNum) {
          existed = true;
          return "";
        }
      }
      return r;
    }).filter(Boolean);

    if (existed) {
      setSplitRange(cleanRanges.join(", "));
    } else {
      setSplitRange(currentRangeStr ? `${currentRangeStr}, ${pageNum}` : `${pageNum}`);
    }
    toast.success(`Toggled Page ${pageNum}`);
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Split Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Split Method</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: "all", label: "Extract All Pages", desc: "Every page becomes a file" },
            { id: "extract", label: "Custom Extraction", desc: "Select specific page list" },
            { id: "parts", label: "Split in Parts", desc: "Divide into N documents" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSplitMode(mode.id as any)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                splitMode === mode.id
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-300"
              }`}
            >
              <span className="text-xs font-black">{mode.label}</span>
              <span className="text-[9px] text-slate-500 mt-1">{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pages lists range input */}
      {splitMode === "extract" && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-blue-400" />
            Page Numbers / Ranges
          </label>
          <input
            type="text"
            value={splitRange}
            onChange={(e) => setSplitRange(e.target.value)}
            placeholder="e.g. 1-3, 5, 8-10"
            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
          />
          <p className="text-[10px] text-slate-500 leading-normal">
            Use comma-separated ranges. Example: <span className="font-mono text-slate-400">1-3, 5</span> extracts pages 1, 2, 3 and 5.
          </p>
        </div>
      )}

      {/* Split in parts range input */}
      {splitMode === "parts" && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-blue-400" />
            Divide Into Equal Parts
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="2"
              max="20"
              value={partsCount}
              onChange={(e) => setPartsCount(parseInt(e.target.value) || 2)}
              className="flex-1 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <span className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-450 flex items-center justify-center">
              Files
            </span>
          </div>
        </div>
      )}

      {/* User tip */}
      <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-4 flex gap-2.5 text-xs text-slate-400 leading-relaxed font-medium">
        <span>💡</span>
        <p>
          You can interactively select page ranges by clicking thumbnails in the Live Preview area below.
        </p>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel
      files={rawFiles}
      slug="split-pdf"
      options={{ split_mode: splitMode, split_range: splitRange }}
      onPreviewClick={handlePageClick}
    />
  );

  return (
    <ToolWorkspace
      toolName="Split PDF"
      toolDescription="Extract specific pages, divide a document into parts, or split all pages into separate PDF files."
      toolIcon={<Scissors className="h-5 w-5" />}
      accentColor="blue"
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
export default SplitPDFWorkspace;
