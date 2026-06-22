import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { PlanBadge } from "@/components/PlanBadge";
import { 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  TrendingUp, 
  ArrowLeft, 
  CreditCard, 
  Zap, 
  History, 
  User, 
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Gift,
  LayoutDashboard,
  Copy,
} from "lucide-react";
import { useSubscription, type PremiumTier } from "@/hooks/useSubscription";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/api";

interface BillingItem {
  id: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { 
    premiumTier, 
    premiumEnabled, 
    expiresAt, 
    useCount, 
    getDailyLimit, 
    loading: subLoading,
    cancelSubscription,
    refreshStatus
  } = useSubscription();

  const [billingHistory, setBillingHistory] = useState<BillingItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const userName = user?.name || "FileNova Member";
  const userEmail = user?.email || "user@filenova.in";

  const dailyLimit = getDailyLimit();
  const usagePercentage = dailyLimit === Infinity || dailyLimit === -1 ? 0 : Math.min(100, (useCount / dailyLimit) * 100);

  // Authentication Route Protection
  useEffect(() => {
    const checkAuth = async () => {
      // Delay slightly to let state load
      await new Promise((resolve) => setTimeout(resolve, 100));
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        setLocation(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    };
    checkAuth();
  }, [user, setLocation]);

  useEffect(() => {
    refreshStatus();
    fetchBillingAndUser();
  }, [refreshStatus]);

  const fetchBillingAndUser = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${BACKEND_URL}/api/payments/history`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.history) {
          setBillingHistory(data.history);
        }
      }
    } catch (e) {
      console.error("Failed to fetch billing history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper to format currency
  const formatAmount = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  // Helper to get plan styles
  const getPlanBadge = (tier: PremiumTier) => {
    switch (tier) {
      case "elite":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 border border-amber-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-glow animate-pulse">
            <Sparkles className="h-3 w-3 fill-white" />
            Elite Plan
          </span>
        );
      case "pro":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-glow">
            <Sparkles className="h-3 w-3 fill-white animate-pulse" />
            Pro Plan
          </span>
        );
      case "basic":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-primary border border-sky-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
            <Zap className="h-3 w-3 fill-white" />
            Basic Plan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground">
            Free Account
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh pb-16 font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          <div className="flex items-center gap-3">
            <PlanBadge />
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/95 glass shadow-premium p-8 card-shine">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
            <div className="space-y-2">
              <p className="text-xs font-bold text-sky-500 uppercase tracking-widest">
                Account Command Center
              </p>
              <h1 className="text-3xl font-black md:text-4xl tracking-tight">
                Welcome, {userName}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Email: {userEmail}
              </p>
            </div>
            <div>
              {getPlanBadge(premiumTier)}
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Usage Meter */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-premium flex flex-col justify-between space-y-6 relative overflow-hidden group/stats">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-sky-500/[0.02] rounded-full blur-2xl group-hover/stats:bg-sky-500/[0.04] transition-all duration-700 pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h2 className="text-base font-black flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-sky-400" />
                  Today's Usage Meter
                </h2>
                <p className="text-[11px] text-slate-500">
                  Resets daily at midnight Indian Standard Time (IST)
                </p>
              </div>
              <span className="text-xl font-black font-mono text-white bg-slate-950/60 border border-slate-900 rounded-xl px-3 py-1.5">
                {useCount} / {dailyLimit === Infinity || dailyLimit === -1 ? "∞" : dailyLimit}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2 relative z-10">
              <div className="h-3.5 w-full bg-slate-950 border border-slate-900 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyLimit === Infinity || dailyLimit === -1 ? 100 : usagePercentage}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className={`h-full rounded-full ${
                    usagePercentage >= 90 
                      ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-glow-sm" 
                      : usagePercentage >= 60 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                      : "bg-gradient-to-r from-sky-500 to-indigo-600"
                  }`} 
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>0% Usage</span>
                <span>{dailyLimit === Infinity || dailyLimit === -1 ? "Unlimited operations available" : `${Math.round(usagePercentage)}% of daily limit consumed`}</span>
              </div>
            </div>

            {/* Weekly activity visualizer */}
            <div className="pt-2 border-t border-slate-900 relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Weekly Files Processed</p>
              <div className="h-24 w-full flex items-end justify-between gap-3 pt-2">
                {[
                  { day: "Mon", count: 2 },
                  { day: "Tue", count: 4 },
                  { day: "Wed", count: 1 },
                  { day: "Thu", count: 5 },
                  { day: "Fri", count: 3 },
                  { day: "Sat", count: 0 },
                  { day: "Sun", count: useCount }
                ].map((item, i) => {
                  const maxCount = 6;
                  const heightPercent = (item.count / maxCount) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                      <div className="w-full relative bg-slate-950/40 rounded-t-lg border border-slate-900 overflow-hidden flex items-end justify-center h-[60px]">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ type: "spring", stiffness: 100, damping: 15, delay: i * 0.04 }}
                          className="w-full bg-gradient-to-t from-sky-600/40 to-indigo-500/80 rounded-t group-hover/bar:to-indigo-400 relative"
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 border border-slate-800 text-[8px] font-mono font-bold text-white px-1 py-0.5 rounded pointer-events-none z-20">
                            {item.count}
                          </div>
                        </motion.div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {dailyLimit !== Infinity && dailyLimit !== -1 && usagePercentage >= 100 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3 relative z-10">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-red-500">Operation limit reached today</p>
                  <p className="text-muted-foreground">Please wait until midnight IST or upgrade your plan now for uninterrupted access to PDF tools, government form presets, and Aadhaar masking.</p>
                </div>
              </div>
            )}

            {premiumTier === "free" && (
              <Link href="/pricing" className="w-full py-3 inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 transition text-xs font-black relative z-10">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                Upgrade to Basic or Pro for more daily actions
              </Link>
            )}
          </div>

          {/* Card 2: Subscription Details */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-premium flex flex-col justify-between space-y-6 relative overflow-hidden group/sub">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl group-hover/sub:bg-indigo-500/[0.04] transition-all duration-700 pointer-events-none" />
            
            <div className="space-y-1 relative z-10">
              <h2 className="text-base font-black flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                Subscription Status
              </h2>
              <p className="text-[11px] text-slate-500">
                Manage renewal details and payments securely via Razorpay
              </p>
            </div>

            {/* Virtual Membership Card Visual */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 shadow-inner space-y-4 relative overflow-hidden select-none z-10">
              <div className="absolute top-0 right-0 p-1 px-3 rounded-bl-xl bg-indigo-500/10 border-l border-b border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                Active Member
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-gradient-to-tr from-brand-primary to-violet-600 flex items-center justify-center text-white font-extrabold text-[10px] shadow">FN</div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider leading-none">Subscription</p>
                    <p className="text-xs font-black text-white capitalize mt-1 leading-none">FileNova {premiumTier}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-wider">Subscriber Name</p>
                  <p className="text-[11px] font-bold text-white mt-1">{userName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-wider">Status</p>
                  <p className={`text-[10px] font-black uppercase mt-1 ${premiumEnabled ? "text-emerald-400" : "text-slate-400"}`}>
                    {premiumEnabled ? "Subscribed" : "Free Plan"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 text-sm relative z-10">
              {expiresAt && (
                <div className="flex items-center justify-between rounded-xl bg-slate-950/40 border border-slate-900 px-4 py-2.5">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Renewal Date
                  </span>
                  <span className="font-bold font-mono text-white text-xs">
                    {new Date(expiresAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
              )}
            </div>

            {premiumEnabled && premiumTier !== "free" ? (
              <button
                onClick={cancelSubscription}
                disabled={subLoading}
                className="w-full py-3 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition text-xs font-black disabled:opacity-50 relative z-10"
              >
                {subLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Downgrade Subscription to Free
              </button>
            ) : (
              <Link href="/pricing" className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-650 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-premium shadow-glow hover:-translate-y-0.5 transition duration-200 cursor-pointer flex items-center justify-center gap-2 relative z-10">
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                Explore Premium Billing Plans
              </Link>
            )}
          </div>
        </section>

        {/* Refer & Earn Section with link copy helper */}
        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-premium space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <Gift className="h-5 w-5 text-emerald-500" />
                Refer & Earn program
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Invite friends to FileNova. When they sign up using your referral link, both of you get 7 days of Pro plan access for free!
              </p>
            </div>
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white shadow-sm hover:bg-emerald-750 transition cursor-pointer">
              Open Referral Center
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {user?.referralCode && (
            <div className="pt-4 border-t border-emerald-500/15 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Your Referral Link</p>
                <code className="text-xs bg-card border border-border px-3 py-1.5 rounded-lg block select-all font-mono font-bold text-foreground">
                  {`https://filenova.in?ref=${user.referralCode}`}
                </code>
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <div className="bg-card border border-border px-3.5 py-1.5 rounded-lg flex flex-col justify-center">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Promo Code</p>
                  <p className="text-sm font-black tracking-wider text-emerald-600 dark:text-emerald-400 mt-1 leading-none">{user.referralCode}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://filenova.in?ref=${user.referralCode}`);
                    toast.success("Referral link copied to clipboard!");
                  }}
                  className="px-4 py-2 bg-card border border-border hover:bg-muted text-foreground rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Hey! Join me on FileNova to resize images, compress PDFs, mask Aadhaar cards locally, and more. Use my referral link to get Pro benefits: https://filenova.in?ref=${user.referralCode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 text-center"
                >
                  Share on WhatsApp
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Billing History Section */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-premium space-y-4">
          <h2 className="text-lg font-black flex items-center gap-2">
            <History className="h-5 w-5 text-violet-500" />
            Billing & Invoices
          </h2>
          
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : billingHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-border/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-background/80 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Plan Description</th>
                    <th className="p-4">Billing Amount</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {billingHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/15 transition">
                      <td className="p-4 font-mono font-bold text-muted-foreground">{item.id}</td>
                      <td className="p-4 font-black capitalize">FileNova {item.plan} (30 Days)</td>
                      <td className="p-4 font-bold font-mono text-foreground">{formatAmount(item.amount)}</td>
                      <td className="p-4 font-semibold text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-500">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border rounded-2xl bg-background/30 text-center space-y-2">
              <CreditCard className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-bold text-muted-foreground">No active payment invoices found</p>
              <p className="text-xs text-muted-foreground/60 max-w-sm">You are currently on the Free/Guest plan. Complete a billing checkout to unlock unlimited PDF workflows and government portal templates.</p>
            </div>
          )}
        </section>

        {/* Quick Tools Access Section */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-premium space-y-4">
          <h2 className="text-lg font-black flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Quick Access Workspace
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Aadhaar Card Masking", path: "/premium", desc: "Redact first 8 digits of Aadhaar XML locally in browser" },
              { name: "PDF Merge & Compress", path: "/", desc: "Combine and optimize files to meet portal upload limits" },
              { name: "Exam Toolkit presets", path: "/premium", desc: "Optimize photos & signatures to fit exact board limits" }
            ].map((tool) => (
              <Link 
                key={tool.name} 
                href={tool.path}
                className="group border border-border/80 bg-background/50 hover:border-primary/40 rounded-2xl p-4 flex justify-between items-start transition hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="text-sm font-black text-foreground group-hover:text-primary transition">{tool.name}</p>
                  <p className="text-xs text-muted-foreground leading-normal">{tool.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </section>

        {/* History Tab */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-premium space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <History className="h-5 w-5 text-violet-500" />
              File Processing History
            </h2>
            <Link href="/history" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <LayoutDashboard className="h-3.5 w-3.5" />
              View Full History
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Track all your processed files. Free users can see their last 5 files; Pro users get unlimited history.
          </p>
          <Link href="/history" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-4 py-2 text-sm font-bold text-foreground hover:bg-muted transition">
            <History className="h-4 w-4" />
            View Your History
          </Link>
        </section>
      </main>
    </div>
  );
}
