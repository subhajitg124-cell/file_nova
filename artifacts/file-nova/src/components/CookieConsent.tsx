import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ShieldCheck, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function CookieConsent() {
  const { tText } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent_accepted");
    if (!consent) {
      // Small delay on load for a premium fade-in feel
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent_accepted", "true");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent_accepted", "false");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        .cookie-banner-container {
          position: fixed;
          bottom: 24px;
          left: 24px;
          max-width: 380px;
          width: calc(100vw - 48px);
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
          z-index: 99999;
          font-family: inherit;
          backdrop-filter: blur(12px);
          animation: slide-up-cookie 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          color: #FFFFFF;
          box-sizing: border-box;
        }

        @keyframes slide-up-cookie {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .cookie-title {
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #6366F1;
        }

        .cookie-desc {
          font-size: 12px;
          line-height: 1.5;
          color: #E2E8F0;
          margin-bottom: 16px;
        }

        .cookie-links {
          color: #6366F1;
          text-decoration: underline;
          transition: color 0.15s ease;
        }

        .cookie-links:hover {
          color: #818cf8;
        }

        .cookie-btn-group {
          display: flex;
          gap: 10px;
        }

        .cookie-btn {
          flex: 1;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease, opacity 0.15s ease;
        }

        .cookie-btn-accept {
          background: #6366F1;
          color: #FFFFFF;
        }

        .cookie-btn-accept:hover {
          background: #4F46E5;
        }

        .cookie-btn-decline {
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .cookie-btn-decline:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .cookie-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s ease;
          padding: 2px;
        }

        .cookie-close-btn:hover {
          color: #cbd5e1;
        }

        @media (max-width: 640px) {
          .cookie-banner-container {
            bottom: 16px;
            left: 16px;
            right: 16px;
            max-width: none;
            width: calc(100vw - 32px);
          }
        }
      `}</style>

      <div className="cookie-banner-container">
        <button className="cookie-close-btn" onClick={handleDecline} aria-label={tText("Close cookie banner")}>
          <X className="h-4 w-4" />
        </button>
        <div className="cookie-title">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          <span>{tText("Cookie Consent")}</span>
        </div>
        <p className="cookie-desc">
          {tText("FileNova uses cookies and similar technologies to measure site performance, personalize content, and serve relevant Google Ads. Read our ")}
          <Link href="/privacy" className="cookie-links">{tText("Privacy Policy")}</Link>
          {tText(" and ")}
          <Link href="/cookie-policy" className="cookie-links">{tText("Cookie Policy")}</Link>
          {tText(" for details.")}
        </p>
        <div className="cookie-btn-group">
          <button className="cookie-btn cookie-btn-accept" onClick={handleAccept}>
            {tText("Accept All")}
          </button>
          <button className="cookie-btn cookie-btn-decline" onClick={handleDecline}>
            {tText("Decline")}
          </button>
        </div>
      </div>
    </>
  );
}
export default CookieConsent;
