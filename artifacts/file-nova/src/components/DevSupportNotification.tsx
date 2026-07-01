import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSupportDevStore } from "@/store/useSupportDevStore";

const DISMISS_KEY = "fn_dev_notification_dismissed";

export function DevSupportNotification() {
  const { user } = useAuthStore();
  const { open } = useSupportDevStore();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!user) {
      setDismissed(true);
      return;
    }
    try {
      const val = localStorage.getItem(DISMISS_KEY);
      setDismissed(val === "true");
    } catch {
      setDismissed(true);
    }
  }, [user]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {}
  };

  if (!user || dismissed) return null;

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
          <div className="relative px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Heart className="h-5 w-5 fill-emerald-500/20" />
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-foreground mb-0.5">
                FileNova is Completely Free for Now
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                While we complete our secure payment integration, every user can enjoy FileNova completely free. If you enjoy using FileNova, you'll soon be able to support future development and help us build one of India's best document platforms.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
