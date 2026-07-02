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
      <DialogContent className="max-w-lg bg-background border border-border rounded-2xl overflow-hidden p-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-7 md:p-9">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Heart className="h-5 w-5 fill-indigo-500/20" />
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground">
                Support Development
              </span>
            </div>

            <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2 leading-tight">
              FileNova is Free During Development
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground leading-relaxed mb-3">
              Every tool on FileNova is currently available free while we're completing the final payment gateway integration.
            </DialogDescription>

            <div className="my-5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 dark:text-indigo-400 block mb-2">
                Watch Support Video
              </span>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-slate-950 shadow-md group transition-all duration-300 hover:border-indigo-500/30">
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

            <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
              <p>
                Thank you for trying FileNova. I'm building this platform to become one of India's most useful document tools for students, professionals, CSC operators, and everyday users.
              </p>
              <p>
                To avoid interruptions while I finish and thoroughly test the payment system, all tools are temporarily free.
              </p>
              <p>
                Soon, you'll be able to support the project through secure online payments. Your support will help fund:
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

              <p className="text-foreground font-semibold pt-2">
                Thank you for helping FileNova grow. Every bit of support means the world to me.
              </p>
            </div>

            <div className="mt-7 space-y-3">
              {notified ? (
                <div className="w-full py-3 px-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-xl border border-emerald-500/20 text-center flex items-center justify-center gap-2">
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

            <p className="text-[11px] text-muted-foreground/60 text-center mt-4 leading-relaxed">
              The payment system is being finalized and will return soon.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
