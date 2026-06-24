import React from "react";
import { RotateCcw, RotateCw, RotateCw as Rotate180 } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const RotateSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-2">
      {[
        { angle: -90, label: "90° L", icon: <RotateCcw className="h-4 w-4" /> },
        { angle: 90, label: "90° R", icon: <RotateCw className="h-4 w-4" /> },
        { angle: 180, label: "180°", icon: <Rotate180 className="h-4 w-4" /> },
      ].map(({ angle, label, icon }) => (
        <button key={angle} type="button" onClick={() => onConfigChange("rotation", (config.rotation || 0) + angle)}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950 py-3 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition cursor-pointer" disabled={disabled}>
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 cursor-pointer hover:bg-slate-900 transition">
      <input type="checkbox" checked={!!config.rotateAll} onChange={(e) => onConfigChange("rotateAll", e.target.checked)}
        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer" disabled={disabled} />
      <span className="text-xs font-bold text-slate-200">Rotate All Pages</span>
    </label>
    <button type="button" onClick={() => onConfigChange("rotation", 0)}
      className="w-full rounded-xl border border-white/10 bg-slate-950 py-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer" disabled={disabled}>
      Reset Rotation
    </button>
  </div>
);

export const rotatePlugin: EditorPlugin = {
  id: "rotate",
  name: "Rotate PDF",
  sections: [
    { id: "rotate", label: "Rotate Pages", icon: <RotateCw className="h-4 w-4" />, component: RotateSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
