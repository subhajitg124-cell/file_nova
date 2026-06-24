import React from "react";
import { Share2 } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const ExportSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Format</label>
      <div className="grid grid-cols-2 gap-2">
        {(["jpg", "png", "webp", "pdf"] as const).map((fmt) => (
          <button key={fmt} type="button" onClick={() => onConfigChange("exportFormat", fmt)}
            className={`flex flex-col items-center rounded-xl border p-2.5 transition-all cursor-pointer ${
              config.exportFormat === fmt ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md font-black" : "border-white/10 bg-slate-950 text-slate-400 hover:bg-slate-900"
            }`} disabled={disabled}>
            <span className="text-[11px] uppercase font-bold">{fmt}</span>
            <span className="text-[8.5px] text-slate-500 mt-0.5">
              {fmt === "png" && "Lossless"}
              {fmt === "jpg" && "Compressed"}
              {fmt === "webp" && "Modern"}
              {fmt === "pdf" && "Document"}
            </span>
          </button>
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        <span>Quality</span>
        <span className="text-emerald-400 font-mono">{config.exportQuality || 85}%</span>
      </div>
      <input type="range" min={10} max={100} value={config.exportQuality || 85}
        onChange={(e) => onConfigChange("exportQuality", Number(e.target.value))}
        className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400" disabled={disabled} />
    </div>
  </div>
);

export const exportPlugin: EditorPlugin = {
  id: "export",
  name: "Export & Share",
  sections: [
    { id: "export", label: "Export Settings", icon: <Share2 className="h-4 w-4" />, component: ExportSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
