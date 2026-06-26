import React, { memo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { User, LogOut, Zap, Sparkles, Clock, CreditCard, ChevronDown, Key, Gift, Sliders } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSubscription } from "@/hooks/useSubscription";
import { AuthModal } from "./AuthModal";
import { toast } from "sonner";

export const UserProfileDropdown = memo(function UserProfileDropdown() {
  const { user, subscription, fetchMe, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuthStore();
  const { cancelSubscription, loading: subLoading, premiumTier } = useSubscription();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isDev = user?.role === 'super_admin' || user?.email?.toLowerCase() === 'subhajitgho123@gmail.com';
  const [, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    toast.success("Successfully logged out.");
    setLocation("/");
  };

  const handleCancelSub = async () => {
    if (confirm("Are you sure you want to cancel your subscription? This will return you to the free tier.")) {
      await cancelSubscription();
      await fetchMe(); // Refresh profile state
      setDropdownOpen(false);
    }
  };

  // Get display text for the subscription details
  const getPlanDetails = () => {
    if (!subscription || subscription.plan === "free" || subscription.status !== "active") {
      return {
        name: "Free Tier",
        color: "text-muted-foreground bg-muted/40 border-border",
        isPremium: false,
        days: null
      };
    }

    let name = "Free Tier";
    let color = "text-muted-foreground bg-muted/40 border-border";
    if (subscription.plan === "basic") {
      name = "Basic Desk";
      color = "text-blue-500 bg-blue-500/10 border-blue-500/20";
    } else if (subscription.plan === "pro") {
      name = "Pro Desk";
      color = "text-purple-500 bg-purple-500/10 border-purple-500/20";
    } else if (subscription.plan === "elite") {
      name = "Elite Console";
      color = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }

    return {
      name,
      color,
      isPremium: true,
      days: subscription.daysActive
    };
  };

  const getNavbarBadge = () => {
    switch (premiumTier) {
      case "basic":
        return <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-500 border border-blue-500/20">BASIC</span>;
      case "pro":
        return <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-[10px] font-bold text-purple-500 border border-purple-500/20">PRO ⚡</span>;
      case "elite":
        return <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-500 border border-amber-500/20">ELITE 👑</span>;
      case "free":
      default:
        return <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground border border-border">FREE</span>;
    }
  };

  const getWidthClass = (days: number | null) => {
    if (days === null) return "w-0";
    const percent = Math.min(100, Math.max(0, Math.round((days / 30) * 10) * 10));
    switch (percent) {
      case 0: return "w-0";
      case 10: return "w-[10%]";
      case 20: return "w-[20%]";
      case 30: return "w-[30%]";
      case 40: return "w-[40%]";
      case 50: return "w-[50%]";
      case 60: return "w-[60%]";
      case 70: return "w-[70%]";
      case 80: return "w-[80%]";
      case 90: return "w-[90%]";
      case 100: default: return "w-full";
    }
  };

  const plan = getPlanDetails();

  return (
    <div className="relative flex items-center gap-2 shrink-0" ref={dropdownRef}>
      {user ? (
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="inline-flex items-center gap-2 fn-neu !rounded-full border border-[var(--fn-border)] px-3.5 py-2 text-xs font-bold text-[var(--fn-text-primary)] hover:bg-[var(--fn-surface-elevated)] transition duration-300 cursor-pointer select-none whitespace-nowrap"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--fn-accent-primary)]/10 text-[var(--fn-accent-primary)] shrink-0">
            <User className="h-3 w-3" />
          </div>
          <span className="max-w-[100px] truncate">{user.name || user.email}</span>
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

      {/* Dropdown Menu */}
      {dropdownOpen && user && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl fn-glass shadow-[var(--fn-shadow-elevated)] p-4 z-[9999] animate-scale-in text-[var(--fn-text-primary)]">
          {/* User info */}
          <div className="border-b border-border pt-1 pb-3.5 mb-3.5">
            <p className="text-xs font-black text-foreground truncate">{user.name || "FileNova User"}</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
            {user.phoneNumber && (
              <p className="text-[10px] text-muted-foreground mt-1.5">{user.phoneNumber}</p>
            )}
          </div>

          {/* Subscription Status details */}
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
                {/* Visual active progress representation */}
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

          {/* Action Links */}
          <div className="space-y-1 mb-3.5">
            {isDev && (
              <button
                onClick={() => { setLocation("/beta-test"); setDropdownOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-black text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 transition flex items-center gap-2 cursor-pointer mb-1"
              >
                <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                <span>Beta Testing Zone</span>
              </button>
            )}
            <button
              onClick={() => { setLocation("/dashboard"); setDropdownOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => { setLocation("/profile"); setDropdownOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-primary" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => { setLocation("/pricing"); setDropdownOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="h-3.5 w-3.5 text-blue-500" />
              <span>My Plan</span>
            </button>
            <button
              onClick={() => { setLocation("/referral"); setDropdownOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer"
            >
              <Gift className="h-3.5 w-3.5 text-emerald-500" />
              <span>Refer & Earn</span>
            </button>
            {!plan.isPremium ? (
              <button
                onClick={() => { setLocation("/pricing"); setDropdownOpen(false); }}
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-glow flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="h-3.5 w-3.5 fill-white" />
                <span>Upgrade Workspace</span>
              </button>
            ) : (
              <button
                onClick={handleCancelSub}
                disabled={subLoading}
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 transition flex items-center gap-2 cursor-pointer border border-transparent hover:border-destructive/15"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Cancel Plan</span>
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-border pt-3.5">
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Register/Login Modal */}
      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onSuccess={() => fetchMe()} 
      />
    </div>
  );
});
