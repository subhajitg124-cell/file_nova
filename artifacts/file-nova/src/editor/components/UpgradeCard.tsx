import React from "react";
import { Sparkles } from "lucide-react";

interface UpgradeCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  title = "Unlock Premium",
  description = "Upgrade for advanced features, unlimited usage, and priority support.",
  className = "",
}) => (
  <div
    className={[
      "relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-transparent to-emerald-500/5 p-4",
      "shadow-lg shadow-purple-500/5",
      className,
    ].filter(Boolean).join(" ")}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent" />
    <div className="relative z-10">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-3">
        <Sparkles className="h-4 w-4" />
      </span>
      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{description}</p>
      <button
        type="button"
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 py-2 text-[11px] font-black text-white hover:from-purple-500 hover:to-emerald-400 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
      >
        Upgrade Now
      </button>
    </div>
  </div>
);

export default UpgradeCard;
