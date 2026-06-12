export type EventTheme = {
  /** CSS variable overrides applied to :root while this event is active */
  cssVars?: Record<string, string>;
  /** Tailwind-friendly accent class for buttons/highlights during the event */
  accentClass?: string;
};

export type AnimationType = "lottie" | "gif" | "video" | "css-confetti" | "css-diya" | "css-lotus" | "none";

export interface SiteEvent {
  id: string;                        // unique key, e.g. "diwali-2026"
  label: string;                     // internal name for your reference
  active: boolean;                   // ← TOGGLE THIS to turn the event on/off
  startDate?: string;                // ISO date — auto-activates on this date
  endDate?: string;                  // ISO date — auto-deactivates after this date

  notice: {
    enabled: boolean;
    message: string;                 // supports {countdown} token
    ctaLabel?: string;
    ctaRoute?: string;                // wouter route, e.g. "/scholarship-zip"
    dismissible: boolean;
    icon?: string;                    // emoji or icon name, e.g. "🪔"
    showCountdownTo?: string;         // ISO date — renders live countdown if set
  };

  theme?: EventTheme;

  banner: {
    enabled: boolean;
    type: AnimationType;
    src?: string;                     // path under src/assets/events/...
    placement: "hero" | "corner-decoration" | "background-overlay";
    altText: string;                  // REQUIRED for accessibility
    reducedMotionFallback?: string;   // static image shown if user prefers-reduced-motion
  };
}

// ─── EVENTS CATALOG ───────────────────────────────────────────────────────────
// Add new events here. Only ONE should have `active: true` at a time
// (or use startDate/endDate for auto-scheduling — see EventProvider logic).

export const SITE_EVENTS: SiteEvent[] = [
  {
    id: "diwali-2026",
    label: "Diwali 2026",
    active: false,
    startDate: "2026-10-15",
    endDate: "2026-11-05",
    notice: {
      enabled: true,
      message: "🪔 Happy Diwali! Compress your festival photos & documents for free.",
      ctaLabel: "Try Compress Tool",
      ctaRoute: "/compress-pdf",
      dismissible: true,
      icon: "🪔",
    },
    theme: {
      cssVars: {
        "--event-primary": "#D97706",   // warm amber/gold
        "--event-secondary": "#7C2D12", // deep maroon
        "--event-glow": "rgba(217, 119, 6, 0.25)",
      },
      accentClass: "from-amber-500 to-orange-600",
    },
    banner: {
      enabled: true,
      type: "css-diya",                 // pure CSS animation, no asset needed
      placement: "corner-decoration",
      altText: "Animated diya lamp decoration for Diwali",
    },
  },

  {
    id: "independence-day-2026",
    label: "Independence Day 2026",
    active: false,
    startDate: "2026-08-10",
    endDate: "2026-08-17",
    notice: {
      enabled: true,
      message: "🇮🇳 Happy Independence Day! FileNova proudly serves Indian students & CSC operators.",
      dismissible: true,
      icon: "🇮🇳",
    },
    theme: {
      cssVars: {
        "--event-primary": "#FF9933",
        "--event-secondary": "#138808",
        "--event-glow": "rgba(255, 153, 51, 0.2)",
      },
      accentClass: "from-orange-500 via-white to-green-600",
    },
    banner: {
      enabled: true,
      type: "lottie",
      src: "/assets/events/independence-day/flag-wave.lottie.json",
      placement: "hero",
      altText: "Waving Indian tricolor flag animation",
      reducedMotionFallback: "/assets/events/independence-day/flag-static.svg",
    },
  },

  {
    id: "durga-puja-2026",
    label: "Durga Puja 2026",
    active: false,
    startDate: "2026-10-10",
    endDate: "2026-10-22",
    notice: {
      enabled: true,
      message: "🌸 Happy Durga Puja! FileNova wishes you a wonderful festive season.",
      dismissible: true,
      icon: "🌸",
    },
    theme: {
      cssVars: {
        "--event-primary": "#DC2626",   // bright festive red
        "--event-secondary": "#F59E0B", // festive yellow/amber
        "--event-glow": "rgba(220, 38, 38, 0.2)",
      },
      accentClass: "from-red-600 to-amber-500",
    },
    banner: {
      enabled: true,
      type: "css-lotus",
      placement: "corner-decoration",
      altText: "Animated lotus flower decoration for Durga Puja",
    },
  },

  {
    id: "scholarship-deadline-wb-2026",
    label: "OASIS WB Scholarship Deadline Reminder",
    active: true,                       // ← currently active example
    notice: {
      enabled: true,
      message: "⏰ OASIS West Bengal scholarship portal closes in {countdown}. Prepare your ZIP now!",
      ctaLabel: "Open Scholarship ZIP Maker",
      ctaRoute: "/scholarship-zip",
      dismissible: true,
      icon: "⏰",
      showCountdownTo: "2026-07-31T23:59:59+05:30",
    },
    banner: {
      enabled: false,
      type: "none",
      placement: "hero",
      altText: "",
    },
  },

  {
    id: "new-tool-launch-aadhaar",
    label: "Aadhaar Mask Tool Launch Promo",
    active: false,
    notice: {
      enabled: true,
      message: "✨ New: Aadhaar Mask tool is live! Mask your Aadhaar number safely, 100% in your browser.",
      ctaLabel: "Try it now",
      ctaRoute: "/aadhaar-mask-pdf",
      dismissible: true,
      icon: "✨",
    },
    banner: {
      enabled: false,
      type: "none",
      placement: "hero",
      altText: "",
    },
  },
];

/**
 * Returns the currently active event, if any.
 * Priority: explicit `active: true` flag > date-range auto-activation.
 * If multiple match, the first in the array wins — order by priority.
 */
export function getActiveEvent(now: Date = new Date()): SiteEvent | null {
  // 1. Explicit override takes priority
  const explicit = SITE_EVENTS.find((e) => e.active);
  if (explicit) return explicit;

  // 2. Date-range auto-activation
  const byDate = SITE_EVENTS.find((e) => {
    if (!e.startDate || !e.endDate) return false;
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    return now >= start && now <= end;
  });

  return byDate ?? null;
}
