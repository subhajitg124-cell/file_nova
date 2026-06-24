import React from "react";
import { Scissors } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const SplitSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => {
  const modes = [
    { id: "range", label: "Page Range" },
    { id: "every", label: "Every X Pages" },
    { id: "extract", label: "Extract Selected" },
    { id: "custom", label: "Custom Split" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {modes.map((m) => (
          <button key={m.id} type="button" onClick={() => onConfigChange("splitMode", m.id)}
            className={`rounded-xl border py-2.5 text-[11px] font-bold transition-all cursor-pointer ${
              config.splitMode === m.id
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md"
                : "border-white/[0.08] bg-slate-950/60 hover:bg-slate-900 text-slate-400"
            }`} disabled={disabled}>
            {m.label}
          </button>
        ))}
      </div>
      {config.splitMode === "range" && (
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Page Range</label>
          <input type="text" value={config.splitRange || ""} onChange={(e) => onConfigChange("splitRange", e.target.value)}
            placeholder="e.g. 1-3,5,7-9"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" disabled={disabled} />
        </div>
      )}
      {config.splitMode === "every" && (
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Every X Pages</label>
          <input type="number" min={1} value={config.splitEvery || 2} onChange={(e) => onConfigChange("splitEvery", Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" disabled={disabled} />
        </div>
      )}
      {config.splitMode === "extract" && (
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Page Numbers</label>
          <input type="text" value={config.extractPages || ""} onChange={(e) => onConfigChange("extractPages", e.target.value)}
            placeholder="e.g. 1,3,5"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" disabled={disabled} />
        </div>
      )}
    </div>
  );
};

export const splitPlugin: EditorPlugin = {
  id: "split",
  name: "Split PDF",
  sections: [
    { id: "split", label: "Split Options", icon: <Scissors className="h-4 w-4" />, component: SplitSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
