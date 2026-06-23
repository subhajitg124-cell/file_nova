import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Copy, Gift, MessageCircle, Sparkles, Users, RefreshCw, Send, Share2,
  Award, CheckCircle2, TrendingUp, Info, ChevronDown, Calendar, History, QrCode, Loader2, Check
} from "lucide-react";
import { toast } from "sonner";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { BACKEND_URL } from "@/lib/api";

interface ReferralStats {
  totalReferred: number;
  successfulSignups: number;
  rewardsEarned: number;
}

interface ReferralItem {
  id: string;
  email: string;
  status: string;
  rewardGiven: boolean;
  upgradeRewardGiven: boolean;
  createdAt: string;
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

const MOCK_REFERRALS: ReferralItem[] = [
  {
    id: "ref_1",
    email: "sar***@gmail.com",
    status: "completed",
    rewardGiven: true,
    upgradeRewardGiven: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ref_2",
    email: "ami***@yahoo.com",
    status: "completed",
    rewardGiven: true,
    upgradeRewardGiven: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ref_3",
    email: "pri***@outlook.com",
    status: "pending",
    rewardGiven: false,
    upgradeRewardGiven: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
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

  return <>{displayValue}{suffix}</>;
}

function SkeletonCard() {
  return (
    <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 bg-slate-800 rounded" />
        <div className="h-5 w-5 bg-slate-800 rounded-full" />
      </div>
      <div className="h-8 w-16 bg-slate-850 rounded" />
      <div className="h-3 w-36 bg-slate-850 rounded" />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-900/40 py-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-xs font-bold text-white hover:text-indigo-400 transition-colors py-1 cursor-pointer"
      >
        <span>{question}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <p className="mt-2 text-[11.5px] text-slate-400 leading-relaxed animate-fade-in">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function ReferralPage() {
  const { user, fetchMe, initialized, openLoginModal } = useAuthStore();
  const [referralCode, setReferralCode] = useState(user?.referralCode || "");
  const [referralLink, setReferralLink] = useState(
    user?.referralCode ? `https://filenova.in/ref?code=${user.referralCode}` : ""
  );
  const [stats, setStats] = useState<ReferralStats>({ totalReferred: 0, successfulSignups: 0, rewardsEarned: 0 });
  const [referralList, setReferralList] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
      setStats({ totalReferred: 0, successfulSignups: 0, rewardsEarned: 0 });
      setReferralList([]);
      return;
    }

    if (isLocalUser) {
      const code = user.referralCode || "FN-MOCK12";
      setReferralCode(code);
      setReferralLink(`https://filenova.in/ref?code=${code}`);
      setStats({
        totalReferred: 3,
        successfulSignups: 2,
        rewardsEarned: 13,
      });
      setReferralList(MOCK_REFERRALS);
      setLoading(false);
      setError(null);
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

  const conversionRate = useMemo(() => {
    if (stats.totalReferred === 0) return 0;
    return Math.min(100, Math.round((stats.successfulSignups / stats.totalReferred) * 100));
  }, [stats.totalReferred, stats.successfulSignups]);

  const upgradesCount = useMemo(() => {
    return referralList.filter(r => r.upgradeRewardGiven).length;
  }, [referralList]);

  const milestoneInfo = useMemo(() => {
    const total = stats.successfulSignups;
    if (total < 3) {
      return {
        tier: "Bronze Referrer",
        current: total,
        target: 3,
        prev: 0,
        bonus: "5 extra days of Pro Desk",
        remaining: 3 - total
      };
    } else if (total < 7) {
      return {
        tier: "Silver Advocate",
        current: total,
        target: 7,
        prev: 3,
        bonus: "10 extra days of Pro Desk",
        remaining: 7 - total
      };
    } else {
      return {
        tier: "Gold Ambassador",
        current: total,
        target: 15,
        prev: 7,
        bonus: "30 extra days of Pro Desk (1 month)",
        remaining: Math.max(0, 15 - total)
      };
    }
  }, [stats.successfulSignups]);

  const milestoneProgress = useMemo(() => {
    const { current, target, prev } = milestoneInfo;
    const num = current - prev;
    const den = target - prev;
    return Math.min(100, Math.round((num / den) * 100));
  }, [milestoneInfo]);

  const equivalentInr = useMemo(() => {
    return (stats.rewardsEarned * 3.30).toFixed(2);
  }, [stats.rewardsEarned]);

  const rewardLogs = useMemo(() => {
    const logs: { id: string; type: string; title: string; days: number; date: string }[] = [];
    referralList.forEach((item, index) => {
      if (item.rewardGiven) {
        logs.push({
          id: `reg_${item.id}_${index}`,
          type: "registration",
          title: `Signup from ${item.email}`,
          days: 3,
          date: item.createdAt
        });
      }
      if (item.upgradeRewardGiven) {
        logs.push({
          id: `upg_${item.id}_${index}`,
          type: "upgrade",
          title: `Premium upgrade from ${item.email}`,
          days: 7,
          date: item.createdAt
        });
      }
    });
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [referralList]);

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
        <div className="rounded-3xl border border-border bg-card/45 backdrop-blur-xl p-6 shadow-premium md:p-8 card-shine relative overflow-hidden">
          {/* Subtle aurora accent */}
          <div className="absolute top-0 right-0 w-[400px] h-[150px] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.06),transparent_70%)] pointer-events-none z-0" />

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-500 relative z-10">
            <Gift className="h-3.5 w-3.5" />
            Referral Hub
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl text-white relative z-10">
            Invite friends to FileNova Pro
          </h1>
          <p className="mt-3 max-w-2xl text-xs sm:text-sm leading-6 text-slate-400 relative z-10">
            Share the FileNova experience. Get <strong className="text-indigo-400 font-bold">3 days of Pro Desk</strong> when your friend signs up. Get an extra <strong className="text-emerald-400 font-bold">7 days of Pro Desk</strong> once they upgrade to any paid tier.
          </p>

          {sessionExpired ? (
            <div className="mt-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center animate-fade-up">
              <p className="text-sm font-bold text-red-650 dark:text-red-400">Session expired. Please log in again to view your referral portal.</p>
              <button onClick={() => { openLoginModal(); }} className="mt-4 rounded-xl bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 text-xs font-black shadow-glow-red cursor-pointer">
                Log In
              </button>
            </div>
          ) : !user ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-slate-950/20 p-8 text-center animate-fade-up">
              <p className="text-sm font-bold text-slate-400">Sign in to retrieve your unique referral link.</p>
              <button onClick={openLoginModal} className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-black text-white shadow-glow-indigo cursor-pointer">
                Sign In
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-8 relative z-10">
              
              {/* Overview Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Friends Invited */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Friends Invited</span>
                      <Users className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-white">
                        <CountUp value={stats.totalReferred} />
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Total referral interactions initiated</p>
                    </div>
                  </div>

                  {/* Card 2: Successful Signups */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Successful Signups</span>
                      <Sparkles className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-white">
                        <CountUp value={stats.successfulSignups} />
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Conversion Rate: <span className="font-bold text-amber-400">{conversionRate}%</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Premium Rewards Earned */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Rewards Earned</span>
                      <Gift className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="mt-4">
                      <p className="text-3xl font-black text-white">
                        <CountUp value={stats.rewardsEarned} />
                        <span className="text-xs font-semibold text-slate-400 ml-1">days Pro</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Equivalent Value: <span className="font-bold text-emerald-400">₹{equivalentInr}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Next Milestone */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Next Milestone</span>
                      <Award className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="mt-2.5">
                      <div className="flex justify-between items-center text-[10px] mb-1">
                        <span className="font-bold text-indigo-400">{milestoneInfo.tier}</span>
                        <span className="text-slate-500">{milestoneInfo.current}/{milestoneInfo.target}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${milestoneProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {milestoneInfo.remaining > 0 ? (
                          <>Need <strong className="text-white font-bold">{milestoneInfo.remaining}</strong> more for <strong className="text-indigo-300 font-bold">{milestoneInfo.bonus}</strong></>
                        ) : (
                          <span className="text-indigo-400 font-bold">All Milestones Cleared!</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left panel: Funnel, Timeline, FAQ */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Referral Progress Detail */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-indigo-400" />
                      Referral Tier Milestones
                    </h3>
                    <div className="space-y-4 text-xs">
                      <div className="flex justify-between items-center bg-slate-950/20 border border-slate-900 p-3.5 rounded-xl">
                        <div>
                          <p className="font-bold text-white">Bronze Milestone (3 Invites)</p>
                          <p className="text-[10.5px] text-slate-500 mt-0.5">Unlock +5 free Pro Desk days bonus</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          stats.successfulSignups >= 3 ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25" : "bg-slate-900 text-slate-600 border border-slate-900"
                        }`}>
                          {stats.successfulSignups >= 3 ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/20 border border-slate-900 p-3.5 rounded-xl">
                        <div>
                          <p className="font-bold text-white">Silver Milestone (7 Invites)</p>
                          <p className="text-[10.5px] text-slate-500 mt-0.5">Unlock +10 free Pro Desk days bonus</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          stats.successfulSignups >= 7 ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25" : "bg-slate-900 text-slate-600 border border-slate-900"
                        }`}>
                          {stats.successfulSignups >= 7 ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/20 border border-slate-900 p-3.5 rounded-xl">
                        <div>
                          <p className="font-bold text-white">Gold Milestone (15 Invites)</p>
                          <p className="text-[10.5px] text-slate-500 mt-0.5">Unlock +30 free Pro Desk days bonus</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          stats.successfulSignups >= 15 ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25" : "bg-slate-900 text-slate-600 border border-slate-900"
                        }`}>
                          {stats.successfulSignups >= 15 ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Referral Analytics Funnel */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-indigo-400" />
                      Referral Analytics Funnel
                    </h3>
                    
                    {loading ? (
                      <div className="h-28 bg-slate-950/20 animate-pulse rounded-2xl" />
                    ) : (
                      <div className="space-y-4">
                        {/* Funnel Stage 1: Initiated */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-white flex items-center gap-1">Invites / Clicks</span>
                            <span className="font-extrabold text-slate-400">{stats.totalReferred} clicks</span>
                          </div>
                          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <div className="h-full bg-slate-500/40 rounded-full" style={{ width: "100%" }} />
                          </div>
                        </div>

                        {/* Funnel Stage 2: Registrations */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-white">Successful Signups</span>
                            <span className="font-extrabold text-slate-400">
                              {stats.successfulSignups} ({conversionRate}%)
                            </span>
                          </div>
                          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${conversionRate}%` }} />
                          </div>
                        </div>

                        {/* Funnel Stage 3: Paid Upgrades */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-white">Paid Upgrades</span>
                            <span className="font-extrabold text-slate-400">
                              {upgradesCount} ({stats.successfulSignups > 0 ? Math.round((upgradesCount / stats.successfulSignups) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${stats.successfulSignups > 0 ? Math.round((upgradesCount / stats.successfulSignups) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Referral Activity Timeline */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-indigo-400" />
                      Referral Activity Timeline
                    </h3>

                    {loading ? (
                      <div className="space-y-3">
                        <div className="h-10 bg-slate-950/20 animate-pulse rounded-xl" />
                        <div className="h-10 bg-slate-950/20 animate-pulse rounded-xl" />
                      </div>
                    ) : referralList.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-900 rounded-2xl bg-slate-950/20">
                        <Users className="h-8 w-8 text-slate-650 mx-auto mb-2" />
                        <p className="text-xs text-slate-455 font-bold">You haven't invited anyone yet.</p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">Share your referral link to start earning FileNova Pro rewards.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {referralList.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-slate-950/25 border border-slate-900 p-3.5 rounded-xl text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-white font-mono">{item.email}</p>
                              <p className="text-[10px] text-slate-550 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                item.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                  : "bg-slate-900 text-slate-500 border border-slate-900"
                              }`}>
                                {item.status === "completed" ? "Signed Up" : "Click / Pending"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reward History Logs */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                      <History className="h-4 w-4 text-indigo-400" />
                      Reward Credit History
                    </h3>

                    {loading ? (
                      <div className="h-20 bg-slate-950/20 animate-pulse rounded-2xl" />
                    ) : rewardLogs.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500">
                        No rewards credited yet. Credits appear once friends complete signups.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {rewardLogs.map((log) => (
                          <div key={log.id} className="flex justify-between items-center bg-slate-950/20 border border-slate-900 p-3 rounded-xl text-xs">
                            <div>
                              <p className="font-bold text-slate-200">{log.title}</p>
                              <p className="text-[10px] text-slate-500">
                                Credited on: {new Date(log.date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-md px-2 py-1">
                              +{log.days} Days
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FAQ Accordion */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-indigo-400" />
                      Frequently Asked Questions
                    </h3>
                    <div className="divide-y divide-slate-900/30">
                      <FaqItem
                        question="How do I get my free Pro Desk rewards?"
                        answer="It is simple: copy your referral link or let your friend scan your QR code. Once they register, both of you are instantly credited with 3 days of Pro Desk. If they choose to subscribe to a paid tier later, you automatically receive another 7 days of Pro Desk."
                      />
                      <FaqItem
                        question="Is there a limit on how many friends I can refer?"
                        answer="Absolutely not! You can refer as many friends as you want. The more friends you invite, the more milestone bonuses you unlock, allowing you to stack up months of free Pro Desk access."
                      />
                      <FaqItem
                        question="How do I track my active Pro days status?"
                        answer="You can see your total days credited right inside the Rewards Earned card on this dashboard. Your account's active tier status will also reflect Pro Desk immediately in your main Profile section."
                      />
                      <FaqItem
                        question="Can I invite myself using another email?"
                        answer="No. FileNova uses secure registration validation metrics, network analysis, and browser tracking blocks to prevent double signup abuse. Self-referrals will be automatically rejected by verification scripts."
                      />
                    </div>
                  </div>

                </div>

                {/* Right panel: Link, QR Code, How it Works */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Share widgets */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-5">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Send className="h-4 w-4 text-indigo-400" />
                      Share Referral Link
                    </h3>

                    {/* Code display */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-extrabold text-slate-500 block">Your Referral Code</span>
                      <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-900 rounded-xl p-3 text-xs">
                        <span className="flex-1 font-mono font-black text-indigo-400 text-sm tracking-wider uppercase">{referralCode}</span>
                        <button
                          onClick={copyCode}
                          type="button"
                          className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedCode ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Link copy */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-extrabold text-slate-500 block">Invite URL</span>
                      <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-900 rounded-xl p-3 text-xs">
                        <input
                          readOnly
                          value={loading ? "Loading Link..." : error ? "Error retrieving link" : referralLink}
                          aria-label="Referral Link"
                          title="Referral Link"
                          className="flex-1 bg-transparent font-mono text-slate-300 outline-none text-xs truncate"
                        />
                        <button
                          onClick={copyLink}
                          disabled={!referralLink || loading}
                          type="button"
                          className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {copiedLink ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Direct Share Options */}
                    {referralLink && !loading && (
                      <div className="space-y-2 pt-2 border-t border-slate-900/60">
                        <span className="text-[10px] uppercase font-extrabold text-slate-500 block">Quick Share</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <a
                            href={`https://wa.me/?text=Join%20FileNova%20using%20my%20link%3A%20${encodeURIComponent(referralLink)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 font-bold p-2.5 transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                          </a>
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join FileNova using my link:")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/25 text-[#38bdf8] font-bold p-2.5 transition"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Telegram
                          </a>
                        </div>
                        {navigatorShareSupported && (
                          <button
                            onClick={shareNative}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 font-bold p-2.5 transition cursor-pointer"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            Native Share Sheet
                          </button>
                        )}
                      </div>
                    )}

                    {/* QR Code generator */}
                    {referralLink && !loading && (
                      <div className="space-y-3 pt-3 border-t border-slate-900/60 text-center flex flex-col items-center">
                        <span className="text-[10px] uppercase font-extrabold text-slate-500 self-start block">Referral QR Code</span>
                        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 inline-block shadow-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`}
                            alt="FileNova Invite QR Code"
                            className="h-32 w-32 object-contain"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Let a friend scan this code to register instantly.</p>
                      </div>
                    )}
                  </div>

                  {/* Invite instructions */}
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Info className="h-4 w-4 text-indigo-400" />
                      How It Works
                    </h3>
                    <div className="space-y-4 text-xs leading-relaxed">
                      <div className="flex gap-3">
                        <div className="h-5 w-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 border border-slate-900">1</div>
                        <div>
                          <p className="font-bold text-white">Send invitation link</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Copy your custom invite link or share the QR code with friends.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-5 w-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 border border-slate-900">2</div>
                        <div>
                          <p className="font-bold text-white">Friend joins FileNova</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">When they sign up, both of you are immediately credited with 3 days Pro.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-5 w-5 rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 border border-slate-900">3</div>
                        <div>
                          <p className="font-bold text-white">Unlock premium upgrade bonus</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">If they upgrade to a premium plan later, you get 7 days Pro bonus.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Reward rules summary bottom card */}
          <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 relative z-10">
            <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              Referral Terms & Anti-Abuse Controls
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Rewards are credited dynamically once our validation filters confirm the unique device signature of the invitee. Self-invitations, repeated registration attempts from single IP subnets, or bot automation will result in immediate reward voiding and block future referral program access.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
