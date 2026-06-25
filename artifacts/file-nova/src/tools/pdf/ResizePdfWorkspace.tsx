import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Maximize2, Sliders } from "lucide-react";

export const ResizePdfWorkspace: React.FC = () => {
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
  } = useToolProcessor("resize-pdf", "resize");

  const [pageSize, setPageSize] = useState<"a4" | "letter" | "legal" | "a3" | "custom">("a4");
  const [scale, setScale] = useState(100);
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);
  const [pageScope, setPageScope] = useState<"all" | "custom">("all");
  const [customRange, setCustomRange] = useState("1-1");

  const isReady = files.length > 0;

  const handleProcess = async () => {
    const options = {
      pageSize,
      scale,
      customWidth,
      customHeight,
      pageScope,
      customRange: pageScope === "custom" ? customRange : undefined,
    };
    await runProcessing(options);
  };

  const configPanel = (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <Maximize2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">Resize PDF Pages</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Change the page dimensions of your PDF. Choose from standard sizes or set custom dimensions.
          </p>
        </div>
      </div>

      {/* Page Size Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Standard Page Sizes</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "a4", label: "A4", desc: "210 × 297mm" },
            { id: "letter", label: "Letter", desc: "8.5 × 11in" },
            { id: "legal", label: "Legal", desc: "8.5 × 14in" },
            { id: "a3", label: "A3", desc: "297 × 420mm" },
            { id: "custom", label: "Custom", desc: "Your own size" },
          ].map((size) => (
            <button
              key={size.id}
              onClick={() => setPageSize(size.id as any)}
              className={`p-3 rounded-2xl border text-left hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                pageSize === size.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-muted text-foreground/80"
              }`}
            >
              <h4 className="text-xs font-bold leading-none">{size.label}</h4>
              <p className="text-[9px] text-muted-foreground mt-1">{size.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Size Inputs */}
      {pageSize === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Width (mm)</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(parseInt(e.target.value) || 210)}
              className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
              title="Width in mm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Height (mm)</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(parseInt(e.target.value) || 297)}
              className="w-full bg-card border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
              title="Height in mm"
            />
          </div>
        </div>
      )}

      {/* Scale Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-primary" />
            Scale
          </label>
          <span className="text-primary font-black font-mono">{scale}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="200"
          value={scale}
          onChange={(e) => setScale(parseInt(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          title="Scale"
        />
        <p className="text-[9px] text-muted-foreground">Scale the page content up or down</p>
      </div>

      {/* Page Scope */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Pages to Resize</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
            <input
              type="radio"
              name="scope"
              checked={pageScope === "all"}
              onChange={() => setPageScope("all")}
              className="text-primary focus:ring-0 cursor-pointer"
            />
            <span>All pages</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
            <input
              type="radio"
              name="scope"
              checked={pageScope === "custom"}
              onChange={() => setPageScope("custom")}
              className="text-primary focus:ring-0 cursor-pointer"
            />
            <span>Custom range</span>
          </label>
        </div>
      </div>

      {pageScope === "custom" && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Page Range</label>
          <input
            type="text"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
            placeholder="e.g. 1, 3-5"
            className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
          />
        </div>
      )}
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="resize-pdf" options={{ pageSize, scale, customWidth, customHeight, pageScope, customRange }} />
  );

  return (
    <ToolWorkspace
      toolName="Resize PDF"
      toolDescription="Change PDF page dimensions with standard or custom sizes."
      toolIcon={<Maximize2 className="h-5 w-5" />}
      accentColor="cyan"
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
      acceptedTypes={[".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};

export default ResizePdfWorkspace;