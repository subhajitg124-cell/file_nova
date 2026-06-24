import React from "react";
import { Crop, Maximize2, Minimize2, Ruler } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { PresetChips } from "../components/PresetChips";
import { HintCard } from "../components/HintCard";

const sizePresets = [
  { id: "2x2", label: "2\"x2\"", description: "US Passport" },
  { id: "35x45", label: "35x45mm", description: "Indian Passport" },
  { id: "51x51", label: "51x51mm", description: "Standard" },
  { id: "custom", label: "Custom", description: "Manual input" },
];

const PanResizeSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <SettingRow label="Output Size">
        <PresetChips
          chips={sizePresets}
          value={config.panSize || "35x45"}
          onChange={(v) => onConfigChange("panSize", v)}
          disabled={disabled}
        />
      </SettingRow>
    </BentoCard>

    {config.panSize === "custom" && (
      <BentoCard size="sm" hover={false}>
        <div className="grid grid-cols-2 gap-3">
          <SettingRow label="Width (mm)">
            <input type="number" value={config.panWidth || 35} onChange={(e) => onConfigChange("panWidth", Number(e.target.value))}
              min={10} max={200}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30" disabled={disabled} />
          </SettingRow>
          <SettingRow label="Height (mm)">
            <input type="number" value={config.panHeight || 45} onChange={(e) => onConfigChange("panHeight", Number(e.target.value))}
              min={10} max={200}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30" disabled={disabled} />
          </SettingRow>
        </div>
      </BentoCard>
    )}

    <BentoCard size="sm" hover={false}>
      <SettingRow label="Maintain Aspect Ratio">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={config.keepAspectRatio !== false} onChange={(e) => onConfigChange("keepAspectRatio", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-purple-500 focus:ring-purple-500/30 cursor-pointer" disabled={disabled} />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Lock ratio</span>
        </label>
      </SettingRow>
    </BentoCard>

    <HintCard>Standard passport size is 35x45mm (2x2 inches). Use Custom for other sizes.</HintCard>
  </div>
);

export const panResizePlugin: EditorPlugin = {
  id: "pan-resize",
  name: "PAN Card Resize",
  sections: [
    { id: "resize", label: "Resize Settings", description: "Passport photo size", icon: <Crop className="h-4 w-4" />, component: PanResizeSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
