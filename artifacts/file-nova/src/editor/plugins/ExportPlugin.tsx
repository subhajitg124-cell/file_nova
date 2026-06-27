import React from "react";
import { Share2, Image, FileImage, FileType, FileText, Globe, Printer, File } from "lucide-react";
import type { EditorPlugin, SectionProps, PresetDefinition } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { PresetChips } from "../components/PresetChips";

const formats = [
  { id: "jpg", label: "JPG", icon: <Image className="h-4 w-4" />, desc: "Compressed" },
  { id: "png", label: "PNG", icon: <FileImage className="h-4 w-4" />, desc: "Lossless" },
  { id: "webp", label: "WebP", icon: <FileType className="h-4 w-4" />, desc: "Modern" },
  { id: "pdf", label: "PDF", icon: <FileText className="h-4 w-4" />, desc: "Document" },
];

const ExportSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <SettingRow label="Output Format">
        <div className="grid grid-cols-2 gap-2">
          {formats.map((fmt) => (
            <button key={fmt.id} type="button" onClick={() => onConfigChange("exportFormat", fmt.id)}
              className={`flex flex-col items-center rounded-xl border p-3 transition-all cursor-pointer ${
                config.exportFormat === fmt.id
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "border-border dark:border-border bg-card/80 dark:bg-background text-muted-foreground dark:text-muted-foreground/80 hover:bg-muted/80 dark:hover:bg-muted"
              }`} disabled={disabled}>
              <span className="mb-1">{fmt.icon}</span>
              <span className="text-[11px] uppercase font-bold">{fmt.label}</span>
              <span className="text-[8px] text-muted-foreground/80 dark:text-muted-foreground mt-0.5">{fmt.desc}</span>
            </button>
          ))}
        </div>
      </SettingRow>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <SettingRow label={`Quality ${config.exportQuality || 85}%`}>
        <input type="range" min={10} max={100} value={config.exportQuality || 85}
          onChange={(e) => onConfigChange("exportQuality", Number(e.target.value))}
          className="h-1 w-full rounded-lg appearance-none cursor-pointer accent-emerald-500 bg-muted dark:bg-muted" disabled={disabled} />
      </SettingRow>
    </BentoCard>
  </div>
);

const exportPresets: PresetDefinition[] = [
  { id: "web", label: "Web Optimized", description: "Fast loading for web", icon: <Globe className="h-4 w-4" />, config: { exportFormat: "jpg", exportQuality: 80 } },
  { id: "print", label: "Print Quality", description: "Highest quality output", icon: <Printer className="h-4 w-4" />, config: { exportFormat: "png", exportQuality: 100 } },
  { id: "document", label: "Document", description: "PDF with standard quality", icon: <File className="h-4 w-4" />, config: { exportFormat: "pdf", exportQuality: 90 } },
];

export const exportPlugin: EditorPlugin = {
  id: "export",
  name: "Export & Share",
  presets: exportPresets,
  sections: [
    { id: "export", label: "Export Settings", description: "Format & quality", icon: <Share2 className="h-4 w-4" />, component: ExportSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
