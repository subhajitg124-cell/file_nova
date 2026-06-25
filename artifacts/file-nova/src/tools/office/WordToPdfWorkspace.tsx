import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileText, Sliders } from "lucide-react";

export const WordToPdfWorkspace: React.FC = () => {
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
  } = useToolProcessor("word-to-pdf", "convert");

  const [pageSize, setPageSize] = useState<"a4" | "letter" | "legal">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(10);
  const [fitContent, setFitContent] = useState(true);

  const isReady = files.length > 0;

  const handleProcess = async () => {
    await runProcessing({ pageSize, orientation, margin, fitContent });
  };

  const configPanel = (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">Word to PDF Conversion</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Upload your Word document (.docx) and we'll convert it to a clean, professional PDF. Formatting, images, and layout are preserved.
          </p>
        </div>
      </div>

      {/* Page Size */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Page Size</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "a4", label: "A4", desc: "210 × 297mm" },
            { id: "letter", label: "Letter", desc: "8.5 × 11in" },
            { id: "legal", label: "Legal", desc: "8.5 × 14in" },
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

      {/* Margin */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5 text-primary" />
            Page Margin
          </label>
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

      {/* Fit Content Toggle */}
      <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card cursor-pointer">
        <div className="space-y-0.5">
          <span className="text-xs font-black uppercase tracking-wider text-foreground">Fit Content to Page</span>
          <p className="text-[10px] text-muted-foreground">Scale content to fit within page margins</p>
        </div>
        <input
          type="checkbox"
          checked={fitContent}
          onChange={(e) => setFitContent(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-0 cursor-pointer"
          title="Fit Content to Page"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Input</p>
          <p className="text-sm font-bold text-foreground mt-1">.docx / .rtf</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Output</p>
          <p className="text-sm font-bold text-primary mt-1">.pdf</p>
        </div>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="word-to-pdf" options={{ pageSize, orientation, margin, fitContent }} />
  );

  return (
    <ToolWorkspace
      toolName="Word to PDF"
      toolDescription="Convert Word documents to professional PDF files instantly."
      toolIcon={<FileText className="h-5 w-5" />}
      accentColor="blue"
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
      acceptedTypes={[".docx", ".rtf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};

export default WordToPdfWorkspace;