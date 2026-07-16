import React, { useState, useEffect } from "react";
import { X, Copy, Check, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";
import { FILENOVA_UPI_ID, FILENOVA_PAYEE_NAME, createUpiLink } from "@/lib/upi";

interface UpiSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  note: string;
}

export function UpiSupportModal({ isOpen, onClose, amount, note }: UpiSupportModalProps) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [localAmount, setLocalAmount] = useState(amount);
  const [localNote, setLocalNote] = useState(note);
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    setLocalAmount(amount);
    setLocalNote(note);
    setAmountError("");
  }, [amount, note]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FILENOVA_UPI_ID);
    setCopied(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAmountChange = (value: string) => {
    const nextAmount = Number(value);
    setLocalAmount(Number.isNaN(nextAmount) ? 0 : Math.max(0, Math.floor(nextAmount)));
    setAmountError(nextAmount < 10 ? "Enter ₹10 or more." : "");
  };

  const effectiveAmount = Math.max(10, localAmount);
  const payLink = createUpiLink(effectiveAmount, localNote);
  const isAmountValid = localAmount >= 10;

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
          <div className="mx-auto h-12 w-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center border border-rose-500/20 mb-3">
            <span className="text-2xl leading-none">☕</span>
          </div>
          <h3 className="text-lg font-black text-white">Support FileNova</h3>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            If FileNova saved you time or money, consider supporting development.
          </p>
        </div>

        {/* Dynamic QR Code & Inputs */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
            <div className="space-y-2 text-left">
              <label htmlFor="upi-amount" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enter amount</label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-xl border border-border bg-slate-950/70 px-3 py-2 text-slate-400 text-sm font-bold">₹</span>
                <input
                  id="upi-amount"
                  type="number"
                  min={10}
                  step={1}
                  value={localAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-rose-500"
                  placeholder="Enter amount"
                />
              </div>
              {amountError ? (
                <p className="text-[11px] text-destructive">{amountError}</p>
              ) : (
                <p className="text-[11px] text-slate-400">Minimum ₹10. Enter any amount to support.</p>
              )}
              <label htmlFor="upi-note" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment note</label>
              <input
                id="upi-note"
                type="text"
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-rose-500"
                placeholder="Support FileNova"
              />
            </div>
            <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl flex items-center justify-center shadow-inner border border-slate-200 shrink-0">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(payLink)}`} 
                alt="UPI QR Code" 
                className="w-full h-full object-contain"
                width="150" height="150" loading="lazy"
              />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 flex items-center justify-center gap-1">
              <QrCode className="w-3.5 h-3.5" />
              Scan to Pay ₹{effectiveAmount}
            </span>
            <p className="text-[11px] text-slate-400">Scan with GPay, PhonePe, Paytm, or BHIM</p>
          </div>
        </div>

        {isMobile && (
          <div className="space-y-4 pt-2">
            <div className="rounded-3xl border border-border bg-slate-950/70 p-4 text-left space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pay with UPI app</p>
              <button
                type="button"
                disabled={!isAmountValid}
                onClick={() => {
                  if (!isAmountValid) {
                    setAmountError("Enter ₹10 or more.");
                    return;
                  }
                  window.location.href = payLink;
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 text-sm font-black shadow-glow-rose transition cursor-pointer"
              >
                Pay ₹{localAmount} via UPI App
                <ExternalLink className="h-4 w-4" />
              </button>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tap to open any installed UPI app and complete payment instantly.
              </p>
            </div>
          </div>
        )}

        {/* Details Card */}
        <div className="bg-slate-950/60 border border-border rounded-2xl p-3 text-left text-xs space-y-2">
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
          className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-muted text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          Cancel / Close
        </button>
      </div>
    </div>
  );
}
