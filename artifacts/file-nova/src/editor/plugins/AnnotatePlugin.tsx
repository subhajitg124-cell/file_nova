import React from "react";
import { Pen, Pencil, MousePointer2, Type, Trash2, X, Palette } from "lucide-react";
import type { EditorPlugin, SectionProps, Annotation } from "../types";
import { BentoCard } from "../components/BentoCard";
import { HintCard } from "../components/HintCard";

const colors = [
  { value: "#000000", label: "Black" },
  { value: "#2563eb", label: "Blue" },
  { value: "#dc2626", label: "Red" },
  { value: "#059669", label: "Green" },
  { value: "#d97706", label: "Amber" },
];

const AnnotateSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => {
  const activeMode: string = config.annotationMode || "select";
  const annotations: Annotation[] = config.annotations || [];
  const drawColor: string = config.drawColor || "#000000";

  return (
    <div className="space-y-3">
      <BentoCard size="sm" hover={false}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { mode: "select", label: "Select", icon: <MousePointer2 className="h-3.5 w-3.5" /> },
            { mode: "draw", label: "Draw", icon: <Pencil className="h-3.5 w-3.5" /> },
            { mode: "text", label: "Text", icon: <Type className="h-3.5 w-3.5" /> },
          ].map(({ mode, label, icon }) => (
            <button key={mode} type="button" onClick={() => onConfigChange("annotationMode", mode)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-[10px] font-bold transition-all cursor-pointer ${
                activeMode === mode
                  ? "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              }`} disabled={disabled}>
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </BentoCard>

      <BentoCard size="sm" hover={false}>
        <div className="flex items-center gap-2">
          <Palette className="h-3 w-3 text-slate-400" />
          <div className="flex gap-1.5">
            {colors.map((color) => (
              <button key={color.value} type="button" onClick={() => onConfigChange("drawColor", color.value)}
                className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer ${
                  drawColor === color.value ? "border-purple-500 scale-110 shadow-sm" : "border-slate-200 dark:border-white/20 hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }} aria-label={color.label} title={color.label} disabled={disabled} />
            ))}
          </div>
        </div>
      </BentoCard>

      {annotations.length > 0 && (
        <BentoCard size="sm" hover={false}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">{annotations.length} placed</span>
            <button type="button" onClick={() => onConfigChange("annotations", [])}
              className="text-[10px] text-red-500 hover:text-red-400 transition cursor-pointer flex items-center gap-1" disabled={disabled}>
              <Trash2 className="h-3 w-3" /> Clear All
            </button>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {annotations.map((ann: Annotation, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/60 px-2.5 py-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ann.color }} />
                  <span>{ann.type === "path" ? "Signature" : `"${ann.text?.slice(0, 12)}..."`}</span>
                </span>
                <button type="button" onClick={() => onConfigChange("removeAnnotationIndex", i)}
                  className="text-slate-400 hover:text-red-500 transition cursor-pointer" disabled={disabled}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </BentoCard>
      )}

      <HintCard>Select Draw to freehand sign or draw on the document. Select Text to add typed annotations.</HintCard>
    </div>
  );
};

export const annotatePlugin: EditorPlugin = {
  id: "annotate",
  name: "Annotate PDF",
  sections: [
    { id: "annotate", label: "Signature & Text", description: "Draw or type on PDF", icon: <Pen className="h-4 w-4" />, component: AnnotateSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
