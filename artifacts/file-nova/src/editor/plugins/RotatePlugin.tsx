import React from "react";
import { RotateCcw, RotateCw, RotateCw as Rotate180, Undo2 } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { PremiumButton } from "../components/PremiumButton";

const RotateSection: React.FC<SectionProps> = ({ config, onConfigChange, mode, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80 dark:text-muted-foreground mb-2.5">Rotate Page</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { angle: -90, label: "90° L", icon: <RotateCcw className="h-4 w-4" /> },
          { angle: 90, label: "90° R", icon: <RotateCw className="h-4 w-4" /> },
          { angle: 180, label: "180°", icon: <Rotate180 className="h-4 w-4" /> },
        ].map(({ angle, label, icon }) => (
          <button key={angle} type="button" onClick={() => onConfigChange("rotation", (config.rotation || 0) + angle)}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border dark:border-border bg-card/80 dark:bg-background py-3 text-xs font-bold text-muted-foreground dark:text-foreground/90 hover:bg-muted/80 dark:hover:bg-muted hover:border-purple-500/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer" disabled={disabled}>
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <label className="flex items-center gap-3 rounded-lg border border-border dark:border-border bg-card/80 dark:bg-background/60 px-3 py-2.5 cursor-pointer hover:bg-muted/80 dark:hover:bg-muted transition">
        <input type="checkbox" checked={!!config.rotateAll} onChange={(e) => onConfigChange("rotateAll", e.target.checked)}
          className="h-4 w-4 rounded border-border dark:border-muted text-purple-500 focus:ring-purple-500/30 cursor-pointer" disabled={disabled} />
        <span className="text-xs font-bold text-foreground/80 dark:text-foreground/90">Apply to All Pages</span>
      </label>
    </BentoCard>

    {mode === "advanced" && (
      <BentoCard size="sm" hover={false}>
        <p className="text-[10px] uppercase tracking-wider font-bold text-purple-500 mb-2">Current Rotation</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground dark:text-muted-foreground/80">{config.rotation || 0}° total rotation</span>
          <PremiumButton variant="ghost" size="sm" icon={<Undo2 className="h-3 w-3" />} onClick={() => onConfigChange("rotation", 0)} disabled={disabled}>
            Reset
          </PremiumButton>
        </div>
      </BentoCard>
    )}
  </div>
);

export const rotatePlugin: EditorPlugin = {
  id: "rotate",
  name: "Rotate PDF",
  sections: [
    { id: "rotate", label: "Rotate Pages", description: "Adjust page orientation", icon: <RotateCw className="h-4 w-4" />, component: RotateSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
