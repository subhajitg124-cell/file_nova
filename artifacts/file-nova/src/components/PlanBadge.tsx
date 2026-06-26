import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Clock,
  X,
  Crown,
  Shield,
  Star,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "@/lib/i18n";

/* ─── Tier configuration ─────────────────────────────────────────────── */
const TIER_META = {
  free: {
    label: "FREE",
    emoji: "🟢",
    badgeClass: "badge-free",
    headerColor: "text-emerald-600 dark:text-emerald-400",
    barFrom: "from-emerald-500",
    barTo: "to-teal-500",
    statusLabel: "Free Plan Status",
    limitLabel: "Daily Workspace Limit",
    limitDesc: "Free tier accounts get 3 document automations daily.",
    dailyMax: 3,
    icon: Shield,
    ctaText: "Upgrade to Pro (₹99/mo)",
    ctaHref: "/pricing",
    ctaClass:
      "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
    perks: ["3 uses/day", "Ad-supported", "Basic PDF tools"],
  },
  basic: {
    label: "BASIC",
    emoji: "🔵",
    badgeClass: "badge-basic",
    headerColor: "text-sky-600 dark:text-sky-400",
    barFrom: "from-sky-500",
    barTo: "to-blue-500",
    statusLabel: "Basic Desk Status",
    limitLabel: "Daily Usage Allowance",
    limitDesc: "Basic Desk users get 20 document automations per day.",
    dailyMax: 20,
    icon: Star,
    ctaText: "Upgrade to Pro (₹99/mo)",
    ctaHref: "/pricing",
    ctaClass:
      "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
    perks: ["20 uses/day", "Ad-free", "Aadhaar masking", "Voice assistant"],
  },
  pro: {
    label: "PRO ⚡",
    emoji: "🟣",
    badgeClass: "badge-pro",
    headerColor: "text-indigo-600 dark:text-indigo-400",
    barFrom: "from-indigo-500",
    barTo: "to-purple-500",
    statusLabel: "Pro Desk Status",
    limitLabel: "Daily Usage Allowance",
    limitDesc: "Pro Desk users enjoy 100 document automations every day.",
    dailyMax: 100,
    icon: Zap,
    ctaText: "Upgrade to Elite (₹199/mo)",
    ctaHref: "/pricing",
    ctaClass:
      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
    perks: ["100 uses/day", "Priority speed", "QR validation", "7-day history"],
  },
  elite: {
    label: "ELITE 👑",
    emoji: "🟡",
    badgeClass: "badge-elite",
    headerColor: "text-amber-600 dark:text-amber-400",
    barFrom: "from-amber-500",
    barTo: "to-orange-400",
    statusLabel: "Elite Console Status",
    limitLabel: "Usage Limit",
    limitDesc: "Elite Console gives you unlimited daily automations.",
    dailyMax: -1, // unlimited
    icon: Crown,
    ctaText: "Manage Workspace",
    ctaHref: "/pricing",
    ctaClass:
      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
    perks: [
      "Unlimited uses",
      "Max 100 MB files",
      "Bulk CSV import",
      "WhatsApp support",
    ],
  },
  pass_24h: {
    label: "24-HOUR PASS ⚡",
    emoji: "🟣",
    badgeClass: "badge-pro",
    headerColor: "text-indigo-600 dark:text-indigo-400",
    barFrom: "from-indigo-500",
    barTo: "to-purple-500",
    statusLabel: "24-Hour Pass Status",
    limitLabel: "Usage Limit",
    limitDesc: "24-Hour Pass gives you 100 document automations.",
    dailyMax: 100,
    icon: Zap,
    ctaText: "Upgrade to Monthly Pro (₹99/mo)",
    ctaHref: "/pricing",
    ctaClass:
      "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
    perks: ["100 uses/day", "Priority speed", "QR validation", "24-hour duration"],
  },
  pass_7d: {
    label: "WEEKLY PASS ⚡",
    emoji: "🟣",
    badgeClass: "badge-pro",
    headerColor: "text-indigo-600 dark:text-indigo-400",
    barFrom: "from-indigo-500",
    barTo: "to-purple-500",
    statusLabel: "Weekly Pass Status",
    limitLabel: "Usage Limit",
    limitDesc: "Weekly Pass gives you 100 document automations daily.",
    dailyMax: 100,
    icon: Zap,
    ctaText: "Upgrade to Elite (₹199/mo)",
    ctaHref: "/pricing",
    ctaClass:
      "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400",
    perks: ["100 uses/day", "Priority speed", "QR validation", "7-day duration"],
  },
} as const;

/* ─── Component ──────────────────────────────────────────────────────── */
export function PlanBadge() {
  const { premiumTier, useCount, getDailyLimit } = useSubscription();
  const { tText } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tier = TIER_META[premiumTier as keyof typeof TIER_META] ?? TIER_META.free;
  const IconComp = tier.icon;

  /* Usage progress */
  const maxUses = premiumTier === "elite" ? null : (getDailyLimit() === Infinity ? null : getDailyLimit());
  const remaining = maxUses !== null ? Math.max(0, maxUses - useCount) : null;
  const progressPct =
    maxUses !== null && maxUses > 0 ? ((remaining! / maxUses) * 100) : 100;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* ── Animated tier badge button ─── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className={`${tier.badgeClass} text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border mr-2 cursor-pointer relative overflow-hidden group select-none flex items-center gap-1`}
      >
        <IconComp className="h-2.5 w-2.5 shrink-0" />
        <span className="relative z-10">{tText(tier.label)}</span>
        {/* Shimmer sweep on hover */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10" />
      </motion.button>

      {/* ── Popover dropdown ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-72 rounded-2xl border border-border bg-card backdrop-blur-xl p-4 shadow-2xl z-50 text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${tier.headerColor}`}>
                <IconComp className="h-3 w-3" />
                {tText(tier.statusLabel)}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Limit description */}
              <div>
                <p className="text-xs font-bold text-foreground leading-snug">
                  {tText(tier.limitLabel)}
                </p>
                <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                  {tText(tier.limitDesc)}
                </p>
              </div>

              {/* Usage meter */}
              <div className="bg-muted rounded-xl p-2.5 border border-border">
                {maxUses === null ? (
                  /* Unlimited */
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    Unlimited daily usage — no gates
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-bold text-foreground mb-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {tText("Uses Remaining")}
                      </span>
                      <span className={tier.headerColor}>
                        {remaining} / {maxUses}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${tier.barFrom} ${tier.barTo} rounded-full transition-all duration-500`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Perks */}
              <div className="grid grid-cols-2 gap-1">
                {(tier.perks as readonly string[]).map((perk: string) => (
                  <div
                    key={perk}
                    className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground"
                  >
                    <CheckCircle2 className={`h-2.5 w-2.5 shrink-0 ${tier.headerColor}`} />
                    {perk}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={tier.ctaHref}
                onClick={() => setIsOpen(false)}
                className={`w-full text-center py-2 px-3 rounded-xl text-xs font-black text-white shadow-glow flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${tier.ctaClass}`}
              >
                {premiumTier === "elite" ? (
                  <Crown className="h-3.5 w-3.5" />
                ) : (
                  <Zap className="h-3.5 w-3.5 fill-white animate-pulse" />
                )}
                <span>{tText(tier.ctaText)}</span>
                <ChevronRight className="h-3 w-3 ml-auto" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
