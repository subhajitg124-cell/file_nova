import React, { useState, useEffect } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Shield, Eye, Settings, HelpCircle } from "lucide-react";

export const AadhaarMaskWorkspace: React.FC = () => {
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
  } = useToolProcessor("aadhaar-mask-pdf", "aadhaar-mask");

  // Local configurations
  const [autoDetect, setAutoDetect] = useState(true);
  const [maskStyle, setMaskStyle] = useState<"black" | "blur" | "asterisks">("black");
  const [showLast4, setShowLast4] = useState(true);
  const [manualMasks, setManualMasks] = useState<any[]>([]);

  const isReady = files.length > 0;

  useEffect(() => {
    if (isReady && typeof window !== "undefined" && window.history.state?.autoProcess) {
      window.history.replaceState({ ...window.history.state, autoProcess: false }, "");
      handleProcess();
    }
  }, [files, isReady]);

  const handleProcess = async () => {
    const options = {
      autoDetect,
      maskStyle,
      showLast4,
      manualMasks,
    };
    await runProcessing(options);
  };

  const handlePreviewPageClick = (pageIndex: number) => {
    // Mock addition of manual mask on preview page click
    toast.success(`Manual masking marker set on Page ${pageIndex}`);
    setManualMasks((prev) => [...prev, { page: pageIndex, x: 100, y: 150, width: 250, height: 40 }]);
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Auto Detect Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card">
        <div className="space-y-0.5">
          <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-primary" />
            Auto-Detect Aadhaar Numbers
          </label>
          <p className="text-[10px] text-muted-foreground">Locates Aadhaar digits in PDF page layers automatically</p>
        </div>
        <input
          type="checkbox"
          checked={autoDetect}
          onChange={(e) => setAutoDetect(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-0 cursor-pointer"
          title="Auto-Detect Aadhaar Numbers"
        />
      </div>

      {/* Mask style */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Redaction style</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "black", label: "Black Block", desc: "Full redact" },
            { id: "blur", label: "Blur Region", desc: "Smooth blur" },
            { id: "asterisks", label: "Asterisks", desc: "xxxx-xxxx-1234" },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setMaskStyle(style.id as any)}
              className={`p-3.5 rounded-2xl border text-left hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                maskStyle === style.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-muted text-foreground/80"
              }`}
            >
              <h4 className="text-xs font-bold leading-none">{style.label}</h4>
              <p className="text-[9px] text-muted-foreground mt-1">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Show Last 4 digits */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card">
        <div className="space-y-0.5">
          <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-primary" />
            Keep Last 4 Digits Visible
          </label>
          <p className="text-[10px] text-muted-foreground">Recommended for verification (UIDAI compliant)</p>
        </div>
        <input
          type="checkbox"
          checked={showLast4}
          disabled={maskStyle !== "asterisks"}
          onChange={(e) => setShowLast4(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-0 cursor-pointer disabled:opacity-20"
          title="Keep Last 4 Digits Visible"
        />
      </div>

      {/* Manual Drawing guidance */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <span>💡</span>
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">Need manual redaction?</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            If there are signatures, names, or photos you want to hide, click the PDF preview page below to draw a manual masking box.
          </p>
        </div>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel
      files={rawFiles}
      slug="aadhaar-mask-pdf"
      options={{ showLast4, maskStyle }}
      onPreviewClick={handlePreviewPageClick}
    />
  );

  return (
    <ToolWorkspace
      toolName="Aadhaar Mask"
      toolDescription="Automatically find and mask Aadhaar numbers in your PDF files to protect identity privacy."
      toolIcon={<Shield className="h-5 w-5" />}
      accentColor="orange"
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

// Toast notification integration
import { toast } from "sonner";
export default AadhaarMaskWorkspace;
