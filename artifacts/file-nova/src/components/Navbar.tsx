import React, { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Settings2, Crown, Menu, X, Zap, FileText
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import { useAuthStore } from "@/store/useAuthStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { PopularToolsDropdown } from "@/components/PopularToolsDropdown";
import { SmartSearchBar } from "@/components/SmartSearchBar";

interface NavbarProps {
  showSearch?: boolean;
}

export const Navbar = memo(function Navbar({ showSearch = true }: NavbarProps) {
  const { tText } = useTranslation();
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen && !settingsOpen && !moreMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const header = document.querySelector("header");
      const mobileMenu = document.querySelector(".mobile-menu-panel");
      if (
        (header && header.contains(target)) ||
        (mobileMenu && mobileMenu.contains(target))
      ) return;
      if (mobileMenuOpen) setMobileMenuOpen(false);
      if (settingsOpen) setSettingsOpen(false);
      if (moreMenuOpen) setMoreMenuOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setSettingsOpen(false);
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen, settingsOpen, moreMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="sticky top-0 z-40 w-full bg-transparent py-3 px-3 sm:px-4 transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-2 rounded-full border border-border/60 relative group/nav">
          {/* Backdrop layers to avoid creating parent stacking context */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-xl shadow-premium rounded-full -z-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/10 to-brand-primary/0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full -z-10" />

          <Link href="/" className="flex items-center gap-2.5 shrink-0 relative z-10">
            <img src="/logo.png" alt="FileNova - AI PDF & Image Tools" className="h-8 w-auto" width="32" height="32" />
            <span className="font-extrabold text-sm text-foreground hidden sm:block">FileNova</span>
          </Link>

          {showSearch && (
            <div className="relative max-w-[240px] xl:max-w-xs w-full hidden lg:block z-10">
              <SmartSearchBar placeholder={tText("Search 30+ document tools...")} />
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative z-10">
            <div className="relative hidden md:block">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:fn-neu-pressed transition-all cursor-pointer border border-transparent hover:border-[var(--fn-border)]"
                aria-label="Settings"
                title="Settings"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 fn-glass rounded-xl shadow-[var(--fn-shadow-elevated)] p-4 space-y-4 z-[9999] min-w-[200px] text-[var(--fn-text-primary)]"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{tText("Theme")}</p>
                      <ThemeToggle />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{tText("Language")}</p>
                      <LanguageSelector />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-2">
              <PopularToolsDropdown />
              <Link href="/india-tools" className="flex items-center gap-1.5 text-sm text-[var(--fn-text-primary)] font-medium py-1.5 px-3 rounded-full border border-[var(--fn-border)] hover:bg-[var(--fn-surface-elevated)] transition-colors duration-150 whitespace-nowrap">
                🇮🇳 {tText("India Tools")}
              </Link>
              <Link href="/workflows" className="flex items-center gap-1.5 text-sm text-[var(--fn-text-primary)] font-medium py-1.5 px-3 rounded-full border border-[var(--fn-border)] hover:bg-[var(--fn-surface-elevated)] transition-colors duration-150 whitespace-nowrap">
                <Zap className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                {tText("Workflows")}
              </Link>
              <Link href="/workspace" className="flex items-center gap-1.5 text-sm text-[var(--fn-text-primary)] font-medium py-1.5 px-3 rounded-full border border-[var(--fn-border)] hover:bg-[var(--fn-surface-elevated)] transition-colors duration-150 whitespace-nowrap">
                <FileText className="h-3.5 w-3.5 text-[var(--fn-text-secondary)]" />
                {tText("Workspace")}
              </Link>
            </nav>

            <div className="hidden lg:block xl:hidden relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1.5 text-sm text-[var(--fn-text-primary)] font-medium py-1.5 px-3 rounded-full border border-[var(--fn-border)] hover:bg-[var(--fn-surface-elevated)] transition-colors duration-150 cursor-pointer whitespace-nowrap"
              >
                <Menu className="h-3.5 w-3.5" />
                {tText("Menu")}
              </button>
              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 fn-glass rounded-xl shadow-[var(--fn-shadow-elevated)] p-2 z-[9999] min-w-[190px] space-y-0.5 text-[var(--fn-text-primary)]"
                  >
                    <div className="px-2 py-1.5"><PopularToolsDropdown /></div>
                    <Link href="/india-tools" onClick={() => setMoreMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-emerald-500 hover:bg-accent/60 transition-colors">
                      🇮🇳 {tText("India Tools")}
                    </Link>
                    <Link href="/workflows" onClick={() => setMoreMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-indigo-500 hover:bg-accent/60 transition-colors">
                      <Zap className="h-4 w-4" /> {tText("Workflows")}
                    </Link>
                    <Link href="/workspace" onClick={() => setMoreMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-foreground hover:bg-accent/60 transition-colors">
                      <FileText className="h-4 w-4" /> {tText("Workspace")}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => useCheckoutStore.getState().openCheckout("pro")} className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 px-3.5 py-2 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-[1.02] whitespace-nowrap shrink-0 active:scale-95">
              <Crown className="h-3.5 w-3.5 fill-current" />
              {tText("Premium")}
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="hidden sm:block">
                <PlanBadge />
              </div>
              {user ? (
                <UserProfileDropdown />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary hover:bg-brand-primary-dark px-3.5 py-2 text-[11px] font-black text-white transition-all duration-300 shadow-md whitespace-nowrap shrink-0 border border-brand-primary/30 hover:scale-[1.02] active:scale-95"
                >
                  {tText("Login")}
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-accent/50 rounded-lg text-muted-foreground hover:text-foreground lg:hidden cursor-pointer"
              aria-label="Toggle mobile menu"
              title="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            role="dialog" aria-modal="true" aria-label="Mobile navigation menu"
            className="mobile-menu-panel lg:hidden border border-border/60 bg-background/95 backdrop-blur-xl p-4 space-y-3 rounded-2xl shadow-premium mt-2 mx-4 overflow-hidden relative z-30"
          >
            {showSearch && (
              <div className="relative">
                <SmartSearchBar placeholder={tText("Search tools...")} />
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <button onClick={() => { setMobileMenuOpen(false); useCheckoutStore.getState().openCheckout("pro"); }} className="flex items-center justify-center gap-2 text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 rounded-lg">
                <Crown className="h-4 w-4 fill-current" />
                {tText("Premium Suite")}
              </button>
              <Link onClick={() => setMobileMenuOpen(false)} href="/workspace" className="text-center text-sm bg-card border border-border text-foreground font-bold py-2 rounded-lg">
                <FileText className="h-4 w-4 inline-block mr-1.5" />{tText("Open Document Workspace")}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/workflows" className="flex items-center justify-center gap-2 text-sm text-indigo-500 font-bold py-2 border border-indigo-500/20 bg-indigo-500/5 rounded-lg">
                <Zap className="h-4 w-4" />
                {tText("Workflows")}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/india-tools" className="flex items-center justify-center gap-2 text-sm text-emerald-500 font-bold py-2 border border-emerald-500/20 bg-emerald-500/5 rounded-lg">
                🇮🇳 {tText("India Tools")}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/contact" className="text-center text-sm border border-border text-foreground font-bold py-2 rounded-lg">
                {tText("📞 Contact Support")}
              </Link>
              <div className="flex items-center justify-between px-4 py-2 border border-border bg-card rounded-lg">
                <span className="text-xs font-bold text-muted-foreground">{tText("Theme")}</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between px-4 py-2 border border-border bg-card rounded-lg">
                <span className="text-xs font-bold text-muted-foreground">{tText("Language")}</span>
                <LanguageSelector />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
