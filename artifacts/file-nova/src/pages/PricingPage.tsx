/**
 * PricingPage Component
 * Displays available subscription tiers (Free, Basic, Pro, Elite) and manages checkout.
 */

import React from "react";
import { Link } from "wouter";
import { ChevronLeft, Sparkles, CheckCircle2, ShieldCheck, Zap, Loader, Copy, QrCode, Upload, Check, X } from "lucide-react";
import { useSubscription, type PremiumTier, isTestingPeriodActive } from "@/hooks/useSubscription";
import { TestingNotice } from "@/components/TestingNotice";
import { useAdmin } from "@/lib/admin";
import { useAuthStore } from "@/store/useAuthStore";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { AuthModal } from "@/components/AuthModal";
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
      className={`rounded-3xl border p-6 flex flex-col relative transition-all duration-300 ${
        isPopular
          ? "border-primary bg-primary/5 shadow-premium scale-105 z-10 hover:scale-[1.07]"
          : "border-border bg-card/60 hover:-translate-y-1 hover:border-primary/30 shadow-sm"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-glow">
          <Sparkles className="h-3 w-3 text-amber-300" />
          Most Popular
        </span>
      )}

      {/* Plan Header */}
      <div className="mb-5">
        <h3 className="text-xl font-black text-foreground">{title}</h3>
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
      <ul className="space-y-3 mb-8 flex-1 border-t border-border pt-5">
        {features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
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
  const [open, setOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [utrId, setUtrId] = React.useState("");
  const [email, setEmail] = React.useState(userEmail || "");
  const [screenshotName, setScreenshotName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const upiId = FILENOVA_UPI_ID;

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
      toast.error(err.message || "Could not submit payment verification.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-3 px-3 rounded-xl text-sm font-black text-primary hover:bg-indigo-500/10 transition flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/20 bg-indigo-500/5"
      >
        <QrCode className="h-4 w-4" />
        Pay via UPI
      </button>

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
        "filenova.in text watermark on output",
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
      setAppliedDiscount(0);
      setCouponError("Failed to validate coupon code.");
      setCouponSuccess("");
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

    const couponDiscount = getDynamicCouponDiscount(plan, couponCode);
    const activeCoupon = couponDiscount > 0 ? couponCode.trim().toUpperCase() : undefined;
    
    startCheckout(plan, activeCoupon);
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
        <div className="text-center max-w-2xl mx-auto space-y-4">
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
        </div>

        {/* Coupon Input Box */}
        <div className="max-w-md mx-auto bg-card/60 backdrop-blur-md rounded-2xl border border-border p-4 shadow-sm flex flex-col gap-2.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Have a coupon code?</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. STUDENT20, CYBER50, FIRST30"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary uppercase"
            />
            <button
              onClick={handleValidateCoupon}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-glow hover:opacity-90 transition cursor-pointer"
            >
              Apply
            </button>
          </div>
          {couponError && <p className="text-xs font-bold text-red-500">{couponError}</p>}
          {couponSuccess && <p className="text-xs font-bold text-emerald-500">{couponSuccess}</p>}
        </div>

        {/* Plan Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-4 max-w-6xl mx-auto">
          {plans.map((p) => (
            <PlanCard
              key={p.id}
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
          ))}
        </div>

        {/* Cancellation policy footer */}
        <div className="max-w-2xl mx-auto text-center text-xs text-muted-foreground border-t border-border pt-8 mt-6">
          <p>Payments are managed securely by Razorpay. Price contains all GST fees.</p>
          <p className="mt-1.5">
            Want to stop subscription? Downgrade to the Free plan above anytime.
            Your premium benefits remain active until the end of the current billing month.
          </p>
        </div>
      </main>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
