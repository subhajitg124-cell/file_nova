import React from "react";
import { Pencil, RotateCcw, RotateCw } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const ImageAdjustSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-4">
    {["brightness", "contrast", "saturation"].map((key) => (
      <div key={key} className="space-y-2">
        <div className="flex justify-between text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
          <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
          <span className="text-emerald-400 font-mono">{config[key] || 0}%</span>
        </div>
        <input type="range" min={-100} max={100} value={config[key] || 0}
          onChange={(e) => onConfigChange(key, Number(e.target.value))}
          className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400" disabled={disabled} />
      </div>
    ))}
    <div className="grid grid-cols-3 gap-2">
      <button type="button" onClick={() => onConfigChange("rotation", (config.rotation || 0) - 90)}
        className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 transition cursor-pointer" disabled={disabled}>
        <RotateCcw className="h-3.5 w-3.5" /> 90°
      </button>
      <button type="button" onClick={() => onConfigChange("rotation", (config.rotation || 0) + 90)}
        className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 transition cursor-pointer" disabled={disabled}>
        <RotateCw className="h-3.5 w-3.5" /> 90°
      </button>
      <button type="button" onClick={() => onConfigChange("flipHorizontal", !config.flipHorizontal)}
        className={`rounded-xl border py-2 text-xs font-bold transition cursor-pointer ${
          config.flipHorizontal ? "border-emerald-500 bg-emerald-500/10 text-emerald-350" : "border-white/10 bg-slate-950 text-slate-400 hover:bg-slate-900"
        }`} disabled={disabled}>
        Flip
      </button>
    </div>
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Filter</label>
      <select value={config.filterPreset || "none"} onChange={(e) => onConfigChange("filterPreset", e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled}>
        <option value="none">None</option>
        <option value="grayscale">Grayscale</option>
        <option value="sepia">Sepia</option>
        <option value="high-contrast">High Contrast</option>
      </select>
    </div>
    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 cursor-pointer hover:bg-slate-900 transition">
      <input type="checkbox" checked={!!config.sharpness} onChange={(e) => onConfigChange("sharpness", e.target.checked)}
        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer" disabled={disabled} />
      <span className="text-xs font-bold text-slate-200">Sharpness</span>
    </label>
  </div>
);

const ResizeSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-2">
      <input type="number" value={config.resizeWidth || 800} onChange={(e) => onConfigChange("resizeWidth", Number(e.target.value))}
        placeholder="Width" title="Width"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled} />
      <input type="number" value={config.resizeHeight || 600} onChange={(e) => onConfigChange("resizeHeight", Number(e.target.value))}
        placeholder="Height" title="Height"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled} />
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { w: 413, h: 531, label: "Passport" },
        { w: 600, h: 600, label: "Visa" },
        { w: 1200, h: 1200, label: "Social" },
        { w: 1920, h: 1080, label: "HD" },
      ].map((p) => (
        <button key={p.label} type="button" onClick={() => { onConfigChange("resizeWidth", p.w); onConfigChange("resizeHeight", p.h); }}
          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-[11px] font-bold text-slate-300 hover:bg-slate-900 transition cursor-pointer" disabled={disabled}>
          {p.label} ({p.w}×{p.h})
        </button>
      ))}
    </div>
    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 cursor-pointer hover:bg-slate-900 transition">
      <input type="checkbox" checked={!!config.maintainAspect} onChange={(e) => onConfigChange("maintainAspect", e.target.checked)}
        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer" disabled={disabled} />
      <span className="text-xs font-bold text-slate-200">Maintain Aspect Ratio</span>
    </label>
  </div>
);

const CropSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-2">
      {["Free", "1:1", "4:3", "16:9", "3:2", "21:9"].map((r) => (
        <button key={r} type="button" onClick={() => onConfigChange("cropRatio", r)}
          className={`rounded-xl border py-2.5 text-[11px] font-bold transition-all cursor-pointer ${
            config.cropRatio === r ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md" : "border-white/[0.08] bg-slate-950/60 hover:bg-slate-900 text-slate-400"
          }`} disabled={disabled}>
          {r}
        </button>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <input type="number" value={config.cropX || 0} onChange={(e) => onConfigChange("cropX", Number(e.target.value))}
        placeholder="X" title="Crop X"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled} />
      <input type="number" value={config.cropY || 0} onChange={(e) => onConfigChange("cropY", Number(e.target.value))}
        placeholder="Y" title="Crop Y"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled} />
      <input type="number" value={config.cropW || 800} onChange={(e) => onConfigChange("cropW", Number(e.target.value))}
        placeholder="W" title="Crop Width"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled} />
      <input type="number" value={config.cropH || 600} onChange={(e) => onConfigChange("cropH", Number(e.target.value))}
        placeholder="H" title="Crop Height"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled} />
    </div>
  </div>
);

export const imageAdjustPlugin: EditorPlugin = {
  id: "image-adjust",
  name: "Image Editor",
  sections: [
    { id: "adjust", label: "Adjustments", icon: <Pencil className="h-4 w-4" />, component: ImageAdjustSection, defaultOpen: true },
    { id: "resize", label: "Resize", icon: <Pencil className="h-4 w-4" />, component: ResizeSection },
    { id: "crop", label: "Crop", icon: <Pencil className="h-4 w-4" />, component: CropSection },
  ],
  previewType: "image",
  onSave: async (file) => file,
};
