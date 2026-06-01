import React from "react";
import { useLocation } from "wouter";
import { Sparkles, ShieldAlert, X, ChevronRight } from "lucide-react";

interface UpgradeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limit?: number;
  usage?: number;
}

export function UpgradeLimitModal({ isOpen, onClose, limit = 3, usage = 3 }: UpgradeLimitModalProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    setLocation("/pricing");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div 
        className="bg-card border border-border rounded-3xl shadow-premium max-w-md w-full overflow-hidden animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/25 rounded-full p-1.5 transition z-10"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Banner header with vibrant red/yellow gradient */}
        <div className="bg-gradient-to-r from-red-500 via-amber-500 to-rose-600 p-6 text-white relative">
          <div className="absolute top-3 left-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
            Daily Limit Reached
          </div>
          <div className="mt-4">
            <ShieldAlert className="h-10 w-10 text-white/90 mb-2" />
            <h2 className="text-xl font-black">Daily Action Limit Exceeded</h2>
            <p className="text-xs text-white/80 mt-1 leading-4">
              You have completed all {limit} of your daily operations.
            </p>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            FileNova's cloud engines process and compile your files with maximum privacy. To maintain standard service quality, daily limits are enforced:
          </p>

          <div className="space-y-2.5">
            {/* Free/Guest Plan */}
            <div className="rounded-xl border border-border/80 bg-background/50 p-3 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-foreground">Guest / Free Plan</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">Tracked by IP or Account</p>
              </div>
              <span className="font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                3 operations / day
              </span>
            </div>

            {/* Basic Plan */}
            <div className="rounded-xl border border-border/80 bg-background/50 p-3 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-foreground">Basic Plan (₹19/month)</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">For light users</p>
              </div>
              <span className="font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                20 operations / day
              </span>
            </div>

            {/* Pro/Elite Plan */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500 animate-pulse" />
                  Pro & Elite Plans (From ₹39)
                </p>
                <p className="text-primary/70 text-[10px] mt-0.5">For operators & power users</p>
              </div>
              <span className="font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Unlimited usage
              </span>
            </div>
          </div>

          {/* Pricing route alternative option */}
          <div className="border-t border-border pt-4">
            <button
              onClick={handleUpgrade}
              className="w-full py-3.5 inline-flex items-center justify-between px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 text-white transition text-xs font-black shadow-premium shadow-glow"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300 animate-pulse" />
                Upgrade Subscription Plan
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full mt-2 py-2 text-center text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
