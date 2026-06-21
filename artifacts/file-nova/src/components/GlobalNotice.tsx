import React, { useState, useEffect } from "react";
import { useAdmin } from "@/lib/admin";
import { Megaphone, AlertTriangle, CheckCircle, Info, X, Youtube, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@CoverDriveBangla";
const POPUP_EXPIRY_DATE = new Date("2026-06-21");

export function GlobalNotice() {
  const { settings } = useAdmin();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [ytPopupVisible, setYtPopupVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Load dismissal states from localStorage
  useEffect(() => {
    if (settings.globalNoticeActive && settings.globalNoticeText) {
      const dismissedBanner = localStorage.getItem(`dismissed-banner-${settings.globalNoticeText}`);
      setBannerVisible(!dismissedBanner);
    }
  }, [settings.globalNoticeActive, settings.globalNoticeText]);

  useEffect(() => {
    if (settings.popupMessageActive && settings.popupMessageText) {
      const dismissedPopup = localStorage.getItem(`dismissed-popup-${settings.popupMessageText}`);
      setPopupVisible(!dismissedPopup);
    }
  }, [settings.popupMessageActive, settings.popupMessageText]);

  const handleDismissBanner = () => {
    setBannerVisible(false);
    if (settings.globalNoticeText) {
      localStorage.setItem(`dismissed-banner-${settings.globalNoticeText}`, "true");
    }
  };

  const handleDismissPopup = () => {
    setPopupVisible(false);
    if (settings.popupMessageText) {
      localStorage.setItem(`dismissed-popup-${settings.popupMessageText}`, "true");
    }
  };

  const handleDismissYtPopup = () => {
    setYtPopupVisible(false);
    localStorage.setItem("dismissed-yt-popup", "true");
  };

  useEffect(() => {
    const dismissedYtPopup = localStorage.getItem("dismissed-yt-popup");
    setYtPopupVisible(!dismissedYtPopup);
  }, []);

  const handleSubscribe = () => {
    setIsSubscribing(true);
    window.open(YOUTUBE_CHANNEL_URL, "_blank");

    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // Boost their limit for today in localStorage
    localStorage.setItem("fn_youtube_subscribed_at", todayStr);
    localStorage.setItem("dismissed-yt-popup", "true");

    // Sync metrics across tabs
    window.dispatchEvent(new Event("filenova-metrics-sync"));

    toast.success("Subscribed to @CoverDriveBangla! Your daily limit has been boosted.");

    // Dismiss the modal after a short delay (1.5 seconds) for a smooth premium experience
    setTimeout(() => {
      setYtPopupVisible(false);
      setIsSubscribing(false);
    }, 1500);
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

      {/* ── YouTube Channel Promotion Pop-up ── */}
      <AnimatePresence>
        {!settings.popupMessageActive && ytPopupVisible && new Date() < POPUP_EXPIRY_DATE && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -50, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50, rotate: 2 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.02 }}
              className="relative max-w-md w-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-red-500/30 p-6 rounded-3xl shadow-2xl shadow-red-500/20 space-y-4"
            >
              {/* Animated glow border */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-red-500/20 pointer-events-none"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <button
                onClick={handleDismissYtPopup}
                className="absolute right-4 top-4 text-red-300 hover:text-red-100 p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                aria-label="Close Modal"
              >
                <X className="h-4 w-4" />
              </button>

              <motion.div
                initial={{ y: -10, scale: 0.9 }}
                animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center"
              >
                <Youtube className="h-14 w-14 text-red-500 drop-shadow-lg" />
              </motion.div>

              <motion.h3 
                className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🎥 Subscribe Our Channel!
              </motion.h3>

              <motion.p 
                className="text-sm text-center text-slate-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Join <span className="text-red-400 font-black text-base">@CoverDriveBangla</span> on YouTube for exclusive content!
              </motion.p>

              <motion.div 
                className="flex flex-col gap-3 pt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  disabled={isSubscribing}
                  onClick={handleSubscribe}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-black text-sm px-6 py-3 rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transform transition-transform hover:scale-105 disabled:opacity-80"
                >
                  {isSubscribing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Redirecting to YouTube...
                    </>
                  ) : (
                    <>
                      <Youtube className="h-5 w-5" />
                      🔔 SUBSCRIBE NOW
                    </>
                  )}
                </Button>
                <Button
                  disabled={isSubscribing}
                  onClick={handleDismissYtPopup}
                  variant="ghost"
                  className="text-slate-400 font-bold text-xs cursor-pointer hover:text-slate-200 disabled:opacity-50"
                >
                  Maybe Later
                </Button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}