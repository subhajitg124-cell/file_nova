import React from "react";
import { Scissors, FileDown, Layers, Hash } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { SegmentedControl } from "../components/SegmentedControl";
import { HintCard } from "../components/HintCard";

const SplitSection: React.FC<SectionProps> = ({ config, onConfigChange, mode, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <SettingRow label="Split Mode">
        <SegmentedControl
          options={[
            { id: "range", label: "Range" },
            { id: "every", label: "Every X" },
            { id: "extract", label: "Extract" },
          ]}
          value={config.splitMode || "range"}
          onChange={(v) => onConfigChange("splitMode", v)}
          disabled={disabled}
        />
      </SettingRow>
    </BentoCard>

    {config.splitMode === "range" && (
      <BentoCard size="sm" hover={false}>
        <SettingRow label="Page Range" helpText="e.g. 1-3,5,7-9">
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input type="text" value={config.splitRange || ""} onChange={(e) => onConfigChange("splitRange", e.target.value)}
              placeholder="1-3,5,7-9"
              className="w-full rounded-xl border-border bg-card pl-8 pr-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" disabled={disabled} />
          </div>
        </SettingRow>
      </BentoCard>
    )}

    {config.splitMode === "every" && (
      <BentoCard size="sm" hover={false}>
        <SettingRow label="Every X Pages">
          <input type="number" min={1} value={config.splitEvery || 2} onChange={(e) => onConfigChange("splitEvery", Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30" disabled={disabled} />
        </SettingRow>
      </BentoCard>
    )}

    {config.splitMode === "extract" && (
      <BentoCard size="sm" hover={false}>
        <SettingRow label="Page Numbers" helpText="e.g. 1,3,5">
          <input type="text" value={config.extractPages || ""} onChange={(e) => onConfigChange("extractPages", e.target.value)}
            placeholder="1,3,5"
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30" disabled={disabled} />
        </SettingRow>
      </BentoCard>
    )}

    {mode === "advanced" && (
      <BentoCard size="sm" hover={false}>
        <SettingRow label="Output Naming">
          <div className="flex gap-2">
            <input type="text" value={config.outputPrefix || "split"} onChange={(e) => onConfigChange("outputPrefix", e.target.value)}
              placeholder="Prefix"
              className="flex-1 rounded-xl border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary" disabled={disabled} />
            <select value={config.namingStyle || "numbered"} onChange={(e) => onConfigChange("namingStyle", e.target.value)}
              className="rounded-xl border-border bg-card px-2 py-2 text-xs text-muted-foreground outline-none" disabled={disabled}>
              <option value="numbered">1,2,3</option>
              <option value="range">Range</option>
            </select>
          </div>
        </SettingRow>
      </BentoCard>
    )}

    <HintCard>Use commas to separate page numbers and hyphens for ranges (e.g. 1-3,5,7-9).</HintCard>
  </div>
);

export const splitPlugin: EditorPlugin = {
  id: "split",
  name: "Split PDF",
  sections: [
    { id: "split", label: "Split Options", description: "Choose how to split", icon: <Scissors className="h-4 w-4" />, component: SplitSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
