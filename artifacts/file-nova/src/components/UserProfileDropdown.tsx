import React, { memo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { User, LogOut, Zap, Sparkles, Clock, CreditCard, ChevronDown, Key, Gift, Sliders, Code, Terminal, Globe, Sun, Moon, HelpCircle, LifeBuoy, Settings, FileText, Percent } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/hooks/useTheme";
import { AuthModal } from "./AuthModal";
import { toast } from "sonner";
import { useDismissablePanel } from "@/hooks/useDismissablePanel";

export const UserProfileDropdown = memo(function UserProfileDropdown() {
  const { user, subscription, fetchMe, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuthStore();
  const { cancelSubscription, loading: subLoading, premiumTier } = useSubscription();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isDev = user?.role === 'developer' || user?.role === 'admin' || user?.role === 'super_admin';
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useDismissablePanel({
    isOpen: dropdownOpen,
    onClose: () => setDropdownOpen(false),
    panelRef: dropdownRef,
    triggerRef,
  });

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    toast.success("Successfully logged out.");
    setLocation("/");
  };

  const handleCancelSub = async () => {
    if (confirm("Are you sure you want to cancel your subscription? This will return you to the free tier.")) {
      await cancelSubscription();
      await fetchMe();
      setDropdownOpen(false);
    }
  };

  const getPlanDetails = () => {
    if (!subscription || subscription.plan === "free" || subscription.status !== "active") {
      return { name: "Free Tier", color: "text-muted-foreground bg-muted/40 border-border", isPremium: false, days: null };
    }
    let name = "Free Tier";
    let color = "text-muted-foreground bg-muted/40 border-border";
    if (subscription.plan === "basic") { name = "Basic Desk"; color = "text-blue-500 bg-blue-500/10 border-blue-500/20"; }
    else if (subscription.plan === "pro") { name = "Pro Desk"; color = "text-purple-500 bg-purple-500/10 border-purple-500/20"; }
    else if (subscription.plan === "elite") { name = "Elite Console"; color = "text-amber-500 bg-amber-500/10 border-amber-500/20"; }
    return { name, color, isPremium: true, days: subscription.daysActive };
  };

  const getWidthClass = (days: number | null) => {
    if (days === null) return "w-0";
    const percent = Math.min(100, Math.max(0, Math.round((days / 30) * 10) * 10));
    const map: Record<number, string> = { 0: "w-0", 10: "w-[10%]", 20: "w-[20%]", 30: "w-[30%]", 40: "w-[40%]", 50: "w-[50%]", 60: "w-[60%]", 70: "w-[70%]", 80: "w-[80%]", 90: "w-[90%]" };
    return map[percent] || "w-full";
  };

  const plan = getPlanDetails();

  const sectionHeader = (label: string) => (
    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">{label}</p>
  );

  return (
    <div className="relative flex items-center gap-2 shrink-0" ref={dropdownRef}>
      {user ? (
        <button
          ref={triggerRef}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="inline-flex items-center gap-2 fn-neu !rounded-full border border-[var(--fn-border)] px-2 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-[var(--fn-text-primary)] hover:bg-[var(--fn-surface-elevated)] transition duration-300 cursor-pointer select-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--fn-accent-primary)] focus-visible:outline-none"
          aria-haspopup="menu"
          {...(dropdownOpen ? { "aria-expanded": "true" } : { "aria-expanded": "false" })}
          aria-label="User menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-xs shrink-0 select-none">
            {((user.name || user.email || "U").charAt(0)).toUpperCase()}
          </div>
          <span className="max-w-[80px] truncate text-sm hidden sm:block">{user.name || user.email}</span>
          <ChevronDown className={`h-3 w-3 text-[var(--fn-text-secondary)] transition-transform duration-300 shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          onClick={openLoginModal}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-glow whitespace-nowrap shrink-0 border border-indigo-500/30 hover:scale-[1.02] active:scale-95"
        >
          <Key className="h-3.5 w-3.5 shrink-0" />
          <span>Sign In</span>
        </button>
      )}

      {dropdownOpen && user && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl fn-glass shadow-[var(--fn-shadow-elevated)] p-4 z-[9999] animate-scale-in text-[var(--fn-text-primary)] max-h-[80vh] overflow-y-auto">
          {/* Account section */}
          <div className="border-b border-border pb-3.5 mb-3.5 break-all">
            <p className="text-xs font-black text-foreground leading-snug">{user.name || "FileNova User"}</p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{user.email}</p>
            {user.phoneNumber && <p className="text-[10px] text-muted-foreground mt-1.5">{user.phoneNumber}</p>}
            {isDev && (
              <span className="inline-flex items-center gap-1 mt-2 rounded-md bg-gradient-to-r from-indigo-500/15 to-purple-500/15 px-2 py-0.5 text-[9px] font-black text-indigo-400 border border-indigo-500/20">
                <Code className="h-2.5 w-2.5" />
                {user.role === 'developer' ? 'DEVELOPER BUILD' : 'ADMIN BUILD'}
              </span>
            )}
          </div>

          {/* Subscription section */}
          {sectionHeader("Subscription")}
          <div className="rounded-xl border border-border bg-background/50 p-3 mb-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Plan</span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${plan.color}`}>
                {plan.isPremium && <Sparkles className="h-2.5 w-2.5" />}
                {plan.name}
              </span>
            </div>
            {plan.isPremium && plan.days !== null ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground/90">
                  <span className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                    <Clock className="h-3 w-3" />
                    Remaining Days
                  </span>
                  <span className="font-bold text-primary">{plan.days} Days Active</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full bg-primary rounded-full transition-all duration-500 ${getWidthClass(plan.days)}`} />
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-muted-foreground leading-normal pt-0.5">
                You are currently running on standard Free rules. Upgrade to gain priority lanes and remove daily limit gates.
              </div>
            )}
          </div>

          {/* Admin Tools section */}
          {(user.role === 'admin' || user.role === 'super_admin') && (
            <div className="mb-3.5">
              {sectionHeader("Admin Tools")}
              <div className="space-y-1">
                <button onClick={() => { setLocation("/nova-control"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Admin Control Panel</span>
                </button>
                <button onClick={() => { setLocation("/admin/discount-codes"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                  <Percent className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Discount Code Manager</span>
                </button>
                <button onClick={() => { setLocation("/admin/coupons"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                  <Percent className="h-3.5 w-3.5 text-purple-400" />
                  <span>Coupons & Offers</span>
                </button>
              </div>
            </div>
          )}

          {/* Developer Tools section */}
          {isDev && (
            <div className="mb-3.5">
              {sectionHeader("Developer Tools")}
              <div className="space-y-1">
                <button onClick={() => { setLocation("/dev"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-black text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 transition flex items-center gap-2 cursor-pointer">
                  <Code className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Developer Workspace</span>
                </button>
                <button onClick={() => { setLocation("/beta-test"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Beta Testing Zone</span>
                </button>
                <button onClick={() => { setLocation("/dev"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                  <Terminal className="h-3.5 w-3.5 text-purple-400" />
                  <span>API Explorer</span>
                </button>
                <button onClick={() => { setLocation("/dev"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Environment Info</span>
                </button>
              </div>
            </div>
          )}

          {/* Workspace section */}
          <div className="mb-3.5">
            {sectionHeader("Workspace")}
            <div className="space-y-1">
              <button onClick={() => { setLocation("/workspace"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Open Workspace</span>
              </button>
              <button onClick={() => { setLocation("/dashboard"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Dashboard</span>
              </button>
              <button onClick={() => { setLocation("/history"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>History</span>
              </button>
            </div>
          </div>

          {/* Billing section */}
          <div className="mb-3.5">
            {sectionHeader("Billing")}
            <div className="space-y-1">
              <button onClick={() => { setLocation("/pricing"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                <span>My Plan</span>
              </button>
              <button onClick={() => { setLocation("/pricing"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                <Gift className="h-3.5 w-3.5 text-emerald-500" />
                <span>Refer & Earn</span>
              </button>
            </div>
          </div>

          {/* Appearance section */}
          <div className="mb-3.5">
            {sectionHeader("Appearance")}
            <div className="space-y-1">
              <button onClick={() => { toggleTheme(); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-blue-500" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button onClick={() => { setLocation("/profile"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Help section */}
          <div className="mb-3.5">
            {sectionHeader("Help")}
            <div className="space-y-1">
              <button onClick={() => { setLocation("/contact"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Contact Support</span>
              </button>
              <button onClick={() => { setLocation("/contact"); setDropdownOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
                <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>FAQs & Guides</span>
              </button>
            </div>
          </div>

          {/* Upgrade / Cancel CTA */}
          <div className="mb-3.5">
            {!plan.isPremium ? (
              <button onClick={() => { setLocation("/pricing"); setDropdownOpen(false); }} className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-glow flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <Zap className="h-3.5 w-3.5 fill-white" />
                <span>Upgrade Workspace</span>
              </button>
            ) : (
              <button onClick={handleCancelSub} disabled={subLoading} className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 transition flex items-center gap-2 cursor-pointer border border-transparent hover:border-destructive/15">
                <CreditCard className="h-3.5 w-3.5" />
                <span>Cancel Plan</span>
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-border pt-3.5">
            <button onClick={handleLogout} className="w-full py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer">
              <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={isLoginModalOpen} onClose={closeLoginModal} onSuccess={() => fetchMe()} />
    </div>
  );
});
