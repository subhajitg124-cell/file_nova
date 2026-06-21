import { useState } from "react";
import { useActiveEvent } from "./EventProvider";

const REACTIONS: Record<string, { emoji: string; label: string }> = {
  "diwali-2026": { emoji: "🪔", label: "Send Diwali wishes" },
  "independence-day-2026": { emoji: "🇮🇳", label: "Jai Hind" },
  "durga-puja-2026": { emoji: "🌸", label: "Happy Durga Puja!" },
  "new-tool-launch-aadhaar": { emoji: "✨", label: "Awesome!" },
};

export function ReactableGreeting() {
  const { activeEvent } = useActiveEvent();
  const [burst, setBurst] = useState(false);
  const [count, setCount] = useState(0);

  const reaction = activeEvent ? REACTIONS[activeEvent.id] : null;
  if (!reaction) return null;

  const handleClick = () => {
    setCount((c) => c + 1);
    setBurst(true);
    // Debounce/reset burst state after animation completes
    const timer = setTimeout(() => setBurst(false), 600);
    return () => clearTimeout(timer);
  };

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                 bg-white/10 hover:bg-white/20 border border-white/20 dark:border-white/10
                 text-foreground transition-all duration-200 active:scale-95 cursor-pointer text-xs font-semibold"
      style={{
        background: "var(--event-primary) ? `rgba(from var(--event-primary) r g b / 0.1)` : undefined"
      }}
    >
      <span className={`text-sm transition-transform duration-200 ${burst ? "scale-150" : "scale-100"}`}>
        {reaction.emoji}
      </span>
      <span className="text-[11px] font-bold">{reaction.label}</span>
      {count > 0 && (
        <span className="text-[10px] text-muted-foreground ml-0.5">+{count}</span>
      )}

      {/* Burst particles on click */}
      {burst && (
        <span className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-base"
              style={{
                left: "50%",
                top: "50%",
                // @ts-ignore
                "--r": `${i * 60}deg`,
                animation: "burst-out 0.6s ease-out forwards",
              }}
            >
              {reaction.emoji}
            </span>
          ))}
          <style>{`
            @keyframes burst-out {
              0% { 
                opacity: 1; 
                transform: translate(-50%, -50%) rotate(var(--r)) translateY(-10px) scale(0.5); 
              }
              100% { 
                opacity: 0; 
                transform: translate(-50%, -50%) rotate(var(--r)) translateY(-45px) scale(1.3); 
              }
            }
          `}</style>
        </span>
      )}
    </button>
  );
}
