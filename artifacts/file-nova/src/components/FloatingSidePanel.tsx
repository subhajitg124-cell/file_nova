import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Languages, Zap, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function FloatingSidePanel() {
  const { tText } = useTranslation();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mobileExpandedIcon, setMobileExpandedIcon] = useState<string | null>(null);
  const [longPressedIcon, setLongPressedIcon] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const HIDE_FAB_ROUTES = [
    '/login', '/signup', '/pricing', '/referral',
    '/admin', '/dev', '/auth', '/checkout'
  ];
  
  const shouldShowFAB = !HIDE_FAB_ROUTES.some(route => 
    location.startsWith(route)
  );

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const hintSeen = localStorage.getItem("sidebar_hint_seen");
    if (!hintSeen) {
      const timer = setTimeout(() => {
        setHintOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsHovered(false);
        setMobileExpandedIcon(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  if (!shouldShowFAB) return null;

  const isWorkspacePage = location === '/workspace';
  const isDashboard = location === '/dashboard';

  const showIndianTools = !isDashboard;
  const showWorkflows = true;
  const showWorkspace = !isWorkspacePage;

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  const dismissHint = () => {
    localStorage.setItem("sidebar_hint_seen", "true");
    setHintOpen(false);
  };

  const handleButtonClick = (path: string, iconId: string, event: React.MouseEvent) => {
    if (isTouchDevice) {
      const isCurrentlyExpanded = open || isHovered;
      if (!isCurrentlyExpanded) {
        event.preventDefault();
        setOpen(true);
        setMobileExpandedIcon(iconId);
        return;
      }
      if (mobileExpandedIcon !== iconId) {
        event.preventDefault();
        setMobileExpandedIcon(iconId);
        return;
      }
    }
    handleNavigate(path);
  };

  const handleTouchStart = (iconId: string) => {
    longPressTimeout.current = setTimeout(() => {
      setLongPressedIcon(iconId);
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    setTimeout(() => {
      setLongPressedIcon(null);
    }, 1500);
  };

  const isExpanded = open || isHovered;

  return (
    <>
      <style>{`
        .fab-container {
          position: fixed;
          bottom: 24px;
          right: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 9999;
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          padding: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          width: 56px;
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, border-color 0.15s ease;
          overflow: hidden;
          box-sizing: border-box;
        }

        .fab-container.expanded {
          width: 172px;
          align-items: flex-start;
          padding: 8px 10px;
        }

        /* Dark Mode overrides for container */
        .dark .fab-container {
          background: rgba(30, 38, 60, 0.9);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
        }

        .fab-btn-list {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .fab-container.expanded .fab-btn-list {
          align-items: flex-start;
        }

        .fab-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s ease, transform 0.15s ease, width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          color: inherit;
          text-decoration: none;
          outline: none;
          gap: 0px;
          box-sizing: border-box;
        }

        .fab-container.expanded .fab-btn {
          width: 100%;
          justify-content: flex-start;
          gap: 12px;
          padding-left: 8px;
          background: rgba(99, 102, 241, 0.02);
        }
        
        .dark .fab-container.expanded .fab-btn {
          background: rgba(255, 255, 255, 0.02);
        }

        .fab-btn:hover {
          background: rgba(99, 102, 241, 0.08);
          transform: scale(1.04);
        }

        .fab-btn.active {
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
        }

        .fab-btn-text {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          opacity: 0;
          max-width: 0;
          transform: translateX(-10px);
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.2s ease, max-width 0.2s ease, transform 0.2s ease;
        }

        .dark .fab-btn-text {
          color: #cbd5e1;
        }

        .fab-container.expanded .fab-btn-text {
          opacity: 1;
          max-width: 110px;
          transform: translateX(0);
        }

        /* Divider line */
        .fab-divider {
          width: 24px;
          height: 1px;
          background: rgba(0, 0, 0, 0.08);
          margin: 4px 0;
          transition: width 0.2s ease;
        }

        .dark .fab-divider {
          background: rgba(255, 255, 255, 0.08);
        }

        .fab-container.expanded .fab-divider {
          width: 100%;
        }

        /* Bottom handle button */
        .fab-toggle-pill {
          width: 40px;
          height: 28px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.06);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366F1;
          transition: background-color 0.15s ease, width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease;
          position: relative;
        }

        .fab-toggle-pill:hover {
          background: rgba(99, 102, 241, 0.12);
        }

        .fab-container.expanded .fab-toggle-pill {
          width: 100%;
          justify-content: flex-start;
          gap: 12px;
          padding-left: 8px;
          background: transparent;
          color: #6366F1;
        }

        .fab-container.expanded .fab-toggle-pill:hover {
          background: rgba(99, 102, 241, 0.05);
        }

        /* Bouncing animation for collapsed handle */
        @keyframes idle-bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          85% {
            transform: translateY(-4px);
          }
          90% {
            transform: translateY(1px);
          }
          95% {
            transform: translateY(-2px);
          }
        }

        .fab-container:not(.expanded) .fab-toggle-pill.animate-bounce {
          animation: idle-bounce 5s ease-in-out infinite;
        }

        /* Tooltips */
        .fab-tooltip {
          position: absolute;
          right: 52px;
          top: 50%;
          transform: translateY(-50%) translateX(10px);
          background: rgba(15, 23, 42, 0.95);
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          z-index: 10000;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: opacity 0.15s ease, transform 0.15s ease;
        }

        .fab-btn:hover .fab-tooltip,
        .fab-toggle-pill:hover .fab-tooltip,
        .fab-tooltip.visible-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        .fab-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-left-color: rgba(15, 23, 42, 0.95);
        }

        .fab-container.expanded .fab-tooltip {
          display: none !important;
        }

        /* Keyboard Focus Visible */
        .fab-btn:focus-visible,
        .fab-toggle-pill:focus-visible {
          outline: 2px solid #6366F1;
          outline-offset: 2px;
        }

        /* First-time coach mark hint styling */
        .fab-coachmark {
          position: fixed;
          bottom: 24px;
          right: 88px;
          width: 220px;
          background: rgba(15, 23, 42, 0.95);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          z-index: 9999;
          font-family: inherit;
          backdrop-filter: blur(12px);
          animation: coachmark-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes coachmark-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fab-coachmark::after {
          content: '';
          position: absolute;
          left: 100%;
          bottom: 18px;
          border: 8px solid transparent;
          border-left-color: rgba(15, 23, 42, 0.95);
        }

        .fab-coachmark-title {
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 6px;
          color: #F59E0B;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .fab-coachmark-text {
          font-size: 11px;
          line-height: 1.4;
          color: #E2E8F0;
          margin-bottom: 10px;
        }

        .fab-coachmark-btn {
          width: 100%;
          background: #6366F1;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 600;
          padding: 6px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .fab-coachmark-btn:hover {
          background: #4F46E5;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .fab-container, .fab-btn, .fab-toggle-pill, .fab-btn-text, .fab-tooltip, .fab-coachmark {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      {hintOpen && (
        <div className="fab-coachmark">
          <div className="fab-coachmark-title">
            <span>💡</span> {tText("Tip")}
          </div>
          <div className="fab-coachmark-text">
            {isTouchDevice 
              ? tText("Tap the bottom handle to expand the sidebar and see labels.") 
              : tText("Hover over icons to see labels. Click the bottom handle to expand the sidebar.")
            }
          </div>
          <button onClick={dismissHint} className="fab-coachmark-btn">
            {tText("Got it")}
          </button>
        </div>
      )}

      <div 
        ref={panelRef}
        className={`fab-container ${isExpanded ? "expanded" : ""}`}
        onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
        onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
      >
        <div className="fab-btn-list">
          {showIndianTools && (
            <button
              onClick={(e) => handleButtonClick("/india-tools", "india-tools", e)}
              onTouchStart={() => handleTouchStart("india-tools")}
              onTouchEnd={handleTouchEnd}
              className={`fab-btn ${location === "/india-tools" ? "active" : ""}`}
              aria-label={tText("Indian Tools")}
            >
              <Languages
                className="h-[22px] w-[22px] shrink-0"
                style={{ color: location === "/india-tools" ? "#FFFFFF" : "#6366F1" }}
              />
              <span className="fab-btn-text">{tText("India Tools")}</span>
              <div className={`fab-tooltip ${longPressedIcon === "india-tools" ? "visible-tooltip" : ""}`} role="tooltip">
                🌐 {tText("India Tools")}
              </div>
            </button>
          )}

          {showWorkflows && (
            <button
              onClick={(e) => handleButtonClick("/workflows", "workflows", e)}
              onTouchStart={() => handleTouchStart("workflows")}
              onTouchEnd={handleTouchEnd}
              className={`fab-btn ${location === "/workflows" ? "active" : ""}`}
              aria-label={tText("Workflows")}
            >
              <Zap
                className="h-[22px] w-[22px] shrink-0"
                style={{ color: location === "/workflows" ? "#FFFFFF" : "#F59E0B" }}
              />
              <span className="fab-btn-text">{tText("Workflows")}</span>
              <div className={`fab-tooltip ${longPressedIcon === "workflows" ? "visible-tooltip" : ""}`} role="tooltip">
                ⚡ {tText("Workflows")}
              </div>
            </button>
          )}

          {showWorkspace && (
            <button
              onClick={(e) => handleButtonClick("/workspace", "workspace", e)}
              onTouchStart={() => handleTouchStart("workspace")}
              onTouchEnd={handleTouchEnd}
              className={`fab-btn ${location === "/workspace" ? "active" : ""}`}
              aria-label={tText("Workspace")}
            >
              <FileText
                className="h-[22px] w-[22px] shrink-0"
                style={{ color: location === "/workspace" ? "#FFFFFF" : "#6366F1" }}
              />
              <span className="fab-btn-text">{tText("Workspace")}</span>
              <div className={`fab-tooltip ${longPressedIcon === "workspace" ? "visible-tooltip" : ""}`} role="tooltip">
                📄 {tText("Workspace")}
              </div>
            </button>
          )}
        </div>

        <div className="fab-divider" />

        <button
          onClick={() => {
            setOpen(!open);
            setMobileExpandedIcon(null);
          }}
          className={`fab-toggle-pill ${!isExpanded ? "animate-bounce" : ""}`}
          aria-label={isExpanded ? tText("Collapse Sidebar") : tText("Expand Sidebar")}
          {...(isExpanded ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
        >
          {isExpanded ? (
            <>
              <ChevronRight className="h-[18px] w-[18px] shrink-0" />
              <span className="fab-btn-text">{tText("Collapse")}</span>
            </>
          ) : (
            <>
              <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
              <div className="fab-tooltip" role="tooltip">
                {tText("Expand Sidebar")}
              </div>
            </>
          )}
        </button>
      </div>
    </>
  );
}
