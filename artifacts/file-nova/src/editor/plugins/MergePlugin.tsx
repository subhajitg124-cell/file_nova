import React from "react";
import { Layers, Plus, RotateCcw, Trash2, Copy, FilePlus } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const MergeSection: React.FC<SectionProps> = ({ config, onConfigChange, onStatusMessage, disabled }) => {
  const files: { name: string; id?: string }[] = config.mergeFiles || [];
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Documents ({files.length})</label>
        <input type="file" accept="application/pdf" multiple
          onChange={(e) => {
            const newFiles = Array.from(e.target.files || []);
            if (newFiles.length) {
              onConfigChange("mergeFiles", [...files, ...newFiles.map((f) => ({ name: f.name, id: f.name + Math.random() }))]);
              onStatusMessage(`${newFiles.length} file(s) added`);
            }
          }}
          className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:cursor-pointer" disabled={disabled} />
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {files.map((f, i) => (
          <div key={f.id || i} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-slate-900/60 px-3 py-2 text-xs">
            <span className="truncate max-w-[160px] text-slate-200">{f.name}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => {
                const arr = [...files];
                if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; onConfigChange("mergeFiles", arr); }
              }} className="text-slate-500 hover:text-slate-200 transition cursor-pointer p-1" disabled={disabled || i === 0}>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </button>
              <button type="button" onClick={() => {
                const arr = [...files];
                if (i < arr.length - 1) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; onConfigChange("mergeFiles", arr); }
              }} className="text-slate-500 hover:text-slate-200 transition cursor-pointer p-1" disabled={disabled || i === files.length - 1}>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button type="button" onClick={() => onConfigChange("mergeFiles", files.filter((_, idx) => idx !== i))}
                className="text-red-400 hover:text-red-300 transition cursor-pointer p-1" disabled={disabled}>
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {[
        { key: "insertBlank", label: "Insert Blank Page" },
        { key: "duplicateLast", label: "Duplicate Last Page" },
      ].map(({ key, label }) => (
        <button key={key} type="button" onClick={() => {
          onConfigChange(key, true);
          onStatusMessage(label);
          setTimeout(() => onConfigChange(key, false), 200);
        }}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950 py-2 text-[11px] font-bold text-slate-300 hover:bg-slate-900 transition cursor-pointer" disabled={disabled}>
          {key === "insertBlank" ? <FilePlus className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {label}
        </button>
      ))}
    </div>
  );
};

export const mergePlugin: EditorPlugin = {
  id: "merge",
  name: "Merge PDF",
  sections: [
    { id: "merge", label: "File Order & Options", icon: <Layers className="h-4 w-4" />, component: MergeSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
