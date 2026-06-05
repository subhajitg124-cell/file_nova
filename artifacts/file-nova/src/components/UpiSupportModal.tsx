import React, { useState, useEffect } from "react";
import { X, Copy, Check, ExternalLink, HelpCircle } from "lucide-react";
import { FILENOVA_UPI_ID, FILENOVA_PAYEE_NAME, createUpiLink, createUpiQrUrl } from "@/lib/upi";

interface UpiSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  note: string;
}

export function UpiSupportModal({ isOpen, onClose, amount, note }: UpiSupportModalProps) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(navigator.userAgent));
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FILENOVA_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = createUpiQrUrl(amount);
  const payLink = createUpiLink(amount, note);

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl shadow-premium max-w-sm w-full overflow-hidden animate-scale-in relative p-6 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-950/80 rounded-full p-1.5 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 pt-2">
          <div className="mx-auto h-12 w-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/20 mb-3">
            <span className="text-2xl leading-none">☕</span>
          </div>
          <h3 className="text-lg font-black text-white">Support FileNova</h3>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            If FileNova saved you time or money, consider supporting development.
          </p>
        </div>

        {/* QR Code Container for Desktop */}
        {!isMobile ? (
          <div className="space-y-4">
            <div className="mx-auto w-48 h-48 bg-white p-3 rounded-2xl flex items-center justify-center shadow-inner border border-slate-800">
              <img 
                src={qrUrl} 
                alt="UPI QR Code" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if the upiqr api is down
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(payLink)}`;
                }}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Scan to Pay ₹{amount}</span>
              <p className="text-[11px] text-slate-400">Scan with GPay, PhonePe, Paytm, or BHIM</p>
            </div>
          </div>
        ) : (
          /* Mobile Button Link */
          <div className="py-4 space-y-4">
            <a
              href={payLink}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white py-3.5 text-sm font-black shadow-glow-indigo transition cursor-pointer"
            >
              Pay ₹{amount} via UPI App
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-[11px] text-slate-400 leading-relaxed px-4">
              Tap the button to open any installed UPI application (GPay, PhonePe, Paytm) directly.
            </p>
          </div>
        )}

        {/* Details Card */}
        <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-3 text-left text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Payee Name</span>
            <span className="font-bold text-slate-200">{FILENOVA_PAYEE_NAME}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-900 pt-2">
            <span className="text-slate-500">UPI ID</span>
            <div className="flex items-center gap-1.5">
              <code className="font-semibold text-slate-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{FILENOVA_UPI_ID}</code>
              <button 
                onClick={handleCopy}
                className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition cursor-pointer"
                title="Copy UPI ID"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          Cancel / Close
        </button>
      </div>
    </div>
  );
}
