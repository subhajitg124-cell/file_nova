import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Shield, Eye, Settings, HelpCircle } from "lucide-react";

export const AadhaarMaskWorkspace: React.FC = () => {
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
  } = useToolProcessor("aadhaar-mask-pdf", "aadhaar-mask");

  // Local configurations
  const [autoDetect, setAutoDetect] = useState(true);
  const [maskStyle, setMaskStyle] = useState<"black" | "blur" | "asterisks">("black");
  const [showLast4, setShowLast4] = useState(true);
  const [manualMasks, setManualMasks] = useState<any[]>([]);

  const isReady = files.length > 0;

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
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.05] bg-slate-950/40">
        <div className="space-y-0.5">
          <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-orange-400" />
            Auto-Detect Aadhaar Numbers
          </label>
          <p className="text-[10px] text-slate-400">Locates Aadhaar digits in PDF page layers automatically</p>
        </div>
        <input
          type="checkbox"
          checked={autoDetect}
          onChange={(e) => setAutoDetect(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-white/10 text-orange-600 focus:ring-0 cursor-pointer"
        />
      </div>

      {/* Mask style */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Redaction style</label>
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
                  ? "border-orange-500 bg-orange-500/10 text-white"
                  : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-300"
              }`}
            >
              <h4 className="text-xs font-bold leading-none">{style.label}</h4>
              <p className="text-[9px] text-slate-500 mt-1">{style.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Show Last 4 digits */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.05] bg-slate-950/40">
        <div className="space-y-0.5">
          <label className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-orange-400" />
            Keep Last 4 Digits Visible
          </label>
          <p className="text-[10px] text-slate-400">Recommended for verification (UIDAI compliant)</p>
        </div>
        <input
          type="checkbox"
          checked={showLast4}
          disabled={maskStyle !== "asterisks"}
          onChange={(e) => setShowLast4(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-white/10 text-orange-600 focus:ring-0 cursor-pointer disabled:opacity-20"
        />
      </div>

      {/* Manual Drawing guidance */}
      <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-4 flex gap-2.5 text-xs text-slate-400 font-medium">
        <span>💡</span>
        <div className="space-y-1">
          <p className="font-bold text-slate-300">Need manual redaction?</p>
          <p className="text-[10px] leading-relaxed text-slate-400">
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
