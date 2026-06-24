import React from "react";
import { Info } from "lucide-react";

interface HintCardProps {
  children: React.ReactNode;
  className?: string;
}

export const HintCard: React.FC<HintCardProps> = ({ children, className = "" }) => (
  <div
    className={[
      "flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3",
      className,
    ].filter(Boolean).join(" ")}
  >
    <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
      {children}
    </div>
  </div>
);

export default HintCard;
