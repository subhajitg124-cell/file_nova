import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { removeImageBackground } from "@/lib/processing/image/client-image";
import { Sliders, Eraser } from "lucide-react";
import { toast } from "sonner";

export const BGRemoverWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing: processorProcessing,
    isUploading,
    progress: processorProgress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
  } = useToolProcessor("remove-background", "bg-remove");

  // Local configurations
  const [backgroundType, setBackgroundType] = useState<"transparent" | "white" | "color">("transparent");
  const [customBgColor, setCustomBgColor] = useState("#3b82f6");
  const [localProcessing, setLocalProcessing] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  const isReady = files.length > 0;

  const handleProcess = async () => {
    if (rawFiles.length === 0) return;

    setLocalProcessing(true);
    setLocalProgress(5);
    
    try {
      const file = rawFiles[0];
      const bgFill = backgroundType === "transparent"
        ? undefined
        : backgroundType === "white"
          ? "#ffffff"
          : customBgColor;
          
      const resultBlob = await removeImageBackground(
        file,
        backgroundType === "transparent" ? "png" : "jpeg",
        bgFill,
        (pct) => setLocalProgress(pct)
      );

      setLocalProgress(100);
      await runProcessing({}, resultBlob);
    } catch (err: any) {
      toast.error(err.message || "Background removal failed.");
    } finally {
      setLocalProcessing(false);
      setLocalProgress(0);
    }
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Background Options */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">Background Replacement</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "transparent", label: "Transparent", desc: "Clean cutout" },
            { id: "white", label: "Solid White", desc: "Form standard" },
            { id: "color", label: "Solid Color", desc: "Custom fill" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setBackgroundType(type.id as any)}
              className={`p-3 rounded-2xl border text-left hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                backgroundType === type.id
                  ? "border-cyan-500 bg-cyan-500/10 text-white"
                  : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-300"
              }`}
            >
              <h4 className="text-xs font-bold leading-none">{type.label}</h4>
              <p className="text-[9px] text-slate-500 mt-1">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom color picker (when Color chosen) */}
      {backgroundType === "color" && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-400">Pick Background Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customBgColor}
              onChange={(e) => setCustomBgColor(e.target.value)}
              className="h-10 w-12 rounded border border-white/10 bg-slate-900 cursor-pointer p-0.5"
              title="Background color picker"
            />
            <input
              type="text"
              value={customBgColor}
              onChange={(e) => setCustomBgColor(e.target.value)}
              className="bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              title="Background hex color code"
              placeholder="#3b82f6"
            />
          </div>
        </div>
      )}

      {/* Manual Refinement Warning Info */}
      <div className="bg-slate-950/60 border border-white/[0.05] rounded-2xl p-4 flex gap-2.5 text-xs text-slate-400 leading-relaxed font-medium">
        <span>✅</span>
        <p>
          Background removal is processed entirely inside your browser using secure ML models. No images are sent to the cloud.
        </p>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="bg-remover" />
  );

  return (
    <ToolWorkspace
      toolName="AI Background Remover"
      toolDescription="Instantly remove image backgrounds locally in your browser using high precision machine learning model neural networks."
      toolIcon={<Eraser className="h-5 w-5" />}
      accentColor="cyan"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={localProcessing || processorProcessing}
      isUploading={isUploading}
      progress={localProgress || processorProgress}
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
export default BGRemoverWorkspace;
