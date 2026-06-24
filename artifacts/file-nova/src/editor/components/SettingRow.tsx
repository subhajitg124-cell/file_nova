import React from "react";

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  helpText?: string;
}

export const SettingRow: React.FC<SettingRowProps> = ({ label, children, className = "", helpText }) => (
  <div className={["space-y-1.5", className].filter(Boolean).join(" ")}>
    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
      {label}
    </label>
    {children}
    {helpText && <p className="text-[9px] text-slate-400 dark:text-slate-500">{helpText}</p>}
  </div>
);

export default SettingRow;
