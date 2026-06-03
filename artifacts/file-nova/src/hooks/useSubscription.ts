/**
 * useSubscription Hook
 * Handles subscription status, Razorpay integration, and Ad-Gate/Usage limit rules.
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

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

  const testingActive = isTestingPeriodActive();
  const premiumTier = testingActive ? "elite" : premiumTierState;
  const premiumEnabled = testingActive ? true : premiumEnabledState;

  // Local storage usage trackers
  const [adWatchCount, setAdWatchCount] = useState(0);
  const [useCount, setUseCount] = useState(0);

  const todayKey = getTodayKey();
  const adsKey = `fn_ads_${todayKey}`;
  const usesKey = `fn_uses_${todayKey}`;

  // Sync with localStorage
  const syncLocalMetrics = useCallback(() => {
    const ads = parseInt(localStorage.getItem(adsKey) || "0", 10);
    const uses = parseInt(localStorage.getItem(usesKey) || "0", 10);
    setAdWatchCount(ads);
    setUseCount(uses);
  }, [adsKey, usesKey]);

  const fetchStatus = useCallback(async () => {
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
      }
    } catch (_) {
      // Fallback silently
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    syncLocalMetrics();
    // Periodically update to detect changes
    const timer = setInterval(() => {
      syncLocalMetrics();
      fetchStatus();
    }, 4000);
    return () => clearInterval(timer);
  }, [fetchStatus, syncLocalMetrics]);

  // Dynamic script loader for Razorpay
  const loadRazorpayScript = (): Promise<boolean> => {
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
  };

  // Checkout execution
  const PLAN_PRICES_PAISE = {
    basic: 4900,
    pro: 9900,
    elite: 19900,
  };

  const startCheckout = async (plan: "basic" | "pro" | "elite", coupon?: string) => {
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
        else if (code === "CYBER50" && plan === "elite") discountPercentage = 50;
        else if (code === "FIRST30") discountPercentage = 30;
        else if (code === "WB10") discountPercentage = 10;
      }
      let amount = PLAN_PRICES_PAISE[plan];
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
        body: JSON.stringify({ plan, amount, coupon }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "FileNova Premium",
        description: `Upgrade to ${plan.toUpperCase()}`,
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
                plan,
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
                plan,
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
  };

  // Cancel Plan
  const cancelSubscription = async () => {
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
  };

  // Gating counters
  const incrementAdWatch = (count = 1) => {
    const current = parseInt(localStorage.getItem(adsKey) || "0", 10);
    localStorage.setItem(adsKey, String(current + count));
    syncLocalMetrics();
  };

  const incrementFeatureUse = () => {
    const current = parseInt(localStorage.getItem(usesKey) || "0", 10);
    localStorage.setItem(usesKey, String(current + 1));
    syncLocalMetrics();
    // Proactively refresh DB status
    fetchStatus();
  };

  // Max daily limit rules
  const getDailyLimit = (): number => {
    if (isTestingPeriodActive()) return Infinity;
    return dbLimit === -1 ? Infinity : dbLimit;
  };

  const isLimitReached = (): boolean => {
    if (isTestingPeriodActive()) return false;
    const max = getDailyLimit();
    return dbUsageToday >= max;
  };

  const shouldShowAdGate = (): boolean => {
    if (isTestingPeriodActive()) return false;
    if (premiumTier !== "free") return false;
    // FREE user: watch 1 ad per use.
    // Condition: watched ads must be >= uses + 1 to run next feature
    const requiredAds = dbUsageToday + 1;
    return adWatchCount < requiredAds;
  };

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
