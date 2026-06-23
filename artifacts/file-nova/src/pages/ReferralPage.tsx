import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Copy, Gift, MessageCircle, Sparkles, Users, RefreshCw, Send, Share2,
  Award, CheckCircle2, TrendingUp, Info, ChevronDown, Calendar, History, QrCode, Loader2, Check, Linkedin, Mail
} from "lucide-react";
import { toast } from "sonner";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { BACKEND_URL } from "@/lib/api";

interface ReferralStats {
  totalReferred: number;
  successfulSignups: number;
  verifiedUsers: number;
  premiumConversions: number;
  conversionRate: number;
  rewardsEarned: number;
  equivalentInrSaved: number;
  pendingRewards: number;
  availableRewards: number;
  paidRewards: number;
}

interface ReferralItem {
  id: string;
  email: string;
  friendName: string | null;
  status: string;
  phoneVerified: boolean;
  premiumEnabled: boolean;
  rewardGiven: boolean;
  upgradeRewardGiven: boolean;
  createdAt: string;
  signupDate: string | null;
}

interface RewardLog {
  id: string;
  rewardType: string;
  rewardValue: number;
  status: string;
  notes: string | null;
  createdAt: string;
  friendName: string | null;
  friendEmail: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("filenova_token");
  if (!token || token.startsWith("local_")) return {};
  return { Authorization: `Bearer ${token}` };
};

const FETCH_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function CountUp({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 600;
    const increment = Math.max(1, end / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{prefix}{displayValue}{suffix}</>;
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-5 w-5 bg-muted rounded-full" />
      </div>
      <div className="h-8 w-16 bg-muted rounded" />
      <div className="h-3 w-36 bg-muted rounded" />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
      >
        <span>{question}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed animate-fade-in">
          {answer}
        </p>
      )}
    </div>
  );
}

// Milestone targets: 3, 7, 15, 30, 50
const milestones = [
  { target: 3, reward: 5, name: "Bronze Advocate" },
  { target: 7, reward: 10, name: "Silver Promoter" },
  { target: 15, reward: 30, name: "Gold Ambassador" },
  { target: 30, reward: 60, name: "Platinum Partner" },
  { target: 50, reward: 100, name: "Diamond Elite" },
];

