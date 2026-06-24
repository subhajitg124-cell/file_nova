import React from "react";
import { Layers, Plus, Trash2, Copy, FilePlus, ArrowUp, ArrowDown } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { PremiumButton } from "../components/PremiumButton";
import { HintCard } from "../components/HintCard";

const MergeSection: React.FC<SectionProps> = ({ config, onConfigChange, onStatusMessage, mode, disabled }) => {
  const files: { name: string; id?: string }[] = config.mergeFiles || [];
  return (
    <div className="space-y-3">
      <BentoCard size="sm" hover={false}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Documents ({files.length})</span>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-purple-500 hover:text-purple-400 cursor-pointer">
              <Plus className="h-3 w-3" />
              <input type="file" accept="application/pdf" multiple
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  if (newFiles.length) {
                    onConfigChange("mergeFiles", [...files, ...newFiles.map((f) => ({ name: f.name, id: f.name + Math.random() }))]);
                    onStatusMessage(`${newFiles.length} file(s) added`);
                  }
                }}
                className="hidden" disabled={disabled} />
              Add Files
            </label>
          </div>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {files.length === 0 ? (
              <div className="text-center py-4 text-[11px] text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30">
                Drop PDFs or click Add Files
              </div>
            ) : files.map((f, i) => (
              <div key={f.id || i}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 px-3 py-2.5 text-xs transition hover:bg-slate-100 dark:hover:bg-slate-900 group">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 w-5">{i + 1}.</span>
                  <span className="truncate max-w-[140px] text-slate-600 dark:text-slate-300 font-medium">{f.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button type="button" onClick={() => { const a = [...files]; if (i > 0) { [a[i - 1], a[i]] = [a[i], a[i - 1]]; onConfigChange("mergeFiles", a); } }}
                    className="h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer" disabled={disabled || i === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => { const a = [...files]; if (i < a.length - 1) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; onConfigChange("mergeFiles", a); } }}
                    className="h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer" disabled={disabled || i === files.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => onConfigChange("mergeFiles", files.filter((_, idx) => idx !== i))}
                    className="h-6 w-6 flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer" disabled={disabled}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BentoCard>

      {mode === "advanced" && (
        <BentoCard size="sm" hover={false}>
          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-500 mb-2">Page Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "insertBlank", label: "Insert Blank Page", icon: <FilePlus className="h-3.5 w-3.5" /> },
              { key: "duplicateLast", label: "Duplicate Last", icon: <Copy className="h-3.5 w-3.5" /> },
            ].map(({ key, label, icon }) => (
              <button key={key} type="button" onClick={() => { onConfigChange(key, true); setTimeout(() => onConfigChange(key, false), 200); }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer" disabled={disabled}>
                {icon}{label}
              </button>
            ))}
          </div>
        </BentoCard>
      )}

      <HintCard>Drag the handle or use arrows to reorder files. The merge order follows the list from top to bottom.</HintCard>
    </div>
  );
};

export const mergePlugin: EditorPlugin = {
  id: "merge",
  name: "Merge PDF",
  sections: [
    { id: "merge", label: "File Order & Options", description: "Arrange files for merging", icon: <Layers className="h-4 w-4" />, component: MergeSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
