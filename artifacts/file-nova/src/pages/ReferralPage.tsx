import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Copy, Gift, MessageCircle, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useAuthStore } from "@/store/useAuthStore";

interface ReferralStats {
  totalReferred: number;
  successfulSignups: number;
  rewardsEarned: number;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("filenova_session_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ReferralPage() {
  const { user, fetchMe, openLoginModal } = useAuthStore();
  const [referralCode, setReferralCode] = useState(user?.referralCode || "");
  const [stats, setStats] = useState<ReferralStats>({ totalReferred: 0, successfulSignups: 0, rewardsEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/v1/referral/stats", {
      credentials: "include",
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || "Failed to load referral stats");
        setReferralCode(data.referralCode);
        setStats(data.stats);
      })
      .catch((err) => toast.error(err.message || "Failed to load referral stats"))
      .finally(() => setLoading(false));
  }, [user]);

  const referralLink = useMemo(() => referralCode ? `https://filenova.in?ref=${referralCode}` : "", [referralCode]);
  const whatsappMessage = `Try FileNova - Free PDF tools for Indians! Sign up with my link and we both get 3 days of Pro free: ${referralLink}`;

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied.");
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

          {!user ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center">
              <p className="text-sm font-bold text-muted-foreground">Sign in to get your referral link.</p>
              <button onClick={openLoginModal} className="mt-4 rounded-xl bg-primary px-5 py-3 text-xs font-black text-primary-foreground shadow-glow">
                Sign In
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-border bg-background/60 p-5">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Your referral link</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm font-bold text-foreground">
                    {loading ? "Loading..." : referralLink}
                  </div>
                  <button onClick={copyLink} disabled={!referralLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs font-black text-muted-foreground hover:text-foreground disabled:opacity-50">
                    <Copy className="h-4 w-4" />
                    Copy link
                  </button>
                </div>
                <a href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white">
                  <MessageCircle className="h-4 w-4" />
                  Share on WhatsApp
                </a>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-5">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Referral stats</p>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground"><Users className="h-4 w-4" /> Total referred</span>
                    <span className="text-lg font-black">{stats.totalReferred}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground"><Sparkles className="h-4 w-4" /> Successful signups</span>
                    <span className="text-lg font-black">{stats.successfulSignups}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground"><Gift className="h-4 w-4" /> Rewards earned</span>
                    <span className="text-lg font-black">{stats.rewardsEarned} days</span>
                  </div>
                </div>
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
