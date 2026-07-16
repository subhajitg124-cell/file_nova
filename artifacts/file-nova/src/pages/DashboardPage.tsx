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
  ArrowUpRight,
  Loader2,
  Gift,
  LayoutDashboard,
  Copy,
  BrainCircuit,
  Heart,
  Server
} from "lucide-react";
import { useSubscription, type PremiumTier } from "@/hooks/useSubscription";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

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
    useCount, 
    refreshStatus
  } = useSubscription();

  const [billingHistory, setBillingHistory] = useState<BillingItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const userName = user?.name || "FileNova Member";
  const userEmail = user?.email || "user@filenova.in";

  // Authentication Route Protection
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        setLocation(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    refreshStatus();
    fetchBillingAndUser();
  }, [refreshStatus]);

  const fetchBillingAndUser = async () => {
    const token = localStorage.getItem("filenova_token");
    if (!token) {
      return;
    }
    setLoadingHistory(true);
    try {
      const data = await apiClient.getPaymentHistory();
      if (data.success && data.history) {
        setBillingHistory(data.history);
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
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
            <div className="space-y-2">
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 fill-rose-500" />
                Community Dashboard
              </p>
              <h1 className="text-3xl font-black md:text-4xl tracking-tight">
                Welcome, {userName}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Email: {userEmail}
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 border border-rose-400/30 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-glow">
                <Sparkles className="h-3 w-3 fill-white animate-pulse" />
                Lifetime Free Elite
              </span>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Unlimited Workspace Benefits */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-premium flex flex-col justify-between space-y-6 relative overflow-hidden group/stats">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-rose-500/[0.02] rounded-full blur-2xl group-hover/stats:bg-rose-500/[0.04] transition-all duration-700 pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="space-y-1">
                <h2 className="text-base font-black flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Your Workspace Benefits
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  FileNova is 100% free. Enjoy premium operations with zero limitations.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  "Unlimited document operations per day",
                  "Bulk upload & batch processing enabled",
                  "Up to 100MB file uploads for larger documents",
                  "100% private, local browser processing",
                  "Ad-free workspace with instant downloads"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/" className="w-full py-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 text-white transition text-xs font-black relative z-10 cursor-pointer shadow-md">
              <Zap className="h-4 w-4 fill-white" />
              Open Tools Directory
            </Link>
          </div>

          {/* Card 2: Keep Us Online */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-premium flex flex-col justify-between space-y-6 relative overflow-hidden group/sub">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-amber-500/[0.02] rounded-full blur-2xl group-hover/sub:bg-amber-500/[0.04] transition-all duration-700 pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="space-y-1">
                <h2 className="text-base font-black flex items-center gap-2 text-foreground">
                  <Server className="h-5 w-5 text-amber-400" />
                  Fund Server Costs
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  We run on community support. Even a small contribution helps cover API fees.
                </p>
              </div>

              <p className="text-xs text-[var(--fn-text-secondary)] font-medium leading-relaxed">
                By removing paywalls, FileNova guarantees accessible document tools for everyone. If FileNova helped you save time today, please consider buying us a cutting chai (₹10) to support server hardware and keeping the platform completely ad-free.
              </p>
            </div>

            <Link href="/pricing" className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-premium hover:-translate-y-0.5 transition duration-200 cursor-pointer flex items-center justify-center gap-2 relative z-10">
              <Heart className="h-4 w-4 fill-current text-white animate-pulse" />
              Support Our Work (UPI / QR)
            </Link>
          </div>
        </section>

        {/* Refer & Earn Section */}
        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-premium space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <Gift className="h-5 w-5 text-emerald-500" />
                Refer &amp; Share
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Invite friends and colleagues to FileNova. Help students and kiosk operators discover India's best free PDF and image processing workspace.
              </p>
            </div>
            <Link href="/referral" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer">
              Open Referral Center
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {user?.referralCode && (
            <div className="pt-4 border-t border-emerald-500/15 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Your Referral Link</p>
                <code className="text-xs bg-card border border-border px-3 py-1.5 rounded-lg block select-all font-mono font-bold text-foreground">
                  {`https://filenova.in/ref?code=${user.referralCode}`}
                </code>
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <div className="bg-card border border-border px-3.5 py-1.5 rounded-lg flex flex-col justify-center">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Promo Code</p>
                  <p className="text-sm font-black tracking-wider text-emerald-600 dark:text-emerald-400 mt-1 leading-none">{user.referralCode}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://filenova.in/ref?code=${user.referralCode}`);
                    toast.success("Referral link copied!");
                  }}
                  className="px-4 py-2 bg-card border border-border hover:bg-muted text-foreground rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Hey! Join me on FileNova to resize images, compress PDFs, mask Aadhaar cards locally, and more. It is fully free with no daily limits: https://filenova.in/ref?code=${user.referralCode}`
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

        {/* AI Credits Section */}
        {(() => {
          const estimatedAiUsage = Math.max(0, useCount * 2);
          return (
            <section className="rounded-3xl border border-border bg-card p-6 shadow-premium space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-fuchsia-500" />
                  AI Credits
                </h2>
                <span className="text-xs font-black text-muted-foreground bg-muted border border-border rounded-full px-3 py-1">
                  Elite Plan
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Used */}
                <div className="rounded-2xl border border-border bg-background/60 p-4 text-center space-y-1">
                  <p className="text-2xl font-black text-foreground">{estimatedAiUsage}</p>
                  <p className="text-[11px] text-muted-foreground font-semibold">AI Ops Used (est.)</p>
                </div>
                {/* Remaining */}
                <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4 text-center space-y-1">
                  <p className="text-2xl font-black text-fuchsia-500">∞</p>
                  <p className="text-[11px] text-muted-foreground font-semibold">Remaining This Month</p>
                </div>
                {/* Total */}
                <div className="rounded-2xl border border-border bg-background/60 p-4 text-center space-y-1">
                  <p className="text-2xl font-black text-foreground">∞</p>
                  <p className="text-[11px] text-muted-foreground font-semibold">Monthly Allowance</p>
                </div>
              </div>
            </section>
          );
        })()}

        {/* Billing History Section */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-premium space-y-4">
          <h2 className="text-lg font-black flex items-center gap-2">
            <History className="h-5 w-5 text-violet-500" />
            Billing &amp; Invoices
          </h2>

          {loadingHistory ? (
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
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="h-3.5 bg-muted rounded-md w-24"></div></td>
                      <td className="p-4"><div className="h-3.5 bg-muted rounded-md w-32"></div></td>
                      <td className="p-4"><div className="h-3.5 bg-muted rounded-md w-16"></div></td>
                      <td className="p-4"><div className="h-3.5 bg-muted rounded-md w-20"></div></td>
                      <td className="p-4"><div className="h-3.5 bg-muted rounded-md w-12"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <p className="text-xs text-muted-foreground/60 max-w-sm">All operations are free. No invoices will be generated unless you choose to donate using the Support page.</p>
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
              { name: "Aadhaar Card Masking", path: "/aadhaar-mask-pdf", desc: "Redact first 8 digits of Aadhaar XML locally in browser" },
              { name: "PDF Merge & Compress", path: "/compress-pdf", desc: "Combine and optimize files to meet portal upload limits" },
              { name: "Exam Toolkit presets", path: "/pan-card-resize", desc: "Optimize photos & signatures to fit exact board limits" }
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
            Track all your processed files. As an Elite member, you have unlimited history storage and access.
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
