import React, { useState, useEffect } from "react";
import { useAdmin } from "@/lib/admin";
import { Megaphone, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function GlobalNotice() {
  const { settings } = useAdmin();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);

  // Load dismissal states from sessionStorage
  useEffect(() => {
    if (settings.globalNoticeActive && settings.globalNoticeText) {
      const dismissedBanner = sessionStorage.getItem(`dismissed-banner-${settings.globalNoticeText}`);
      setBannerVisible(!dismissedBanner);
    }
  }, [settings.globalNoticeActive, settings.globalNoticeText]);

  useEffect(() => {
    if (settings.popupMessageActive && settings.popupMessageText) {
      const dismissedPopup = sessionStorage.getItem(`dismissed-popup-${settings.popupMessageText}`);
      setPopupVisible(!dismissedPopup);
    }
  }, [settings.popupMessageActive, settings.popupMessageText]);

  const handleDismissBanner = () => {
    setBannerVisible(false);
    if (settings.globalNoticeText) {
      sessionStorage.setItem(`dismissed-banner-${settings.globalNoticeText}`, "true");
    }
  };

  const handleDismissPopup = () => {
    setPopupVisible(false);
    if (settings.popupMessageText) {
      sessionStorage.setItem(`dismissed-popup-${settings.popupMessageText}`, "true");
    }
  };

  if (!settings) return null;

  // Banner Styles based on Notice Type
  const noticeType = settings.globalNoticeType || "info";
  const bannerBgMap = {
    info: "from-blue-600 via-indigo-600 to-violet-600 text-white",
    warning: "from-amber-500 via-amber-600 to-yellow-600 text-white",
    error: "from-rose-600 via-red-600 to-red-700 text-white",
    success: "from-emerald-600 via-teal-650 to-green-600 text-white",
  };

  const bannerIconMap = {
    info: <Info className="h-4 w-4 text-sky-200 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-100 shrink-0" />,
    error: <AlertTriangle className="h-4 w-4 text-rose-100 shrink-0" />,
    success: <CheckCircle className="h-4 w-4 text-emerald-100 shrink-0" />,
  };

  const bannerBg = bannerBgMap[noticeType] || bannerBgMap.info;
  const bannerIcon = bannerIconMap[noticeType] || bannerIconMap.info;

  return (
    <>
      {/* ── Global Header Banner ── */}
      <AnimatePresence>
        {settings.globalNoticeActive && settings.globalNoticeText && bannerVisible && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`relative w-full py-2.5 px-10 text-center text-xs sm:text-sm font-bold shadow-md z-[60] bg-gradient-to-r ${bannerBg} flex items-center justify-center gap-2`}
          >
            {bannerIcon}
            <span>{settings.globalNoticeText}</span>
            <button
              onClick={handleDismissBanner}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors"
              aria-label="Dismiss Banner"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Global Pop-up Modal ── */}
      <AnimatePresence>
        {settings.popupMessageActive && settings.popupMessageText && popupVisible && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full bg-card border border-border p-6 rounded-3xl shadow-2xl space-y-4"
            >
              <button
                onClick={handleDismissPopup}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Close Modal"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-primary">
                <Megaphone className="h-5 w-5 text-indigo-500 animate-bounce" />
                <h3 className="text-base font-black text-foreground">Announcement</h3>
              </div>

              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {settings.popupMessageText}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleDismissPopup}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Understood
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
