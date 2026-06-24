import React from "react";
import { Zap, RotateCcw } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const CompressSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => {
  const levels = ["Low", "Medium", "High"];
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Compression Level</label>
        <div className="grid grid-cols-3 gap-2">
          {levels.map((level) => (
            <button
              key={level} type="button"
              onClick={() => onConfigChange("quality", level === "Low" ? 0.4 : level === "Medium" ? 0.65 : 0.85)}
              className={`rounded-xl border py-2 text-[11px] font-bold transition-all cursor-pointer ${
                (level === "Low" && config.quality === 0.4) ||
                (level === "Medium" && config.quality === 0.65) ||
                (level === "High" && config.quality === 0.85)
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md"
                  : "border-white/[0.08] bg-slate-950/60 hover:bg-slate-900 text-slate-400"
              }`}
              disabled={disabled}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Output Quality</label>
        <input type="range" min={10} max={100} value={config.quality * 100 || 65}
          onChange={(e) => onConfigChange("quality", Number(e.target.value) / 100)}
          className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400" disabled={disabled} />
        <span className="text-xs text-slate-500 font-mono">{Math.round((config.quality || 0.65) * 100)}%</span>
      </div>
      {[
        { key: "grayscale", label: "Grayscale" },
        { key: "removeMetadata", label: "Remove Metadata" },
        { key: "optimizeFonts", label: "Optimize Fonts" },
        { key: "optimizeImages", label: "Optimize Images" },
      ].map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 cursor-pointer hover:bg-slate-900 transition">
          <input type="checkbox" checked={!!config[key]} onChange={(e) => onConfigChange(key, e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer" disabled={disabled} />
          <span className="text-xs font-bold text-slate-200">{label}</span>
        </label>
      ))}
      <div className="rounded-xl border border-white/[0.05] bg-slate-950 px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Estimated Size</p>
        <p className="text-xs text-emerald-400 font-mono mt-1">{config.estimatedSize || "—"}</p>
      </div>
    </div>
  );
};

export const compressPlugin: EditorPlugin = {
  id: "compress",
  name: "Compress PDF",
  sections: [
    { id: "compress", label: "Compression Settings", icon: <Zap className="h-4 w-4" />, component: CompressSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
