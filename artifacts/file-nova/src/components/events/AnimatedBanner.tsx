import { useActiveEvent } from "./EventProvider";
import { useEffect, useState } from "react";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

interface AnimatedBannerProps {
  /** Only render banners matching this placement on the current page */
  placement: "hero" | "corner-decoration" | "background-overlay";
}

export function AnimatedBanner({ placement }: AnimatedBannerProps) {
  const { activeEvent } = useActiveEvent();
  const reducedMotion = usePrefersReducedMotion();
  const [lottieData, setLottieData] = useState<object | null>(null);
  const [Lottie, setLottie] = useState<any>(null);

  useEffect(() => {
    import("lottie-react").then(m => setLottie(() => m.default));
  }, []);

  const banner = activeEvent?.banner;
  const shouldRender = banner?.enabled && banner.placement === placement;

  useEffect(() => {
    if (!shouldRender || banner?.type !== "lottie" || !banner.src) {
      setLottieData(null);
      return;
    }
    fetch(banner.src)
      .then((r) => r.json())
      .then(setLottieData)
      .catch(() => setLottieData(null));
  }, [shouldRender, banner]);

  if (!shouldRender || !banner) return null;

  // Reduced motion: show static fallback image if provided
  if (reducedMotion && banner.reducedMotionFallback) {
    return (
      <img
        src={banner.reducedMotionFallback}
        alt={banner.altText}
        className="pointer-events-none select-none max-w-full h-auto mx-auto"
      />
    );
  }
  // Reduced motion, no fallback: render nothing rather than force animation
  if (reducedMotion) return null;

  switch (banner.type) {
    case "lottie":
      if (!lottieData) return null;
      return (
        <div role="img" aria-label={banner.altText} className="pointer-events-none w-full max-w-md mx-auto">
          {Lottie ? <Lottie animationData={lottieData} loop autoplay /> : <div className="w-full h-48 bg-muted/20 animate-pulse rounded-lg" />}
        </div>
      );

    case "gif":
      return (
        <img
          src={banner.src}
          alt={banner.altText}
          loading="lazy"
          className="pointer-events-none select-none max-w-full h-auto mx-auto"
        />
      );

    case "video":
      return (
        <video
          src={banner.src}
          autoPlay
          loop
          muted
          playsInline
          aria-label={banner.altText}
          className="pointer-events-none w-full h-full object-cover"
        />
      );

    case "css-diya":
      return <CSSDiyaAnimation />;

    case "css-lotus":
      return <CSSLotusAnimation />;

    case "css-confetti":
      return <CSSConfetti />;

    default:
      return null;
  }
}

// ─── Pure-CSS animations (no asset files needed) ──────────────────────────────

function CSSDiyaAnimation() {
  return (
    <div
      className="fixed bottom-4 right-4 z-40 pointer-events-none select-none"
      role="img"
      aria-label="Animated diya lamp"
    >
      <style>{`
        @keyframes diya-flame {
          0%, 100% { transform: scale(1) rotate(-2deg); opacity: 0.9; }
          50% { transform: scale(1.15) rotate(2deg); opacity: 1; }
        }
        .diya-flame {
          animation: diya-flame 1.2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(251, 146, 60, 0.8));
        }
      `}</style>
      <div className="text-5xl diya-flame">🪔</div>
    </div>
  );
}

function CSSLotusAnimation() {
  return (
    <div
      className="fixed bottom-4 right-4 z-40 pointer-events-none select-none"
      role="img"
      aria-label="Animated lotus flower"
    >
      <style>{`
        @keyframes lotus-glow {
          0%, 100% { transform: scale(1); opacity: 0.9; filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.6)); }
          50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.9)); }
        }
        .lotus-glow {
          animation: lotus-glow 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="text-5xl lotus-glow">🌸</div>
    </div>
  );
}

function CSSConfetti() {
  const pieces = Array.from({ length: 30 });
  const colors = ["#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#8B5CF6"];

  return (
    <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: "-10px",
            width: "8px",
            height: "8px",
            backgroundColor: colors[i % colors.length],
            animation: `confetti-fall ${4 + Math.random() * 3}s linear ${Math.random() * 5}s infinite`,
            borderRadius: i % 2 === 0 ? "50%" : "0%",
          }}
        />
      ))}
    </div>
  );
}
