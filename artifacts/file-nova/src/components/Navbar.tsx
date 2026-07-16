import React, { memo, useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Settings2, Menu, X, Check, FileText, Code, Bell, Shield, Workflow, Heart
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { DevBadge } from "@/components/dev/DevBadge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import { useAuthStore } from "@/store/useAuthStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useSupportDevStore } from "@/store/useSupportDevStore";
import { FEATURE_PAYMENT_GATEWAY } from "@/config/featureFlags";
import { SmartSearchBar } from "@/components/SmartSearchBar";
import { PopularToolsDropdown } from "@/components/PopularToolsDropdown";
import { useDismissablePanel } from "@/hooks/useDismissablePanel";
import { BACKEND_URL, HAS_BACKEND } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);

  useDismissablePanel({
    isOpen: settingsOpen,
    onClose: () => setSettingsOpen(false),
    panelRef: settingsRef,
    triggerRef: settingsTriggerRef,
  });

  useDismissablePanel({
    isOpen: notificationsOpen,
    onClose: () => setNotificationsOpen(false),
    panelRef: notificationsRef,
    triggerRef: notificationsTriggerRef,
  });

  const fetchNotifications = useCallback(async () => {
    if (!user || !HAS_BACKEND) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/notifications`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
      }
    } catch {
      // Silently fail — notifications are non-critical
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string, link?: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
    if (link) {
      setNotificationsOpen(false);
      setLocation(link);
    }
  };

  const clearNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`${BACKEND_URL}/api/v1/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Silently fail
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => {
      const wasUnread = notifications.find((n) => n.id === id && !n.isRead);
      return wasUnread ? Math.max(0, prev - 1) : prev;
    });
  };

  const clearAllNotifications = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/notifications`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Silently fail
    }
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    if (!mobileMenuOpen && !settingsOpen && !notificationsOpen) return;
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
      if (notificationsOpen) setNotificationsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setSettingsOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen, settingsOpen, notificationsOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="sticky top-0 z-40 w-full bg-transparent py-3 px-3 sm:px-4 transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-2 rounded-full border border-border relative group/nav overflow-visible">
          <div className="absolute inset-0 bg-card/45 backdrop-blur-xl shadow-premium rounded-full -z-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/10 to-brand-primary/0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full -z-10" />

          <Link href="/" className="flex items-center gap-2.5 shrink-0 relative z-10">
            <img src="/logo.png" alt="FileNova - AI PDF & Image Tools" className="h-8 w-auto" width="32" height="32" fetchPriority="high" />
            <span className="font-extrabold text-sm text-foreground hidden sm:block">FileNova</span>
          </Link>

          {showSearch && (
            <div className="relative flex-1 min-w-[180px] max-w-xs hidden lg:block z-[9999]">
              <SmartSearchBar placeholder={tText("Search tools...")} />
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative z-10">
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
              <PopularToolsDropdown />
              <Link href="/india-tools" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-semibold py-1.5 px-2.5 rounded-full hover:bg-secondary/60 transition-colors duration-150 whitespace-nowrap">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                {tText("India Tools")}
              </Link>
              <Link href="/workflows" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-semibold py-1.5 px-2.5 rounded-full hover:bg-secondary/60 transition-colors duration-150 whitespace-nowrap">
                <Workflow className="h-3.5 w-3.5 text-amber-500" />
                {tText("Workflows")}
              </Link>
              <Link href="/pricing" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-semibold py-1.5 px-2.5 rounded-full hover:bg-secondary/60 transition-colors duration-150 whitespace-nowrap">
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/10" />
                {tText("Support")}
              </Link>
            </nav>

            {/* Notification bell */}
            {user && (
              <div className="relative flex items-center justify-center" ref={notificationsRef}>
                <button
                  ref={notificationsTriggerRef}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative hidden md:flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                  aria-label="Notifications"
                  {...(notificationsOpen ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
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
                      className="absolute right-0 top-full mt-3 bg-card/95 border border-border shadow-soft rounded-2xl p-4 z-[9999] w-80 text-foreground backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
                        <p className="text-xs font-black text-foreground">Notifications</p>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              {unreadCount} unread
                            </span>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-md hover:bg-secondary"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
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
                              className={`group/notif relative p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                                n.isRead
                                  ? "bg-transparent border-transparent hover:bg-secondary"
                                  : "bg-primary/5 border-primary/10 hover:bg-primary/10 hover:border-primary/20"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <p className={`text-xs font-bold pr-5 ${n.isRead ? "text-foreground/80" : "text-foreground"}`}>
                                  {n.title}
                                </p>
                                <div className="flex items-center gap-1 shrink-0">
                                  {!n.isRead && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1" />
                                  )}
                                  <button
                                    onClick={(e) => clearNotification(e, n.id)}
                                    className="opacity-0 group-hover/notif:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                    aria-label="Clear notification"
                                    title="Clear"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
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
            <div ref={settingsRef} className="relative hidden md:block">
              <button
                ref={settingsTriggerRef}
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
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
                    className="absolute right-0 top-full mt-3 bg-card/95 border border-border shadow-soft rounded-2xl p-4 space-y-4 z-[9999] min-w-[280px] backdrop-blur-xl text-foreground"
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

            {isDev && (
              <div className="hidden sm:block">
                <DevBadge />
              </div>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
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
              className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground lg:hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
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
            className="mobile-menu-panel lg:hidden border border-border bg-card/95 backdrop-blur-xl p-4 space-y-3 rounded-2xl shadow-soft mt-2 mx-4 overflow-hidden relative z-30"
          >
            {showSearch && (
              <div className="relative">
                <SmartSearchBar placeholder={tText("Search tools...")} />
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {isDev && (
                <Link onClick={() => setMobileMenuOpen(false)} href="/dev" className="flex items-center justify-center gap-2 text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 py-2.5 rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                  </span>
                  DevWorkspace
                </Link>
              )}
              <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="flex items-center justify-center gap-2 text-sm font-black text-white bg-gradient-to-r from-rose-500 to-rose-600 py-2.5 rounded-lg">
                <Heart className="h-4 w-4 fill-current text-white animate-pulse" />
                {tText("Support Us")}
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
              <div className="flex flex-col gap-2 px-4 py-3 border border-border bg-card rounded-lg">
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
