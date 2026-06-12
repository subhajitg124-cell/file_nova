import React, { useEffect, useRef } from "react";
import { useAdmin } from "@/lib/admin";
import { useLocation } from "wouter";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  type: string;
  extra?: any;
}

export function ThemeEffects() {
  const { settings } = useAdmin();
  const [location] = useLocation();
  const activeTheme = settings.eventTheme || "none";
  const isAdminPath = location.startsWith('/admin') || location.startsWith('/nova-control') || location.startsWith('/nova-login');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameId = useRef<number | null>(null);
  const particles = useRef<Particle[]>([]);
  const lastTheme = useRef<string>("none");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTheme === "none" || isAdminPath) {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
        frameId.current = null;
      }
      particles.current = [];
      // Clean canvas
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Re-initialize particles if theme changed
    if (activeTheme !== lastTheme.current) {
      particles.current = [];
      lastTheme.current = activeTheme;
    }

    const colors: Record<string, string[]> = {
      durgaPuja: ["#f59e0b", "#ea580c", "#e11d48", "#fffbeb", "#fef3c7"], // Marigold yellows & vermillion
      holi: ["#ec4899", "#f43f5e", "#06b6d4", "#a855f7", "#eab308"], // Vibrant gulal colors
      diwali: ["#fbbf24", "#f59e0b", "#d97706", "#a78bfa", "#f87171"], // Candles/purple sparkles
      poilaBaisakh: ["#dc2626", "#ea580c", "#fef3c7", "#ffffff"], // Terracotta & rice-paste white
      saraswatiPuja: ["#fef08a", "#facc15", "#eab308", "#ffffff", "#ca8a04"], // Yellows & sitar whites
      eid: ["#34d399", "#10b981", "#059669", "#fbbf24", "#fcd34d"], // Emerald green & moon gold
      christmas: ["#ffffff", "#f1f5f9", "#e11d48", "#ef4444", "#10b981"], // Snow, crimson & holly
      newYear: ["#fbbf24", "#f59e0b", "#f8fafc", "#e2e8f0", "#a1a1aa"], // Sparkle gold & silver
      scholarship: ["#3b82f6", "#1d4ed8", "#fbbf24", "#60a5fa", "#ffffff"], // Navy, blue, cap gold
      tricolor: ["#f97316", "#ffffff", "#22c55e", "#1e3a8a"], // Saffron, white, green, chakra blue
      rabindraJayanti: ["#b45309", "#d97706", "#fdf6e2", "#78350f"], // Terracotta terracotta brown & charcoal ink
      warm: ["#f43f5e", "#e11d48", "#fbbf24", "#f97316"], // Hot embers
      cool: ["#06b6d4", "#3b82f6", "#a855f7", "#0ea5e9"], // Neon matrix nodes
    };

    const activeColors = colors[activeTheme] || ["#ffffff"];

    const createParticle = (initY = false): Particle => {
      const size = Math.random() * 8 + (activeTheme === "scholarship" || activeTheme === "diwali" || activeTheme === "eid" ? 12 : 5);
      const isBengaliVowel = activeTheme === "rabindraJayanti" && Math.random() > 0.4;
      const isKashPhool = activeTheme === "durgaPuja" && Math.random() > 0.7;

      let type = "circle";
      if (activeTheme === "christmas") type = Math.random() > 0.7 ? "santaHat" : "snowflake";
      else if (activeTheme === "scholarship") type = Math.random() > 0.5 ? "gradCap" : "diploma";
      else if (activeTheme === "eid") type = Math.random() > 0.6 ? "crescent" : "star";
      else if (activeTheme === "diwali") type = Math.random() > 0.6 ? "diya" : "sparkle";
      else if (activeTheme === "durgaPuja") type = isKashPhool ? "kashPhool" : "petal";
      else if (activeTheme === "poilaBaisakh") type = Math.random() > 0.6 ? "alpana" : "petal";
      else if (activeTheme === "rabindraJayanti") type = isBengaliVowel ? "bengaliLetter" : "note";
      else if (activeTheme === "saraswatiPuja") type = Math.random() > 0.5 ? "note" : "petal";
      else if (activeTheme === "holi") type = "splash";
      else if (activeTheme === "tricolor") type = Math.random() > 0.7 ? "chakra" : "star";
      else if (activeTheme === "warm") type = "ember";
      else if (activeTheme === "cool") type = "cyberSquare";

      // Falling vs rising vs floating physics
      let vx = (Math.random() - 0.5) * 1.5;
      let vy = Math.random() * 1.5 + 0.5; // Default: falling down
      let y = initY ? Math.random() * canvas.height : -20;
      let x = Math.random() * canvas.width;

      if (activeTheme === "diwali" || activeTheme === "warm") {
        // Rising upwards
        vy = -(Math.random() * 1.2 + 0.4);
        y = initY ? Math.random() * canvas.height : canvas.height + 20;
      } else if (activeTheme === "holi") {
        // Wide drifting sweeps
        vx = (Math.random() - 0.5) * 3;
        vy = Math.random() * 1.2 + 0.8;
      } else if (activeTheme === "durgaPuja" && type === "kashPhool") {
        // Slow horizontal wind drift
        vx = Math.random() * 1.5 + 1.0;
        vy = Math.random() * 0.4 + 0.2;
        x = initY ? Math.random() * canvas.width : -50;
      }

      // Extra properties
      const extra: any = {};
      if (type === "bengaliLetter") {
        const letters = ["অ", "আ", "ই", "উ", "এ", "ক", "খ", "গ", "র", "ব", "স"];
        extra.char = letters[Math.floor(Math.random() * letters.length)];
      } else if (type === "note") {
        const notes = ["♩", "♪", "♫", "♬", "♭", "♮"];
        extra.char = notes[Math.floor(Math.random() * notes.length)];
      } else if (type === "alpana") {
        extra.motif = Math.floor(Math.random() * 3);
      } else if (type === "splash") {
        extra.scaleFactor = Math.random() * 0.6 + 0.4;
        extra.blobPoints = Array.from({ length: 8 }, () => Math.random() * 0.4 + 0.8);
      }

      return {
        x,
        y,
        vx,
        vy,
        size,
        color: activeColors[Math.floor(Math.random() * activeColors.length)],
        alpha: Math.random() * 0.5 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        type,
        extra,
      };
    };

    // Fill initial particles
    const maxParticles = activeTheme === "christmas" ? 60 : activeTheme === "newYear" ? 50 : activeTheme === "holi" ? 45 : 30;
    for (let i = 0; i < maxParticles; i++) {
      particles.current.push(createParticle(true));
    }

    const drawGradCap = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.fillStyle = "#0f172a";
      c.strokeStyle = p.color;
      c.lineWidth = 1.5;

      // Draw Diamond mortarboard
      c.beginPath();
      c.moveTo(0, -p.size / 2);
      c.lineTo(p.size, 0);
      c.lineTo(0, p.size / 2);
      c.lineTo(-p.size, 0);
      c.closePath();
      c.fill();
      c.stroke();

      // Cap cap skull wrapper
      c.beginPath();
      c.moveTo(-p.size / 2, 0);
      c.quadraticCurveTo(0, p.size / 2, p.size / 2, 0);
      c.lineTo(p.size / 2, p.size / 3);
      c.quadraticCurveTo(0, p.size * 0.7, -p.size / 2, p.size / 3);
      c.closePath();
      c.fillStyle = "#1e293b";
      c.fill();
      c.stroke();

      // Tassel
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-p.size * 0.8, p.size * 0.3);
      c.lineTo(-p.size * 0.85, p.size * 0.6);
      c.strokeStyle = "#fbbf24";
      c.lineWidth = 1;
      c.stroke();

      c.restore();
    };

    const drawDiploma = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);

      // Diploma scroll roll
      c.fillStyle = "#f8fafc";
      c.strokeStyle = "#cbd5e1";
      c.lineWidth = 1;
      c.beginPath();
      c.rect(-p.size, -p.size / 4, p.size * 2, p.size / 2);
      c.fill();
      c.stroke();

      // Red ribbon wrap
      c.fillStyle = "#ef4444";
      c.beginPath();
      c.rect(-p.size / 4, -p.size / 4 - 1, p.size / 2, p.size / 2 + 2);
      c.fill();

      // Ribbon ends
      c.beginPath();
      c.moveTo(0, p.size / 4);
      c.lineTo(-p.size / 3, p.size * 0.6);
      c.lineTo(0, p.size * 0.5);
      c.lineTo(p.size / 3, p.size * 0.6);
      c.closePath();
      c.fill();

      c.restore();
    };

    const drawCrescent = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.fillStyle = p.color;
      c.shadowColor = p.color;
      c.shadowBlur = 8;

      c.beginPath();
      c.arc(0, 0, p.size, -Math.PI / 2, Math.PI / 2, false);
      c.arc(p.size * 0.5, 0, p.size, Math.PI / 2, -Math.PI / 2, true);
      c.closePath();
      c.fill();
      c.restore();
    };

    const drawDiya = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      
      // Shadow glow
      c.shadowColor = "#f59e0b";
      c.shadowBlur = 10;

      // Diya Clay Cup base
      c.fillStyle = "#b45309";
      c.beginPath();
      c.arc(0, 0, p.size, 0, Math.PI, false);
      c.lineTo(-p.size, 0);
      c.closePath();
      c.fill();

      // Golden Rim highlight
      c.strokeStyle = "#d97706";
      c.lineWidth = 1.5;
      c.stroke();

      // Flame
      c.shadowColor = "#fbbf24";
      c.shadowBlur = 15;
      c.fillStyle = "#fbbf24";
      c.beginPath();
      // Draw tear shape flame
      c.moveTo(0, -p.size * 0.1);
      c.bezierCurveTo(-p.size * 0.4, -p.size * 0.5, -p.size * 0.2, -p.size * 1.3, 0, -p.size * 1.5);
      c.bezierCurveTo(p.size * 0.2, -p.size * 1.3, p.size * 0.4, -p.size * 0.5, 0, -p.size * 0.1);
      c.closePath();
      c.fill();

      // inner white-hot flame core
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.moveTo(0, -p.size * 0.2);
      c.bezierCurveTo(-p.size * 0.2, -p.size * 0.5, -p.size * 0.1, -p.size * 0.9, 0, -p.size * 1.1);
      c.bezierCurveTo(p.size * 0.1, -p.size * 0.9, p.size * 0.2, -p.size * 0.5, 0, -p.size * 0.2);
      c.closePath();
      c.fill();

      c.restore();
    };

    const drawSplash = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.fillStyle = p.color;

      c.beginPath();
      const points = p.extra?.blobPoints || [1, 1, 1, 1, 1, 1, 1, 1];
      const count = points.length;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = p.size * points[i] * (p.extra?.scaleFactor || 0.8);
        const rx = Math.cos(angle) * radius;
        const ry = Math.sin(angle) * radius;
        if (i === 0) c.moveTo(rx, ry);
        else c.lineTo(rx, ry);
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    const drawAlpana = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.strokeStyle = p.color;
      c.lineWidth = 1.5;

      const motif = p.extra?.motif || 0;
      if (motif === 0) {
        // Concentric loops
        c.beginPath();
        c.arc(0, 0, p.size, 0, Math.PI * 2);
        c.stroke();
        c.beginPath();
        c.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        c.stroke();
      } else if (motif === 1) {
        // Bengali floral petal loop
        c.beginPath();
        for (let i = 0; i < 6; i++) {
          c.rotate(Math.PI / 3);
          c.ellipse(p.size * 0.5, 0, p.size * 0.4, p.size * 0.15, 0, 0, Math.PI * 2);
        }
        c.stroke();
      } else {
        // Diamond mandala
        c.beginPath();
        c.rect(-p.size / 2, -p.size / 2, p.size, p.size);
        c.stroke();
        c.rotate(Math.PI / 4);
        c.beginPath();
        c.rect(-p.size / 2, -p.size / 2, p.size, p.size);
        c.stroke();
      }
      c.restore();
    };

    const drawChakra = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.strokeStyle = "#1e3a8a"; // Navy ashok chakra blue
      c.lineWidth = 1;

      // Outer wheel
      c.beginPath();
      c.arc(0, 0, p.size, 0, Math.PI * 2);
      c.stroke();

      // Inner hub
      c.beginPath();
      c.arc(0, 0, p.size * 0.15, 0, Math.PI * 2);
      c.fillStyle = "#1e3a8a";
      c.fill();

      // Spokes
      for (let i = 0; i < 24; i++) {
        c.rotate(Math.PI / 12);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, p.size);
        c.stroke();
      }
      c.restore();
    };

    const drawKashPhool = (c: CanvasRenderingContext2D, p: Particle) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation + Math.sin(p.y * 0.01) * 0.2); // sway wave
      c.strokeStyle = "rgba(255, 255, 255, 0.4)";
      c.lineWidth = 1;

      // Draw stem
      c.beginPath();
      c.moveTo(0, p.size * 1.5);
      c.quadraticCurveTo(-p.size * 0.3, p.size * 0.5, 0, -p.size);
      c.strokeStyle = "rgba(254, 243, 199, 0.2)";
      c.stroke();

      // Draw soft feathers
      c.beginPath();
      c.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let i = 0; i < 6; i++) {
        const offset = (i - 3) * (p.size * 0.3);
        c.ellipse(offset * 0.2, -p.size * 0.3 + offset, p.size * 0.3, p.size * 0.1, Math.PI / 4, 0, Math.PI * 2);
        c.ellipse(-offset * 0.2, -p.size * 0.4 + offset, p.size * 0.35, p.size * 0.1, -Math.PI / 4, 0, Math.PI * 2);
      }
      c.fill();

      c.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p, idx) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Oscillate horizontal positions slightly
        if (p.type === "snowflake" || p.type === "petal") {
          p.x += Math.sin(p.y * 0.01 + p.rotation) * 0.3;
        }

        // Draw particle based on type
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = p.alpha;

        if (p.type === "snowflake") {
          // Soft snowflake circles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "santaHat") {
          // Draw a mini Santa hat
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          // Red triangle
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.moveTo(-p.size / 2, p.size / 4);
          ctx.lineTo(p.size / 2, p.size / 4);
          ctx.lineTo(0, -p.size / 2);
          ctx.closePath();
          ctx.fill();
          // White band
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.rect(-p.size / 2 - 2, p.size / 4 - 1, p.size + 4, p.size / 4);
          ctx.fill();
          // Pom pom
          ctx.beginPath();
          ctx.arc(0, -p.size / 2, p.size / 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === "gradCap") {
          drawGradCap(ctx, p);
        } else if (p.type === "diploma") {
          drawDiploma(ctx, p);
        } else if (p.type === "crescent") {
          drawCrescent(ctx, p);
        } else if (p.type === "diya") {
          drawDiya(ctx, p);
        } else if (p.type === "alpana") {
          drawAlpana(ctx, p);
        } else if (p.type === "splash") {
          drawSplash(ctx, p);
        } else if (p.type === "chakra") {
          drawChakra(ctx, p);
        } else if (p.type === "kashPhool") {
          drawKashPhool(ctx, p);
        } else if (p.type === "bengaliLetter" || p.type === "note") {
          ctx.font = `black ${p.size * 1.4}px Outfit, sans-serif`;
          ctx.fillText(p.extra?.char || "♩", p.x, p.y);
        } else if (p.type === "ember") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.random() * 2 + 1, 0, Math.PI * 2);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.fill();
        } else if (p.type === "cyberSquare") {
          ctx.fillRect(p.x, p.y, p.size / 2, p.size / 2);
        } else if (p.type === "star") {
          // Draw standard 5-point star
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * p.size);
            ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (p.size * 0.4), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (p.size * 0.4));
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (p.type === "sparkle") {
          // Draw 4-point sparkle star
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(0, 0, p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, p.size);
          ctx.quadraticCurveTo(0, 0, -p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          // Default: falling petal / circle
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size / 2, p.size / 4, p.rotation, 0, Math.PI * 2);
          ctx.fill();
        }

        // Reset particle on boundaries
        let offBoundaries = false;
        if (activeTheme === "diwali" || activeTheme === "warm") {
          // Rising up
          if (p.y < -20) offBoundaries = true;
        } else if (activeTheme === "durgaPuja" && p.type === "kashPhool") {
          // Drifting right
          if (p.x > canvas.width + 50 || p.y > canvas.height + 20) offBoundaries = true;
        } else {
          // Falling down
          if (p.y > canvas.height + 20) offBoundaries = true;
        }

        if (offBoundaries) {
          particles.current[idx] = createParticle(false);
        }
      });

      ctx.globalAlpha = 1.0;
      frameId.current = requestAnimationFrame(render);
    };

    // Watch tab activity to freeze canvas and save cycles when inactive
    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        if (!frameId.current) {
          frameId.current = requestAnimationFrame(render);
        }
      } else {
        if (frameId.current) {
          cancelAnimationFrame(frameId.current);
          frameId.current = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial frame kickoff
    frameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [activeTheme, isAdminPath]);

  if (activeTheme === "none" || isAdminPath) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 opacity-35 mix-blend-screen"
      style={{ pointerEvents: "none" }}
    />
  );
}
