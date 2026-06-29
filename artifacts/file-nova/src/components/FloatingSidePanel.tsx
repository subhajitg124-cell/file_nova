import React from "react";
import { useLocation } from "wouter";
import { Languages, Zap, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function FloatingSidePanel() {
  const { tText } = useTranslation();
  const [location, setLocation] = useLocation();

  const HIDE_FAB_ROUTES = [
    '/login', '/signup', '/pricing', '/referral',
    '/admin', '/dev', '/auth', '/checkout'
  ];
  
  const shouldShowFAB = !HIDE_FAB_ROUTES.some(route => 
    location.startsWith(route)
  );

  if (!shouldShowFAB) return null;

  const isWorkspacePage = location === '/workspace';
  const isDashboard = location === '/dashboard';

  const showTranslate = !isDashboard;
  const showWorkspace = !isWorkspacePage;
  const showBolt = true;

  return (
    <>
      <style>{`
        @keyframes fabSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fab-btn-glass {
            animation: none !important;
          }
        }
        .fab-btn-glass:nth-child(1) { animation: fabSlideIn 0.25s ease 0.05s both; }
        .fab-btn-glass:nth-child(2) { animation: fabSlideIn 0.25s ease 0.10s both; }
        .fab-btn-glass:nth-child(3) { animation: fabSlideIn 0.25s ease 0.15s both; }

        .fab-container {
          position: fixed;
          bottom: 24px;
          right: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          z-index: 9999;
        }

        .fab-btn-glass {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(15, 22, 38, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4),
                      0 1px 0 rgba(255, 255, 255, 0.05) inset;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
        }

        .fab-btn-glass:active {
          transform: scale(0.92) !important;
        }

        .fab-btn-translate:hover {
          border-color: rgba(99, 102, 241, 0.5) !important;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.25) !important;
        }
        .fab-btn-bolt:hover {
          border-color: rgba(245, 158, 11, 0.5) !important;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2) !important;
        }
        .fab-btn-workspace:hover {
          border-color: rgba(16, 185, 129, 0.5) !important;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2) !important;
        }

        .fab-tooltip-new {
          position: absolute;
          right: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(15, 22, 38, 0.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 500;
          color: #F1F5F9;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 10000;
        }

        .fab-btn-glass:hover .fab-tooltip-new {
          opacity: 1;
        }

        .fab-tooltip-new::after {
          content: "";
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-left-color: rgba(15, 22, 38, 0.9);
        }

        /* Light Mode overrides */
        html:not(.dark) .fab-btn-glass {
          background: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(15, 23, 42, 0.1) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1),
                      0 1px 0 rgba(255, 255, 255, 0.9) inset !important;
        }
        html:not(.dark) .fab-tooltip-new {
          background: rgba(255, 255, 255, 0.95) !important;
          color: #0f172a !important;
          border-color: rgba(15, 23, 42, 0.1) !important;
        }
        html:not(.dark) .fab-tooltip-new::after {
          border-left-color: rgba(255, 255, 255, 0.95) !important;
        }
      `}</style>

      <div className="fab-container" aria-label="Quick actions">
        {showTranslate && (
          <button
            onClick={() => setLocation("/india-tools")}
            className="fab-btn-glass fab-btn-translate"
            aria-label="Translate"
          >
            <Languages className="h-[18px] w-[18px] shrink-0" style={{ color: "#818CF8" }} />
            <span className="fab-tooltip-new">{tText("Translate")}</span>
          </button>
        )}

        {showBolt && (
          <button
            onClick={() => setLocation("/workflows")}
            className="fab-btn-glass fab-btn-bolt"
            aria-label="AI Tools"
          >
            <Zap className="h-[18px] w-[18px] shrink-0" style={{ color: "#FCD34D" }} />
            <span className="fab-tooltip-new">{tText("AI Tools")}</span>
          </button>
        )}

        {showWorkspace && (
          <button
            onClick={() => setLocation("/workspace")}
            className="fab-btn-glass fab-btn-workspace"
            aria-label="Workspace"
          >
            <FileText className="h-[18px] w-[18px] shrink-0" style={{ color: "#34D399" }} />
            <span className="fab-tooltip-new">{tText("Workspace")}</span>
          </button>
        )}
      </div>
    </>
  );
}
