import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Image, FileImage } from "lucide-react";

export const PdfToJpgWorkspace: React.FC = () => {
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
  } = useToolProcessor("pdf-to-jpg", "convert");

  const [quality, setQuality] = useState(92);
  const [dpi, setDpi] = useState(300);
  const [pageRange, setPageRange] = useState("all");

  const isReady = files.length > 0;

  const handleProcess = async () => {
    await runProcessing({ quality, dpi, pageRange });
  };

  const configPanel = (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <Image className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">PDF to JPG Conversion</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Convert each PDF page into a high-quality JPG image. Perfect for sharing, social media, or printing individual pages.
          </p>
        </div>
      </div>

      {/* Quality Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-black uppercase tracking-wider text-muted-foreground">Image Quality</label>
          <span className="text-primary font-black font-mono">{quality}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          title="Image Quality"
        />
        <p className="text-[9px] text-muted-foreground">Higher quality = larger file size</p>
      </div>

      {/* DPI Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Resolution (DPI)</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 72, label: "72 DPI", desc: "Screen" },
            { id: 150, label: "150 DPI", desc: "Standard" },
            { id: 300, label: "300 DPI", desc: "Print" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDpi(d.id)}
              className={`p-3 rounded-2xl border text-left hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                dpi === d.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-muted text-foreground/80"
              }`}
            >
              <h4 className="text-xs font-bold leading-none">{d.label}</h4>
              <p className="text-[9px] text-muted-foreground mt-1">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Page Range */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Page Range</label>
        <input
          type="text"
          value={pageRange}
          onChange={(e) => setPageRange(e.target.value)}
          placeholder="all or 1-5, 8"
          className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
        />
        <p className="text-[9px] text-muted-foreground">Leave as "all" to convert every page</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Input</p>
          <p className="text-sm font-bold text-foreground mt-1">.pdf</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Output</p>
          <p className="text-sm font-bold text-primary mt-1">.jpg</p>
        </div>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="pdf-to-jpg" options={{ quality, dpi, pageRange }} />
  );

  return (
    <ToolWorkspace
      toolName="PDF to JPG"
      toolDescription="Convert PDF pages to high-quality JPG images."
      toolIcon={<Image className="h-5 w-5" />}
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
      maxFiles={1}
      acceptedTypes={[".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};

export default PdfToJpgWorkspace;