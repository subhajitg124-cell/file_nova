/**
 * useSubscription Hook
 * Handles subscription status, Razorpay integration, and Ad-Gate/Usage limit rules.
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useFileStore } from "@/store/useFileStore";

export type PremiumTier = "free" | "basic" | "pro" | "elite" | "pass_24h" | "pass_7d";

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
      console.log("%c[SUB] fetchStatus response", "color:blue", {
        status: res.status,
        timestamp: new Date().toISOString(),
      });
      if (res.ok) {
        if (localStorage.getItem("filenova_mock_mode_manual") !== "true") {
          useFileStore.setState({ isMockMode: false });
          try { localStorage.removeItem("filenova_mock_mode"); } catch (_) {}
        }
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
          try { localStorage.setItem("filenova_mock_mode", "true"); } catch (_) {}
        }
      }
    } catch (_) {
      useFileStore.setState({ isMockMode: true });
      try { localStorage.setItem("filenova_mock_mode", "true"); } catch (_) {}
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
    pass_24h: 900,
    pass_7d: 2900,
  };

  // startCheckout removed — use CheckoutModal via useCheckoutStore instead

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
    if (typeof window !== "undefined" && window.location.pathname.includes("/ai-ppt-maker")) {
      return premiumTier === "free" ? 2 : 20;
    }
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
    
    // Check if ad type is disabled in admin settings
    try {
      const settingsStr = localStorage.getItem("filenova-settings");
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        if (parsed && parsed.adType === "none") {
          return false;
        }
      }
    } catch (_) {}

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
    // startCheckout removed — use CheckoutModal instead
    cancelSubscription,
    isLimitReached,
    shouldShowAdGate,
    getDailyLimit,
    refreshStatus: fetchStatus,
  };
}
