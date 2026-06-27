import React from "react";
import { Pencil, RotateCcw, RotateCw, FlipHorizontal, Crop, Ruler, Sun, Contrast, Droplets } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { PresetChips } from "../components/PresetChips";
import { SegmentedControl } from "../components/SegmentedControl";
import { PremiumButton } from "../components/PremiumButton";

const ImageAdjustSection: React.FC<SectionProps> = ({ config, onConfigChange, mode, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80 dark:text-muted-foreground mb-2 flex items-center gap-1.5">
        <Sun className="h-3 w-3" /> Adjustments
      </p>
      <div className="space-y-3">
        {[
          { key: "brightness", label: "Brightness", icon: <Sun className="h-3 w-3" /> },
          { key: "contrast", label: "Contrast", icon: <Contrast className="h-3 w-3" /> },
          { key: "saturation", label: "Saturation", icon: <Droplets className="h-3 w-3" /> },
        ].map(({ key, label, icon }) => (
          <div key={key}>
            <div className="flex justify-between text-[10.5px] font-bold text-muted-foreground dark:text-muted-foreground/80 mb-1">
              <span className="flex items-center gap-1">{icon}{label}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{config[key] || 0}%</span>
            </div>
            <input type="range" min={-100} max={100} value={config[key] || 0}
              onChange={(e) => onConfigChange(key, Number(e.target.value))}
              className="h-1 w-full rounded-lg appearance-none cursor-pointer accent-emerald-500 bg-muted dark:bg-muted" disabled={disabled} />
          </div>
        ))}
      </div>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80 dark:text-muted-foreground mb-2">Transform</p>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => onConfigChange("rotation", (config.rotation || 0) - 90)}
          className="flex items-center justify-center gap-1 rounded-xl border border-border dark:border-border bg-card/80 dark:bg-background px-3 py-2 text-xs font-bold text-muted-foreground dark:text-foreground/90 hover:bg-muted/80 dark:hover:bg-muted hover:border-emerald-500/30 transition cursor-pointer" disabled={disabled}>
          <RotateCcw className="h-3.5 w-3.5" /> 90°
        </button>
        <button type="button" onClick={() => onConfigChange("rotation", (config.rotation || 0) + 90)}
          className="flex items-center justify-center gap-1 rounded-xl border border-border dark:border-border bg-card/80 dark:bg-background px-3 py-2 text-xs font-bold text-muted-foreground dark:text-foreground/90 hover:bg-muted/80 dark:hover:bg-muted hover:border-emerald-500/30 transition cursor-pointer" disabled={disabled}>
          <RotateCw className="h-3.5 w-3.5" /> 90°
        </button>
        <button type="button" onClick={() => onConfigChange("flipHorizontal", !config.flipHorizontal)}
          className={`rounded-xl border py-2 text-xs font-bold transition cursor-pointer ${
            config.flipHorizontal
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-border dark:border-border bg-card/80 dark:bg-background text-muted-foreground dark:text-muted-foreground/80 hover:bg-muted/80 dark:hover:bg-muted"
          }`} disabled={disabled}>
          <FlipHorizontal className="h-3.5 w-3.5 inline mr-1" /> Flip
        </button>
      </div>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <SettingRow label="Filter">
        <select value={config.filterPreset || "none"} onChange={(e) => onConfigChange("filterPreset", e.target.value)}
          className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3 py-2 text-xs text-foreground/80 dark:text-foreground/90 outline-none focus:border-emerald-500" disabled={disabled}>
          <option value="none">None</option>
          <option value="grayscale">Grayscale</option>
          <option value="sepia">Sepia</option>
          <option value="high-contrast">High Contrast</option>
        </select>
      </SettingRow>
    </BentoCard>

    {mode === "advanced" && (
      <label className="flex items-center gap-3 rounded-xl border border-border dark:border-border bg-card/80 dark:bg-background/60 px-4 py-2.5 cursor-pointer hover:bg-muted/80 dark:hover:bg-muted transition">
        <input type="checkbox" checked={!!config.sharpness} onChange={(e) => onConfigChange("sharpness", e.target.checked)}
          className="h-4 w-4 rounded border-border dark:border-muted text-emerald-500 focus:ring-emerald-500/30 cursor-pointer" disabled={disabled} />
        <span className="text-xs font-bold text-foreground/80 dark:text-foreground/90">Apply Sharpness Enhancement</span>
      </label>
    )}
  </div>
);

const ResizeSection: React.FC<SectionProps> = ({ config, onConfigChange, mode, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <SettingRow label="Dimensions">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={config.resizeWidth || 800} onChange={(e) => onConfigChange("resizeWidth", Number(e.target.value))}
            placeholder="Width" title="Width"
            className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3 py-2 text-xs text-foreground dark:text-foreground outline-none focus:border-emerald-500" disabled={disabled} />
          <input type="number" value={config.resizeHeight || 600} onChange={(e) => onConfigChange("resizeHeight", Number(e.target.value))}
            placeholder="Height" title="Height"
            className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3 py-2 text-xs text-foreground dark:text-foreground outline-none focus:border-emerald-500" disabled={disabled} />
        </div>
      </SettingRow>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <SettingRow label="Quick Presets">
        <div className="grid grid-cols-2 gap-2">
          {[
            { w: 413, h: 531, label: "Passport" },
            { w: 600, h: 600, label: "Visa" },
            { w: 1200, h: 1200, label: "Social" },
            { w: 1920, h: 1080, label: "HD" },
          ].map((p) => (
            <button key={p.label} type="button" onClick={() => { onConfigChange("resizeWidth", p.w); onConfigChange("resizeHeight", p.h); }}
              className="rounded-xl border border-border dark:border-border bg-card/80 dark:bg-background px-3 py-2 text-[11px] font-bold text-muted-foreground dark:text-foreground/90 hover:bg-muted/80 dark:hover:bg-muted hover:border-emerald-500/30 transition cursor-pointer" disabled={disabled}>
              {p.label} <span className="text-[9px] text-muted-foreground/80">({p.w}×{p.h})</span>
            </button>
          ))}
        </div>
      </SettingRow>
    </BentoCard>

    <label className="flex items-center gap-3 rounded-xl border border-border dark:border-border bg-card/80 dark:bg-background/60 px-4 py-2.5 cursor-pointer hover:bg-muted/80 dark:hover:bg-muted transition">
      <input type="checkbox" checked={!!config.maintainAspect} onChange={(e) => onConfigChange("maintainAspect", e.target.checked)}
        className="h-4 w-4 rounded border-border dark:border-muted text-emerald-500 focus:ring-emerald-500/30 cursor-pointer" disabled={disabled} />
      <span className="text-xs font-bold text-foreground/80 dark:text-foreground/90">Maintain Aspect Ratio</span>
    </label>
  </div>
);

const CropSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <SettingRow label="Aspect Ratio">
        <div className="grid grid-cols-2 gap-2">
          {["Free", "1:1", "4:3", "16:9", "3:2", "21:9"].map((r) => (
            <button key={r} type="button" onClick={() => onConfigChange("cropRatio", r)}
              className={`rounded-xl border py-2.5 text-[11px] font-bold transition-all cursor-pointer ${
                config.cropRatio === r
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "border-border dark:border-border bg-card/80 dark:bg-background/60 text-muted-foreground dark:text-muted-foreground/80 hover:bg-muted/80 dark:hover:bg-muted"
              }`} disabled={disabled}>
              {r}
            </button>
          ))}
        </div>
      </SettingRow>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <SettingRow label="Crop Area">
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={config.cropX || 0} onChange={(e) => onConfigChange("cropX", Number(e.target.value))}
            placeholder="X" title="Crop X"
            className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3 py-2 text-xs text-foreground dark:text-foreground outline-none focus:border-emerald-500" disabled={disabled} />
          <input type="number" value={config.cropY || 0} onChange={(e) => onConfigChange("cropY", Number(e.target.value))}
            placeholder="Y" title="Crop Y"
            className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3 py-2 text-xs text-foreground dark:text-foreground outline-none focus:border-emerald-500" disabled={disabled} />
          <input type="number" value={config.cropW || 800} onChange={(e) => onConfigChange("cropW", Number(e.target.value))}
            placeholder="W" title="Crop Width"
            className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3 py-2 text-xs text-foreground dark:text-foreground outline-none focus:border-emerald-500" disabled={disabled} />
          <input type="number" value={config.cropH || 600} onChange={(e) => onConfigChange("cropH", Number(e.target.value))}
            placeholder="H" title="Crop Height"
            className="w-full rounded-xl border border-border dark:border-border bg-card dark:bg-background px-3 py-2 text-xs text-foreground dark:text-foreground outline-none focus:border-emerald-500" disabled={disabled} />
        </div>
      </SettingRow>
    </BentoCard>
  </div>
);

export const imageAdjustPlugin: EditorPlugin = {
  id: "image-adjust",
  name: "Image Editor",
  sections: [
    { id: "adjust", label: "Adjustments", description: "Brightness, contrast & more", icon: <Pencil className="h-4 w-4" />, component: ImageAdjustSection, defaultOpen: true },
    { id: "resize", label: "Resize", description: "Change dimensions", icon: <Ruler className="h-4 w-4" />, component: ResizeSection },
    { id: "crop", label: "Crop", description: "Trim the image", icon: <Crop className="h-4 w-4" />, component: CropSection },
  ],
  previewType: "image",
  onSave: async (file) => file,
};
