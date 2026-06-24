import React from "react";
import { Sparkles } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const QrSection: React.FC<SectionProps> = ({ config, onConfigChange, onStatusMessage, onBusy, disabled, file }) => {
  const handleGenerate = async () => {
    if (!config.qrPayload?.trim()) { onStatusMessage("Enter text or URL first"); return; }
    onBusy(true);
    onStatusMessage("Generating QR...");
    try {
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(config.qrPayload)}&size=${config.qrSize === "small" ? 150 : config.qrSize === "large" ? 400 : 250}x${config.qrSize === "small" ? 150 : config.qrSize === "large" ? 400 : 250}`);
      const blob = await response.blob();
      onConfigChange("qrResultUrl", URL.createObjectURL(blob));
      onStatusMessage("QR code ready");
    } catch (err: any) {
      onStatusMessage(err.message || "QR generation failed");
    } finally {
      onBusy(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Content</label>
        <input type="text" value={config.qrPayload || ""} onChange={(e) => onConfigChange("qrPayload", e.target.value)}
          placeholder="Text or URL"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" disabled={disabled} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["small", "medium", "large"].map((size) => (
          <button key={size} type="button" onClick={() => onConfigChange("qrSize", size)}
            className={`rounded-xl border py-2 text-xs font-bold transition cursor-pointer ${
              (config.qrSize || "medium") === size ? "border-emerald-500 bg-emerald-500/10 text-emerald-350" : "border-white/10 bg-slate-950 text-slate-400 hover:bg-slate-900"
            }`} disabled={disabled}>
            {size}
          </button>
        ))}
      </div>
      <button type="button" onClick={handleGenerate}
        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-white hover:bg-emerald-400 transition cursor-pointer shadow-md" disabled={disabled}>
        Generate QR
      </button>
      {config.qrResultUrl && (
        <div className="flex justify-center rounded-xl border border-white/10 bg-white p-3">
          <img src={config.qrResultUrl} alt="QR Code" className="max-w-[180px] h-auto" width="180" height="180" />
        </div>
      )}
    </div>
  );
};

export const qrPlugin: EditorPlugin = {
  id: "qr",
  name: "QR Code Generator",
  sections: [
    { id: "qr", label: "QR Code", icon: <Sparkles className="h-4 w-4" />, component: QrSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
