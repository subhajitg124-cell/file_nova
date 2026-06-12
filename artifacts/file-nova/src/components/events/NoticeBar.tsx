import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "wouter";
import { useActiveEvent } from "./EventProvider";

function useCountdown(target?: string): string | null {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!target) {
      setRemaining(null);
      return;
    }
    const targetDate = new Date(target).getTime();

    const update = () => {
      const diff = targetDate - Date.now();
      if (diff <= 0) {
        setRemaining("now closed");
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      if (days > 0) {
        setRemaining(`${days}d ${hours}h`);
      } else {
        const mins = Math.floor((diff % 3_600_000) / 60_000);
        setRemaining(`${hours}h ${mins}m`);
      }
    };

    update();
    const interval = setInterval(update, 60_000); // update every minute
    return () => clearInterval(interval);
  }, [target]);

  return remaining;
}

export function NoticeBar() {
  const { activeEvent, isDismissed, dismiss } = useActiveEvent();
  const countdown = useCountdown(activeEvent?.notice.showCountdownTo);

  if (!activeEvent?.notice.enabled || isDismissed) return null;

  const { message, ctaLabel, ctaRoute, dismissible, icon } = activeEvent.notice;
  const finalMessage = countdown
    ? message.replace("{countdown}", countdown)
    : message.replace(/\s*\{countdown\}/, "");

  return (
    <div
      className="relative flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium text-white
                 bg-gradient-to-r from-indigo-600 to-purple-600
                 animate-in slide-in-from-top duration-300 z-50"
      style={{
        background: activeEvent.theme?.cssVars?.["--event-primary"]
          ? `linear-gradient(to right, var(--event-primary), var(--event-secondary, var(--event-primary)))`
          : undefined,
      }}
      role="status"
    >
      {icon && <span className="text-base" aria-hidden="true">{icon}</span>}
      <span className="text-center">{finalMessage}</span>

      {ctaLabel && ctaRoute && (
        <Link
          href={ctaRoute}
          className="ml-1 underline font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          {ctaLabel} →
        </Link>
      )}

      {dismissible && (
        <button
          onClick={dismiss}
          aria-label="Dismiss notice"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                     hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
