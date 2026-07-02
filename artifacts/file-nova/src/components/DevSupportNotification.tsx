import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X } from "lucide-react";
import { useSupportDevStore } from "@/store/useSupportDevStore";

const DISMISS_KEY = "fn_dev_notification_dismissed";

export function DevSupportNotification() {
  const { open } = useSupportDevStore();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const val = localStorage.getItem(DISMISS_KEY);
      setDismissed(val === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {}
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mx-auto max-w-6xl px-4"
      >
        <div className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 overflow-hidden mb-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
          <div className="relative px-5 py-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-full md:w-56 aspect-video rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-950 shrink-0 relative group">
              <video
                src="/Promo-Support/Support.mp4"
                controls
                className="w-full h-full object-cover"
                playsInline
                preload="metadata"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5">
                FileNova is Free During Development
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                  Support Video
                </span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We are currently building India's most loved document platform, and all tools are completely free while we finalize our secure payment integration. Watch our development video to learn more!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center mt-2 md:mt-0">
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-bold text-foreground bg-card hover:bg-muted border border-border px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => { open(); handleDismiss(); }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                Learn More
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                title="Dismiss"
                aria-label="Dismiss notification"
                className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
