import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowUpRight, X } from "lucide-react";
import { useSupportDevStore } from "@/store/useSupportDevStore";

const DISMISS_KEY = "fn_dev_banner_dismissed";

export function DevSupportBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "true";
    } catch {
      return false;
    }
  });
  const { open } = useSupportDevStore();

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-auto max-w-6xl px-4 pt-2"
    >
      <div className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-indigo-500/10 to-indigo-500/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative px-5 py-3 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="hidden sm:flex p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
            <Heart className="h-4 w-4 fill-indigo-500/20" />
          </span>
          <p className="text-xs text-foreground/80 leading-relaxed flex-1">
            FileNova is currently free while we complete secure payment integration. Thank you for helping us improve the platform.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                open();
                handleDismiss();
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
            >
              Learn More
              <ArrowUpRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              title="Dismiss"
              aria-label="Dismiss banner"
              className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
