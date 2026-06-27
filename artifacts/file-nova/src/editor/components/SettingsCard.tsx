import React from "react";

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ children, className = "" }) => (
  <div className={["rounded-xl border border-white/10 dark:border-border bg-card/5 dark:bg-card/5 p-4 space-y-4", className].filter(Boolean).join(" ")}>
    {children}
  </div>
);

export default SettingsCard;
