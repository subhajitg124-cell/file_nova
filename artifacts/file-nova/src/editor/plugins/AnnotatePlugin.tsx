import React from "react";
import { Pen, Pencil, MousePointer2, Type, Trash2, X } from "lucide-react";
import type { EditorPlugin, SectionProps, Annotation } from "../types";

const AnnotateSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => {
  const activeMode: string = config.annotationMode || "select";
  const annotations: Annotation[] = config.annotations || [];
  const drawColor: string = config.drawColor || "#000000";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { mode: "select", label: "Select", icon: <MousePointer2 className="h-3.5 w-3.5" /> },
          { mode: "draw", label: "Draw", icon: <Pencil className="h-3.5 w-3.5" /> },
          { mode: "text", label: "Text", icon: <Type className="h-3.5 w-3.5" /> },
        ].map(({ mode, label, icon }) => (
          <button key={mode} type="button" onClick={() => onConfigChange("annotationMode", mode)}
            className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-[10px] font-bold transition-all cursor-pointer ${
              activeMode === mode ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md" : "border-white/[0.08] bg-slate-950/60 hover:bg-slate-900 text-slate-400"
            }`} disabled={disabled}>
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Color</label>
        <div className="flex gap-2">
          {["#000000", "#0000ff", "#ff0000"].map((color) => (
            <button key={color} type="button" onClick={() => onConfigChange("drawColor", color)}
              className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${drawColor === color ? "border-emerald-500 scale-110" : "border-white/20"}`}
              style={{ backgroundColor: color }} aria-label={`Color ${color}`} disabled={disabled} />
          ))}
        </div>
      </div>
      {annotations.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">{annotations.length} placed</span>
            <button type="button" onClick={() => onConfigChange("annotations", [])}
              className="text-[10px] text-red-400 hover:text-red-300 transition cursor-pointer" disabled={disabled}>
              <Trash2 className="h-3 w-3 inline mr-1" />Clear
            </button>
          </div>
          {annotations.map((ann: Annotation, i: number) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-slate-950/60 px-2.5 py-1.5 text-[10px] text-slate-300">
              <span>{ann.type === "path" ? `✏️ Signature` : `📝 ${ann.text?.slice(0, 15)}`}</span>
              <button type="button" onClick={() => onConfigChange("removeAnnotationIndex", i)}
                className="text-slate-500 hover:text-red-400 transition cursor-pointer" disabled={disabled}>
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const annotatePlugin: EditorPlugin = {
  id: "annotate",
  name: "Annotate PDF",
  sections: [
    { id: "annotate", label: "Signature & Text", icon: <Pen className="h-4 w-4" />, component: AnnotateSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
