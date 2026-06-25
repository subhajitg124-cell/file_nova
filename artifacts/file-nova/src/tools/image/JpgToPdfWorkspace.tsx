import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileImage } from "lucide-react";

export const JpgToPdfWorkspace: React.FC = () => {
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
  } = useToolProcessor("jpg-to-pdf", "convert");

  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("fit");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(10);

  const isReady = files.length > 0;

  const handleProcess = async () => {
    await runProcessing({ pageSize, orientation, margin });
  };

  const configPanel = (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <FileImage className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">JPG to PDF Conversion</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Convert your JPG images into a clean PDF document. Multiple images can be combined into a single PDF.
          </p>
        </div>
      </div>

      {/* Page Size */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Page Size</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "fit", label: "Fit to Image", desc: "Original size" },
            { id: "a4", label: "A4", desc: "210 × 297mm" },
            { id: "letter", label: "Letter", desc: "8.5 × 11in" },
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

      {/* Orientation */}
      {pageSize !== "fit" && (
        <div className="space-y-2.5">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Orientation</label>
          <div className="grid grid-cols-2 gap-2">
            {["portrait", "landscape"].map((o) => (
              <button
                key={o}
                onClick={() => setOrientation(o as any)}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold capitalize hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                  orientation === o
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card hover:bg-muted text-foreground/80"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Margin */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-black uppercase tracking-wider text-muted-foreground">Page Margin</label>
          <span className="text-primary font-black font-mono">{margin}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={margin}
          onChange={(e) => setMargin(parseInt(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          title="Page Margin"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Input</p>
          <p className="text-sm font-bold text-foreground mt-1">.jpg / .jpeg</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Output</p>
          <p className="text-sm font-bold text-primary mt-1">.pdf</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-3 text-xs text-muted-foreground">
        <p className="font-bold text-foreground/80">Multiple images?</p>
        <p className="text-[10px] mt-1">Upload multiple JPGs and they'll be combined into a single PDF, one image per page.</p>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="jpg-to-pdf" options={{ pageSize, orientation, margin }} />
  );

  return (
    <ToolWorkspace
      toolName="JPG to PDF"
      toolDescription="Convert JPG images to clean PDF documents."
      toolIcon={<FileImage className="h-5 w-5" />}
      accentColor="emerald"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      isUploading={isUploading}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleReset}
      maxFiles={20}
      acceptedTypes={[".jpg", ".jpeg", ".png"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};

export default JpgToPdfWorkspace;