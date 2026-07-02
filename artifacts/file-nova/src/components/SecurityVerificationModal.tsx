import React, { useState, useEffect } from "react";
import { X, Mail, Shield, ShieldCheck, CheckCircle, ChevronRight, AlertTriangle, LogIn } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient, BACKEND_URL } from "@/lib/api";

type VerificationStep = "auth-check" | "choose" | "enter-otp" | "verifying" | "verified" | "error" | "session-expired";

interface Props {
  onVerified: (paymentToken: string) => void;
  onClose: () => void;
  planId: string;
  billingCycle: string;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return user.slice(0, 3) + "***@" + domain;
}

export function SecurityVerificationModal({ onVerified, onClose, planId, billingCycle }: Props) {
  const [step, setStep] = useState<VerificationStep>("auth-check");
  const [otp, setOtp] = useState("");
  const [maskedTarget, setMaskedTarget] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("Verifying account...");
  const [resendCooldown, setResendCooldown] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Step 0: Verify the user's session is actually valid on the backend
  useEffect(() => {
    let cancelled = false;
    const verifyAuth = async () => {
      setAuthMessage("Verifying account...");
      const token = localStorage.getItem("filenova_token");
      console.log("[SecurityVerification] Auth check starting", {
        hasUser: !!user,
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 12) + "..." : null,
        planId,
        billingCycle,
      });

      if (!token && !user) {
        console.log("[SecurityVerification] No token and no user — showing session expired");
        if (!cancelled) setStep("session-expired");
        return;
      }

      if (!token) {
        console.log("[SecurityVerification] User object exists but no token — showing session expired");
        if (!cancelled) setStep("session-expired");
        return;
      }

      // For local/mock tokens, skip backend check
      if (token.startsWith("local_")) {
        console.log("[SecurityVerification] Local/mock token detected — skipping backend auth check");
        if (!cancelled) setStep("choose");
        return;
      }

      // Verify token is valid by calling /me
      try {
        const me = await apiClient.request<{ success: boolean; user?: any }>("/api/v1/auth/me", {
          method: "GET",
        }, 10000);
        const isAuthed = me.success && me.user != null;
        console.log("[SecurityVerification] Backend auth check", { success: me.success, hasUser: !!me.user, isAuthed });
        if (!cancelled) {
          if (isAuthed) {
            setStep("choose");
          } else {
            setStep("session-expired");
          }
        }
      } catch (err: any) {
        console.log("[SecurityVerification] Backend auth check FAILED", { message: err.message });
        if (!cancelled) {
          if (err.message.includes("Authentication required") || err.message.includes("log in first") || err.message.includes("401")) {
            setStep("session-expired");
          } else {
            // Non-auth error (network, server down, etc.) — let user try verification anyway
            console.warn("[SecurityVerification] Non-auth error during auth check, proceeding anyway", err.message);
            if (!cancelled) setStep("choose");
          }
        }
      }
    };
    verifyAuth();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.request<any>("/api/otp/send", {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!res.success) {
        setError(res.error || "Failed to send OTP");
        return;
      }

      setMaskedTarget(res.maskedTarget);
      setStep("enter-otp");
      setResendCooldown(60);
    } catch (err: any) {
      handleApiError(err, "Failed to send OTP. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    setStep("verifying");
    setAuthMessage("Verifying code...");
    try {
      const res = await apiClient.request<any>("/api/otp/verify", {
        method: "POST",
        body: JSON.stringify({ code: otp }),
      });

      if (!res.success) {
        setError(res.error || "Verification failed");
        setOtp("");
        setStep("enter-otp");
        return;
      }

      setStep("verified");
      setAuthMessage("Preparing secure checkout...");
      console.log("[SecurityVerification] OTP verification succeeded, payment token received", {
        tokenPrefix: res.paymentToken?.substring(0, 8),
      });
      setTimeout(() => {
        onVerified(res.paymentToken);
      }, 1500);
    } catch (err: any) {
      handleApiError(err, "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTurnstileSuccess = async (token: string) => {
    setLoading(true);
    setError("");
    setStep("verifying");
    setAuthMessage("Verifying account...");
    try {
      console.log("[SecurityVerification] Turnstile succeeded, calling /api/otp/verify-captcha");
      const res = await apiClient.request<any>("/api/otp/verify-captcha", {
        method: "POST",
        body: JSON.stringify({ turnstileToken: token }),
      });

      if (!res.success) {
        setError(res.error || "CAPTCHA verification failed");
        setStep("choose");
        return;
      }

      setStep("verified");
      setAuthMessage("Preparing secure checkout...");
      console.log("[SecurityVerification] CAPTCHA verification succeeded, payment token received", {
        tokenPrefix: res.paymentToken?.substring(0, 8),
      });
      setTimeout(() => {
        setAuthMessage("Opening Razorpay...");
        onVerified(res.paymentToken);
      }, 1500);
    } catch (err: any) {
      handleApiError(err, "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err: any, fallbackMessage: string) => {
    const msg = err.message || fallbackMessage;
    console.log("[SecurityVerification] API error", { message: msg });
    if (msg.includes("Authentication required") || msg.includes("log in first") || msg.includes("401")) {
      setStep("session-expired");
      setError("");
    } else {
      setError(msg);
      if (step === "verifying") setStep("choose");
    }
  };

  useEffect(() => {
    if (otp.length === 6) handleVerifyOTP();
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const handleLoginClick = () => {
    onClose();
    useAuthStore.getState().openLoginModal("Please log in to continue with payment.");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="fn-glass rounded-3xl p-8 max-w-sm w-full relative">
        {step !== "verified" && step !== "auth-check" && step !== "session-expired" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--fn-surface-elevated)] flex items-center justify-center text-[var(--fn-text-secondary)] hover:text-[var(--fn-text-primary)] transition"
          >
            <X size={16} />
          </button>
        )}

        {step === "auth-check" && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-indigo-400 animate-pulse" size={28} />
            </div>
            <h2 className="text-xl font-bold text-center text-[var(--fn-text-primary)] mb-2">Security Verification</h2>
            <p className="text-[var(--fn-text-secondary)] text-sm">{authMessage}</p>
          </div>
        )}

        {step === "session-expired" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-amber-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-center text-[var(--fn-text-primary)] mb-2">Session Expired</h2>
            <p className="text-[var(--fn-text-secondary)] text-sm text-center mb-6">
              Your session has expired. Please log in again to continue with your purchase.
            </p>
            <button
              onClick={handleLoginClick}
              className="w-full bg-indigo-600 text-white rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 transition hover:bg-indigo-500"
            >
              <LogIn size={18} />
              Log In
            </button>
          </>
        )}

        {step === "choose" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-indigo-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-center text-[var(--fn-text-primary)] mb-2">Security Verification</h2>
            <p className="text-[var(--fn-text-secondary)] text-sm text-center mb-6">
              Verify your account to protect your billing profile and enable checkout.
            </p>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full fn-card p-4 flex items-center gap-4 mb-3 hover:border-indigo-500/40 transition-all hover:shadow-[var(--fn-shadow-elevated)]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="text-indigo-400" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--fn-text-primary)] text-sm">Verify with Email</p>
                <p className="text-[var(--fn-text-secondary)] text-xs">Send OTP to {maskEmail(user?.email || "")}</p>
              </div>
              <ChevronRight className="ml-auto text-[var(--fn-text-tertiary)]" size={16} />
            </button>

            <div className="fn-card p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="text-orange-400" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--fn-text-primary)] text-sm">Quick CAPTCHA Verify</p>
                  <p className="text-[var(--fn-text-secondary)] text-xs">One-click verification — no code needed</p>
                </div>
              </div>
              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                onSuccess={handleTurnstileSuccess}
                onError={() => setError("CAPTCHA failed. Please refresh.")}
                onExpire={() => setError("CAPTCHA expired. Please try again.")}
                options={{
                  theme: isDark ? "dark" : "light",
                  size: "flexible",
                  language: "en",
                }}
                className="w-full"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
          </>
        )}

        {step === "enter-otp" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="text-indigo-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-center text-[var(--fn-text-primary)] mb-2">Enter OTP</h2>
            <p className="text-[var(--fn-text-secondary)] text-sm text-center mb-6">
              We sent a 6-digit code to<br />
              <span className="text-[var(--fn-text-primary)] font-medium">{maskedTarget}</span>
            </p>

            <div className="flex gap-2 justify-center mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const newOtp = otp.split("");
                    newOtp[i] = val;
                    setOtp(newOtp.join(""));
                    if (val && i < 5) {
                      document.getElementById(`sv-otp-${i + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                      document.getElementById(`sv-otp-${i - 1}`)?.focus();
                    }
                  }}
                  id={`sv-otp-${i}`}
                  autoFocus={i === 0}
                  className="w-11 h-13 text-center text-xl font-bold bg-[var(--fn-surface-elevated)] rounded-xl border-2 border-[var(--fn-border)] outline-none text-[var(--fn-text-primary)] focus:border-indigo-500 transition-colors"
                />
              ))}
            </div>

            {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

            <button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-indigo-600 text-white rounded-2xl py-3 font-semibold mb-4 disabled:opacity-40 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
              {resendCooldown > 0 ? (
                <p className="text-[var(--fn-text-tertiary)] text-sm">Resend in {resendCooldown}s</p>
              ) : (
                <button
                  onClick={() => {
                    setOtp("");
                    handleSendOTP();
                  }}
                  className="text-indigo-500 text-sm hover:underline"
                >
                  Resend OTP
                </button>
              )}
              <button
                onClick={() => {
                  setStep("choose");
                  setOtp("");
                  setError("");
                }}
                className="block mx-auto mt-2 text-[var(--fn-text-tertiary)] text-xs hover:text-[var(--fn-text-secondary)]"
              >
                Use different method
              </button>
            </div>
          </>
        )}

        {step === "verifying" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShieldCheck className="text-indigo-400" size={36} />
            </div>
            <h2 className="text-xl font-bold text-[var(--fn-text-primary)] mb-2">Verifying</h2>
            <p className="text-[var(--fn-text-secondary)] text-sm">{authMessage}</p>
          </div>
        )}

        {step === "verified" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="text-emerald-400" size={36} />
            </div>
            <h2 className="text-xl font-bold text-[var(--fn-text-primary)] mb-2">Verification Complete</h2>
            <p className="text-[var(--fn-text-secondary)] text-sm">{authMessage}</p>
          </div>
        )}

        {step === "error" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-center text-[var(--fn-text-primary)] mb-2">Verification Failed</h2>
            <p className="text-[var(--fn-text-secondary)] text-sm text-center mb-6">{error}</p>
            <button
              onClick={() => { setStep("choose"); setError(""); }}
              className="w-full bg-indigo-600 text-white rounded-2xl py-3 font-semibold transition hover:bg-indigo-500"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
