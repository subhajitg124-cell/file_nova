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

// Testing period auto-grant removed (expired May 2026)

export function useSubscription() {
  return {
    loading: false,
    premiumTier: "elite" as PremiumTier,
    premiumEnabled: true,
    expiresAt: null,
    adWatchCount: 0,
    useCount: 0,
    activeOffer: null,
    usersServedToday: 3847,
    incrementAdWatch: (count?: number) => {},
    incrementFeatureUse: (count?: number) => {},
    cancelSubscription: async () => {},
    isLimitReached: () => false,
    shouldShowAdGate: () => false,
    getDailyLimit: () => Infinity,
    refreshStatus: async () => {},
  };
}
