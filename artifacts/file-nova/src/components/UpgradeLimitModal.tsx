import React from "react";
import { useLocation } from "wouter";
import { Sparkles, ShieldAlert, X, ChevronRight, Share2 } from "lucide-react";

interface UpgradeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limit?: number;
  usage?: number;
}

export function UpgradeLimitModal({ isOpen, onClose, limit = 3, usage = 3 }: UpgradeLimitModalProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handlePricingRedirect = () => {
    onClose();
    setLocation("/pricing");
  };

  const handleReferralRedirect = () => {
    onClose();
    setLocation("/referral");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div 
        className="bg-card border border-border rounded-3xl shadow-premium max-w-2xl w-full overflow-hidden animate-scale-in relative flex flex-col"
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

        {/* Vibrant Gradient Header */}
        <div className="bg-gradient-to-r from-red-500 via-amber-500 to-rose-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-white/90 shrink-0" />
            <div>
              <h2 className="text-lg font-black leading-tight">Daily Action Limit Reached ({usage}/{limit})</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Upgrade to a paid desk to unlock more files, larger sizes, and exclusive premium tools.
              </p>
            </div>
          </div>
        </div>

        {/* side-by-side plans */}
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Basic Desk Card */}
            <div className="rounded-2xl border border-border bg-background/50 p-4 flex flex-col justify-between hover:border-primary/30 transition shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-foreground">Basic Desk</h3>
                <p className="text-2xl font-black text-foreground mt-1">₹49<span className="text-[10px] font-semibold text-muted-foreground">/mo</span></p>
                <div className="text-[10px] font-black text-amber-500 mt-0.5 bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">20 uses / day</div>
                <ul className="text-[10px] text-muted-foreground mt-3 space-y-1">
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Max 15MB file size</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Voice Assistant</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Aadhaar Masking</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> 24h file storage</li>
                </ul>
              </div>
              <button 
                onClick={handlePricingRedirect}
                className="w-full mt-4 py-2 rounded-lg text-[11px] font-bold border border-border hover:bg-muted transition cursor-pointer"
              >
                Choose Basic
              </button>
            </div>

            {/* Pro Desk Card - Highlighted */}
            <div className="rounded-2xl border-2 border-primary bg-primary/5 p-4 flex flex-col justify-between relative shadow-premium hover:scale-[1.02] transition">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Best Value
              </span>
              <div>
                <h3 className="text-sm font-bold text-primary flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
                  Pro Desk
                </h3>
                <p className="text-2xl font-black text-foreground mt-1">₹99<span className="text-[10px] font-semibold text-muted-foreground">/mo</span></p>
                <div className="text-[10px] font-black text-emerald-500 mt-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">100 uses / day</div>
                <ul className="text-[10px] text-muted-foreground mt-3 space-y-1">
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Max 50MB file size</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Bulk (5) & Priority</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Exam Presets / QR</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> 7 days file storage</li>
                </ul>
              </div>
              <button 
                onClick={handlePricingRedirect}
                className="w-full mt-4 py-2 rounded-lg text-[11px] font-black bg-primary text-primary-foreground hover:opacity-90 shadow-glow transition cursor-pointer"
              >
                Choose Pro
              </button>
            </div>

            {/* Elite Console Card */}
            <div className="rounded-2xl border border-border bg-background/50 p-4 flex flex-col justify-between hover:border-primary/30 transition shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-foreground">Elite Console</h3>
                <p className="text-2xl font-black text-foreground mt-1">₹199<span className="text-[10px] font-semibold text-muted-foreground">/mo</span></p>
                <div className="text-[10px] font-black text-violet-500 mt-0.5 bg-violet-500/10 px-2 py-0.5 rounded-full inline-block">Unlimited uses</div>
                <ul className="text-[10px] text-muted-foreground mt-3 space-y-1">
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Max 100MB file size</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> Cafe Mode & CSV Import</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> WhatsApp / API keys</li>
                  <li className="flex items-center gap-1"><span className="text-emerald-500">✓</span> 30 days file storage</li>
                </ul>
              </div>
              <button 
                onClick={handlePricingRedirect}
                className="w-full mt-4 py-2 rounded-lg text-[11px] font-bold border border-border hover:bg-muted transition cursor-pointer"
              >
                Choose Elite
              </button>
            </div>

          </div>

          {/* UPI and Referral CTA Area */}
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[10px] font-bold text-indigo-500">⚡ Instant Active UPI payments</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Pay with UPI ID <code className="font-semibold text-foreground bg-muted px-1 py-0.5 rounded">subhajitgho123-1@oksbi</code> on Pricing Page</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={handleReferralRedirect}
                className="flex-1 sm:flex-none py-2 px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                Refer & Earn (3 Days Free Pro)
              </button>

              <button
                onClick={handlePricingRedirect}
                className="flex-1 sm:flex-none py-2 px-4 inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 text-white transition text-xs font-black shadow-premium shadow-glow cursor-pointer"
              >
                View Pricing
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground font-semibold"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
