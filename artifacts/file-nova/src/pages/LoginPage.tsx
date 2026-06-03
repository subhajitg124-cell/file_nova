import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import {
  ChevronLeft, Sparkles, Mail, Phone, Lock, User,
  ArrowRight, Loader, ShieldCheck, Zap, Files
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

type AuthTab = "login" | "signup";

export default function LoginPage() {
  const { login, signup, loginWithGoogle, loading, error, clearError, user } = useAuthStore();
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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (user) {
      setLocation(new URLSearchParams(window.location.search).get("redirect") || "/dashboard");
    }
  }, [user, setLocation]);

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
    setLocation("/dashboard");
  };

const isNetworkError = (err: string): boolean => {
  const msg = err.toLowerCase();
  return msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch") || msg.includes("connect") || msg.includes("timeout");
};

const isValidationError = (err: string): boolean => {
  const msg = err.toLowerCase();
  return msg.includes("empty response") || msg.includes("invalid") || msg.includes("unexpected end of json");
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
    } else if (isNetworkError(useAuthStore.getState().error || "")) {
      const currentRetry = retryCount;
      setRetryCount(currentRetry + 1);
      if (currentRetry < 2) {
        toast.info("Connection issue detected, please try again.");
      }
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
    } else if (isNetworkError(useAuthStore.getState().error || "")) {
      const currentRetry = retryCount;
      setRetryCount(currentRetry + 1);
      if (currentRetry < 2) {
        toast.info("Connection issue detected, please try again.");
      }
    }
  };

  const getFriendlyErrorMessage = (err: string | null) => {
    if (!err) return "";
    const msg = err.toLowerCase();
    if (msg.includes("password") || msg.includes("incorrect")) {
      return "Incorrect password. Please try again.";
    }
    if (msg.includes("no account") || msg.includes("user not found") || msg.includes("not found") || msg.includes("invalid email/phone") || msg.includes("email or phone number or password")) {
      return "No account found with this email or phone number.";
    }
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch") || msg.includes("connect") || msg.includes("timeout")) {
      return "Connection failed. Please check your internet and try again.";
    }
    if (msg.includes("empty response") || msg.includes("invalid") || msg.includes("unexpected")) {
      return "Server error. Please try again in a moment.";
    }
    return err;
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasGoogleClientId = googleClientId && googleClientId !== "your_google_client_id" && googleClientId !== "";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:grid md:grid-cols-12 overflow-hidden bg-mesh relative">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/65 backdrop-blur-md px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all hover:scale-105">
          <ChevronLeft className="h-4 w-4" />
          Back Home
        </Link>
      </div>

      <div className="hidden md:flex md:col-span-5 lg:col-span-4 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950/90 border-r border-border p-12 flex-col justify-between relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <img src="/logo.png" alt="FileNova logo" className="h-6 w-auto" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white">FileNova AI</span>
            <span className="block text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Premium Workspace</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8 my-auto">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Secure Document Engine
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              One account. <br />Infinite file utilities.
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[280px]">
              Access custom Indian government templates, high-speed compressions, automated PDF conversions, and OCR tooling inside a single desk.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { icon: ShieldCheck, title: "Zero-Log Encryption", desc: "Documents are auto-deleted and never stored on persistent storage.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { icon: Zap, title: "Elite Speed-Lane", desc: "High priority rendering and OCR models for premium tiers.", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { icon: Files, title: "Unified Form Desk", desc: "Resize photos, mask Aadhaar numbers, and generate certificates.", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-slate-500 font-semibold tracking-wider">
          FILENOVA SECURE SYSTEM - © {new Date().getFullYear()}
        </div>
      </div>

      <div className="flex-1 md:col-span-7 lg:col-span-8 flex flex-col justify-center items-center p-6 md:p-12 min-h-screen relative z-10">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl shadow-premium p-8 relative animate-scale-in">
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <img src="/logo.png" alt="FileNova logo" className="h-5 w-auto" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">FileNova AI</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {activeTab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTab === "login" ? "Use Google or enter your credentials to log in." : "Register for free to configure workspaces and remove daily limit gates."}
            </p>
          </div>

          <div className="flex border border-border/60 bg-muted/40 p-1 rounded-xl mb-6">
            <button onClick={() => handleTabChange("login")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${activeTab === "login" ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`}>
              Sign In
            </button>
            <button onClick={() => handleTabChange("signup")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${activeTab === "signup" ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`}>
              Create Account
            </button>
          </div>

          <div className="space-y-4">
            {hasGoogleClientId && (
              <>
                <div className="flex justify-center rounded-xl bg-white p-1 shadow-sm">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google sign in was cancelled or failed.")}
                    text="continue_with"
                    shape="rectangular"
                    width="380"
                  />
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border/80" />
                  <span className="flex-shrink mx-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">or continue with email</span>
                  <div className="flex-grow border-t border-border/80" />
                </div>
              </>
            )}

            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Email or Phone Number"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      setEmailError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                  />
                </div>
                {emailError && <p className="text-xs font-bold text-destructive px-1">{emailError}</p>}

                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                  />
                </div>
                {passwordError && <p className="text-xs font-bold text-destructive px-1">{passwordError}</p>}

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => toast.info("Please contact support@filenova.in")}
                    className="text-xs text-primary hover:underline font-bold bg-transparent border-0 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && <p className="text-xs font-bold text-destructive px-1">{getFriendlyErrorMessage(error)}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader className="h-4 w-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      setEmailError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                  />
                </div>
                {emailError && <p className="text-xs font-bold text-destructive px-1">{emailError}</p>}

                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="Phone (e.g. 9876543210)"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Password (min 8 characters)"
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                  />
                </div>
                {passwordError && <p className="text-xs font-bold text-destructive px-1">{passwordError}</p>}

                {error && <p className="text-xs font-bold text-destructive px-1">{getFriendlyErrorMessage(error)}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader className="h-4 w-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
