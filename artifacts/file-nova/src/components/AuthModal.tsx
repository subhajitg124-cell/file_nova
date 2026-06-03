import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { X, Sparkles, Mail, Phone, Lock, User, ArrowRight, Loader, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthTab = "login" | "signup";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login, signup, loginWithGoogle, loading, error, clearError, loginModalMessage } = useAuthStore();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    clearErrors();
    onClose();
  };

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
    clearError();
  };

  const handleTabChange = (tab: AuthTab) => {
    if (tab === "login") {
      if (signupEmail) {
        setLoginIdentifier(signupEmail);
      } else if (signupPhone) {
        setLoginIdentifier(signupPhone);
      }
    } else {
      if (loginIdentifier) {
        if (loginIdentifier.includes("@")) {
          setSignupEmail(loginIdentifier);
        } else if (/^\d+$/.test(loginIdentifier)) {
          setSignupPhone(loginIdentifier);
        }
      }
    }
    setActiveTab(tab);
    setEmailError("");
    setPasswordError("");
    clearError();
  };

  const finishAuth = (message: string) => {
    toast.success(message);
    handleClose();
    onSuccess?.();
    setLocation("/dashboard");
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("Google did not return a credential.");
      return;
    }

    const success = await loginWithGoogle(response.credential);
    if (success) {
      finishAuth("Signed in with Google.");
    } else {
      toast.error(useAuthStore.getState().error || "Google authentication failed.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    let hasValError = false;

    if (loginIdentifier.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginIdentifier)) {
        setEmailError("Please enter a valid email address.");
        hasValError = true;
      }
    } else if (!loginIdentifier.trim()) {
      setEmailError("Email or Phone Number is required.");
      hasValError = true;
    }

    if (!loginPassword) {
      setPasswordError("Password is required.");
      hasValError = true;
    } else if (loginPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasValError = true;
    }

    if (hasValError) return;

    const success = await login(loginIdentifier, loginPassword);
    if (success) {
      finishAuth("Successfully logged in!");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    let hasValError = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!signupEmail) {
      setEmailError("Email is required.");
      hasValError = true;
    } else if (!emailRegex.test(signupEmail)) {
      setEmailError("Please enter a valid email address.");
      hasValError = true;
    }

    if (!signupPassword) {
      setPasswordError("Password is required.");
      hasValError = true;
    } else if (signupPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasValError = true;
    }

    if (hasValError) return;

    const success = await signup(signupEmail, signupPhone || null, signupPassword, signupName || null);
    if (success) {
      finishAuth("Account created successfully!");
    }
  };

  const getFriendlyErrorMessage = (err: string | null) => {
    if (!err) return "";
    const msg = err.toLowerCase();
    if (msg.includes("password") || msg.includes("incorrect")) {
      return "Incorrect password. Please try again.";
    }
    if (msg.includes("no account") || msg.includes("user not found") || msg.includes("not found")) {
      return "No account found with this email.";
    }
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch") || msg.includes("connect")) {
      return "Connection failed. Please check your internet.";
    }
    return err;
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasGoogleClientId = googleClientId && googleClientId !== "your_google_client_id" && googleClientId !== "";

  return (
    <>
      {/* Backdrop overlay */}
      <div className="auth-modal-overlay" onClick={handleClose} />

      {/* Centered / bottom sheet content */}
      <div
        className="auth-modal-content w-[calc(100vw-2rem)] sm:w-[90vw] sm:max-w-md bg-card border border-border rounded-2xl sm:rounded-3xl shadow-premium max-h-[85vh] sm:max-h-[92vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          title="Close dialog"
          aria-label="Close dialog"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground h-10 w-10 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-background/50 hover:bg-background border border-border transition z-10 cursor-pointer"
        >
          <X className="h-5 w-5 sm:h-4 sm:w-4" />
        </button>

        <div className="bg-gradient-to-r from-primary via-indigo-650 to-indigo-550 p-6 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 mb-3">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Welcome to FileNova</h2>
            <Link href="/login" onClick={handleClose} className="text-[10px] text-indigo-200 hover:text-white flex items-center gap-1 font-bold underline transition">
              <span>Full screen</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>
          <p className="text-xs text-white/80 mt-1.5 leading-4">
            {loginModalMessage || "Sign in to configure your workspaces, secure your documents, and manage premium subscriptions."}
          </p>
        </div>

        <div className="flex border border-border/80 bg-muted/40 p-1 m-4 rounded-xl">
          <button
            onClick={() => handleTabChange("login")}
            className={`flex-grow py-3 text-xs font-bold rounded-lg transition cursor-pointer min-h-[44px] ${activeTab === "login" ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange("signup")}
            className={`flex-grow py-3 text-xs font-bold rounded-lg transition cursor-pointer min-h-[44px] ${activeTab === "signup" ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
          >
            Create Account
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {hasGoogleClientId && (
            <>
              <div className="flex justify-center rounded-xl bg-white p-1 shadow-sm">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google sign in was cancelled or failed.")}
                  text="continue_with"
                  shape="rectangular"
                  width="360"
                />
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border/80" />
                <span className="flex-shrink mx-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">or continue with email</span>
                <div className="flex-grow border-t border-border/80" />
              </div>
            </>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Email or Phone Number"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    setEmailError("");
                  }}
                  autoComplete="username"
                  className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
              {emailError && <p className="text-xs font-bold text-destructive px-1">{emailError}</p>}

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setPasswordError("");
                  }}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none min-h-[44px]"
                />
              </div>
              {passwordError && <p className="text-xs font-bold text-destructive px-1">{passwordError}</p>}

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => toast.info("Please contact support@filenova.in")}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>

              {error && <p className="text-xs font-bold text-destructive px-1">{getFriendlyErrorMessage(error)}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  autoComplete="name"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    setEmailError("");
                  }}
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                />
              </div>
              {emailError && <p className="text-xs font-bold text-destructive px-1">{emailError}</p>}

              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Phone Number (e.g. 9876543210)"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  autoComplete="tel"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password (min 8 characters)"
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    setPasswordError("");
                  }}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                />
              </div>
              {passwordError && <p className="text-xs font-bold text-destructive px-1">{passwordError}</p>}

              {error && <p className="text-xs font-bold text-destructive px-1">{getFriendlyErrorMessage(error)}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
