import React, { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const ProtectSection: React.FC<SectionProps> = ({ config, onConfigChange, disabled }) => {
  const [showPw, setShowPw] = useState(false);
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Password</label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} value={config.password || ""}
            onChange={(e) => onConfigChange("password", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500" disabled={disabled} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition cursor-pointer" disabled={disabled}>
            {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Confirm Password</label>
        <input type={showPw ? "text" : "password"} value={config.confirmPassword || ""}
          onChange={(e) => onConfigChange("confirmPassword", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" disabled={disabled} />
        {config.confirmPassword && config.password !== config.confirmPassword && (
          <p className="text-[10px] text-red-400">Passwords do not match</p>
        )}
      </div>
      {[
        { key: "allowPrint", label: "Allow Printing" },
        { key: "allowCopy", label: "Allow Copying" },
        { key: "allowEdit", label: "Allow Editing" },
      ].map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 cursor-pointer hover:bg-slate-900 transition">
          <input type="checkbox" checked={!!config[key]} onChange={(e) => onConfigChange(key, e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer" disabled={disabled} />
          <span className="text-xs font-bold text-slate-200">{label}</span>
        </label>
      ))}
    </div>
  );
};

export const protectPlugin: EditorPlugin = {
  id: "protect",
  name: "Protect PDF",
  sections: [
    { id: "protect", label: "Password & Permissions", icon: <Shield className="h-4 w-4" />, component: ProtectSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
