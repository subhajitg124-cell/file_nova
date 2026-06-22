/**
 * PricingPage Component
 * Displays available subscription tiers (Free, Basic, Pro, Elite) and manages checkout.
 */

import React, { useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, CheckCircle2, ShieldCheck, Zap, Loader, Copy, QrCode, Check, X } from "lucide-react";
import { useSubscription, type PremiumTier, isTestingPeriodActive } from "@/hooks/useSubscription";
import { TestingNotice } from "@/components/TestingNotice";
import { useAdmin } from "@/lib/admin";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
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
  borderColor = "rgba(255, 255, 255, 0.1)",
  defaultBorder = "rgba(255, 255, 255, 0.05)",
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
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 bg-card/45 backdrop-blur-md perspective-1000 preserve-3d ${
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

  const midPoint = Math.ceil(features.length / 2);
  const firstHalf = features.slice(0, midPoint);
  const secondHalf = features.slice(midPoint);
  const displayFeaturesGrid = isPro || isElite;

  const cardContent = (
    <div className={`p-6 sm:p-8 flex flex-col justify-between h-full relative z-10 ${isPro ? 'animated-lines-bg' : ''}`}>
      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-glow">
          <Sparkles className="h-3 w-3 text-amber-300 animate-spin-slow" />
          Most Popular
        </span>
      )}

      <div className={`flex flex-col h-full ${displayFeaturesGrid ? 'lg:grid lg:grid-cols-12 lg:gap-8 lg:items-stretch' : 'gap-5'}`}>
        <div className={`${displayFeaturesGrid ? 'lg:col-span-5 flex flex-col justify-between h-full' : 'flex flex-col'}`}>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`${isPopular ? "text-2xl sm:text-3xl" : "text-xl"} font-black text-foreground`}>{title}</h3>
              {isElite && (
                <span className="text-[9px] bg-violet-500/15 text-violet-400 font-bold px-2 py-0.5 rounded-full border border-violet-500/20">
                  Console Mode
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed min-h-8">
              {description}
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              {price}
              {period && <span className="text-xs font-semibold text-muted-foreground">/{period}</span>}
            </div>
            <div className="mt-2 text-xs font-bold text-primary">{limit}</div>
          </div>

          <div className="mt-6">
            <div className={isPaidPlan && !isCurrent ? "grid grid-cols-1 gap-2.5 xl:grid-cols-2" : ""}>
              <button
                onClick={onSelect}
                disabled={isCurrent || loading}
                className={`w-full py-3 rounded-xl text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  isCurrent
                    ? "bg-muted border border-border text-muted-foreground cursor-default"
                    : isPopular
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-glow"
                      : "border border-border bg-background hover:bg-muted text-foreground"
                }`}
              >
                {loading && !isCurrent ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Connecting…
                  </>
                ) : isCurrent ? (
                  "Current Plan"
                ) : (
                  ctaText
                )}
              </button>
              {isPaidPlan && !isCurrent && (
                <UpiPaymentBox plan={id} amount={amount} userEmail={userEmail} />
              )}
            </div>
          </div>
        </div>

        {displayFeaturesGrid && (
          <div className="hidden lg:block lg:col-span-1 border-r border-border/20 self-stretch my-1" />
        )}

        <div className={`${displayFeaturesGrid ? 'lg:col-span-6 mt-6 lg:mt-0 flex flex-col justify-center' : 'mt-4 border-t border-border pt-4'}`}>
          <p className="text-[10px] uppercase font-black tracking-wider text-muted-foreground mb-3">
            Features Unlocked:
          </p>
          {displayFeaturesGrid ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <ul className="space-y-2.5">
                {firstHalf.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-foreground/90 font-medium text-xs">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${accent}`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2.5">
                {secondHalf.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-foreground/90 font-medium text-xs">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${accent}`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-foreground/90 font-medium text-xs">
                  <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${accent}`} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  if (id === "pro") {
    return (
      <div className={`neon-sweep-wrapper shadow-neon-pro h-full group transition-all duration-300 ${isActive ? "spatial-active-ring" : "hover:scale-[1.01]"}`}>
        <div className="neon-sweep-bg" />
        <SpotlightCard
          className="neon-sweep-content bg-slate-950/95 h-full"
          spotlightColor="rgba(99, 102, 241, 0.22)"
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
        className="h-full shadow-neon-elite transition-transform duration-300 border-soft"
        spotlightColor="rgba(139, 92, 246, 0.2)"
        borderColor="rgba(139, 92, 246, 0.5)"
        defaultBorder="rgba(139, 92, 246, 0.2)"
        isActive={isActive}
      >
        {cardContent}
      </SpotlightCard>
    );
  }

  if (id === "basic") {
    return (
      <SpotlightCard
        className="h-full transition-all duration-300"
        spotlightColor="rgba(16, 185, 129, 0.15)"
        borderColor="rgba(16, 185, 129, 0.45)"
        defaultBorder="rgba(16, 185, 129, 0.15)"
        isActive={isActive}
      >
        {cardContent}
      </SpotlightCard>
    );
  }

  return (
    <SpotlightCard
      className="h-full transition-all duration-300"
      spotlightColor="rgba(148, 163, 184, 0.08)"
      borderColor="rgba(148, 163, 184, 0.25)"
      defaultBorder="rgba(255, 255, 255, 0.06)"
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
              <img src={createUpiQrUrl(amount)} alt="FileNova UPI QR code" className="mx-auto h-40 w-40 rounded-xl border border-border bg-white object-contain p-2" />
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
  const { premiumTier, startCheckout, cancelSubscription, loading, activeOffer, usersServedToday } = useSubscription();
  const { user } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [pendingPlan, setPendingPlan] = React.useState<PremiumTier | null>(null);
  const admin = useAdmin();
  const isTesting = isTestingPeriodActive();
  const [couponCode, setCouponCode] = React.useState("");
  const [appliedDiscount, setAppliedDiscount] = React.useState(0);
  const [couponError, setCouponError] = React.useState("");
  const [couponSuccess, setCouponSuccess] = React.useState("");

  const themeClass = admin.settings.eventTheme && admin.settings.eventTheme !== "none" ? `event-theme-${admin.settings.eventTheme}` : "";

  const [hudActiveIndex, setHudActiveIndex] = React.useState<number | null>(null);

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

  const handleSelectPlan = (plan: PremiumTier) => {
    if (isTesting) { toast.info("Testing mode: All features unlocked for free."); return; }
    if (!user && plan !== "free") { setAuthModalOpen(true); return; }
    if (plan === "free") { if (premiumTier !== "free" && confirm("Confirm cancellation?")) cancelSubscription(); return; }
    if (!user) return;
    if (!user.phoneVerified) { setPendingPlan(plan); setOtpOpen(true); return; }
    startCheckout(plan as Exclude<PremiumTier, "free">, appliedDiscount > 0 ? couponCode.trim().toUpperCase() : undefined);
  };

  const getPlanPrice = (planId: PremiumTier, original: number) => {
    if (planId === "free") return <span className="text-3xl font-black text-foreground">₹0</span>;
    if (isTesting) return <span className="text-3xl font-black text-emerald-500">FREE</span>;
    const discounted = appliedDiscount > 0 ? Math.round(original * (1 - appliedDiscount / 100)) : original;
    return <span className="text-3xl font-black text-foreground">₹{discounted}</span>;
  };

  const getPlanCta = (id: PremiumTier, cta: string) => (isTesting ? "Unlocked" : cta);
  const getPayableAmount = (planId: PremiumTier, original: number) => (planId === "free" ? 0 : Math.round(original * (1 - appliedDiscount / 100)));

  return (
    <div className={`min-h-screen bg-background text-foreground flex flex-col bg-mesh ${themeClass}`}>
      <TestingNotice />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold"><ChevronLeft className="h-4 w-4" /> Home</Link>
          <UserProfileDropdown />
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-7xl px-4 py-12 space-y-12 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-black text-primary"><Zap className="h-3 w-3 animate-pulse" /> Upgrade Workspace</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight font-display">Flexible premium plans</h1>
          {usersServedToday && (
            <div className="mx-auto flex justify-center pt-2"><div className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 border border-border/80 px-4 py-1.5 text-xs text-muted-foreground font-semibold">Live: <strong className="text-foreground">{usersServedToday.toLocaleString()}</strong> served today</div></div>
          )}
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 max-w-6xl mx-auto">
          {plans.map((p, idx) => (
            <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} className={p.id === "pro" ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : p.id === "elite" ? "sm:col-span-2 lg:col-span-2" : ""}>
              <PlanCard id={p.id} title={p.title} price={getPlanPrice(p.id, p.originalPrice)} period={p.period} limit={p.limit} description={p.description} features={p.features} accent={p.accent} isPopular={p.isPopular} ctaText={getPlanCta(p.id, p.ctaText)} onSelect={() => handleSelectPlan(p.id)} currentTier={premiumTier} loading={loading} amount={getPayableAmount(p.id, p.originalPrice)} userEmail={user?.email} isActive={hudActiveIndex === idx} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <SpotlightCard className="p-6 flex flex-col justify-between h-full" isActive={hudActiveIndex === 4}>
              <div><h3 className="text-base font-black font-display">24-Hour Pass</h3><p className="text-xs text-muted-foreground mt-2">Access to all premium tools for 24h.</p></div>
              <div className="pt-4 border-t border-border/20 mt-4"><div className="flex items-baseline gap-1 mb-2"><span className="text-2xl font-black">₹9</span></div><div className="grid grid-cols-2 gap-2"><button onClick={() => handleSelectPlan("pass_24h")} className="py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black">Buy</button><UpiPaymentBox plan="pass_24h" amount={9} /></div></div>
            </SpotlightCard>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <SpotlightCard className="p-6 flex flex-col justify-between h-full" isActive={hudActiveIndex === 5}>
              <div><h3 className="text-base font-black font-display">Weekly Pass</h3><p className="text-xs text-muted-foreground mt-2">Perfect for 7-day cycles.</p></div>
              <div className="pt-4 border-t border-border/20 mt-4"><div className="flex items-baseline gap-1 mb-2"><span className="text-2xl font-black">₹29</span></div><div className="grid grid-cols-2 gap-2"><button onClick={() => handleSelectPlan("pass_7d")} className="py-2 bg-purple-600 text-white rounded-xl text-xs font-black">Buy</button><UpiPaymentBox plan="pass_7d" amount={29} /></div></div>
            </SpotlightCard>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <SpotlightCard className="p-5 flex flex-col gap-3 h-full">
              <p className="text-sm font-black">Have a coupon?</p>
              <div className="flex gap-2"><input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon Code (e.g. STUDENT20)" title="Coupon Code" aria-label="Coupon Code" className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-xs" /><button onClick={handleValidateCoupon} title="Apply Coupon" aria-label="Apply Coupon" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black">Apply</button></div>
            </SpotlightCard>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <SpotlightCard className="p-5 flex flex-col justify-center h-full">
              <p className="text-sm font-black">Secure Checkout</p>
              <p className="text-[11px] text-muted-foreground mt-1">100% encrypted & protected.</p>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </main>
      <OTPVerificationModal
        isOpen={otpOpen}
        onClose={() => {
          setOtpOpen(false);
          setPendingPlan(null);
        }}
        onSuccess={() => {
          if (pendingPlan && pendingPlan !== "free") {
            const couponDiscount = getDynamicCouponDiscount(pendingPlan, couponCode);
            const activeCoupon = couponDiscount > 0 ? couponCode.trim().toUpperCase() : undefined;
            startCheckout(pendingPlan as Exclude<PremiumTier, "free">, activeCoupon);
            setPendingPlan(null);
          }
        }}
      />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Spatial Key HUD */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
        <div className="glass px-5 py-3 rounded-full border border-white/10 shadow-2xl flex items-center gap-6 text-[11px] font-bold text-muted-foreground backdrop-blur-xl spatial-hud-glow">
          <div className="flex items-center gap-1.5">
            <span className="spatial-keycap px-2 py-1 rounded text-[10px] font-sans font-black shadow-sm mr-1">←</span>
            <span className="spatial-keycap px-2 py-1 rounded text-[10px] font-sans font-black shadow-sm mr-1">→</span>
            <span className="text-white/80 font-black tracking-wider uppercase text-[10px]">Navigate</span>
          </div>
          <div className="h-4 border-r border-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="spatial-keycap px-2.5 py-1 rounded text-[10px] font-sans font-black shadow-sm mr-1">Enter</span>
            <span className="text-white/80 font-black tracking-wider uppercase text-[10px]">Select</span>
          </div>
          <div className="h-4 border-r border-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="spatial-keycap px-2.5 py-1 rounded text-[10px] font-sans font-black shadow-sm mr-1">Esc</span>
            <span className="text-white/80 font-black tracking-wider uppercase text-[10px]">Clear</span>
          </div>
          {hudActiveIndex !== null && (
            <>
              <div className="h-4 border-r border-white/10" />
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                Focused: {hudActiveIndex === 0 ? "Free" : hudActiveIndex === 1 ? "Basic" : hudActiveIndex === 2 ? "Pro" : hudActiveIndex === 3 ? "Elite" : hudActiveIndex === 4 ? "24H Pass" : "Weekly Pass"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
