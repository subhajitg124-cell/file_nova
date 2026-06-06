import React from "react";
import { X, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "batch" | "limit" | string;
}

export function UpgradeModal({ isOpen, onClose, reason = "batch" }: UpgradeModalProps) {
  const { startCheckout, loading } = useSubscription();

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    // Pro upgrade modal maps to basic tier (₹49) in API parameters
    await startCheckout("basic");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 dark:hover:text-white rounded-full p-1.5 transition z-10 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center">
          <div className="mx-auto h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-amber-300 fill-amber-300 animate-pulse" />
          </div>
          <h2 className="text-xl font-black">Upgrade to Pro</h2>
          <p className="text-xs text-indigo-100 mt-1">
            {reason === "batch" 
              ? "Multiple file processing is a Pro feature." 
              : "Unlock the full potential of FileNova's tools."}
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-900 dark:text-white block">Batch Processing</span>
                <span className="text-[11px] text-gray-500 block">Process up to 10 files simultaneously with JSZip bundles.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-900 dark:text-white block">Large File Sizes</span>
                <span className="text-[11px] text-gray-500 block">Upload files up to 10MB per file.</span>
              </div>
            </div>
          </div>

          <div className="text-center bg-gray-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-900">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Special Offer</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white block mt-1">₹49<span className="text-sm font-bold text-gray-500">/month</span></span>
            <span className="text-[10px] text-gray-500 block mt-1">Instant activation via Razorpay UPI or Cards</span>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-glow cursor-pointer transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Initializing Checkout..." : "Upgrade Now for ₹49"}
          </button>
        </div>
      </div>
    </div>
  );
}
