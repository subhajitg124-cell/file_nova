import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Zap, ChevronDown } from "lucide-react";
import { TOOLS, type Tool } from "./PopularToolsGrid";
import { useDismissablePanel } from "@/hooks/useDismissablePanel";

const CATEGORIES = [
  {
    title: "PDF Operations",
    routes: ["/merge-pdf", "/split-pdf", "/compress-pdf", "/rotate-pdf", "/protect-pdf", "/unlock-pdf", "/compress-pdf-for-upload"],
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
  },
  {
    title: "Document Converters",
    routes: ["/pdf-to-word", "/pdf-to-jpg", "/jpg-to-pdf", "/word-to-pdf"],
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
  },
  {
    title: "Govt & Student Portals",
    routes: ["/pan-card-resize", "/aadhaar-mask-pdf", "/government-form-fill", "/scholarship-zip"],
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
  },
  {
    title: "AI Tools",
    routes: ["/ocr", "/remove-background", "/ai-pdf-summary"],
    badgeColor: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20"
  }
];

export function PopularToolsDropdown() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useDismissablePanel({
    isOpen: open,
    onClose: () => setOpen(false),
    panelRef: ref,
    triggerRef: buttonRef,
  });

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-1.5 border border-border rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors duration-150 cursor-pointer shadow-sm select-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        title="Popular Tools Shortcuts"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 transition-transform group-hover:scale-110 duration-300 fill-amber-500/20 dark:fill-amber-400/20 animate-pulse" />
        <span className="font-semibold">Popular Tools</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="text-muted-foreground shrink-0"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      {/* Dropdown container */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 mt-3 z-[9999] w-[90vw] sm:w-[520px] fn-glass rounded-xl shadow-[var(--fn-shadow-elevated)] overflow-hidden text-[var(--fn-text-primary)]"
            style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}
          >
            {/* Header banner */}
            <div className="px-5 py-3.5 border-b border-border/50 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400 fill-amber-400/30" />
                <span className="text-xs font-black text-amber-600 dark:text-amber-300 uppercase tracking-widest">
                  Quick Shortcuts
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-bold">30+ Free Tools</span>
            </div>

            {/* Scrollable list container */}
            <div className="p-4 max-h-[440px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-5">
              {CATEGORIES.map((category, catIdx) => {
                // Find tools in this category
                const catTools = category.routes
                  .map((r) => TOOLS.find((t) => t.route === r))
                  .filter((t): t is Tool => !!t);

                if (catTools.length === 0) return null;

                return (
                  <div key={category.title} className="space-y-2.5">
                    {/* Category Title Badge */}
                    <div className="flex items-center">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border tracking-wider uppercase leading-none ${category.badgeColor}`}>
                        {category.title}
                      </span>
                    </div>

                    {/* Category Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catTools.map((tool, idx) => {
                        const Icon = tool.icon;
                        const absoluteIndex = catIdx * 10 + idx;
                        return (
                          <motion.button
                            key={tool.route}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: absoluteIndex * 0.015, duration: 0.18, ease: "easeOut" }}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setLocation(tool.route);
                              setOpen(false);
                            }}
                            className="group relative w-full flex items-center gap-3 p-2.5 rounded-xl text-left bg-[var(--fn-surface-elevated)] border border-[var(--fn-border)] hover:border-[var(--fn-border-strong)] transition-all cursor-pointer overflow-hidden text-[var(--fn-text-primary)]"
                          >
                            {/* Inner gradient glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            {/* Icon container */}
                            <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${tool.gradient} border border-[var(--fn-border)] shrink-0 group-hover:scale-105 duration-300`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>

                            {/* Label & Description */}
                            <div className="relative min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="block font-black text-xs text-[var(--fn-text-primary)] group-hover:text-[var(--fn-accent-primary)] truncate transition-colors leading-tight">
                                  {tool.label}
                                </span>
                                {tool.badge && (
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-1 py-0.2 rounded-full leading-none shrink-0 ${
                                    tool.badge === "AI"
                                      ? "bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-400/20"
                                      : "bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-400/20"
                                  }`}>
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <span className="block text-[10px] text-[var(--fn-text-secondary)] group-hover:text-[var(--fn-text-primary)] truncate mt-0.5 transition-colors leading-none font-semibold">
                                {tool.description}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
