import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, X } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "@/lib/i18n";

export function FreeBadge() {
  const { useCount } = useSubscription();
  const { tText } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const remaining = Math.max(0, 3 - useCount);

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Glowing animated FREE badge */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="badge-free text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border mr-2 cursor-pointer shadow-sm relative overflow-hidden group select-none block"
      >
        <span className="relative z-10">{tText("Free")}</span>
        {/* Glow effect hover overlay */}
        <span className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>

      {/* Interactive Tooltip / Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2.5 w-64 rounded-2xl border border-border bg-card backdrop-blur-xl p-4 shadow-2xl z-50 text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                🟢 {tText("Free Plan Status")}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Info / Limits */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-foreground leading-snug">
                  {tText("Daily Workspace Limit")}
                </p>
                <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                  {tText("Free tier accounts get 3 document automations daily.")}
                </p>
              </div>

              {/* Progress bar */}
              <div className="bg-muted rounded-xl p-2.5 border border-border">
                <div className="flex items-center justify-between text-[11px] font-bold text-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {tText("Uses Remaining")}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">{remaining} / 3</span>
                </div>
                
                {/* Visual indicator */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(remaining / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <Link 
                href="/pricing" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-glow flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="h-3.5 w-3.5 fill-white animate-pulse" />
                <span>{tText("Upgrade to Pro (₹99)")}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
