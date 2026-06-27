import React from "react";
import { EyeOff, Shield, Type, Square, User, Hash } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { SegmentedControl } from "../components/SegmentedControl";
import { HintCard } from "../components/HintCard";
import { PremiumButton } from "../components/PremiumButton";

const AadhaarMaskSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => (
  <div className="space-y-3">
    <BentoCard size="sm" hover={false}>
      <SettingRow label="Mask Style">
        <SegmentedControl
          options={[
            { id: "redact", label: "Redact" },
            { id: "blur", label: "Blur" },
            { id: "asterisk", label: "Asterisks" },
          ]}
          value={config.maskStyle || "redact"}
          onChange={(v) => onConfigChange("maskStyle", v)}
          disabled={disabled}
        />
      </SettingRow>
    </BentoCard>

    <BentoCard size="sm" hover={false}>
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80 dark:text-muted-foreground">Fields to Mask</p>
        {[
          { key: "maskAadhaar", label: "Aadhaar Number", icon: <Hash className="h-3 w-3" /> },
          { key: "maskName", label: "Full Name", icon: <User className="h-3 w-3" /> },
          { key: "maskAddress", label: "Address", icon: <Type className="h-3 w-3" /> },
        ].map(({ key, label, icon }) => (
          <label key={key} className="flex items-center gap-3 rounded-lg border border-border dark:border-border bg-card/80 dark:bg-background/60 px-3 py-2 cursor-pointer hover:bg-muted/80 dark:hover:bg-muted transition">
            <input type="checkbox" defaultChecked={true} checked={config[key] !== false} onChange={(e) => onConfigChange(key, e.target.checked)}
              className="h-4 w-4 rounded border-border dark:border-muted text-purple-500 focus:ring-purple-500/30 cursor-pointer" disabled={disabled} />
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground/80 dark:text-foreground/90">
              {icon}{label}
            </span>
          </label>
        ))}
      </div>
    </BentoCard>

    <HintCard>Masking is permanent. Original data cannot be recovered after saving.</HintCard>
  </div>
);

export const aadhaarMaskPlugin: EditorPlugin = {
  id: "aadhaar-mask",
  name: "Aadhaar Mask",
  sections: [
    { id: "mask", label: "Mask Settings", description: "Redact sensitive info", icon: <EyeOff className="h-4 w-4" />, component: AadhaarMaskSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
