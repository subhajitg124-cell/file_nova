import React from "react";
import { Droplets } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const WatermarkSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Text</label>
      <input type="text" value={config.watermarkText || ""} onChange={(e) => onConfigChange("watermarkText", e.target.value)}
        placeholder="Watermark text"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" disabled={disabled} />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        <span>Opacity</span>
        <span className="font-mono">{config.watermarkOpacity || 40}%</span>
      </div>
      <input type="range" min={5} max={95} value={config.watermarkOpacity || 40}
        onChange={(e) => onConfigChange("watermarkOpacity", Number(e.target.value))}
        className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400" disabled={disabled} />
    </div>
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Rotation</label>
      <input type="range" min={-45} max={45} value={config.watermarkRotation || 0}
        onChange={(e) => onConfigChange("watermarkRotation", Number(e.target.value))}
        className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400" disabled={disabled} />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Scale</label>
        <input type="range" min={50} max={200} value={config.watermarkScale || 100}
          onChange={(e) => onConfigChange("watermarkScale", Number(e.target.value))}
          className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400" disabled={disabled} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Position</label>
        <select value={config.watermarkPosition || "center"} onChange={(e) => onConfigChange("watermarkPosition", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled}>
          <option value="center">Center</option>
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="tile">Tile</option>
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <input type="number" value={config.watermarkMarginX || 20} onChange={(e) => onConfigChange("watermarkMarginX", Number(e.target.value))}
        placeholder="Margin X" title="Margin X"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled} />
      <input type="number" value={config.watermarkMarginY || 20} onChange={(e) => onConfigChange("watermarkMarginY", Number(e.target.value))}
        placeholder="Margin Y" title="Margin Y"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none" disabled={disabled} />
    </div>
  </div>
);

export const watermarkPlugin: EditorPlugin = {
  id: "watermark",
  name: "Watermark PDF",
  sections: [
    { id: "watermark", label: "Watermark Settings", icon: <Droplets className="h-4 w-4" />, component: WatermarkSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
