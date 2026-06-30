import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ShieldCheck, X, Settings, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { loadGoogleAnalytics, clearGoogleAnalyticsCookies } from "@/lib/analytics";
import { useDismissablePanel } from "@/hooks/useDismissablePanel";

export function CookieConsent() {
  const { tText } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem("fn-cookie-consent");
    if (!consent) {
      // 1.5s delay on load for a premium fade-in feel
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom window event to reopen/customize preferences
  useEffect(() => {
    const handleOpenConsent = () => {
      const consent = localStorage.getItem("fn-cookie-consent");
      setAnalyticsEnabled(consent === "all");
      setExpanded(true);
      setVisible(true);
    };

    window.addEventListener("openCookieConsentBanner", handleOpenConsent);
    return () => {
      window.removeEventListener("openCookieConsentBanner", handleOpenConsent);
    };
  }, []);

  // Shared dismiss hook to allow Escape key to close the banner when it was manually opened
  useDismissablePanel({
    isOpen: visible && expanded,
    onClose: () => setVisible(false),
    panelRef: bannerRef
  });

  const saveConsent = (choice: "all" | "essential") => {
    localStorage.setItem("fn-cookie-consent", choice);
    if (choice === "all") {
      loadGoogleAnalytics();
    } else {
      clearGoogleAnalyticsCookies();
    }
    setVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent("all");
  };

  const handleEssentialOnly = () => {
    saveConsent("essential");
  };

  const handleSaveCustom = () => {
    saveConsent(analyticsEnabled ? "all" : "essential");
  };

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label={tText("Cookie Consent Banner")}
      className="fixed bottom-0 left-0 right-0 w-full z-[9999] fn-glass border-t border-[var(--fn-border)] shadow-premium bg-[var(--fn-surface-glass)] backdrop-blur-xl p-5 md:p-6 transition-all duration-300 transform translate-y-0"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-4 text-[var(--fn-text-primary)]">
        
        {/* Main Banner Message */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-wider text-indigo-500 leading-none">
                {tText("Cookie Consent")}
              </h4>
              <p className="text-xs text-[var(--fn-text-secondary)] leading-relaxed mt-1 max-w-3xl">
                {tText("We use cookies for analytics to improve FileNova. No data is sold or shared with advertisers. Read our ")}
                <Link href="/privacy" className="text-indigo-400 hover:underline">{tText("Privacy Policy")}</Link>
                {tText(" and ")}
                <Link href="/cookie-policy" className="text-indigo-400 hover:underline">{tText("Cookie Policy")}</Link>
                {tText(" for details.")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end md:self-center flex-wrap">
            <button
              onClick={handleEssentialOnly}
              className="py-2 px-4 rounded-xl border border-[var(--fn-border)] hover:bg-[var(--fn-surface-elevated)] text-xs font-bold text-[var(--fn-text-secondary)] transition-colors cursor-pointer select-none"
            >
              {tText("Essential Only")}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="py-2 px-4 rounded-xl border border-[var(--fn-border)] hover:bg-[var(--fn-surface-elevated)] text-xs font-bold text-[var(--fn-text-secondary)] transition-colors cursor-pointer select-none flex items-center gap-1.5"
            >
              <Settings className="h-3.5 w-3.5" />
              {tText("Customize")}
            </button>
            <button
              onClick={handleAcceptAll}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer select-none"
            >
              {tText("Accept All")}
            </button>
          </div>
        </div>

        {/* Customized Settings Expansion Panel */}
        {expanded && (
          <div className="border-t border-[var(--fn-border)] pt-4 mt-2 space-y-4 animate-fadeIn">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-indigo-500 mb-2">
              {tText("Manage Cookie Preferences")}
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Essential Option Card */}
              <div className="p-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)]/40 flex items-center justify-between gap-4">
                <div className="space-y-0.5 text-left">
                  <span className="block text-xs font-bold text-[var(--fn-text-primary)]">
                    {tText("Essential Cookies")}
                  </span>
                  <span className="block text-[10px] text-[var(--fn-text-tertiary)] leading-normal">
                    {tText("Required for user sessions, system settings, and basic features. Cannot be disabled.")}
                  </span>
                </div>
                
                {/* Always-on switch */}
                <div className="relative inline-flex items-center cursor-not-allowed">
                  <div className="w-9 h-5 bg-indigo-600/30 dark:bg-indigo-500/20 rounded-full border border-indigo-500/30 flex items-center justify-end px-0.5">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Option Card */}
              <div className="p-4 rounded-2xl border border-[var(--fn-border)] bg-[var(--fn-surface)]/40 flex items-center justify-between gap-4">
                <div className="space-y-0.5 text-left">
                  <span className="block text-xs font-bold text-[var(--fn-text-primary)]">
                    {tText("Analytics Cookies (Google Analytics)")}
                  </span>
                  <span className="block text-[10px] text-[var(--fn-text-tertiary)] leading-normal">
                    {tText("Helps us gather anonymous traffic stats to improve our application and document automation tools.")}
                  </span>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                  className="relative inline-flex items-center h-5 w-9 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  style={{
                    backgroundColor: analyticsEnabled ? "var(--fn-accent-primary)" : "rgba(148, 163, 184, 0.2)"
                  }}
                  aria-label={tText("Toggle Analytics Cookies")}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                      analyticsEnabled ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveCustom}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer select-none"
              >
                {tText("Save Preferences")}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default CookieConsent;
