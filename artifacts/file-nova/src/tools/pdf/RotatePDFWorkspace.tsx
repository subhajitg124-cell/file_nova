import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { RotateCw, RotateCcw, Sliders, CheckCircle } from "lucide-react";

export const RotatePDFWorkspace: React.FC = () => {
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
  } = useToolProcessor("rotate-pdf", "rotate");

  // Local configurations
  const [rotation, setRotation] = useState<number>(90);
  const [pageScope, setPageScope] = useState<"all" | "custom">("all");
  const [customRange, setCustomRange] = useState("1-1");

  const isReady = files.length > 0;

  const handleProcess = async () => {
    const options = {
      rotation,
      pageScope,
      customRange: pageScope === "custom" ? customRange : undefined,
    };
    await runProcessing(options);
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Rotation button selector */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Rotation Angle</label>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 90, label: "90° CW", icon: RotateCw },
            { id: 270, label: "90° CCW", icon: RotateCcw },
            { id: 180, label: "180° Flip", icon: RotateCw },
          ].map((angle) => {
            const Icon = angle.icon;
            return (
              <button
                key={angle.id}
                onClick={() => setRotation(angle.id)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                  rotation === angle.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card hover:bg-muted text-foreground/80"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${rotation === angle.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-black mt-3 block">{angle.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Scope Selection */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Pages to Rotate</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
            <input
              type="radio"
              name="scope"
              checked={pageScope === "all"}
              onChange={() => setPageScope("all")}
              className="text-primary focus:ring-0 cursor-pointer"
            />
            <span>All pages in document</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground/80">
            <input
              type="radio"
              name="scope"
              checked={pageScope === "custom"}
              onChange={() => setPageScope("custom")}
              className="text-primary focus:ring-0 cursor-pointer"
            />
            <span>Specific pages range</span>
          </label>
        </div>
      </div>

      {/* Pages lists range input */}
      {pageScope === "custom" && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-primary" />
            Page Range list
          </label>
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
    <PreviewPanel files={rawFiles} slug="rotate-pdf" options={{ rotation, pageScope, customRange }} />
  );

  return (
    <ToolWorkspace
      toolName="Rotate PDF"
      toolDescription="Rotate standard PDF page sheets globally or by individual ranges in real-time."
      toolIcon={<RotateCw className="h-5 w-5" />}
      accentColor="amber"
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
export default RotatePDFWorkspace;
