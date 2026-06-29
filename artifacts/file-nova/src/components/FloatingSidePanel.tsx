import React, { useState } from "react";
import { useLocation } from "wouter";
import { Languages, Zap, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function FloatingSidePanel() {
  const { tText } = useTranslation();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

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

  const showIndianTools = !isDashboard;
  const showWorkflows = true;
  const showWorkspace = !isWorkspacePage;

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  return (
    <>
      <style>{`
        @keyframes fabUp {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fabDown {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(10px) scale(0.9); }
        }

        .fab-container {
          position: fixed;
          bottom: 24px;
          right: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 9999;
        }

        .fab-btn {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: #FFFFFF;
          border: none;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.10),
                      0 1px 3px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }

        .fab-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
        }

        .fab-btn.active {
          background: #6366F1;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        /* Dark Mode overrides */
        .dark .fab-btn {
          background: rgba(30, 38, 60, 0.9);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        }

        .dark .fab-btn.active {
          background: #6366F1;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
        }

        /* Toggle pill trigger button */
        .fab-toggle-pill {
          width: 32px;
          height: 6px;
          border-radius: 3px;
          background: rgba(99, 102, 241, 0.3);
          border: none;
          cursor: pointer;
          margin-top: 2px;
          transition: background 0.15s ease;
        }

        .fab-toggle-pill:hover {
          background: rgba(99, 102, 241, 0.5);
        }

        /* Animations and states */
        .fab-btn-list {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .fab-btn-list.open .fab-btn {
          visibility: visible;
          pointer-events: auto;
        }

        .fab-btn-list.closed .fab-btn {
          visibility: hidden;
          pointer-events: none;
          transition: visibility 0s linear 0.2s;
        }

        .fab-btn-list.open .fab-btn:nth-child(1) { animation: fabUp 0.2s ease 0.00s both; }
        .fab-btn-list.open .fab-btn:nth-child(2) { animation: fabUp 0.2s ease 0.05s both; }
        .fab-btn-list.open .fab-btn:nth-child(3) { animation: fabUp 0.2s ease 0.10s both; }

        .fab-btn-list.closed .fab-btn:nth-child(1) { animation: fabDown 0.2s ease 0.10s both; }
        .fab-btn-list.closed .fab-btn:nth-child(2) { animation: fabDown 0.2s ease 0.05s both; }
        .fab-btn-list.closed .fab-btn:nth-child(3) { animation: fabDown 0.2s ease 0.00s both; }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .fab-btn {
            animation: none !important;
            transition: none !important;
          }
          .fab-btn-list.closed {
            display: none !important;
          }
          .fab-btn-list.open {
            display: flex !important;
          }
          .fab-btn-list.open .fab-btn {
            visibility: visible !important;
            pointer-events: auto !important;
          }
          .fab-btn-list.closed .fab-btn {
            visibility: hidden !important;
            pointer-events: none !important;
          }
        }
      `}</style>

      <div className="fab-container">
        <div className={`fab-btn-list ${open ? "open" : "closed"}`}>
          {showIndianTools && (
            <button
              onClick={() => handleNavigate("/india-tools")}
              className={`fab-btn ${location === "/india-tools" ? "active" : ""}`}
              aria-label="Indian Tools"
            >
              <Languages
                className="h-[22px] w-[22px] shrink-0"
                style={{ color: location === "/india-tools" ? "#FFFFFF" : "#6366F1" }}
              />
            </button>
          )}

          {showWorkflows && (
            <button
              onClick={() => handleNavigate("/workflows")}
              className={`fab-btn ${location === "/workflows" ? "active" : ""}`}
              aria-label="Workflows"
            >
              <Zap
                className="h-[22px] w-[22px] shrink-0"
                style={{ color: location === "/workflows" ? "#FFFFFF" : "#F59E0B" }}
              />
            </button>
          )}

          {showWorkspace && (
            <button
              onClick={() => handleNavigate("/workspace")}
              className={`fab-btn ${location === "/workspace" ? "active" : ""}`}
              aria-label="Workspace"
            >
              <FileText
                className="h-[22px] w-[22px] shrink-0"
                style={{ color: location === "/workspace" ? "#FFFFFF" : "#6366F1" }}
              />
            </button>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="fab-toggle-pill"
          aria-label="Toggle floating shortcuts"
          {...(open ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
        />
      </div>
    </>
  );
}
