import React, { useState } from "react";
import { Shield, Eye, EyeOff, Lock, Printer, Copy, Edit3 } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { SettingRow } from "../components/SettingRow";
import { HintCard } from "../components/HintCard";

const ProtectSection: React.FC<SectionProps> = ({ config, onConfigChange, mode, disabled }) => {
  const [showPw, setShowPw] = useState(false);
  return (
    <div className="space-y-3">
      <BentoCard size="sm" hover={false} accent="premium">
        <p className="text-[10px] uppercase tracking-wider font-bold text-purple-500 mb-3 flex items-center gap-1.5">
          <Lock className="h-3 w-3" /> Password Protection
        </p>
        <div className="space-y-3">
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={config.password || ""}
              onChange={(e) => onConfigChange("password", e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-xl border-border bg-card px-3 py-2.5 pr-10 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" disabled={disabled} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer" disabled={disabled}>
              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <input type={showPw ? "text" : "password"} value={config.confirmPassword || ""}
            onChange={(e) => onConfigChange("confirmPassword", e.target.value)}
            placeholder="Confirm password"
              className="w-full rounded-xl border-border bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30" disabled={disabled} />
          {config.confirmPassword && config.password !== config.confirmPassword && (
            <p className="text-[10px] text-red-500 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Passwords do not match</p>
          )}
          {config.password && config.password === config.confirmPassword && (
            <p className="text-[10px] text-emerald-500 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Passwords match</p>
          )}
        </div>
      </BentoCard>

      <BentoCard size="sm" hover={false}>
        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2.5">Permissions</p>
        <div className="space-y-1.5">
          {[
            { key: "allowPrint", label: "Allow Printing", icon: <Printer className="h-3 w-3" /> },
            { key: "allowCopy", label: "Allow Copying", icon: <Copy className="h-3 w-3" /> },
            { key: "allowEdit", label: "Allow Editing", icon: <Edit3 className="h-3 w-3" /> },
          ].map(({ key, label, icon }) => (
            <label key={key} className="flex items-center gap-3 rounded-lg border-border bg-card/80 px-3 py-2 cursor-pointer hover:bg-muted transition">
              <input type="checkbox" checked={!!config[key]} onChange={(e) => onConfigChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer" disabled={disabled} />
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">{icon}{label}</span>
            </label>
          ))}
        </div>
      </BentoCard>

      <HintCard>Set a strong password to protect your PDF. Permissions control what users can do with the protected file.</HintCard>
    </div>
  );
};

export const protectPlugin: EditorPlugin = {
  id: "protect",
  name: "Protect PDF",
  sections: [
    { id: "protect", label: "Password & Permissions", description: "Secure your document", icon: <Shield className="h-4 w-4" />, component: ProtectSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
