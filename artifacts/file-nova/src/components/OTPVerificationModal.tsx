import React, { useState, useEffect, useRef } from "react";
import { X, Smartphone, Mail, Loader2, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type VerificationType = "mobile" | "email";
type Step = "select_method" | "enter_target" | "enter_otp" | "success";

export function OTPVerificationModal({ isOpen, onClose, onSuccess }: OTPVerificationModalProps) {
  const { user, sendOtpCode, verifyUserAccount, loading } = useAuthStore();
  
  const [step, setStep] = useState<Step>("select_method");
  const [type, setType] = useState<VerificationType>("email");
  const [target, setTarget] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Cooldown timer for OTP resending
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle auto-focus on first OTP input
  useEffect(() => {
    if (step === "enter_otp") {
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [step]);

  if (!isOpen || !user) return null;

  const handleSelectMethod = (selectedType: VerificationType) => {
    setType(selectedType);
    if (selectedType === "email") {
      setTarget(user.email);
      setStep("enter_target");
    } else {
      setTarget(user.phoneNumber || "");
      setStep("enter_target");
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!target.trim()) {
      toast.error(type === "mobile" ? "Phone number is required." : "Email address is required.");
      return;
    }

    if (type === "mobile" && !/^\+?[0-9]{10,15}$/.test(target.replace(/\s/g, ""))) {
      toast.error("Please enter a valid phone number (10-15 digits).");
      return;
    }

    const success = await sendOtpCode(type, target);
    if (success) {
      toast.success(`Verification code sent to your ${type === "mobile" ? "phone" : "email"}.`);
      setResendCooldown(30);
      setStep("enter_otp");
      setOtp(Array(4).fill(""));
    } else {
      toast.error("Failed to send OTP code. Please try again.");
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next box if value is entered
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-verify if 4th digit is entered
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 4) {
      triggerVerification(fullOtp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Focus previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const triggerVerification = async (code: string) => {
    const success = await verifyUserAccount(type, target, code);
    if (success) {
      setStep("success");
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 1500);
    } else {
      toast.error("Incorrect verification code. Try '1234' for testing.");
      setOtp(Array(4).fill(""));
      inputRefs[0].current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-sm rounded-3xl border border-zinc-800 bg-[#0f0f12] text-zinc-100 p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {step !== "success" && (
          <button
            onClick={onClose}
            title="Close verification dialog"
            aria-label="Close verification dialog"
            className="absolute top-4 right-4 h-8 w-8 rounded-full border border-zinc-800 hover:bg-zinc-900 flex items-center justify-center transition cursor-pointer text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === "select_method" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 pt-2"
            >
              <div className="text-center space-y-1.5">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Security Verification</h3>
                <p className="text-xs text-zinc-400">
                  Verify your account to protect your billing profile and enable checkouts.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleSelectMethod("email")}
                  className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-left transition cursor-pointer group"
                >
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-700 transition">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">Verify with Email</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">We'll send code to {user.email.replace(/(.{3})(.*)(@.*)/, "$1***$3")}</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMethod("mobile")}
                  className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-left transition cursor-pointer group"
                >
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-700 transition">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">Verify with Phone Number</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {user.phoneNumber 
                        ? `We'll send SMS to +91 ******${user.phoneNumber.slice(-4)}` 
                        : "Enter a mobile number to verify"}
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === "enter_target" && (
            <motion.div
              key="target"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-5 pt-2"
            >
              <div className="text-left space-y-1">
                <h3 className="text-base font-black">
                  {type === "mobile" ? "Enter Phone Number" : "Verify Email"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {type === "mobile" 
                    ? "Enter your 10-digit mobile number to receive verification code."
                    : "Confirm your email address to send the verification code."}
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                {type === "mobile" ? (
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                    <label htmlFor="phone-input" className="sr-only">Phone Number</label>
                    <input
                      type="tel"
                      id="phone-input"
                      placeholder="e.g. 9876543210"
                      value={target}
                      onChange={(e) => setTarget(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                      required
                      aria-label="Phone Number"
                      title="Phone Number"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                    <label htmlFor="email-input" className="sr-only">Email Address</label>
                    <input
                      type="email"
                      id="email-input"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs font-semibold outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700"
                      disabled={true} // Email is prefilled from logged-in profile
                      aria-label="Email Address"
                      title="Email Address"
                      placeholder="yourname@gmail.com"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("select_method")}
                    className="flex-1 py-3 border border-zinc-800 bg-transparent hover:bg-zinc-900 rounded-xl text-xs font-bold transition cursor-pointer text-zinc-400"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-black text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Get Code</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === "enter_otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 pt-2 text-center"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-tight text-white">Let's verify your {type === "mobile" ? "number" : "email"}</h3>
                <p className="text-xs text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                  We've sent a 4-digit code to your {type === "mobile" ? "phone" : "email"}.<br />
                  It'll auto-verify once entered.
                </p>
                <div className="text-[10px] text-zinc-500 font-bold bg-zinc-950 border border-zinc-800 inline-block px-2.5 py-1 rounded-md mt-1">
                  Testing Code: <span className="text-orange-500 font-extrabold font-mono">1234</span>
                </div>
              </div>

              {/* 4 Digit Boxes */}
              <div className="flex justify-center gap-3 my-2">
                {otp.map((digit, index) => (
                  <div key={index} className="relative">
                    <label htmlFor={`otp-input-${index}`} className="sr-only">{`OTP Digit ${index + 1}`}</label>
                    <input
                      id={`otp-input-${index}`}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-600/30 text-center text-xl font-bold outline-none text-white transition-all duration-200"
                      aria-label={`OTP Digit ${index + 1}`}
                      title={`OTP Digit ${index + 1}`}
                      placeholder="-"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-400">
                  Didn't receive the code?{" "}
                  {resendCooldown > 0 ? (
                    <span className="text-zinc-500 font-bold">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      onClick={() => handleSendOtp()}
                      className="text-orange-500 hover:text-orange-400 font-black cursor-pointer bg-transparent border-none outline-none inline underline underline-offset-2"
                    >
                      Resend
                    </button>
                  )}
                </p>

                <button
                  onClick={() => setStep("enter_target")}
                  className="text-xs text-zinc-500 hover:text-zinc-300 font-bold underline cursor-pointer bg-transparent"
                >
                  Change {type === "mobile" ? "phone number" : "email address"}
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Verification Complete</h3>
                <p className="text-xs text-zinc-400">Account verified successfully! Proceeding to checkout...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
