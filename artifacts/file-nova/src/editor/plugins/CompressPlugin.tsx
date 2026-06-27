import React from "react";
import { Zap, FileSymlink, Image, FileText, Rocket, Scale, FileDown } from "lucide-react";
import type { EditorPlugin, SectionProps, PresetDefinition } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { PresetChips } from "../components/PresetChips";
import { HintCard } from "../components/HintCard";

const CompressSection: React.FC<SectionProps> = ({ config, onConfigChange, mode, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <SettingRow label="Compression Level">
        <PresetChips
          chips={[
            { id: "low", label: "Low", description: "Minimal" },
            { id: "medium", label: "Medium", description: "Balanced" },
            { id: "high", label: "High", description: "Maximum" },
          ]}
          value={config.compressionLevel || "medium"}
          onChange={(v) => onConfigChange("compressionLevel", v)}
          disabled={disabled}
        />
      </SettingRow>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <SettingRow label={`Quality ${Math.round((config.quality || 0.65) * 100)}%`}>
        <input type="range" min={10} max={100} value={config.quality * 100 || 65}
          onChange={(e) => onConfigChange("quality", Number(e.target.value) / 100)}
          className="h-1 w-full rounded-lg appearance-none cursor-pointer accent-purple-500 bg-muted dark:bg-muted" disabled={disabled} />
      </SettingRow>
    </BentoCard>

    <BentoCard size="sm" hover={false} accent="success">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80 dark:text-muted-foreground">Estimated Size</span>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{config.estimatedSize || "—"}</span>
      </div>
    </BentoCard>

    {mode === "advanced" && (
      <BentoCard size="sm" hover={false}>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-purple-500">Advanced Options</p>
          {[
            { key: "grayscale", label: "Grayscale Conversion", icon: <Image className="h-3 w-3" /> },
            { key: "removeMetadata", label: "Remove Metadata", icon: <FileText className="h-3 w-3" /> },
            { key: "optimizeFonts", label: "Optimize Fonts", icon: <FileSymlink className="h-3 w-3" /> },
            { key: "optimizeImages", label: "Optimize Images", icon: <Image className="h-3 w-3" /> },
          ].map(({ key, label, icon }) => (
            <label key={key} className="flex items-center gap-3 rounded-lg border border-border dark:border-border bg-card/80 dark:bg-background/60 px-3 py-2 cursor-pointer hover:bg-muted/80 dark:hover:bg-muted transition">
              <input type="checkbox" checked={!!config[key]} onChange={(e) => onConfigChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-border dark:border-muted text-purple-500 focus:ring-purple-500/30 cursor-pointer" disabled={disabled} />
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 dark:text-foreground/90">
                {icon}{label}
              </span>
            </label>
          ))}
        </div>
      </BentoCard>
    )}

    <HintCard>Higher compression may reduce document quality. Preview before saving.</HintCard>
  </div>
);

const compressPresets: PresetDefinition[] = [
  { id: "fast", label: "Fast Compression", description: "Minimal size reduction", icon: <Rocket className="h-4 w-4" />, config: { compressionLevel: "low", quality: 0.8 } },
  { id: "balanced", label: "Balanced", description: "Good quality & size tradeoff", icon: <Scale className="h-4 w-4" />, config: { compressionLevel: "medium", quality: 0.65 } },
  { id: "maximum", label: "Maximum", description: "Smallest file size", icon: <FileDown className="h-4 w-4" />, config: { compressionLevel: "high", quality: 0.3 } },
];

export const compressPlugin: EditorPlugin = {
  id: "compress",
  name: "Compress PDF",
  presets: compressPresets,
  sections: [
    { id: "compress", label: "Compression Settings", description: "Size & quality balance", icon: <Zap className="h-4 w-4" />, component: CompressSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
