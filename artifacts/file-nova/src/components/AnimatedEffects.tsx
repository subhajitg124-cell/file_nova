import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Floating Particles Background for a starry night / modern neon workspace aesthetic
export const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 2,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * -10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-indigo-500/15"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -45, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Success Animation checkmark
interface SuccessAnimationProps {
  show: boolean;
  onClose?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ show, onClose }) => {
  React.useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-[200] bg-background/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.7, rotate: 25 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center shadow-premium"
          >
            <div className="relative h-20 w-20 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              <motion.svg
                className="w-10 h-10 text-emerald-400"
                viewBox="0 0 52 52"
                fill="none"
              >
                <circle
                  cx="26"
                  cy="26"
                  r="25"
                  className="stroke-emerald-500/30"
                  strokeWidth="2"
                />
                <motion.path
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l8 8 16-16"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                />
              </motion.svg>
            </div>
            <h3 className="text-foreground font-extrabold text-base mb-1">Process Completed!</h3>
            <p className="text-xs text-muted-foreground">File is processed and ready to save.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Shimmering Loading Skeleton
export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 w-full">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="h-16 bg-muted border border-border rounded-2xl w-full relative overflow-hidden"
          animate={{
            opacity: [0.4, 0.85, 0.4],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </motion.div>
      ))}
    </div>
  );
};

// Confetti Celebration Effect
interface ConfettiProps {
  show: boolean;
}

export const Confetti: React.FC<ConfettiProps> = ({ show }) => {
  if (!show) return null;

  const colors = ["#818cf8", "#a78bfa", "#f472b6", "#fb7185", "#38bdf8", "#34d399"];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage of viewport width
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.6,
    duration: Math.random() * 2.5 + 2,
    angle: Math.random() * 360,
    size: Math.random() * 6 + 6,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[250] overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            left: `${piece.x}vw`,
            backgroundColor: piece.color,
            width: piece.size,
            height: piece.size * 0.6,
          }}
          initial={{ y: -50, rotate: piece.angle }}
          animate={{
            y: "110vh",
            rotate: piece.angle + 720,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Global mouse-spotlight glow backdrop
export const CursorGlow: React.FC = () => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 hidden md:block"
      style={{
        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`,
      }}
    />
  );
};
