/**
 * PricingPage Component
 * Displays available subscription tiers (Free, Basic, Pro, Elite) and manages checkout.
 */

import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, CheckCircle2, ShieldCheck, Zap, Loader, Copy, QrCode, Upload, Check, X } from "lucide-react";
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
}: PlanCardProps) {
  const isCurrent = currentTier === id;
  const isPaidPlan = id !== "free";

  return (
    <div
      className={`rounded-3xl border p-6 flex flex-col relative transition-all duration-300 h-full ${
        isPopular
          ? "border-primary/40 bg-gradient-to-br from-primary/8 via-card to-violet-500/5 shadow-premium scale-[1.02] z-10 hover:scale-[1.04] hover:shadow-glow"
          : "border-border/60 bg-card/60 hover:-translate-y-1 hover:border-primary/25 shadow-sm hover:shadow-md"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-glow">
          <Sparkles className="h-3 w-3 text-amber-300" />
          Most Popular
        </span>
      )}

      {/* Plan Header */}
      <div className={isPopular ? "mb-6" : "mb-5"}>
        <h3 className={`${isPopular ? "text-2xl" : "text-xl"} font-black text-foreground`}>{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed min-h-8">
          {description}
        </p>
        <div className="mt-4 flex items-baseline gap-1">
          {price}
          {period && <span className="text-xs font-semibold text-muted-foreground">/{period}</span>}
        </div>
        <div className="mt-2 text-xs font-bold text-primary">{limit}</div>
      </div>

      {/* Feature list */}
      <ul className={`space-y-3 mb-8 flex-1 border-t border-border pt-5 ${isPopular ? "space-y-3.5" : ""}`}>
        {features.map((feat) => (
          <li key={feat} className={`flex items-start gap-2.5 text-foreground/90 font-medium ${isPopular ? "text-sm" : "text-xs"}`}>
            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${accent}`} />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <div className={isPaidPlan && !isCurrent ? "grid grid-cols-1 gap-3 xl:grid-cols-2" : ""}>
      {/* CTA Button */}
      <button
        onClick={onSelect}
        disabled={isCurrent || loading}
        className={`w-full py-3 rounded-xl text-sm font-black transition flex items-center justify-center gap-2 ${
          isCurrent
            ? "bg-muted border border-border text-muted-foreground cursor-default"
            : isPopular
              ? "bg-primary text-primary-foreground hover:opacity-90 shadow-glow cursor-pointer"
              : "border border-border bg-background hover:bg-muted text-foreground cursor-pointer"
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
        <div>
          <UpiPaymentBox plan={id} amount={amount} userEmail={userEmail} />
        </div>
      )}
      </div>
    </div>
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
  const [formOpen, setFormOpen] = React.useState(false);
  const [utrId, setUtrId] = React.useState("");
  const [email, setEmail] = React.useState(userEmail || "");
  const [screenshotName, setScreenshotName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const upiId = FILENOVA_UPI_ID;

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

  React.useEffect(() => {
    if (userEmail && !email) setEmail(userEmail);
  }, [email, userEmail]);

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
    if (!email) {
      toast.error("Email address is required.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      if (!HAS_BACKEND) {
        toast.info("Payment verification will be confirmed manually. Please WhatsApp or email the UTR after payment.");
        setUtrId("");
        setScreenshotName("");
        setFormOpen(false);
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
      setScreenshotName("");
      setFormOpen(false);
      setOpen(false);
    } catch (err: any) {
      // Offline/unreachable backend fallback
      toast.info("Payment verification submitted (offline fallback)! Admin will verify and activate your plan.");
      setUtrId("");
      setScreenshotName("");
      setFormOpen(false);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleOpenUpi}
        className="w-full py-3 px-3 rounded-xl text-sm font-black text-primary hover:bg-indigo-500/10 transition flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/20 bg-indigo-500/5"
      >
        <QrCode className="h-4 w-4" />
        Pay via UPI
      </button>

      <OTPVerificationModal
        isOpen={otpOpen}
        onClose={() => setOtpOpen(false)}
        onSuccess={() => setOpen(true)}
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition cursor-pointer text-muted-foreground"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-foreground">UPI Payment Verification</h3>
              <p className="text-xs text-muted-foreground">
                Pay ₹{amount} for the {plan.toUpperCase()} plan using UPI.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/50 p-4 text-center space-y-4">
              <img
                src={createUpiQrUrl(amount)}
                alt="FileNova UPI QR code"
                className="mx-auto h-40 w-40 rounded-xl border border-border bg-white object-contain p-2"
              />
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-foreground text-left">{upiId}</span>
                <button
                  type="button"
                  onClick={copyUpiId}
                  title="Copy UPI ID"
                  aria-label="Copy UPI ID"
                  className="h-8 w-8 shrink-0 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Scan QR or pay to UPI ID, then submit your transaction details below.
              </p>
            </div>

            <form onSubmit={submitVerification} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  12-Digit UTR / Transaction ID
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="e.g. 345678901234"
                  value={utrId}
                  onChange={(e) => setUtrId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-primary py-3 text-xs font-black text-primary-foreground shadow-glow hover:opacity-90 transition cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Verifying Payment...
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" />
                    Submit for Verification
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const { premiumTier, startCheckout, cancelSubscription, loading, activeOffer } = useSubscription();
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

  const themeClass = admin.settings.eventTheme && admin.settings.eventTheme !== "none"
    ? `event-theme-${admin.settings.eventTheme}`
    : "";

  const plans = [
    {
      id: "free" as const,
      title: "Free",
      originalPrice: 0,
      period: "",
      limit: "Ad-supported access",
      description: "Ideal for occasional, single-document edits and quick runs.",
      features: [
        "3 uses per day (strictly enforced)",
        "PDF Merge & Compress only",
        "Max file size: 3MB",
        "Must watch 1 ad before each use",
        "FileNova text watermark on output",
        "Temporary storage (deleted after 1h)",
        "No voice assistant / Aadhaar masking",
      ],
      accent: "text-muted-foreground",
      ctaText: "Current Plan",
    },
    {
      id: "basic" as const,
      title: "Basic Desk",
      originalPrice: 49,
      period: "month",
      limit: "20 uses / day",
      description: "Built for individual applicants filling regular local job forms.",
      features: [
        "20 uses per day",
        "All basic tools unlocked",
        "Max file size: 15MB",
        "Absolutely ad-free & no watermarks",
        "Voice Assistant (EN/HI/BN)",
        "Aadhaar Masking tools",
        "Expiry share links",
        "24-hour storage retention",
        "Standard email support",
      ],
      accent: "text-emerald-500",
      ctaText: "Upgrade Basic",
    },
    {
      id: "pro" as const,
      title: "Pro Desk",
      originalPrice: 99,
      period: "month",
      limit: "100 uses / day",
      description: "Our best option for high-volume document creators and coordinators.",
      isPopular: true,
      features: [
        "100 uses per day",
        "All premium & basic tools unlocked",
        "Max file size: 50MB",
        "Absolutely ad-free & no watermarks",
        "Exam Toolkit template presets",
        "QR validation (Scan & Gen)",
        "Priority download speeds & bulk (5)",
        "30-file processing history",
        "7 days storage retention",
        "Priority support",
      ],
      accent: "text-sky-500",
      ctaText: "Go Pro Desk",
    },
    {
      id: "elite" as const,
      title: "Elite Console",
      originalPrice: 199,
      period: "month",
      limit: "Unlimited usage",
      description: "Designed for Cyber Cafe owners and student operators handling bulk applications.",
      features: [
        "Unlimited usage",
        "Max file size: 100MB",
        "Absolutely ad-free & no watermarks",
        "Cyber Cafe Operator mode",
        "Bulk CSV student imports (20 files)",
        "Dedicated priority processing lanes",
        "API access keys",
        "30 days storage retention",
        "WhatsApp support & 5 sub-accounts",
      ],
      accent: "text-violet-500",
      ctaText: "Acquire Elite",
    },
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
    if (!cleanCode) {
      setCouponError("Please enter a coupon code.");
      setCouponSuccess("");
      setAppliedDiscount(0);
      return;
    }
    
    if (cleanCode !== "STUDENT20" && cleanCode !== "CYBER50" && cleanCode !== "FIRST30" && cleanCode !== "WB10") {
      setCouponError("Invalid coupon code.");
      setCouponSuccess("");
      setAppliedDiscount(0);
      return;
    }

    if (!user) {
      toast.error("Please sign in first to validate a coupon.");
      setAuthModalOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/coupons/validate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ coupon: cleanCode, plan: "pro" }),
      });
      const data = await res.json();
      
      if (res.ok && data.valid) {
        setAppliedDiscount(data.discountPercentage);
        setCouponSuccess(`Coupon '${cleanCode}' applied successfully!`);
        setCouponError("");
        toast.success(`Coupon applied! ${data.discountPercentage}% discount active.`);
      } else {
        setAppliedDiscount(0);
        setCouponError(data.message || "Invalid coupon code.");
        setCouponSuccess("");
      }
    } catch (err) {
      // Local coupon validation fallback when offline/unreachable
      const couponDiscount = getDynamicCouponDiscount("pro", cleanCode);
      if (couponDiscount > 0) {
        setAppliedDiscount(couponDiscount);
        setCouponSuccess(`Coupon '${cleanCode}' applied successfully (offline fallback)!`);
        setCouponError("");
        toast.success(`Coupon applied! ${couponDiscount}% discount active.`);
      } else {
        setAppliedDiscount(0);
        setCouponError("Invalid coupon code.");
        setCouponSuccess("");
      }
    }
  };

  const handleSelectPlan = (plan: PremiumTier) => {
    if (isTesting) {
      toast.info("All plans are currently free during the testing period! Enjoy all premium benefits.");
      return;
    }
    if (!user && plan !== "free") {
      toast.error("Please sign in first to purchase a plan.");
      setAuthModalOpen(true);
      return;
    }
    if (plan === "free") {
      if (premiumTier !== "free") {
        if (confirm("Are you sure you want to cancel your premium plan? This will return you to the ad-supported free tier.")) {
          cancelSubscription();
        }
      }
      return;
    }

    if (!user) return;
    if (!user.phoneVerified) {
      setPendingPlan(plan);
      setOtpOpen(true);
      return;
    }

    const couponDiscount = getDynamicCouponDiscount(plan, couponCode);
    const activeCoupon = couponDiscount > 0 ? couponCode.trim().toUpperCase() : undefined;
    
    startCheckout(plan as Exclude<PremiumTier, "free">, activeCoupon);
  };

  const getPlanPrice = (planId: PremiumTier, originalPrice: number) => {
    if (planId === "free") return <span className="text-3xl font-black text-foreground">₹0</span>;
    
    if (isTesting) {
      return (
        <span className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-emerald-500 animate-pulse-glow">FREE</span>
          <span className="text-sm text-muted-foreground line-through font-semibold">₹{originalPrice}</span>
        </span>
      );
    }

    let couponDiscount = 0;
    if (appliedDiscount > 0) {
      couponDiscount = getDynamicCouponDiscount(planId, couponCode);
    }

    let discountPercentage = couponDiscount;
    if (discountPercentage === 0 && activeOffer && activeOffer.discountPercentage > 0) {
      discountPercentage = activeOffer.discountPercentage;
    }

    if (discountPercentage > 0 && discountPercentage <= 100) {
      const discounted = Math.round(originalPrice * (1 - discountPercentage / 100));
      return (
        <span className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-foreground">₹{discounted}</span>
          <span className="text-sm text-muted-foreground line-through font-semibold">₹{originalPrice}</span>
        </span>
      );
    }

    return <span className="text-3xl font-black text-foreground">₹{originalPrice}</span>;
  };

  const getPlanCta = (planId: PremiumTier, defaultCta: string) => {
    if (isTesting) {
      return planId === "free" ? "Free Tier" : "Unlocked (Testing)";
    }
    return defaultCta;
  };

  const getPayableAmount = (planId: PremiumTier, originalPrice: number) => {
    if (planId === "free") return 0;
    
    let couponDiscount = 0;
    if (appliedDiscount > 0) {
      couponDiscount = getDynamicCouponDiscount(planId, couponCode);
    }

    let discountPercentage = couponDiscount;
    if (discountPercentage === 0 && activeOffer && activeOffer.discountPercentage > 0) {
      discountPercentage = activeOffer.discountPercentage;
    }

    if (discountPercentage > 0 && discountPercentage <= 100) {
      return Math.round(originalPrice * (1 - discountPercentage / 100));
    }
    return originalPrice;
  };

  return (
    <div className={`min-h-screen bg-background text-foreground flex flex-col bg-mesh ${themeClass}`}>
      <TestingNotice />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold">
            <ChevronLeft className="h-4 w-4" />
            FileNova Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground mr-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Encrypted Checkout
            </div>
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-7xl px-4 py-12 space-y-12">
        {/* Title area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-black text-primary">
            <Zap className="h-3 w-3" />
            Upgrade Workspace
          </div>
          
          {activeOffer && !isTesting && (
            <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-center text-sm font-bold text-primary animate-pulse-glow max-w-xl mx-auto">
              🎉 {activeOffer.announcement}
            </div>
          )}

          {isTesting && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center text-sm font-bold text-emerald-600 animate-pulse-glow max-w-xl mx-auto">
              🛠️ Testing Mode: All premium subscriptions are currently unlocked for FREE!
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Flexible premium plans for every workspace
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Acquire unlimited bandwidth, premium tools, and voice assistance today.
            Start editing securely with no installation. Cancel anytime with a single click.
          </p>
        </motion.div>

        {/* Coupon + Trust — Animated Bento Strip */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-4xl mx-auto grid gap-4 sm:grid-cols-2"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
            className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md rounded-2xl border border-border/60 p-5 shadow-sm flex flex-col gap-3 hover:border-primary/25 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Have a coupon?</p>
                <p className="text-[10px] text-muted-foreground font-medium">Enter code for instant discounts</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="STUDENT20, CYBER50, FIRST30"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary uppercase"
              />
              <button
                onClick={handleValidateCoupon}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black shadow-glow hover:opacity-90 transition cursor-pointer"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs font-bold text-red-500">{couponError}</p>}
            {couponSuccess && <p className="text-xs font-bold text-emerald-500">{couponSuccess}</p>}
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
            className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-md rounded-2xl border border-emerald-500/15 p-5 flex flex-col justify-center gap-3 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Secure &amp; Encrypted</p>
                <p className="text-[10px] text-muted-foreground font-medium">All transactions are protected</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Instant activation</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Sachet Passes — Animated Bento Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          className="max-w-4xl mx-auto space-y-6 pt-4"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            className="space-y-1.5 text-center"
          >
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-500/20">
              ⚡ Sachet Pass (Single Use Cycles)
            </span>
            <h2 className="text-2xl font-black text-foreground">Only need it for a short project?</h2>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              Get full access to all premium tools without a monthly recurring commitment.
            </p>
          </motion.div>
          
          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {/* 24 Hour pass */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } } }}
              whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(99,102,241,0.12)" }}
              className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-card to-slate-900/40 p-6 flex flex-col justify-between transition-colors hover:border-indigo-500/40 relative group text-left"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-foreground">24-Hour Pass</h3>
                  <span className="text-[9px] bg-indigo-500/15 text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">Best Value</span>
                </div>
                <p className="text-xs text-muted-foreground leading-normal">Complete access to pro tools, form autofills, and PDF builders for 24 hours.</p>
              </div>
              
              <div className="relative flex items-baseline gap-1 pt-4 pb-4 border-t border-border/40 mt-4">
                <span className="text-2xl font-black text-foreground">₹9</span>
                <span className="text-xs text-muted-foreground">/24 Hours</span>
              </div>
              
              <div className="relative grid grid-cols-1 gap-2 xl:grid-cols-2">
                <button
                  onClick={() => handleSelectPlan("pass_24h")}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:opacity-90 shadow-glow cursor-pointer transition flex items-center justify-center"
                >
                  Buy Pass
                </button>
                <UpiPaymentBox plan="pass_24h" amount={9} userEmail={user?.email} />
              </div>
            </motion.div>

            {/* 7 day pass */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } } }}
              whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(168,85,247,0.12)" }}
              className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/20 via-card to-slate-900/40 p-6 flex flex-col justify-between transition-colors hover:border-purple-500/40 relative group text-left"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-foreground">Weekly Pass</h3>
                  <span className="text-[9px] bg-purple-500/15 text-purple-400 font-bold px-2 py-0.5 rounded-full border border-purple-500/20">Form Cycle</span>
                </div>
                <p className="text-xs text-muted-foreground leading-normal">Perfect for processing admission sets and local scholarship forms over a week.</p>
              </div>
              
              <div className="relative flex items-baseline gap-1 pt-4 pb-4 border-t border-border/40 mt-4">
                <span className="text-2xl font-black text-foreground">₹29</span>
                <span className="text-xs text-muted-foreground">/7 Days</span>
              </div>
              
              <div className="relative grid grid-cols-1 gap-2 xl:grid-cols-2">
                <button
                  onClick={() => handleSelectPlan("pass_7d")}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-500/10 transition cursor-pointer flex items-center justify-center"
                >
                  Buy Pass
                </button>
                <UpiPaymentBox plan="pass_7d" amount={29} userEmail={user?.email} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Plan Cards — Animated Bento Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 max-w-6xl mx-auto"
        >
          {plans.map((p, i) => {
            const isPro = p.isPopular;
            const isElite = i === 3;
            return (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.96 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={isPro ? { scale: 1.02 } : { y: -6, transition: { duration: 0.25 } }}
                className={
                  isPro
                    ? "lg:col-span-2 lg:row-span-2"
                    : isElite
                      ? "lg:col-start-4 lg:row-start-1 lg:row-span-2"
                      : ""
                }
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
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Cancellation policy footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="max-w-2xl mx-auto text-center text-xs text-muted-foreground border-t border-border pt-8 mt-6"
        >
          <p>Payments are managed securely by Razorpay. Price contains all GST fees.</p>
          <p className="mt-1.5">
            Want to stop subscription? Downgrade to the Free plan above anytime.
            Your premium benefits remain active until the end of the current billing month.
          </p>
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
    </div>
  );
}
