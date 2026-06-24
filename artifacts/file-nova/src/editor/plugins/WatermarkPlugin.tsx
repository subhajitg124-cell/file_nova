import React from "react";
import { Droplets, Type, AlignCenter, AlignStartHorizontal, AlignEndHorizontal, AlignStartVertical, AlignEndVertical, Grid3x3, ShieldAlert, FileWarning, FileCog } from "lucide-react";
import type { EditorPlugin, SectionProps, PresetDefinition } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { HintCard } from "../components/HintCard";

const positions = [
  { id: "top-left", icon: <AlignStartVertical className="h-3 w-3" /> },
  { id: "top-center", icon: <AlignCenter className="h-3 w-3" /> },
  { id: "top-right", icon: <AlignEndVertical className="h-3 w-3" /> },
  { id: "center-left", icon: <AlignStartHorizontal className="h-3 w-3" /> },
  { id: "center", icon: <Grid3x3 className="h-3 w-3" /> },
  { id: "center-right", icon: <AlignEndHorizontal className="h-3 w-3" /> },
  { id: "bottom-left", icon: <AlignEndVertical className="h-3 w-3" /> },
  { id: "bottom-center", icon: <AlignCenter className="h-3 w-3" /> },
  { id: "bottom-right", icon: <AlignEndHorizontal className="h-3 w-3" /> },
];

const WatermarkSection: React.FC<SectionProps> = ({ config, onConfigChange, mode, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <SettingRow label="Watermark Text">
        <div className="relative">
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input type="text" value={config.watermarkText || ""} onChange={(e) => onConfigChange("watermarkText", e.target.value)}
            placeholder="e.g. CONFIDENTIAL"
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30" disabled={disabled} />
        </div>
      </SettingRow>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <SettingRow label={`Opacity ${config.watermarkOpacity || 40}%`}>
        <input type="range" min={5} max={95} value={config.watermarkOpacity || 40}
          onChange={(e) => onConfigChange("watermarkOpacity", Number(e.target.value))}
          className="h-1 w-full rounded-lg appearance-none cursor-pointer accent-purple-500 bg-slate-200 dark:bg-slate-800" disabled={disabled} />
      </SettingRow>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <SettingRow label={`Rotation ${config.watermarkRotation || 0}°`}>
          <input type="range" min={-45} max={45} value={config.watermarkRotation || 0}
            onChange={(e) => onConfigChange("watermarkRotation", Number(e.target.value))}
            className="h-1 w-full rounded-lg appearance-none cursor-pointer accent-purple-500 bg-slate-200 dark:bg-slate-800" disabled={disabled} />
        </SettingRow>
        <SettingRow label={`Scale ${config.watermarkScale || 100}%`}>
          <input type="range" min={50} max={200} value={config.watermarkScale || 100}
            onChange={(e) => onConfigChange("watermarkScale", Number(e.target.value))}
            className="h-1 w-full rounded-lg appearance-none cursor-pointer accent-purple-500 bg-slate-200 dark:bg-slate-800" disabled={disabled} />
        </SettingRow>
      </div>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <SettingRow label="Placement">
        <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
          {positions.map((pos) => (
            <button key={pos.id} type="button" onClick={() => onConfigChange("watermarkPosition", pos.id)}
              className={`h-7 w-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                (config.watermarkPosition || "center") === pos.id
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
              }`}
              title={pos.id.replace("-", " ")} disabled={disabled}>
              {pos.icon}
            </button>
          ))}
        </div>
      </SettingRow>
    </BentoCard>

    {mode === "advanced" && (
      <BentoCard size="sm" hover={false}>
        <SettingRow label="Margins">
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={config.watermarkMarginX || 20} onChange={(e) => onConfigChange("watermarkMarginX", Number(e.target.value))}
              placeholder="X" title="Margin X"
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-500" disabled={disabled} />
            <input type="number" value={config.watermarkMarginY || 20} onChange={(e) => onConfigChange("watermarkMarginY", Number(e.target.value))}
              placeholder="Y" title="Margin Y"
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-purple-500" disabled={disabled} />
          </div>
        </SettingRow>
      </BentoCard>
    )}

    <HintCard>For best results, use short text with moderate opacity (30-50%). Preview before finalizing.</HintCard>
  </div>
);

const watermarkPresets: PresetDefinition[] = [
  { id: "confidential", label: "Confidential", description: "Red confidential overlay", icon: <ShieldAlert className="h-4 w-4" />, config: { watermarkText: "CONFIDENTIAL", watermarkOpacity: 30, watermarkRotation: -30, watermarkScale: 120, watermarkPosition: "center" } },
  { id: "draft", label: "Draft", description: "Light draft indicator", icon: <FileWarning className="h-4 w-4" />, config: { watermarkText: "DRAFT", watermarkOpacity: 20, watermarkRotation: 0, watermarkScale: 100, watermarkPosition: "center" } },
  { id: "topsecret", label: "Top Secret", description: "Bold security marking", icon: <FileCog className="h-4 w-4" />, config: { watermarkText: "TOP SECRET", watermarkOpacity: 50, watermarkRotation: 0, watermarkScale: 150, watermarkPosition: "center" } },
];

export const watermarkPlugin: EditorPlugin = {
  id: "watermark",
  name: "Watermark PDF",
  presets: watermarkPresets,
  sections: [
    { id: "watermark", label: "Watermark Settings", description: "Add text overlays", icon: <Droplets className="h-4 w-4" />, component: WatermarkSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
