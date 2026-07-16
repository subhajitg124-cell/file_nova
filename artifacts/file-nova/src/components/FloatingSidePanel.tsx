import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Languages, Zap, FileText, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

interface PanelItem {
  id: string;
  path: string;
  icon: React.ElementType;
  label: string;
  color: string;
  show: boolean;
}

export function FloatingSidePanel() {
  const { tText } = useTranslation();
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const HIDE_ROUTES = ['/login', '/signup', '/pricing', '/referral', '/admin', '/dev', '/auth', '/checkout'];
  const shouldShow = !HIDE_ROUTES.some(route => location.startsWith(route));

  const isWorkspacePage = location === '/workspace';
  const isDashboard = location === '/dashboard';

  const items: PanelItem[] = [
    { id: "india-tools", path: "/india-tools", icon: Languages, label: "India Tools", color: "text-emerald-500", show: !isDashboard },
    { id: "workflows", path: "/workflows", icon: Zap, label: "Workflows", color: "text-amber-500", show: true },
    { id: "workspace", path: "/workspace", icon: FileText, label: "Workspace", color: "text-primary", show: !isWorkspacePage },
  ];

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const hintSeen = localStorage.getItem("sidebar_hint_seen_v2");
    if (!hintSeen) {
      const timer = setTimeout(() => setHintOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!shouldShow) return null;

  const visibleItems = items.filter(item => item.show);

  return (
    <>
      {/* Coachmark hint */}
      <AnimatePresence>
        {hintOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-[90px] right-20 z-[9998] max-w-[200px] bg-card border border-border rounded-xl p-3.5 shadow-lg backdrop-blur-xl"
          >
            <p className="text-xs font-bold text-foreground mb-1">{tText("Quick Access")}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mb-2.5">
              {tText("Navigate to India Tools, Workflows, or Workspace from anywhere.")}
            </p>
            <button
              onClick={() => { localStorage.setItem("sidebar_hint_seen_v2", "true"); setHintOpen(false); }}
              className="w-full text-[10px] font-bold text-primary hover:text-primary/80 py-1.5 rounded-lg bg-primary/10 transition cursor-pointer"
            >
              {tText("Got it")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main panel */}
      <div ref={panelRef} className="fixed bottom-6 right-4 z-[9999] flex flex-col items-center">
        <div
          className={`
            flex flex-col gap-1.5 p-1.5 rounded-2xl
            bg-card/80 backdrop-blur-xl border border-border/60
            shadow-lg
            transition-all duration-200 ease-out
            ${expanded ? 'w-[180px] items-stretch' : 'w-[52px] items-center'}
          `}
        >
          {/* Nav items */}
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.id}
                onClick={() => { window.location.href = item.path; }}
                className={`
                  group relative flex items-center rounded-xl transition-all duration-150 cursor-pointer
                  ${expanded ? 'justify-start gap-2.5 px-3 py-2' : 'justify-center w-[40px] h-[40px] mx-auto'}
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }
                `}
                aria-label={tText(item.label)}
                title={!expanded ? item.label : undefined}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary-foreground' : item.color}`} strokeWidth={isActive ? 2.5 : 2} />
                {expanded && (
                  <span className="text-xs font-semibold truncate">{tText(item.label)}</span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className={`h-px bg-border/50 my-0.5 ${expanded ? 'mx-0' : 'mx-2'}`} />

          {/* Toggle button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`
              flex items-center rounded-xl transition-all duration-150 cursor-pointer
              ${expanded ? 'justify-start gap-2.5 px-3 py-2' : 'justify-center w-[40px] h-[40px] mx-auto'}
              text-muted-foreground hover:text-foreground hover:bg-muted/60
            `}
            aria-label={expanded ? tText("Collapse") : tText("Expand")}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronRight className="h-[18px] w-[18px] shrink-0" />
                <span className="text-xs font-semibold">{tText("Collapse")}</span>
              </>
            ) : (
              <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default FloatingSidePanel;
