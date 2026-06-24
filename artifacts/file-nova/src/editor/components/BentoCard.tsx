import React from "react";
import { motion } from "framer-motion";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  accent?: "default" | "premium" | "ai" | "success";
  size?: "sm" | "md" | "lg";
  hover?: boolean;
}

const accentBorders = {
  default: "border-white/10 dark:border-white/10",
  premium: "border-purple-500/30 dark:border-purple-500/30",
  ai: "border-emerald-500/30 dark:border-emerald-500/30",
  success: "border-emerald-400/30 dark:border-emerald-400/30",
};

const accentGlows = {
  default: "",
  premium: "shadow-purple-500/5",
  ai: "shadow-emerald-500/5",
  success: "shadow-emerald-400/5",
};

export const BentoCard: React.FC<BentoCardProps> = ({
  children, className = "", title, description, icon, accent = "default", size = "md", hover = true,
}) => {
  const sizePadding = size === "sm" ? "p-3" : size === "lg" ? "p-6" : "p-4";
  return (
    <motion.div
      whileHover={hover ? { y: -1, scale: 1.005 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "rounded-2xl border bg-white/5 dark:bg-white/5 backdrop-blur-md",
        accentBorders[accent],
        accentGlows[accent],
        "shadow-lg shadow-black/5 dark:shadow-black/10",
        sizePadding,
        className,
      ].filter(Boolean).join(" ")}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2.5 mb-3">
          {icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              {icon}
            </span>
          )}
          <div>
            {title && <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{title}</p>}
            {description && <p className="text-[10px] text-slate-400 dark:text-slate-500">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default BentoCard;
