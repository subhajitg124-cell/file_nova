import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Copy, Gift, MessageCircle, Sparkles, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { BACKEND_URL } from "@/lib/api";

interface ReferralStats {
  totalReferred: number;
  successfulSignups: number;
  rewardsEarned: number;
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
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export default function ReferralPage() {
  const { user, fetchMe, initialized, openLoginModal } = useAuthStore();
  const [referralCode, setReferralCode] = useState(user?.referralCode || "");
  const [stats, setStats] = useState<ReferralStats>({ totalReferred: 0, successfulSignups: 0, rewardsEarned: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      setSessionExpired(false);
      setReferralCode(user.referralCode || "");
    }
  }, [user]);

  const isLocalUser = !!user?.id?.startsWith("local_");

  useEffect(() => {
    if (!initialized) return;

    if (!user) {
      setLoading(false);
      setStats({ totalReferred: 0, successfulSignups: 0, rewardsEarned: 0 });
      return;
    }

    if (isLocalUser) {
      setReferralCode(user.referralCode || "FN-MOCK12");
      setStats({
        totalReferred: 3,
        successfulSignups: 1,
        rewardsEarned: 7,
      });
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
          setStats(data.stats);
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

  const referralLink = useMemo(() => referralCode ? `https://filenova.in/ref?code=${referralCode}` : "", [referralCode]);
  const whatsappMessage = useMemo(
    () => referralLink ? `Join FileNova using my link: ${referralLink}` : "",
    [referralLink]
  );

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied.");
  };

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    fetchMe();
    setRetryCount((c) => c + 1);
  };

  return (
    <main className="min-h-screen bg-background text-foreground bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          <UserProfileDropdown />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-premium md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-500">
            <Gift className="h-3.5 w-3.5" />
            Refer & Earn
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Invite friends to FileNova</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Invite a friend: when they sign up, both of you get 3 days of Pro Desk free. When they upgrade to a paid plan, you get an additional 7 days of Pro Desk free.
          </p>

          {sessionExpired ? (
            <div className="mt-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
              <p className="text-sm font-bold text-red-650 dark:text-red-400">Session expired. Please log in again to view your referral link.</p>
              <button onClick={() => { openLoginModal(); }} className="mt-4 rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-3 text-xs font-black shadow-glow">
                Log In
              </button>
            </div>
          ) : !user ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center">
              <p className="text-sm font-bold text-muted-foreground">Sign in to get your referral link.</p>
              <button onClick={openLoginModal} className="mt-4 rounded-xl bg-primary px-5 py-3 text-xs font-black text-primary-foreground shadow-glow">
                Sign In
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="fn-glass rounded-2xl p-5 flex flex-col justify-between border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Referred</span>
                    <Users className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="mt-4 text-3xl font-black text-[var(--fn-text-primary)]">{stats.totalReferred}</p>
                </div>
                <div className="fn-glass rounded-2xl p-5 flex flex-col justify-between border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Successful Signups</span>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="mt-4 text-3xl font-black text-[var(--fn-text-primary)]">{stats.successfulSignups}</p>
                </div>
                <div className="fn-glass rounded-2xl p-5 flex flex-col justify-between border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Rewards Earned</span>
                    <Gift className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="mt-4 text-3xl font-black text-[var(--fn-text-primary)]">{stats.rewardsEarned} days</p>
                </div>
              </div>

              {/* Link generator */}
              <div className="rounded-2xl border border-border bg-background/60 p-5">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Your referral link</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <div className="fn-glass rounded-2xl p-4 flex items-center gap-3 flex-1 border border-border/60">
                    <input
                      readOnly
                      value={loading ? "Loading..." : error ? "Could not load link" : referralLink}
                      aria-label="Referral link"
                      title="Referral link"
                      placeholder="Referral link"
                      className="flex-1 bg-transparent text-[var(--fn-text-primary)] text-sm font-mono outline-none"
                    />
                    <button
                      onClick={copyLink}
                      disabled={!referralLink || loading}
                      className="bg-[var(--fn-accent-primary)] text-white font-extrabold rounded-full px-5 py-2.5 text-xs hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                {error ? (
                  <button onClick={retryFetch} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs font-black text-muted-foreground hover:text-foreground transition">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                ) : referralLink ? (
                  <div className="mt-4">
                    <a
                      href={`https://wa.me/?text=Join FileNova using my link: ${encodeURIComponent(referralLink)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white hover:bg-emerald-700 transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Share on WhatsApp
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm font-black text-foreground">Reward rules</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              1. Friend signs up &rarr; Both get 3 days Pro free. <br />
              2. Friend upgrades to any paid plan &rarr; You get 7 days Pro free.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