export default function ReferralPage() {
  const { user, fetchMe, initialized, openLoginModal } = useAuthStore();
  const [referralCode, setReferralCode] = useState(user?.referralCode || "");
  const [referralLink, setReferralLink] = useState(
    user?.referralCode ? `https://filenova.in/ref?code=${user.referralCode}` : ""
  );
  const [stats, setStats] = useState<ReferralStats>({
    totalReferred: 0,
    successfulSignups: 0,
    verifiedUsers: 0,
    premiumConversions: 0,
    conversionRate: 0,
    rewardsEarned: 0,
    equivalentInrSaved: 0,
    pendingRewards: 0,
    availableRewards: 0,
    paidRewards: 0,
  });
  const [referralList, setReferralList] = useState<ReferralItem[]>([]);
  const [rewardsList, setRewardsList] = useState<RewardLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      setSessionExpired(false);
      setReferralCode(user.referralCode || "");
      if (user.referralCode) {
        setReferralLink(`https://filenova.in/ref?code=${user.referralCode}`);
      }
    }
  }, [user]);

  const isLocalUser = !!user?.id?.startsWith("local_");

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      setLoading(false);
      return;
    }

    if (isLocalUser) {
      setLoading(false);
      setError("Please sign in with a registered account to view your referral dashboard.");
      return;
    }

    let cancelled = false;

    const fetchStats = async (attempt = 0) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/v1/referral/stats`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          if (!cancelled) {
            setSessionExpired(true);
            setLoading(false);
            useAuthStore.getState().logout();
          }
          return;
        }

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error || `Server returned ${res.status}`);
        }

        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to load referral stats");

        if (!cancelled) {
          setReferralCode(data.referralCode);
          setReferralLink(data.referralLink || `https://filenova.in/ref?code=${data.referralCode}`);
          setStats(data.stats);
          setReferralList(data.referrals || []);
          setRewardsList(data.rewards || []);
        }
      } catch (err: any) {
        if (cancelled) return;

        const isAbort = err.name === "AbortError";
        const isLastAttempt = attempt >= MAX_RETRIES;

        if (isAbort && !isLastAttempt) {
          await new Promise(r => setTimeout(r, 1000));
          return fetchStats(attempt + 1);
        }

        const message = isAbort
          ? "Server is unreachable. Please try again later."
          : err.message || "Failed to load referral stats";
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();

    return () => { cancelled = true; };
  }, [user?.id, isLocalUser, retryCount, initialized]);

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const copyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Failed to copy code.");
    }
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    fetchMe();
    setRetryCount((c) => c + 1);
  };

  const navigatorShareSupported = typeof navigator !== "undefined" && !!navigator.share;

  const shareNative = async () => {
    if (!referralLink) return;
    try {
      await navigator.share({
        title: "FileNova Premium",
        text: "Join FileNova using my link and get free Pro access!",
        url: referralLink,
      });
      toast.success("Shared successfully!");
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Failed to share link.");
      }
    }
  };

  // Milestone Progress calculations
  const milestoneInfo = useMemo(() => {
    const current = stats.successfulSignups;
    const next = milestones.find((m) => current < m.target);

    if (!next) {
      return {
        tier: "Diamond Elite (Maxed)",
        current,
        target: current,
        prev: milestones[milestones.length - 1].target,
        bonus: "Max milestones reached!",
        remaining: 0,
        progress: 100,
      };
    }

    const prevIndex = milestones.indexOf(next) - 1;
    const prevTarget = prevIndex >= 0 ? milestones[prevIndex].target : 0;

    const totalInTier = next.target - prevTarget;
    const currentInTier = current - prevTarget;
    const progress = Math.min(100, Math.round((currentInTier / totalInTier) * 100));

    return {
      tier: next.name,
      current,
      target: next.target,
      prev: prevTarget,
      bonus: `+${next.reward} Pro Days`,
      remaining: next.target - current,
      progress,
    };
  }, [stats.successfulSignups]);

  // Social Share templates
  const shareText = `Use my invite link to sign up on FileNova and instantly get 3 days of Pro Desk premium access! 🚀 ${referralLink}`;
  const emailSubject = "Join FileNova Pro Desk for Free";
  const emailBody = `Hey! I've been using FileNova to handle my document workflows. Sign up using my link to get 3 days of free Pro Desk premium access:\n\n${referralLink}`;

  return (
    <main className="min-h-screen bg-background text-foreground bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 backdrop-blur-md px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all hover:scale-105">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          <UserProfileDropdown />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-premium md:p-8 card-shine relative overflow-hidden">
          {/* Subtle aurora accent */}
          <div className="absolute top-0 right-0 w-[400px] h-[150px] bg-[radial-gradient(circle_at_top_right,var(--primary),transparent_70%)] opacity-5 pointer-events-none z-0" />

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-black text-primary relative z-10">
            <Gift className="h-3.5 w-3.5" />
            Referral Hub
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl text-foreground relative z-10">
            Invite friends to FileNova Pro
          </h1>
          <p className="mt-3 max-w-2xl text-xs sm:text-sm leading-6 text-muted-foreground relative z-10">
            Share the FileNova experience. Get <strong className="text-primary font-bold">3 days of Pro Desk</strong> when your friend signs up. Get an extra <strong className="text-emerald-500 font-bold">7 days of Pro Desk</strong> once they upgrade to any paid tier, plus <strong className="text-amber-500 font-bold">10% recurring cash commission</strong>.
          </p>

          {sessionExpired ? (
            <div className="mt-8 bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center animate-fade-up">
              <p className="text-sm font-bold text-destructive">Session expired. Please log in again to view your referral portal.</p>
              <button onClick={() => { openLoginModal(); }} className="mt-4 rounded-xl bg-destructive hover:bg-destructive/90 text-white px-6 py-2.5 text-xs font-black cursor-pointer">
                Log In
              </button>
            </div>
          ) : !user ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center animate-fade-up">
              <p className="text-sm font-bold text-muted-foreground">Sign in to retrieve your unique referral link.</p>
              <button onClick={openLoginModal} className="mt-4 rounded-xl bg-primary hover:bg-primary/95 px-6 py-2.5 text-xs font-black text-white shadow-glow transition cursor-pointer">
                Sign In
              </button>
            </div>
          ) : error ? (
            <div className="mt-8 bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-center animate-fade-up">
              <p className="text-sm font-bold text-destructive">{error}</p>
              <button onClick={retryFetch} className="mt-4 rounded-xl bg-primary hover:bg-primary/95 text-white px-6 py-2.5 text-xs font-black cursor-pointer">
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-8 relative z-10 animate-fade-up">
              
              {/* Primary Highlights Row */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Rewards Earned */}
                  <div className="bg-muted/40 dark:bg-card/45 border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Rewards Earned</span>
                      <Award className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-foreground">
                        <CountUp value={stats.rewardsEarned} suffix=" days" />
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Equivalent Value: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹<CountUp value={Number(stats.equivalentInrSaved)} suffix="" /> saved</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Users Registered */}
                  <div className="bg-muted/40 dark:bg-card/45 border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Users Registered</span>
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-foreground">
                        <CountUp value={stats.successfulSignups} />
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Conversion Rate: <span className="font-bold text-primary">{stats.conversionRate}%</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Available Commission Payout */}
                  <div className="bg-muted/40 dark:bg-card/45 border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Available Cash</span>
                      <Sparkles className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-foreground">
                        ₹<CountUp value={stats.availableRewards} />
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Pending Approval: <span className="font-bold text-amber-600 dark:text-amber-400">₹{stats.pendingRewards}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Next Milestone */}
                  <div className="bg-muted/40 dark:bg-card/45 border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Next Milestone</span>
                      <Gift className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-bold text-primary truncate max-w-[130px]">{milestoneInfo.tier}</span>
                        <span className="text-muted-foreground">{milestoneInfo.current}/{milestoneInfo.target}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${milestoneInfo.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {milestoneInfo.remaining > 0 ? (
                          <>Need <strong className="text-foreground font-bold">{milestoneInfo.remaining}</strong> more for <strong className="text-primary font-bold">{milestoneInfo.bonus}</strong></>
                        ) : (
                          <span className="text-emerald-500 font-bold">All Milestones Cleared!</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Panel: Sharing link and controls */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Share Box */}
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
                    <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Send className="h-4 w-4 text-primary" />
                      Invite Link Channels
                    </h3>

                    {/* Code Display */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Your Invite Code</span>
                      <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-xl p-3 text-xs">
                        <span className="flex-1 font-mono font-black text-primary text-sm tracking-wider uppercase">{referralCode}</span>
                        <button
                          onClick={copyCode}
                          type="button"
                          className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Link Copy */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Referral URL</span>
                      <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-xl p-3 text-xs">
                        <input
                          readOnly
                          value={loading ? "Loading..." : referralLink}
                          aria-label="Referral Link"
                          className="flex-1 bg-transparent font-mono text-foreground outline-none text-xs truncate"
                        />
                        <button
                          onClick={copyLink}
                          disabled={!referralLink || loading}
                          type="button"
                          className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Direct Social Share */}
                    {referralLink && !loading && (
                      <div className="space-y-3 pt-3 border-t border-border">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Direct Share Channels</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {/* WhatsApp */}
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold p-2.5 transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                          </a>
                          {/* Telegram */}
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join FileNova using my link:")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 text-[#0088cc] dark:text-[#38bdf8] font-bold p-2.5 transition"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Telegram
                          </a>
                          {/* LinkedIn */}
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 border border-[#0a66c2]/20 text-[#0a66c2] dark:text-[#70b5f9] font-bold p-2.5 transition"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                            LinkedIn
                          </a>
                          {/* Email */}
                          <a
                            href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold p-2.5 transition"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email Share
                          </a>
                        </div>
                        
                        {/* Native Share Sheet */}
                        {navigatorShareSupported && (
                          <button
                            onClick={shareNative}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold p-2.5 transition cursor-pointer shadow-sm"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            Open Share Sheet
                          </button>
                        )}

                        {/* QR Code toggle */}
                        <button
                          onClick={() => setShowQrModal(true)}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-secondary hover:bg-secondary-foreground/10 border border-border text-foreground font-bold p-2.5 transition cursor-pointer"
                        >
                          <QrCode className="h-3.5 w-3.5 text-muted-foreground" />
                          View QR Code
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Funnel Analytics Box */}
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-indigo-500" />
                      Referral Analytics
                    </h3>
                    {loading ? (
                      <div className="h-28 bg-muted animate-pulse rounded-2xl" />
                    ) : (
                      <div className="space-y-4 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-bold">Referral Link Clicks</span>
                            <span className="font-black text-muted-foreground">{stats.totalReferred}</span>
                          </div>
                          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden border border-border">
                            <div className="h-full bg-slate-400 rounded-full" style={{ width: "100%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-bold">Registrations</span>
                            <span className="font-black text-muted-foreground">{stats.successfulSignups} ({stats.conversionRate}%)</span>
                          </div>
                          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden border border-border">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${stats.conversionRate}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-bold">Email Verifications</span>
                            <span className="font-black text-muted-foreground">
                              {stats.verifiedUsers} ({stats.successfulSignups > 0 ? Math.round((stats.verifiedUsers / stats.successfulSignups) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden border border-border">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${stats.successfulSignups > 0 ? Math.round((stats.verifiedUsers / stats.successfulSignups) * 100) : 0}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-bold">Premium Purchases</span>
                            <span className="font-black text-muted-foreground">
                              {stats.premiumConversions} ({stats.successfulSignups > 0 ? Math.round((stats.premiumConversions / stats.successfulSignups) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden border border-border">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${stats.successfulSignups > 0 ? Math.round((stats.premiumConversions / stats.successfulSignups) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: History and Payout Credits */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Empty States Handling */}
                  {!loading && referralList.length === 0 ? (
                    <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                      <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Gift className="h-7 w-7" />
                      </div>
                      <h3 className="font-black text-lg text-foreground">You haven't invited anyone yet.</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Invite your first friend to earn 3 free Pro Days. Share your link via the invite panel to get started!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Referral History List */}
                      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Referral Conversion History
                        </h3>
                        {loading ? (
                          <div className="space-y-3">
                            <div className="h-10 bg-muted animate-pulse rounded-xl" />
                            <div className="h-10 bg-muted animate-pulse rounded-xl" />
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-3">
                                  <th className="pb-3 pr-2">Friend</th>
                                  <th className="pb-3 px-2">Signup Date</th>
                                  <th className="pb-3 px-2">Verification</th>
                                  <th className="pb-3 px-2">Premium Status</th>
                                  <th className="pb-3 pl-2 text-right">Reward Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border font-medium">
                                {referralList.map((item) => (
                                  <tr key={item.id} className="text-foreground hover:bg-muted/30 transition-colors">
                                    <td className="py-3.5 pr-2 font-bold max-w-[130px] truncate">
                                      {item.friendName || item.email}
                                    </td>
                                    <td className="py-3.5 px-2 text-muted-foreground">
                                      {item.signupDate ? new Date(item.signupDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }) : "Pending Signup"}
                                    </td>
                                    <td className="py-3.5 px-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                                        item.phoneVerified
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                          : "bg-muted text-muted-foreground border-border"
                                      }`}>
                                        {item.phoneVerified ? "Verified" : "Pending"}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                                        item.premiumEnabled
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-sm"
                                          : "bg-muted text-muted-foreground border-border"
                                      }`}>
                                        {item.premiumEnabled ? "Premium" : "Free"}
                                      </span>
                                    </td>
                                    <td className="py-3.5 pl-2 text-right font-black text-primary">
                                      {item.rewardGiven ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                                          <Check className="h-3 w-3" /> Credited (+3d)
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground italic font-normal">Pending</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Cash Rewards & Credits Logs */}
                      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
                          <History className="h-4 w-4 text-indigo-500" />
                          Reward History Logs
                        </h3>
                        {loading ? (
                          <div className="h-20 bg-muted animate-pulse rounded-2xl" />
                        ) : rewardsList.length === 0 ? (
                          <p className="text-center py-6 text-xs text-muted-foreground font-medium">
                            No reward logs recorded. Earnings appear when friends upgrade to premium tiers.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {rewardsList.map((log) => (
                              <div key={log.id} className="flex justify-between items-center bg-muted/30 border border-border p-3.5 rounded-2xl text-xs">
                                <div>
                                  <p className="font-bold text-foreground capitalize">
                                    {log.rewardType === "commission" ? "Recurring Payout Commission" : "Milestone Premium days"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                    {log.notes || `Credit matching user ${log.friendEmail}`}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground/80 mt-1">
                                    {new Date(log.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black border ${
                                    log.rewardType === "commission"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                  }`}>
                                    {log.rewardType === "commission" ? `+₹${log.rewardValue.toFixed(2)}` : `+${log.rewardValue} Days`}
                                  </span>
                                  <p className="text-[9px] text-muted-foreground mt-1 capitalize font-bold">
                                    Status: <span className={log.status === "paid" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}>{log.status}</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* FAQ Accordion */}
                  <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      Frequently Asked Questions
                    </h3>
                    <div className="divide-y divide-border">
                      <FaqItem
                        question="How do I earn free Pro Desk days?"
                        answer="You automatically get 3 days of Pro Desk when a friend registers using your link. If they choose to subscribe to a paid tier later, you receive another 7 days of Pro Desk premium access."
                      />
                      <FaqItem
                        question="What is the 10% recurring cash commission?"
                        answer="For every paid purchase or subscription renewal your referred friend completes, you earn 10% of their payment value in cash. This is accumulated in your cash balance and can be seen under Available Cash."
                      />
                      <FaqItem
                        question="How do milestone bonuses stack?"
                        answer="Milestones trigger automatically when you hit target numbers of successful signups (e.g. 3, 7, 15, 30, 50). Each milestone grants bonus Pro Days that stack directly on top of your existing days."
                      />
                      <FaqItem
                        question="Is there an anti-abuse validation system?"
                        answer="Yes. FileNova uses secure registration metrics to block duplicate registrations, self-referrals, and robot signups. Any accounts attempting to game the system will be immediately disqualified from payouts."
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* Reward Terms summary bottom card */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 relative z-10">
            <p className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Referral Terms & Anti-Abuse Controls
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Rewards are credited dynamically once our validation filters confirm the unique device signature of the invitee. Self-invitations, repeated registration attempts from single IP subnets, or bot automation will result in immediate reward voiding and block future referral program access.
            </p>
          </div>

        </div>
      </section>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <h3 className="font-black text-lg text-foreground mb-1">Scan to Join</h3>
            <p className="text-xs text-muted-foreground mb-4">Let your friend scan this QR code with their mobile device to sign up instantly.</p>
            
            <div className="bg-white p-3.5 rounded-2xl border border-border inline-block shadow-sm mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`}
                alt="FileNova Invite QR Code"
                className="h-48 w-48 object-contain"
              />
            </div>
            
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 px-4 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
