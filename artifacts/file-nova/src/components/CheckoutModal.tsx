import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCheckoutStore, PlanType } from "@/store/useCheckoutStore";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient, apiMock, HAS_BACKEND } from "@/lib/api";
import { FILENOVA_UPI_ID, FILENOVA_PAYEE_NAME, createUpiQrUrl } from "@/lib/upi";
import { toast } from "sonner";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Loader,
  Copy,
  Check,
  X,
  CreditCard,
  QrCode,
  Gift,
} from "lucide-react";

const PLAN_DETAILS: Record<PlanType, {
  name: string;
  price: number; // in INR
  period: string;
  description: string;
  features: string[];
}> = {
  pass_24h: {
    name: "24h Pass",
    price: 19,
    period: "24 hours",
    description: "Perfect for quick one-off document edits and tasks",
    features: [
      "Access to all Premium Tools",
      "Increased file upload limits (15MB)",
      "Ad-free premium experience",
    ],
  },
  pass_7d: {
    name: "7-Day Pass",
    price: 39,
    period: "7 days",
    description: "Great for week-long exam prep, projects, or operators",
    features: [
      "Access to all Premium Tools",
      "Increased file upload limits (15MB)",
      "High priority document processing",
      "Ad-free premium experience",
    ],
  },
  basic: {
    name: "Basic Plan",
    price: 49,
    period: "month",
    description: "Essential limits for students and light operators",
    features: [
      "20 files/day limit",
      "15MB file upload limit",
      "Standard PDF & Image tools",
      "Ad-free experience",
    ],
  },
  pro: {
    name: "Pro Plan",
    price: 99,
    period: "month",
    description: "Unlimited local tools, larger files, and priority support",
    features: [
      "Unlimited file processing",
      "50MB file upload limit",
      "Bulk processing (up to 10 files)",
      "Priority customer support",
      "Zero ads",
    ],
  },
  elite: {
    name: "Elite Plan",
    price: 199,
    period: "month",
    description: "Ultimate power-user plan for heavy cyber cafes and operators",
    features: [
      "Unlimited file processing",
      "100MB file upload limit",
      "Bulk processing (up to 20 files)",
      "24/7 dedicated call support",
      "Early beta access to new tools",
    ],
  },
};

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function CheckoutModal() {
  const { isOpen, selectedPlan, coupon, closeCheckout, setCoupon } = useCheckoutStore();
  const { user, fetchMe, openLoginModal } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [couponCode, setCouponCode] = useState(coupon);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // UPI payment state
  const [utrId, setUtrId] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittingUpi, setSubmittingUpi] = useState(false);
  const [upiSubmitted, setUpiSubmitted] = useState(false);

  // General state
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (selectedPlan) {
      setCouponCode(coupon);
      setDiscountPercent(0);
      setCouponMessage("");
      setIsCouponValid(false);
      setUtrId("");
      setUpiSubmitted(false);
      setPaymentMethod("card");
    }
  }, [selectedPlan, coupon]);

  if (!selectedPlan) return null;

  const planInfo = PLAN_DETAILS[selectedPlan];
  const originalPrice = planInfo.price;
  const discountedPrice = Math.max(0, Math.round(originalPrice * (1 - discountPercent / 100)));
  const savings = originalPrice - discountedPrice;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const client = HAS_BACKEND ? apiClient : apiMock;
      const res = await client.validateCoupon(couponCode, selectedPlan);
      if (res.valid) {
        setDiscountPercent(res.discountPercentage);
        setCouponMessage(res.message || "Coupon applied successfully!");
        setIsCouponValid(true);
      } else {
        setDiscountPercent(0);
        setCouponMessage(res.message || "Invalid coupon code.");
        setIsCouponValid(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Coupon verification failed.");
      setDiscountPercent(0);
      setCouponMessage("Verification error.");
      setIsCouponValid(false);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(FILENOVA_UPI_ID);
      setCopiedUpi(true);
      toast.success("UPI ID copied to clipboard.");
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      toast.error("Failed to copy UPI ID.");
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!user) {
      toast.error("Please sign in first to upgrade.");
      closeCheckout();
      openLoginModal();
      return;
    }

    setProcessing(true);
    try {
      const client = HAS_BACKEND ? apiClient : apiMock;
      const amountInPaise = discountedPrice * 100;

      // 1. Create order on backend
      const order = await client.createSubscriptionOrder(
        selectedPlan,
        isCouponValid ? couponCode : undefined
      );

      // 2. If backend is mock or order runs in mock mode
      if (order.isMock || !HAS_BACKEND) {
        toast.info("Processing test mock payment...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const verify = await client.verifySubscriptionPayment({
          razorpay_order_id: order.orderId || "mock_order",
          razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
          plan: selectedPlan,
        });

        if (verify.success) {
          toast.success("🎉 Upgrade Successful! Welcome to Premium.");
          await fetchMe();
          closeCheckout();
        } else {
          toast.error("Mock verification failed.");
        }
        return;
      }

      // 3. Load Razorpay script for live checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay checkout script.");
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "FileNova Premium",
        description: `Upgrade to ${planInfo.name}`,
        order_id: order.orderId,
        handler: async (response: any) => {
          setProcessing(true);
          try {
            const verify = await client.verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
            });

            if (verify.success) {
              toast.success("🎉 Payment verified successfully! Enjoy Premium.");
              await fetchMe();
              closeCheckout();
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err: any) {
            toast.error(err.message || "Failed to verify signature.");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay checkout flow failed:", err);
      toast.error(err.message || "Failed to start checkout. Please try UPI instead.");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first to submit payment.");
      return;
    }
    if (!/^\d{12}$/.test(utrId)) {
      toast.error("Please enter a valid 12-digit UTR/Transaction ID.");
      return;
    }

    setSubmittingUpi(true);
    try {
      const client = HAS_BACKEND ? apiClient : apiMock;
      await client.submitUpiPayment({
        utrId,
        email: user.email,
        plan: selectedPlan,
        amount: discountedPrice,
      });

      setUpiSubmitted(true);
      toast.success("UTR submitted! Your upgrade is pending verification.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit UPI transaction verification.");
    } finally {
      setSubmittingUpi(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCheckout()}>
      <DialogContent className="max-w-2xl bg-background border border-border rounded-xl overflow-hidden p-0 shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">
        {/* Plan Info Panel */}
        <div className="w-full md:w-5/12 bg-muted/30 p-6 border-b md:border-b-0 md:border-r border-border flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Zap className="h-5 w-5 fill-indigo-500/10" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">
              Upgrade
            </span>
          </div>

          <DialogTitle className="text-2xl font-black tracking-tight mb-2 text-foreground">
            {planInfo.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mb-4">
            {planInfo.description}
          </DialogDescription>

          <div className="flex items-baseline gap-1 mb-5">
            <span className="text-3xl font-black text-foreground">
              ₹{discountedPrice}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              /{planInfo.period}
            </span>
            {savings > 0 && (
              <span className="ml-2 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                Save ₹{savings}
              </span>
            )}
          </div>

          <div className="border-t border-border pt-4 flex-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground block mb-2.5">
              Features Included:
            </span>
            <ul className="space-y-3">
              {planInfo.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border pt-3">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Secure SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Checkout Forms Panel */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg mb-5 border border-border">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === "card"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Online Checkout
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === "upi"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                Manual UPI QR
              </button>
            </div>

            {/* Coupon Code Section */}
            {!upiSubmitted && (
              <div className="mb-5 bg-muted/40 p-3 rounded-lg border border-border">
                <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block mb-1.5">
                  Have a Promo / Referral Coupon?
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-background border border-border rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-foreground font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                  >
                    {validatingCoupon && <Loader className="h-3 w-3 animate-spin" />}
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <span
                    className={`text-[10px] font-bold mt-1.5 block ${
                      isCouponValid ? "text-green-500" : "text-destructive"
                    }`}
                  >
                    {couponMessage}
                  </span>
                )}
              </div>
            )}

            {/* Payment Content */}
            {paymentMethod === "card" ? (
              <div className="space-y-4">
                <div className="text-center py-6 px-4 border border-dashed border-border rounded-lg bg-muted/10">
                  <span className="p-3 rounded-full bg-indigo-500/10 text-indigo-500 inline-block mb-3">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    Razorpay Checkout Integration
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Pay securely using Google Pay, PhonePe, Cards, Netbanking, or UPI. Upgrades are instant.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRazorpayCheckout}
                  disabled={processing}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Connecting Payment Gateway...
                    </>
                  ) : (
                    `Pay ₹${discountedPrice} via Online Gateway`
                  )}
                </button>
              </div>
            ) : (
              <div>
                {!upiSubmitted ? (
                  <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <div className="flex flex-col items-center gap-4 bg-muted/20 p-4 border border-border rounded-lg">
                      {/* UPI QR Code image */}
                      <img
                        src={createUpiQrUrl(discountedPrice)}
                        alt="UPI Payment QR Code"
                        className="w-36 h-36 border border-border rounded-lg shadow-sm"
                      />
                      <div className="text-center">
                        <span className="text-xs font-bold text-foreground">
                          Scan to pay: ₹{discountedPrice}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Payee: {FILENOVA_PAYEE_NAME}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-muted/30 p-2 border border-border rounded-md text-xs">
                        <span className="text-muted-foreground font-semibold">UPI ID:</span>
                        <div className="flex items-center gap-1.5 font-bold font-mono text-foreground">
                          <span>{FILENOVA_UPI_ID}</span>
                          <button
                            type="button"
                            onClick={copyUpiId}
                            title="Copy UPI ID"
                            aria-label="Copy UPI ID"
                            className="p-1 hover:bg-muted rounded text-muted-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block">
                        Enter 12-Digit UPI UTR / Transaction ID
                      </label>
                      <input
                        type="text"
                        placeholder="12 digit transaction code"
                        value={utrId}
                        onChange={(e) => setUtrId(e.target.value.replace(/\D/g, "").substring(0, 12))}
                        required
                        className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-foreground font-mono font-bold"
                      />
                      <span className="text-[9px] text-muted-foreground block">
                        Verify this on your bank or payment app receipt.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingUpi}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      {submittingUpi ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Submitting UTR Verification...
                        </>
                      ) : (
                        `Confirm Payment of ₹${discountedPrice}`
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <span className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 inline-block mb-3">
                      <Check className="h-8 w-8 stroke-[3]" />
                    </span>
                    <h4 className="text-base font-black text-foreground mb-2">
                      Transaction Submitted!
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
                      Your payment of ₹{discountedPrice} is now under manual verification. Your account tier will be updated automatically within 2 to 4 hours.
                    </p>
                    <button
                      type="button"
                      onClick={closeCheckout}
                      className="py-2 px-6 border border-border text-foreground hover:bg-muted font-bold text-xs rounded-full transition-colors"
                    >
                      Close Checkout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
