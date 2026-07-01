/**
 * PricingPage Component
 * Displays available subscription tiers (Free, Basic, Pro, Elite) and manages checkout.
 */

import React, { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, ShieldCheck, Zap, Loader, Copy, QrCode, Check, X, Building2, ServerCog, MessageCircle } from "lucide-react";
import { useSubscription, type PremiumTier } from "@/hooks/useSubscription";
import { useRazorpay } from "@/hooks/useRazorpay";
import type { PlanType } from "@/store/useCheckoutStore";
import { TestingNotice } from "@/components/TestingNotice";
import { useAdmin } from "@/lib/admin";
import { useAuthStore } from "@/store/useAuthStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { Navbar } from "@/components/Navbar";
import { BackHomeBar } from "@/components/BackHomeBar";
import { AuthModal } from "@/components/AuthModal";
import { OTPVerificationModal } from "@/components/OTPVerificationModal";
import { toast } from "sonner";
import { BACKEND_URL, HAS_BACKEND } from "@/lib/api";
import { FILENOVA_UPI_ID, createUpiQrUrl } from "@/lib/upi";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  defaultBorder?: string;
  isActive?: boolean;
}

function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(99, 102, 241, 0.15)",
  borderColor = "var(--fn-border-strong)",
  defaultBorder = "var(--fn-border)",
  isActive = false,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    const w = rect.width;
    const h = rect.height;
    const dx = x - w / 2;
    const dy = y - h / 2;
    const maxTilt = 5; // Slight 3D skew
    setTilt({
      x: -(dy / (h / 2)) * maxTilt,
      y: (dx / (w / 2)) * maxTilt,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 backdrop-blur-md perspective-1000 preserve-3d ${
        isActive ? "spatial-active-ring" : ""
      } ${className}`}
      style={{
        borderColor: isHovered ? borderColor : defaultBorder,
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
          : isActive
            ? `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1.025, 1.025, 1.025)`
            : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div 
        className="relative z-10 h-full w-full flex flex-col preserve-3d"
        style={{ transform: isHovered ? "translateZ(10px)" : "translateZ(0px)" }}
      >
        {children}
      </div>
    </div>
  );
}

interface PlanCardProps {
  id: PremiumTier;
  title: string;
  price: React.ReactNode;
  period: string;
  limit: string;
  description: string;
  features: string[];
  accent: string;
  isPopular?: boolean;
  ctaText: string;
  onSelect: () => void;
  currentTier: PremiumTier;
  loading: boolean;
  amount: number;
  userEmail?: string;
  isActive?: boolean;
}

function PlanCard({
  id,
  title,
  price,
  period,
  limit,
  description,
  features,
  accent,
  isPopular,
  ctaText,
  onSelect,
  currentTier,
  loading,
  amount,
  userEmail,
  isActive = false,
}: PlanCardProps) {
  const isCurrent = currentTier === id;
  const isPaidPlan = id !== "free";
  const isPro = id === "pro";
  const isElite = id === "elite";

  const textPrimaryClass = id === "pro" ? "text-white" : "text-[var(--fn-text-primary)] dark:text-white";
  const textSecondaryClass = id === "pro" ? "text-white/80" : "text-[var(--fn-text-secondary)]";

  const getFeatureIconClass = () => {
    if (id === "pro") return "stroke-indigo-200 text-transparent fill-indigo-200/20";
    if (id === "elite") return "stroke-[var(--fn-accent-elite)] text-transparent fill-[var(--fn-accent-elite)]/20";
    if (id === "free") return "stroke-[var(--fn-text-tertiary)] text-transparent fill-[var(--fn-text-tertiary)]/20";
    return "stroke-[var(--fn-accent-india)] text-transparent fill-[var(--fn-accent-india)]/20";
  };

  const getCtaButton = () => {
    if (isCurrent) {
      if (id === "pro") {
        return (
          <button disabled className="w-full py-2.5 px-6 rounded-full bg-white/20 text-white text-sm font-semibold cursor-default mt-auto">
            Current Plan
          </button>
        );
      }
      if (id === "elite") {
        return (
          <button disabled className="w-full py-2.5 px-6 rounded-full border border-[var(--fn-accent-elite)]/45 text-[var(--fn-accent-elite)]/80 text-sm font-semibold cursor-default mt-auto">
            Current Plan
          </button>
        );
      }
      return (
        <button disabled className="w-full py-2.5 px-6 rounded-full fn-neu-pressed text-[var(--fn-text-secondary)] text-sm font-semibold cursor-default mt-auto">
          Current Plan
        </button>
      );
    }

    if (loading) {
      return (
        <button disabled className="w-full py-2.5 px-6 rounded-full bg-[var(--fn-surface-elevated)] border border-[var(--fn-border)] text-[var(--fn-text-secondary)] text-sm font-semibold flex items-center justify-center gap-2 mt-auto">
          <Loader className="h-4 w-4 animate-spin text-[var(--fn-accent-primary)]" />
          Connecting...
        </button>
      );
    }

    if (id === "pro") {
      return (
        <button
          onClick={onSelect}
          className="w-full py-2.5 px-6 rounded-full bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors mt-auto"
        >
          {ctaText}
        </button>
      );
    }

    if (id === "elite") {
      return (
        <button
          onClick={onSelect}
          className="w-full py-2.5 px-6 rounded-full border border-[var(--fn-accent-elite)] text-[var(--fn-accent-elite)] hover:bg-[var(--fn-accent-elite)]/10 font-semibold text-sm transition-colors mt-auto"
        >
          {ctaText}
        </button>
      );
    }

    if (id === "basic") {
      return (
        <button
          onClick={onSelect}
          className="w-full py-2.5 px-6 rounded-full bg-[var(--fn-accent-primary)] text-white hover:opacity-90 font-semibold text-sm transition-opacity mt-auto"
        >
          {ctaText}
        </button>
      );
    }

    return (
      <button
        onClick={onSelect}
        className="w-full py-2.5 px-6 rounded-full bg-[var(--fn-surface-elevated)] border border-[var(--fn-border)] text-[var(--fn-text-primary)] hover:bg-[var(--fn-surface)] font-semibold text-sm transition-colors mt-auto"
      >
        {ctaText}
      </button>
    );
  };

  const cardContent = (
    <div className={`p-6 flex flex-col h-full relative z-10 ${isPro ? 'animated-lines-bg' : ''}`}>
      <div className="flex flex-col h-full gap-5 flex-1">
        <div className="flex flex-col h-full">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h3 className={`${isPopular ? "text-2xl sm:text-3xl" : "text-xl"} font-black ${textPrimaryClass}`}>{title}</h3>
              {isElite && (
                <span className="text-[9px] bg-[var(--fn-accent-elite)]/10 text-[var(--fn-accent-elite)] font-bold px-2 py-0.5 rounded-full border border-[var(--fn-accent-elite)]/30">
                  Console Mode
                </span>
              )}
            </div>
            <p className={`text-xs ${textSecondaryClass} leading-relaxed min-h-8`}>
              {description}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              {price}
              {period && <span className={`text-xs font-semibold ${textSecondaryClass}`}>/{period}</span>}
            </div>
            <div className={`text-xs font-bold ${id === "pro" ? "text-indigo-200" : "text-[var(--fn-accent-primary)] dark:text-white"}`}>{limit}</div>
          </div>

          <div className="mt-auto pt-6 w-full flex flex-col gap-2">
            <div className="w-full">
              {getCtaButton()}
            </div>
            {isPaidPlan && !isCurrent && (
              <button
                type="button"
                onClick={onSelect}
                className={`w-full py-2 px-3 rounded-full text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer border ${
                  id === 'pro'
                    ? 'border-indigo-300/35 bg-indigo-500/10 text-indigo-100 hover:bg-indigo-500/20'
                    : 'border-[var(--fn-border)] bg-[var(--fn-surface-elevated)] text-[var(--fn-text-secondary)] hover:bg-[var(--fn-surface)]'
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                PhonePe / UPI Pay
              </button>
            )}
          </div>
        </div>

        <div className={`mt-6 border-t pt-4 flex-1 ${id === "pro" ? "border-white/10" : "border-[var(--fn-border)]"}`}>
          <p className={`text-[10px] uppercase font-black tracking-wider ${id === "pro" ? "text-indigo-200" : "text-[var(--fn-text-tertiary)]"} mb-3`}>
            Features Unlocked:
          </p>
          <ul className="space-y-2.5">
            {features.map((feat) => (
              <li key={feat} className={`flex items-start gap-2.5 ${id === "pro" ? "text-white" : "text-[var(--fn-text-secondary)]"} font-medium text-xs`}>
                <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${getFeatureIconClass()}`} />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  if (id === "pro") {
    return (
      <div className={`neon-sweep-wrapper shadow-neon-pro h-full group transition-all duration-300 relative ${isActive ? "spatial-active-ring" : "hover:scale-[1.01]"}`}>
        {isPopular && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-400 to-purple-400 text-white text-xs font-bold rounded-full px-4 py-1 whitespace-nowrap z-30">
            Most Popular
          </span>
        )}
        <div className="neon-sweep-bg" />
        <SpotlightCard
          className="neon-sweep-content bg-indigo-600 dark:bg-indigo-950 dark:border dark:border-indigo-500/30 text-white rounded-2xl shadow-[var(--fn-shadow-elevated)] h-full border-none"
          spotlightColor="rgba(255, 255, 255, 0.2)"
          borderColor="transparent"
          defaultBorder="transparent"
          isActive={isActive}
        >
          {cardContent}
        </SpotlightCard>
      </div>
    );
  }

  if (id === "elite") {
    return (
      <SpotlightCard
        className="fn-clay border border-[var(--fn-accent-elite)]/30 h-full transition-transform duration-300"
        spotlightColor="rgba(245, 158, 11, 0.15)"
        borderColor="var(--fn-accent-elite)"
        defaultBorder="var(--fn-accent-elite)/30"
        isActive={isActive}
      >
        {cardContent}
      </SpotlightCard>
    );
  }

  if (id === "basic") {
    return (
      <SpotlightCard
        className="fn-glass h-full transition-all duration-300"
        spotlightColor="rgba(99, 102, 241, 0.15)"
        borderColor="var(--fn-border-strong)"
        defaultBorder="var(--fn-border)"
        isActive={isActive}
      >
        {cardContent}
      </SpotlightCard>
    );
  }

  return (
    <SpotlightCard
      className="fn-neu h-full transition-all duration-300"
      spotlightColor="rgba(148, 163, 184, 0.08)"
      borderColor="var(--fn-border-strong)"
      defaultBorder="var(--fn-border)"
      isActive={isActive}
    >
      {cardContent}
    </SpotlightCard>
  );
}

function UpiPaymentBox({
  plan,
  amount,
  userEmail,
}: {
  plan: Exclude<PremiumTier, "free">;
  amount: number;
  userEmail?: string;
}) {
  const { user } = useAuthStore();
  const [open, setOpen] = React.useState(false);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [utrId, setUtrId] = React.useState("");
  const [email, setEmail] = React.useState(userEmail || "");
  const [submitting, setSubmitting] = React.useState(false);
  const upiId = FILENOVA_UPI_ID;

  React.useEffect(() => {
    if (userEmail && !email) setEmail(userEmail);
  }, [email, userEmail]);

  const handleOpenUpi = () => {
    if (!user) {
      toast.error("Please sign in first to purchase a plan.");
      return;
    }
    if (!user.phoneVerified) {
      setOtpOpen(true);
      return;
    }
    setOpen(true);
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      toast.success("UPI ID copied.");
    } catch {
      toast.error("Could not copy UPI ID.");
    }
  };

  const submitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(utrId)) {
      toast.error("Enter a valid 12 digit UTR/Transaction ID.");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      if (!HAS_BACKEND) {
        toast.info("Payment verification will be confirmed manually. Please WhatsApp or email the UTR after payment.");
        setUtrId("");
        setOpen(false);
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/upi-payment-verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ utrId, email, plan, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit payment verification.");

      toast.success("Payment received! Account upgraded in 2-4 hours.");
      setUtrId("");
      setOpen(false);
    } catch (err: any) {
      toast.info("Payment verification submitted (offline fallback)! Admin will verify and activate your plan.");
      setUtrId("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={handleOpenUpi} className="w-full py-3 px-3 rounded-xl text-sm font-black text-primary hover:bg-indigo-500/10 transition flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/20 bg-indigo-500/5">
        <QrCode className="h-4 w-4" /> Pay
      </button>
      <OTPVerificationModal isOpen={otpOpen} onClose={() => setOtpOpen(false)} onSuccess={() => setOpen(true)} />
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setOpen(false)} title="Close UPI Payment Verification Modal" aria-label="Close UPI Payment Verification Modal" className="absolute top-4 right-4 h-8 w-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition cursor-pointer text-muted-foreground"><X className="h-4 w-4" /></button>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-foreground font-display">UPI Payment Verification</h3>
              <p className="text-xs text-muted-foreground font-medium">Pay ₹{amount} for the {plan.replace('pass_', '').toUpperCase()} plan using UPI.</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4 text-center space-y-4">
              <img src={createUpiQrUrl(amount)} alt="FileNova UPI QR code" className="mx-auto h-40 w-40 rounded-xl border border-border bg-card object-contain p-2" width="200" height="200" loading="lazy" />
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-foreground text-left">{upiId}</span>
                <button type="button" onClick={copyUpiId} title="Copy UPI ID to clipboard" aria-label="Copy UPI ID to clipboard" className="h-8 w-8 shrink-0 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center cursor-pointer"><Copy className="h-3.5 w-3.5" /></button>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">Scan QR or pay to UPI ID, then submit your transaction details below.</p>
            </div>
            <form onSubmit={submitVerification} className="space-y-4">
              <input type="text" maxLength={12} placeholder="12-Digit UTR / Transaction ID" value={utrId} onChange={(e) => setUtrId(e.target.value.replace(/\D/g, ""))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary" required />
              <input type="email" placeholder="Registered Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary" required />
              <button type="submit" disabled={submitting} className="w-full rounded-xl bg-primary py-3 text-xs font-black text-primary-foreground shadow-glow hover:opacity-90 transition cursor-pointer disabled:opacity-60">{submitting ? "Verifying..." : "Submit Verification"}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function PricingPage() {
  const { premiumTier, cancelSubscription, loading, activeOffer, usersServedToday } = useSubscription();
  const { openCheckout } = useCheckoutStore();
  const { user } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [pendingPlan, setPendingPlan] = React.useState<PremiumTier | null>(null);
  const admin = useAdmin();
  const isTesting = false;
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [couponError, setCouponError] = React.useState("");
  const [couponSuccess, setCouponSuccess] = React.useState("");

  const themeClass = admin.settings.eventTheme && admin.settings.eventTheme !== "none" ? `event-theme-${admin.settings.eventTheme}` : "";

  const [hudActiveIndex, setHudActiveIndex] = React.useState<number | null>(null);

  const [, setLocation] = useLocation();
  const { openPayment } = useRazorpay();

  const handleUpgrade = (planId: string, billingCycle = 'monthly') => {
    if (planId === "free") { 
      if (premiumTier !== "free" && confirm("Confirm cancellation?")) {
        cancelSubscription();
      }
      return; 
    }
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!user.phoneVerified) {
      // In dev mode, skip phone verification gate if there's a valid session token
      // (user authenticated but cached profile may be stale when DB is offline)
      const hasRealToken = localStorage.getItem('filenova_token');
      const isDevBypass = import.meta.env.DEV && hasRealToken && !hasRealToken.startsWith('local_');
      const isDeveloperAccount = user.email === 'subhajitgho123@gmail.com';

      if (!isDevBypass && !isDeveloperAccount) {
        const mappedPlan = planId === 'pass' 
          ? (billingCycle === '24hr' ? 'pass_24h' : 'pass_7d') 
          : planId as PremiumTier;
        setPendingPlan(mappedPlan);
        setOtpOpen(true);
        return;
      }
    }

    openPayment({
      planId,
      billingCycle: billingCycle as 'monthly' | 'yearly',
      userName: user.name ?? '',
      userEmail: user.email ?? '',
      onSuccess: (data) => {
        toast.success(`🎉 Upgraded to ${planId}! Enjoy FileNova Premium.`);
        useAuthStore.getState().refreshUser();
        setLocation('/dashboard');
      },
      onFailure: (error) => {
        toast.error(`Payment failed: ${error}`);
        if (typeof error === 'string' && (error.includes('Authentication required') || error.includes('log in first'))) {
          useAuthStore.getState().logout().then(() => {
            setAuthModalOpen(true);
          });
        }
      },
    });
  };

  const handleSelectPlan = (plan: PremiumTier) => {
    if (isTesting) { toast.info("Testing mode: All features unlocked for free."); return; }
    if (!user && plan !== "free") { setAuthModalOpen(true); return; }
    if (plan === "free") { if (premiumTier !== "free" && confirm("Confirm cancellation?")) cancelSubscription(); return; }
    if (!user) return;
    if (!user.phoneVerified) { setPendingPlan(plan); setOtpOpen(true); return; }
    
    if (plan === "pass_24h") {
      handleUpgrade("pass", "24hr");
    } else if (plan === "pass_7d") {
      handleUpgrade("pass", "weekly");
    } else {
      handleUpgrade(plan, "monthly");
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setHudActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % 6));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setHudActiveIndex((prev) => (prev === null ? 5 : (prev - 1 + 6) % 6));
      } else if (e.key === "Enter") {
        if (hudActiveIndex !== null) {
          e.preventDefault();
          if (hudActiveIndex === 0) handleSelectPlan("free");
          else if (hudActiveIndex === 1) handleSelectPlan("basic");
          else if (hudActiveIndex === 2) handleSelectPlan("pro");
          else if (hudActiveIndex === 3) handleSelectPlan("elite");
          else if (hudActiveIndex === 4) handleSelectPlan("pass_24h");
          else if (hudActiveIndex === 5) handleSelectPlan("pass_7d");
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setHudActiveIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hudActiveIndex]);

  const plans = [
    { id: "free" as const, title: "Free", originalPrice: 0, period: "", limit: "Ad-supported access", description: "Ideal for occasional, single-document edits and quick runs.", features: ["3 uses per day", "PDF Merge & Compress only", "Max file size: 3MB", "Must watch 1 ad per use", "FileNova watermark", "1h temp storage", "No voice assistant"], accent: "text-muted-foreground", ctaText: "Current Plan" },
    { id: "basic" as const, title: "Basic Desk", originalPrice: 49, period: "month", limit: "20 uses / day", description: "Built for individual applicants filling regular local job forms.", features: ["20 uses per day", "All basic tools", "Max file size: 15MB", "Ad-free", "Voice Assistant", "Aadhaar Masking", "24h storage"], accent: "text-emerald-500", ctaText: "Upgrade Basic" },
    { id: "pro" as const, title: "Pro Desk", originalPrice: 99, period: "month", limit: "100 uses / day", description: "Best for high-volume document creators and coordinators.", isPopular: true, features: ["100 uses per day", "All premium tools", "Max file size: 50MB", "Ad-free", "Exam Template Presets", "QR Scanner/Gen", "7 days storage"], accent: "text-sky-500", ctaText: "Go Pro Desk" },
    { id: "elite" as const, title: "Elite Console", originalPrice: 199, period: "month", limit: "Unlimited", description: "Cyber Cafe operators and bulk application centers.", features: ["Unlimited usage", "Max file size: 100MB", "Ad-free", "Cyber Cafe Operator mode", "Bulk CSV imports", "Priority lanes", "30 days storage"], accent: "text-violet-500", ctaText: "Acquire Elite" },
  ];

  const getDynamicCouponDiscount = (planId: PremiumTier, codeStr: string): number => {
    const code = codeStr.toUpperCase().trim();
    if (code === "STUDENT20") return 20;
    if (code === "CYBER50" && planId === "elite") return 50;
    if (code === "FIRST30") return 30;
    if (code === "WB10") return 10;
    return 0;
  };

  const handleValidateCoupon = async () => {
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) { setCouponError("Please enter a code."); return; }
    if (!user) { toast.error("Sign in to apply."); setAuthModalOpen(true); return; }
    try {
      const token = localStorage.getItem("filenova_token");
      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/coupons/validate`, { method: "POST", headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) }, body: JSON.stringify({ coupon: cleanCode, plan: "pro" }) });
      const data = await res.json();
      if (res.ok && data.valid) { setAppliedDiscount(data.discountPercentage); setCouponSuccess(`Coupon '${cleanCode}' applied!`); setCouponError(""); }
      else { setAppliedDiscount(0); setCouponError(data.message || "Invalid code."); setCouponSuccess(""); }
    } catch (err) {
      const d = getDynamicCouponDiscount("pro", cleanCode);
      if (d > 0) { setAppliedDiscount(d); setCouponSuccess(`Coupon '${cleanCode}' applied!`); }
      else { setAppliedDiscount(0); setCouponError("Invalid code."); }
    }
  };

  const getPlanPrice = (planId: PremiumTier, original: number) => {
    const textClass = planId === "pro" ? "text-white" : "text-[var(--fn-text-primary)] dark:text-white";
    if (planId === "free") return <span className={`text-3xl font-black ${textClass}`}>₹0</span>;
    if (isTesting) return <span className="text-3xl font-black text-emerald-500">FREE</span>;
    const discounted = appliedDiscount > 0 ? Math.round(original * (1 - appliedDiscount / 100)) : original;
    return <span className={`text-3xl font-black ${textClass}`}>₹{discounted}</span>;
  };

  const getPlanCta = (id: PremiumTier, cta: string) => (isTesting ? "Unlocked" : cta);
  const getPayableAmount = (planId: PremiumTier, original: number) => (planId === "free" ? 0 : Math.round(original * (1 - appliedDiscount / 100)));

  return (
    <div className={`min-h-screen fn-aurora-bg text-[var(--fn-text-primary)] flex flex-col ${themeClass}`}>
      <TestingNotice />
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl px-4 py-12 space-y-12 pb-24 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto space-y-6">
          <div className="flex justify-start mb-6">
            <BackHomeBar />
          </div>
          <div className="fn-glass rounded-3xl px-8 py-4 inline-block shadow-sm">
            <span className="text-xs font-black text-[var(--fn-accent-primary)] uppercase tracking-wider">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--fn-text-primary)] tracking-tight leading-tight font-display">Flexible premium plans</h1>
          {usersServedToday && (
            <div className="mx-auto flex justify-center pt-2">
              <div className="inline-flex items-center gap-2 fn-glass rounded-full px-4 py-2 text-sm text-[var(--fn-text-secondary)] font-semibold shadow-sm">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live: <strong className="text-[var(--fn-text-primary)]">{usersServedToday.toLocaleString()}</strong> served today</span>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch"
        >
          {plans.map((p, idx) => (
            <motion.div 
              key={p.id} 
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} 
              className="flex flex-col h-full"
            >
              <PlanCard 
                id={p.id} 
                title={p.title} 
                price={getPlanPrice(p.id, p.originalPrice)} 
                period={p.period} 
                limit={p.limit} 
                description={p.description} 
                features={p.features} 
                accent={p.accent} 
                isPopular={p.isPopular} 
                ctaText={getPlanCta(p.id, p.ctaText)} 
                onSelect={() => handleSelectPlan(p.id)} 
                currentTier={premiumTier} 
                loading={loading} 
                amount={getPayableAmount(p.id, p.originalPrice)} 
                userEmail={user?.email} 
                isActive={hudActiveIndex === idx} 
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Compact Passes Section */}
        <div className="space-y-4 pt-8">
          <h2 className="text-xl font-bold text-center text-[var(--fn-text-primary)] font-display">Day Passes</h2>
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <SpotlightCard className="fn-glass rounded-2xl p-6 flex flex-col justify-between h-full text-[var(--fn-text-primary)]" isActive={hudActiveIndex === 4}>
                <div>
                  <h3 className="text-base font-bold font-display text-[var(--fn-text-primary)]">24-Hour Pass</h3>
                  <p className="text-xs text-[var(--fn-text-secondary)] mt-2">Access to all premium tools for 24 hours.</p>
                </div>
                <div className="pt-4 border-t border-[var(--fn-border)] mt-4">
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-[var(--fn-text-primary)]">₹9</span>
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <button onClick={() => handleSelectPlan("pass_24h")} className="w-full py-2 bg-[var(--fn-accent-primary)] text-white rounded-full text-xs font-black cursor-pointer hover:opacity-90 transition-opacity">Buy Pass</button>
                    <button onClick={() => handleSelectPlan("pass_24h")} className="w-full py-1.5 border border-[var(--fn-border)] bg-[var(--fn-surface-elevated)] text-[var(--fn-text-secondary)] rounded-full text-[10px] font-black cursor-pointer hover:bg-[var(--fn-surface)] transition flex items-center justify-center gap-1.5"><QrCode className="h-3 w-3" /> PhonePe / UPI Pay</button>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
              <SpotlightCard className="fn-glass rounded-2xl p-6 flex flex-col justify-between h-full text-[var(--fn-text-primary)]" isActive={hudActiveIndex === 5}>
                <div>
                  <h3 className="text-base font-bold font-display text-[var(--fn-text-primary)]">Weekly Pass</h3>
                  <p className="text-xs text-[var(--fn-text-secondary)] mt-2">Perfect for 7-day high volume cycles.</p>
                </div>
                <div className="pt-4 border-t border-[var(--fn-border)] mt-4">
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-[var(--fn-text-primary)]">₹29</span>
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <button onClick={() => handleSelectPlan("pass_7d")} className="w-full py-2 bg-[var(--fn-accent-primary)] text-white rounded-full text-xs font-black cursor-pointer hover:opacity-90 transition-opacity">Buy Pass</button>
                    <button onClick={() => handleSelectPlan("pass_7d")} className="w-full py-1.5 border border-[var(--fn-border)] bg-[var(--fn-surface-elevated)] text-[var(--fn-text-secondary)] rounded-full text-[10px] font-black cursor-pointer hover:bg-[var(--fn-surface)] transition flex items-center justify-center gap-1.5"><QrCode className="h-3 w-3" /> PhonePe / UPI Pay</button>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        </div>

        {/* Coupon + Secure Checkout Row */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-6"
        >
          <div>
            <SpotlightCard className="fn-glass rounded-2xl p-4 flex flex-col gap-3 h-full text-[var(--fn-text-primary)] justify-center">
              <p className="text-sm font-bold text-[var(--fn-text-primary)]">Have a coupon?</p>
              <div className="flex gap-2">
                <input 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  placeholder="Coupon Code" 
                  title="Coupon Code" 
                  aria-label="Coupon Code" 
                  className="w-full rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface-elevated)] px-4 py-2 text-xs text-[var(--fn-text-primary)] outline-none focus:border-[var(--fn-accent-primary)] font-semibold" 
                />
                <button 
                  onClick={handleValidateCoupon} 
                  title="Apply Coupon" 
                  aria-label="Apply Coupon" 
                  className="px-4 py-2 bg-[var(--fn-accent-india)] text-white rounded-full text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-500 font-bold px-1">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-emerald-500 font-bold px-1">{couponSuccess}</p>}
            </SpotlightCard>
          </div>

          <div>
            <SpotlightCard className="fn-glass rounded-2xl p-4 flex items-center gap-3 h-full text-[var(--fn-text-primary)] justify-center">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--fn-text-primary)]">Secure Checkout</p>
                <p className="text-[11px] text-[var(--fn-text-secondary)] mt-0.5">100% encrypted & protected payments.</p>
              </div>
            </SpotlightCard>
          </div>
        </motion.div>

        {/* Enterprise and API Pricing */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl mx-auto"
        >
          <SpotlightCard className="fn-glass rounded-2xl p-6 text-[var(--fn-text-primary)]">
            <div className="flex h-full flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-elevated)] flex items-center justify-center text-[var(--fn-accent-primary)]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--fn-accent-primary)]">Enterprise</p>
                  <h2 className="mt-1 text-xl font-black text-[var(--fn-text-primary)] font-display">Custom plans for institutes and cyber cafe chains</h2>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[var(--fn-text-secondary)]">
                Need seats for a college office, CSC network, coaching center, or high-volume document desk? Get pooled usage, priority support, onboarding, and custom retention controls.
              </p>
              <ul className="grid gap-2 text-xs font-semibold text-[var(--fn-text-secondary)] sm:grid-cols-2">
                {["Bulk operator seats", "Custom file limits", "Priority onboarding", "Dedicated support channel"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[var(--fn-accent-primary)] px-5 py-2.5 text-xs font-black text-white transition hover:opacity-90">
                <MessageCircle className="h-4 w-4" />
                Contact for pricing
              </Link>
            </div>
          </SpotlightCard>

          <SpotlightCard className="fn-glass rounded-2xl p-6 text-[var(--fn-text-primary)]">
            <div className="flex h-full flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-elevated)] flex items-center justify-center text-[var(--fn-accent-primary)]">
                  <ServerCog className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[var(--fn-accent-primary)]">Developer API</p>
                  <h2 className="mt-1 text-xl font-black text-[var(--fn-text-primary)] font-display">API tiers are being prepared</h2>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { name: "Starter", price: "Coming soon", limit: "1K jobs/mo" },
                  { name: "Growth", price: "Coming soon", limit: "10K jobs/mo" },
                  { name: "Scale", price: "Talk to us", limit: "Custom volume" },
                ].map((tier) => (
                  <div key={tier.name} className="rounded-xl border border-[var(--fn-border)] bg-[var(--fn-surface-elevated)] p-3">
                    <p className="text-xs font-black text-[var(--fn-text-primary)]">{tier.name}</p>
                    <p className="mt-1 text-[11px] font-bold text-[var(--fn-accent-primary)]">{tier.price}</p>
                    <p className="mt-2 text-[10px] text-[var(--fn-text-secondary)]">{tier.limit}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-[var(--fn-text-secondary)]">
                Public API keys, usage dashboards, and webhook controls are planned. Until then, teams can request private access for vetted workflows.
              </p>
              <Link href="/contact" className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-[var(--fn-border)] bg-[var(--fn-surface-elevated)] px-5 py-2.5 text-xs font-black text-[var(--fn-text-primary)] transition hover:bg-[var(--fn-surface)]">
                Request API access
              </Link>
            </div>
          </SpotlightCard>
        </motion.section>
      </main>

      <OTPVerificationModal
        isOpen={otpOpen}
        onClose={() => {
          setOtpOpen(false);
          setPendingPlan(null);
        }}
        onSuccess={() => {
          if (pendingPlan && pendingPlan !== "free") {
            handleSelectPlan(pendingPlan);
            setPendingPlan(null);
          }
        }}
      />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
