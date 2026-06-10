/**
 * useSubscription Hook
 * Handles subscription status, Razorpay integration, and Ad-Gate/Usage limit rules.
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useFileStore } from "@/store/useFileStore";

export type PremiumTier = "free" | "basic" | "pro" | "elite";

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const TESTING_END_TIME = new Date("2026-05-31T20:58:19+05:30").getTime();
export const isTestingPeriodActive = () => Date.now() < TESTING_END_TIME;

export function useSubscription() {
  const [loading, setLoading] = useState(false);
  const [premiumTierState, setPremiumTierState] = useState<PremiumTier>("free");
  const [premiumEnabledState, setPremiumEnabledState] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [activeOffer, setActiveOffer] = useState<{ announcement: string; discountPercentage: number } | null>(null);
  const [dbUsageToday, setDbUsageToday] = useState(0);
  const [dbLimit, setDbLimit] = useState(3);
  const [usersServedToday, setUsersServedToday] = useState(3847);

  const user = useAuthStore((state) => state.user);
  const isDev = user?.email?.toLowerCase() === 'subhajitgho123@gmail.com';

  const testingActive = isTestingPeriodActive() || isDev;
  const premiumTier = testingActive ? "elite" : premiumTierState;
  const premiumEnabled = testingActive ? true : premiumEnabledState;

  // Local storage usage trackers
  const [adWatchCount, setAdWatchCount] = useState(0);
  const [useCount, setUseCount] = useState(0);

  // Sync with localStorage
  const syncLocalMetrics = useCallback(() => {
    const todayKey = getTodayKey();
    const adsKey = `fn_ads_${todayKey}`;
    const usesKey = `fn_uses_${todayKey}`;
    const ads = parseInt(localStorage.getItem(adsKey) || "0", 10);
    const uses = parseInt(localStorage.getItem(usesKey) || "0", 10);
    setAdWatchCount(ads);
    setUseCount(uses);
  }, []);

  const fetchStatus = useCallback(async () => {
    if (useFileStore.getState().isMockMode) {
      return;
    }
    try {
      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/status`, { headers });
      if (res.ok) {
        const data = await res.json();
        const isPremium = data.premiumEnabled || false;
        setPremiumTierState(data.premiumTier || "free");
        setPremiumEnabledState(isPremium);
        setExpiresAt(data.subscription?.expiresAt || null);
        setDbUsageToday(data.usageToday ?? 0);
        setDbLimit(data.limit ?? 3);
        if (data.usersServedToday !== undefined) {
          setUsersServedToday(data.usersServedToday);
        }
        
        try {
          localStorage.setItem("fn_premium_enabled", String(isPremium));
        } catch (e) {
          // Ignore localStorage errors
        }

        if (data.activeOffer) {
          setActiveOffer(data.activeOffer);
        } else {
          setActiveOffer(null);
        }
      } else {
        if (res.status === 500 || res.status === 502 || res.status === 503 || res.status === 504) {
          useFileStore.setState({ isMockMode: true });
        }
      }
    } catch (_) {
      useFileStore.setState({ isMockMode: true });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    syncLocalMetrics();

    const handleSync = () => {
      syncLocalMetrics();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("filenova-metrics-sync", handleSync);

    // Periodically update to detect changes
    const timer = setInterval(() => {
      syncLocalMetrics();
      fetchStatus();
    }, 4000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("filenova-metrics-sync", handleSync);
    };
  }, [fetchStatus, syncLocalMetrics]);

  // Dynamic script loader for Razorpay
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Checkout execution
  const PLAN_PRICES_PAISE = {
    basic: 4900,
    pro: 9900,
    elite: 19900,
  };

  const startCheckout = useCallback(async (plan: "basic" | "pro" | "elite" | "pro_monthly", coupon?: string) => {
    const targetPlan = plan === "pro_monthly" ? "basic" : plan;
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay checkout. Check your internet connection.");
        setLoading(false);
        return;
      }

      let discountPercentage = 0;
      if (coupon) {
        const code = coupon.toUpperCase().trim();
        if (code === "STUDENT20") discountPercentage = 20;
        else if (code === "CYBER50" && targetPlan === "elite") discountPercentage = 50;
        else if (code === "FIRST30") discountPercentage = 30;
        else if (code === "WB10") discountPercentage = 10;
      }
      let amount = PLAN_PRICES_PAISE[targetPlan];
      if (discountPercentage > 0) {
        amount = Math.round(amount * (1 - discountPercentage / 100));
      }

      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({ plan: targetPlan, amount, coupon }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "FileNova Premium",
        description: `Upgrade to ${targetPlan.toUpperCase()}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          setLoading(true);
          try {
             const token = localStorage.getItem("filenova_token");
             const headers: Record<string, string> = { "Content-Type": "application/json" };
             if (token) {
               headers["Authorization"] = `Bearer ${token}`;
             }

             const verifyRes = await fetch(`${BACKEND_URL}/api/payments/verify`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: targetPlan,
              }),
            });
            if (!verifyRes.ok) throw new Error("Payment verification failed");
            toast.success("🎉 Welcome to Pro! Your account is now upgraded.");
            fetchStatus();
            useAuthStore.getState().fetchMe();
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "Student Desk",
          email: "student@filenova.in",
        },
        theme: {
          color: "#0284c7",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment process cancelled.");
          },
        },
      };

      // Mock auto-complete for local/testing convenience
      if (data.orderId.startsWith("order_mock_")) {
        toast.info("Mocking transaction checkout…");
        setTimeout(async () => {
          try {
            const token = localStorage.getItem("filenova_token");
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) {
              headers["Authorization"] = `Bearer ${token}`;
            }

            const verifyRes = await fetch(`${BACKEND_URL}/api/payments/verify`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                razorpay_order_id: data.orderId,
                razorpay_payment_id: `pay_mock_${Math.random().toString(36).slice(2)}`,
                plan: targetPlan,
              }),
            });
            if (!verifyRes.ok) throw new Error("Mock verification failed");
            toast.success("🎉 Welcome to Pro! Your account is now upgraded.");
            fetchStatus();
            useAuthStore.getState().fetchMe();
          } catch (err) {
            toast.error("Simulated purchase validation failed.");
          } finally {
            setLoading(false);
          }
        }, 1200);
      } else {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      toast.error(err.message || "Payment setup failed");
      setLoading(false);
    }
  }, [fetchStatus, loadRazorpayScript]);

  // Cancel Plan
  const cancelSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/cancel`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        toast.success("Subscription downgraded to Free.");
        fetchStatus();
      } else {
        throw new Error();
      }
    } catch (_) {
      toast.error("Failed to cancel subscription.");
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // Gating counters
  const incrementAdWatch = useCallback((count = 1) => {
    const todayKey = getTodayKey();
    const adsKey = `fn_ads_${todayKey}`;
    const current = parseInt(localStorage.getItem(adsKey) || "0", 10);
    localStorage.setItem(adsKey, String(current + count));
    syncLocalMetrics();
  }, [syncLocalMetrics]);

  const incrementFeatureUse = useCallback(() => {
    const todayKey = getTodayKey();
    const usesKey = `fn_uses_${todayKey}`;
    const current = parseInt(localStorage.getItem(usesKey) || "0", 10);
    localStorage.setItem(usesKey, String(current + 1));
    syncLocalMetrics();
    // Proactively refresh DB status
    fetchStatus();
  }, [syncLocalMetrics, fetchStatus]);

  // Max daily limit rules
  const getDailyLimit = useCallback((): number => {
    if (isTestingPeriodActive() || isDev) return Infinity;
    if (dbLimit === -1) return Infinity;
    try {
      const today = getTodayKey();
      const hasYt = localStorage.getItem("fn_youtube_subscribed_at") === today;
      const hasInsta = localStorage.getItem("fn_instagram_followed_at") === today;
      const hasFb = localStorage.getItem("fn_facebook_followed_at") === today;

      let activeCount = 0;
      if (hasYt) activeCount++;
      if (hasInsta) activeCount++;
      if (hasFb) activeCount++;

      if (premiumTier === "free") {
        if (activeCount === 1) return 6;
        if (activeCount === 2) return 8;
        if (activeCount >= 3) return 12;
      }
    } catch (_) {}
    return dbLimit;
  }, [dbLimit, premiumTier, isDev]);

  const isLimitReached = useCallback((): boolean => {
    if (isTestingPeriodActive() || isDev) return false;
    const max = getDailyLimit();
    return dbUsageToday >= max;
  }, [getDailyLimit, dbUsageToday, isDev]);

  const shouldShowAdGate = useCallback((): boolean => {
    if (isTestingPeriodActive() || isDev) return false;
    if (premiumTier !== "free") return false;
    // FREE user: watch 1 ad per use.
    // Condition: watched ads must be >= uses + 1 to run next feature
    const requiredAds = dbUsageToday + 1;
    return adWatchCount < requiredAds;
  }, [premiumTier, dbUsageToday, adWatchCount, isDev]);

  return {
    loading,
    premiumTier,
    premiumEnabled,
    expiresAt,
    adWatchCount,
    useCount: dbUsageToday,
    activeOffer,
    usersServedToday,
    incrementAdWatch,
    incrementFeatureUse,
    startCheckout,
    cancelSubscription,
    isLimitReached,
    shouldShowAdGate,
    getDailyLimit,
    refreshStatus: fetchStatus,
  };
}
