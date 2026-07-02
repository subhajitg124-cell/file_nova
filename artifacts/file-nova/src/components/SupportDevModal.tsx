import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Heart, Sparkles, Bell, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SupportDevModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportDevModal({ isOpen, onClose }: SupportDevModalProps) {
  const [notified, setNotified] = useState(false);

  const handleNotifyMe = () => {
    setNotified(true);
    const key = "fn_support_notify";
    localStorage.setItem(key, "true");
    toast.success("We'll notify you when support opens. Thank you!");
    setTimeout(() => onClose(), 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-background border border-border rounded-2xl overflow-hidden p-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Custom Support Banner Flyer */}
          <div className="relative w-full overflow-hidden border-b border-border bg-slate-950">
            <img
              src="/Promo-Support/support_promo.jpg"
              alt="FileNova Development Support Flyer"
              className="w-full h-auto object-cover select-none pointer-events-none"
            />
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Heart className="h-5 w-5 fill-indigo-500/20" />
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
                Support Development
              </span>
            </div>

            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-foreground mb-2 leading-tight">
              FileNova is Free During Development
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground leading-relaxed mb-4">
              All tools are currently 100% free while we complete our secure UPI and card payment gateway. Watch our support video to learn about our mission and future roadmap.
            </DialogDescription>

            {/* Video Showcase Section */}
            <div className="my-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 dark:text-indigo-400 block mb-2">
                Watch Support Video
              </span>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border bg-slate-950 shadow-md group transition-all duration-300 hover:border-indigo-500/30">
                <video
                  src="/Promo-Support/Support.mp4"
                  controls
                  className="w-full h-full object-cover"
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>

            <div className="border-t border-border my-5" />

            <div className="space-y-4 text-xs text-foreground/90 leading-relaxed">
              <p>
                Soon, you'll be able to support the project through secure online payments. Your support helps fund faster document processing, advanced OCR accuracy, and new AI-powered features.
              </p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                {[
                  "Faster document processing",
                  "New AI-powered tools",
                  "Better OCR accuracy",
                  "More PDF and image tools",
                  "Cloud sync",
                  "Improved security",
                  "Faster servers",
                  "Continuous updates",
                  "Customer support",
                  "Long-term development",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {notified ? (
                <div className="w-full py-3 px-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/20 text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  You're on the list. We'll notify you!
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    Continue Using FileNova Free
                  </button>
                  <button
                    type="button"
                    onClick={handleNotifyMe}
                    className="w-full py-3 px-5 border border-border bg-card hover:bg-muted text-foreground font-bold text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="h-4 w-4" />
                    Notify Me When Support Opens
                  </button>
                </>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground/60 text-center mt-4">
              Thank you for helping us grow. Every bit of support means the world!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
