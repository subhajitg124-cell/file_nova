import React, { memo, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Settings2, Crown, Menu, X, Check, Bell, CreditCard, FileText, Code
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { DevBadge } from "@/components/dev/DevBadge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import { useAuthStore } from "@/store/useAuthStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { SmartSearchBar } from "@/components/SmartSearchBar";
import { PopularToolsDropdown } from "@/components/PopularToolsDropdown";
import { BACKEND_URL, HAS_BACKEND } from "@/lib/api";
import { useFileStore } from "@/store/useFileStore";

interface NavbarProps {
  showSearch?: boolean;
}

export const Navbar = memo(function Navbar({ showSearch = true }: NavbarProps) {
  const { tText } = useTranslation();
  const { user } = useAuthStore();
  const isDev = user?.role === 'developer' || user?.role === 'admin' || user?.role === 'super_admin';
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("filenova_token");
      const isMock = !HAS_BACKEND || useFileStore.getState().isMockMode || (token && token.startsWith("local_"));
      
      let data;
      if (isMock) {
        const raw = localStorage.getItem("filenova_mock_notifications");
        let list = raw ? JSON.parse(raw) : [];
        if (list.length === 0) {
          list = [{
            id: "welcome-mock-id",
            userId: user.id,
            type: "welcome",
            title: "Welcome to FileNova AI! 🚀",
            message: "Experience fast, secure, and offline-first document productivity. Your files never leave your device for standalone tools.",
            isRead: false,
            link: "/workspace",
            createdAt: new Date().toISOString()
          }];
          localStorage.setItem("filenova_mock_notifications", JSON.stringify(list));
        }
        data = { success: true, notifications: list };
      } else {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${BACKEND_URL}/api/v1/notifications`, {
          credentials: 'include',
          headers
        });
        console.log("%c[NAV] notifications fetch response", "color:purple", {
          status: res.status,
          timestamp: new Date().toISOString(),
        });
        if (res.ok) {
          data = await res.json();
        }
      }

      if (data && data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
  }, [user]);

  const markAsRead = async (id: string, link?: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const token = localStorage.getItem("filenova_token");
      const isMock = !HAS_BACKEND || useFileStore.getState().isMockMode || (token && token.startsWith("local_"));
      
      if (isMock) {
        const raw = localStorage.getItem("filenova_mock_notifications");
        if (raw) {
          const list = JSON.parse(raw);
          const updated = list.map((n: any) => n.id === id ? { ...n, isRead: true } : n);
          localStorage.setItem("filenova_mock_notifications", JSON.stringify(updated));
        }
      } else {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        await fetch(`${BACKEND_URL}/api/v1/notifications/${id}/read`, {
          method: "PATCH",
          credentials: "include",
          headers
        });
      }
    } catch (e) {
      console.warn("Failed to mark notification as read:", e);
    }

    if (link) {
      setNotificationsOpen(false);
      setLocation(link);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!mobileMenuOpen && !settingsOpen) return;
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
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen, settingsOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="sticky top-0 z-40 w-full bg-transparent py-3 px-3 sm:px-4 transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-2 rounded-full border border-[var(--fn-border)] relative group/nav">
          <div className="absolute inset-0 bg-[var(--fn-surface-glass)] backdrop-blur-xl shadow-premium rounded-full -z-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/10 to-brand-primary/0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full -z-10" />

          <Link href="/" className="flex items-center gap-2.5 shrink-0 relative z-10">
            <img src="/logo.png" alt="FileNova - AI PDF & Image Tools" className="h-8 w-auto" width="32" height="32" fetchPriority="high" />
            <span className="font-extrabold text-sm text-[var(--fn-text-primary)] hidden sm:block">FileNova</span>
          </Link>

          {showSearch && (
            <div className="relative max-w-[200px] xl:max-w-xs w-full hidden lg:block z-10">
              <SmartSearchBar placeholder={tText("Search 30+ document tools...")} />
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative z-10">
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
              <PopularToolsDropdown />
              <Link href="/pricing" className="flex items-center gap-1.5 text-sm text-[var(--fn-text-secondary)] hover:text-[var(--fn-text-primary)] font-medium py-1.5 px-3 rounded-full hover:bg-[var(--fn-surface-elevated)] transition-colors duration-150 whitespace-nowrap">
                <CreditCard className="h-3.5 w-3.5" />
                {tText("Pricing")}
              </Link>
              {isDev && (
                <Link href="/dev" className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 font-black py-1.5 px-3 rounded-full hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 hover:border-indigo-500/20 dark:hover:border-indigo-400/30 transition-all duration-150 whitespace-nowrap">
                  <Code className="h-3.5 w-3.5" />
                  DevWorkspace
                </Link>
              )}
            </nav>

            {/* Notification bell */}
            {user && (
              <div className="relative flex items-center justify-center" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative hidden md:flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-3 fn-glass rounded-2xl shadow-[var(--fn-shadow-elevated)] p-4 z-[9999] w-80 text-[var(--fn-text-primary)] border border-border"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
                        <p className="text-xs font-black text-foreground">Notifications</p>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-muted-foreground font-medium">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id, n.link)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                                n.isRead
                                  ? "bg-transparent border-transparent hover:bg-muted/40"
                                  : "bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/8 hover:border-indigo-500/20"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <p className={`text-xs font-bold ${n.isRead ? "text-foreground/80" : "text-foreground"}`}>
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                                {n.message}
                              </p>
                              <span className="text-[8px] text-muted-foreground/60 block mt-1.5 font-mono">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Settings */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
                aria-label="Settings"
                {...(settingsOpen ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
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

            {/* Smart Premium / Upgrade button */}
            {(() => {
              const tier = user?.premiumTier || 'free';
              const isDev = user?.role === 'developer' || user?.role === 'admin' || user?.role === 'super_admin';
              if (isDev) {
                return <DevBadge />;
              }
              if (tier === 'elite') {
                return (
                  <Link href="/pricing" className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 px-3.5 py-2 rounded-full transition-all whitespace-nowrap shrink-0">
                    <Check className="h-3.5 w-3.5" />
                    {tText("Member")}
                  </Link>
                );
              }
              const targetPlan = tier === 'free' ? 'pro' : 'elite';
              const label = tier === 'free' ? 'Upgrade' : 'Go Elite';
              return (
                <button onClick={() => useCheckoutStore.getState().openCheckout(targetPlan)} className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 px-3.5 py-2 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-[1.02] whitespace-nowrap shrink-0 active:scale-95">
                  <Crown className="h-3.5 w-3.5 fill-current" />
                  {tText(label)}
                </button>
              );
            })()}

            <div className="flex items-center gap-1.5 shrink-0">
              {!isDev && (
                <div className="hidden sm:block">
                  <PlanBadge />
                </div>
              )}
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
              {...(mobileMenuOpen ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
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
            className="mobile-menu-panel lg:hidden border border-[var(--fn-border)] bg-background/95 dark:bg-card/95 backdrop-blur-xl p-4 space-y-3 rounded-2xl shadow-premium mt-2 mx-4 overflow-hidden relative z-30"
          >
            {showSearch && (
              <div className="relative">
                <SmartSearchBar placeholder={tText("Search tools...")} />
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {(() => {
                const tier = user?.premiumTier || 'free';
                const isDev = user?.role === 'developer' || user?.role === 'admin' || user?.role === 'super_admin';
                if (isDev) {
                  return (
                    <Link onClick={() => setMobileMenuOpen(false)} href="/dev" className="flex items-center justify-center gap-2 text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 py-2.5 rounded-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                      </span>
                      DevWorkspace
                    </Link>
                  );
                }
                if (tier === 'elite') {
                  return (
                    <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="flex items-center justify-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2.5 rounded-lg">
                      <Check className="h-4 w-4" />
                      {tText("Member — Elite")}
                    </Link>
                  );
                }
                const targetPlan = tier === 'free' ? 'pro' : 'elite';
                const label = tier === 'free' ? 'Premium Suite' : 'Go Elite';
                return (
                  <button onClick={() => { setMobileMenuOpen(false); useCheckoutStore.getState().openCheckout(targetPlan); }} className="flex items-center justify-center gap-2 text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 rounded-lg">
                    <Crown className="h-4 w-4 fill-current" />
                    {tText(label)}
                  </button>
                );
              })()}
              <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="text-center text-sm border border-border text-foreground font-bold py-2 rounded-lg">
                {tText("View Plans & Pricing")}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/workspace" className="text-center text-sm border border-border text-foreground font-bold py-2 rounded-lg">
                <FileText className="h-4 w-4 inline-block mr-1.5" />{tText("Open Workspace")}
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link onClick={() => setMobileMenuOpen(false)} href="/tools" className="text-center text-sm border border-border text-foreground font-bold py-2 rounded-lg">
                  {tText("All Tools")}
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/contact" className="text-center text-sm border border-border text-foreground font-bold py-2 rounded-lg">
                  {tText("Contact")}
                </Link>
              </div>
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
