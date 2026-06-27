import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, FileText, Languages, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const LINKS = [
  {
    href: "/india-tools",
    icon: <Languages className="h-4 w-4" />,
    label: "India Tools",
    accent: "text-emerald-500",
    bgGlow: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderGlow: "border-emerald-500/20 group-hover:border-emerald-500/40",
  },
  {
    href: "/workflows",
    icon: <Zap className="h-4 w-4" />,
    label: "Workflows",
    accent: "text-indigo-500",
    bgGlow: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    borderGlow: "border-indigo-500/20 group-hover:border-indigo-500/40",
  },
  {
    href: "/workspace",
    icon: <FileText className="h-4 w-4" />,
    label: "Workspace",
    accent: "text-foreground",
    bgGlow: "from-foreground/5 via-transparent to-transparent",
    borderGlow: "border-border group-hover:border-foreground/30",
  },
];

export function FloatingSidePanel() {
  const { tText } = useTranslation();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const navigate = (href: string) => {
    setIsOpen(false);
    setLocation(href);
  };

  return (
    <>
      {/* Desktop: vertical pill dock — always visible on lg+ */}
      <div className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col gap-2">
        <div className="flex flex-col gap-1.5 rounded-2xl border border-border/50 bg-background/70 backdrop-blur-xl p-1.5 shadow-premium">
          {LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => setLocation(link.href)}
              className={`group flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl border border-transparent ${link.borderGlow} bg-gradient-to-b ${link.bgGlow} hover:bg-background/80 transition-all duration-200 cursor-pointer`}
              title={tText(link.label)}
            >
              <span className={link.accent}>{link.icon}</span>
              <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground leading-tight transition-colors duration-200">
                {tText(link.label === "India Tools" ? "India" : link.label === "Workflows" ? "Workflows" : "Workspace")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: FAB button */}
      <div ref={containerRef} className="lg:hidden fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-premium cursor-pointer animate-pulse-glow"
          aria-label="Open navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-16 right-0 w-56 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl p-2 shadow-2xl"
            >
              {LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-muted/80 transition-colors cursor-pointer ${link.accent}`}
                >
                  {link.icon}
                  <span>{tText(link.label)}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
