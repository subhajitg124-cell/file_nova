import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Zap, FileText, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const LINKS = [
  {
    href: "/india-tools",
    icon: <Languages className="h-5 w-5" />,
    label: "India Tools",
    labelShort: "India",
    accent: "text-emerald-500",
    bgGlow: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderGlow: "border-emerald-500/20 group-hover:border-emerald-500/40",
  },
  {
    href: "/workflows",
    icon: <Zap className="h-5 w-5" />,
    label: "Workflows",
    labelShort: "Workflows",
    accent: "text-indigo-500",
    bgGlow: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    borderGlow: "border-indigo-500/20 group-hover:border-indigo-500/40",
  },
  {
    href: "/workspace",
    icon: <FileText className="h-5 w-5" />,
    label: "Workspace",
    labelShort: "Workspace",
    accent: "text-foreground",
    bgGlow: "from-foreground/5 via-transparent to-transparent",
    borderGlow: "border-border group-hover:border-foreground/30",
  },
];

export function FloatingSidePanel() {
  const { tText } = useTranslation();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navigate = (href: string) => {
    setIsOpen(false);
    setLocation(href);
  };

  const fab = (
    <motion.button
      onClick={() => setIsOpen(!isOpen)}
      whileHover={reducedMotion ? {} : { scale: 1.08 }}
      whileTap={reducedMotion ? {} : { scale: 0.92 }}
      className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-premium cursor-pointer"
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
    >
      {isOpen ? <X className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
    </motion.button>
  );

  const bottomSheet = (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      className="absolute bottom-16 left-0 w-56 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl p-2 shadow-2xl"
    >
      {LINKS.map((link) => (
        <button
          key={link.href}
          onClick={() => navigate(link.href)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer ${link.accent}`}
        >
          {link.icon}
          <span>{tText(link.label)}</span>
        </button>
      ))}
    </motion.div>
  );

  return (
    <>
      {/* Desktop: right-side floating pill dock with hover expand */}
      <nav
        className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 flex-col items-end"
        onMouseLeave={() => setHovered(null)}
        aria-label="Quick navigation"
      >
        <div className="flex flex-col gap-1.5 rounded-2xl border border-border/50 bg-background/70 backdrop-blur-xl p-1.5 shadow-premium">
          {LINKS.map((link) => {
            const isHovered = hovered === link.href;
            return (
              <motion.button
                key={link.href}
                onClick={() => setLocation(link.href)}
                onMouseEnter={() => setHovered(link.href)}
                onFocus={() => setHovered(link.href)}
                onBlur={() => setHovered(null)}
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
                className={`group flex items-center gap-2 px-2 py-2 rounded-xl border border-transparent ${link.borderGlow} bg-gradient-to-b ${link.bgGlow} hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 cursor-pointer overflow-hidden`}
                title={tText(link.label)}
                aria-label={tText(link.label)}
                layout
              >
                <span className={`shrink-0 ${link.accent}`}>{link.icon}</span>
                <motion.span
                  initial={false}
                  animate={{
                    width: isHovered ? "auto" : 0,
                    opacity: isHovered ? 1 : 0,
                  }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
                  className="text-xs font-bold text-muted-foreground group-hover:text-foreground leading-tight whitespace-nowrap overflow-hidden"
                >
                  {tText(link.labelShort)}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Mobile: FAB + bottom sheet */}
      <div ref={containerRef} className="lg:hidden fixed bottom-6 left-6 z-45">
        {fab}
        <AnimatePresence>
          {isOpen && bottomSheet}
        </AnimatePresence>
      </div>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? {} : { opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
