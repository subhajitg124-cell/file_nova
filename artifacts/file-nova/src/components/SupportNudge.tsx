import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Coffee } from "lucide-react";

export function SupportNudge() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      const reason = customEvent.detail?.reason;
      
      const now = Date.now();
      const lastNudgeTime = localStorage.getItem("fn_last_nudge_time");
      
      if (reason === "tool-use") {
        const useCount = parseInt(localStorage.getItem("fn_tool_use_count") || "0", 10) + 1;
        localStorage.setItem("fn_tool_use_count", String(useCount));
        
        // Show nudge every 3 tool uses
        if (useCount % 3 === 0) {
          setIsOpen(true);
          sessionStorage.setItem("fn_session_nudged", "true");
          localStorage.setItem("fn_last_nudge_time", String(now));
        }
      } else if (reason === "return-visit") {
        // Show nudge on return visit if at least 1 hour has passed since last nudge
        if (!lastNudgeTime || now - parseInt(lastNudgeTime, 10) > 3600000) {
          setIsOpen(true);
          sessionStorage.setItem("fn_session_nudged", "true");
          localStorage.setItem("fn_last_nudge_time", String(now));
        }
      }
    };
    
    window.addEventListener("trigger-support-nudge", handleTrigger);
    return () => window.removeEventListener("trigger-support-nudge", handleTrigger);
  }, []);

  const handleSupportClick = () => {
    setIsOpen(false);
    setLocation("/pricing");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 right-6 z-[99999] w-80 max-w-[90vw] fn-glass border border-[var(--fn-border)] shadow-[var(--fn-shadow-elevated)] rounded-2xl p-4 flex flex-col gap-3.5 text-left"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500 shrink-0">
                <Coffee className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white leading-tight flex items-center gap-1">
                  Support FileNova
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                </h4>
                <p className="text-[10px] text-muted-foreground font-semibold leading-tight">Kept alive by users like you</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white/80 p-0.5 rounded-lg transition shrink-0 cursor-pointer"
              aria-label="Dismiss nudge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-[11px] text-[var(--fn-text-secondary)] font-medium leading-relaxed">
            We are 100% free with no limits. If FileNova saved you time or money today, please consider buying us a cutting chai (₹10) to help cover server bills! ☕
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSupportClick}
              className="flex-1 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black shadow-sm transition cursor-pointer text-center"
            >
              Support Us
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-1.5 rounded-xl bg-[var(--fn-surface-elevated)] border border-[var(--fn-border)] hover:bg-[var(--fn-surface-hover)] text-white text-[10px] font-bold transition cursor-pointer text-center"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
