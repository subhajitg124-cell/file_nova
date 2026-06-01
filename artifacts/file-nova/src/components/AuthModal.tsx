import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Sparkles, Mail, Phone, Lock, User, ArrowRight, Loader, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

// Standard JWT decoder helper
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthTab = "login" | "signup";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login, signup, loginWithGoogle, loading, error, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  
  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form states
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Sandbox simulation states
  const [showGoogleSim, setShowGoogleSim] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("john.doe@gmail.com");
  const [googleName, setGoogleName] = useState("John Doe");

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "1022082801397971-mockclientid.apps.googleusercontent.com";

  // Load Google Identity Services dynamically (backup mechanism)
  useEffect(() => {
    if (!isOpen) return;
    const scriptId = "google-gsi-client-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  // Initialize and Render the Google Identity Services button
  useEffect(() => {
    if (!isOpen) return;

    const initGoogle = () => {
      const g = (window as any).google;
      if (!g || !g.accounts) return;

      try {
        g.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnElement = document.getElementById("google-login-btn-modal");
        if (btnElement) {
          g.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "large",
            width: btnElement.clientWidth || 350,
            text: "continue_with",
            shape: "rectangular",
          });
        }
      } catch (err) {
        console.error("Google GSI initialization failed:", err);
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, showGoogleSim, googleClientId]);

  if (!isOpen) return null;

  const handleClose = () => {
    clearError();
    onClose();
  };

  const handleGoogleCallback = async (response: any) => {
    const token = response.credential;
    try {
      const payload = decodeJwt(token);
      if (payload && payload.email) {
        const { email, name, sub } = payload;
        const success = await loginWithGoogle(email, name || "Google User", sub);
        if (success) {
          toast.success(`Logged in as ${name || email}`);
          handleClose();
          if (onSuccess) onSuccess();
        } else {
          toast.error("Google authentication failed.");
        }
      } else {
        toast.error("Failed to parse Google profile credentials.");
      }
    } catch (err) {
      console.error("Google GSI callback parsing error:", err);
      toast.error("Google OAuth token processing failed.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      toast.error("Please enter both credentials.");
      return;
    }
    const success = await login(loginIdentifier, loginPassword);
    if (success) {
      toast.success("Successfully logged in!");
      handleClose();
      if (onSuccess) onSuccess();
    } else {
      toast.error(useAuthStore.getState().error || "Failed to log in.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword) {
      toast.error("Email and Password are required.");
      return;
    }
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    const success = await signup(
      signupEmail,
      signupPhone || null,
      signupPassword,
      signupName || null
    );
    if (success) {
      toast.success("Account created successfully!");
      // Automatically log them in after signup
      const loggedIn = await login(signupEmail, signupPassword);
      if (loggedIn) {
        handleClose();
        if (onSuccess) onSuccess();
      }
    } else {
      toast.error(useAuthStore.getState().error || "Failed to sign up.");
    }
  };

  const handleGoogleSimulate = async () => {
    if (!googleEmail) {
      toast.error("Email is required for Google login.");
      return;
    }
    const sub = `google_sub_${googleEmail.replace(/[^a-zA-Z0-9]/g, "")}`;
    const success = await loginWithGoogle(googleEmail, googleName || "Google User", sub);
    if (success) {
      toast.success(`Logged in as ${googleName} (Google Sandbox)`);
      setShowGoogleSim(false);
      handleClose();
      if (onSuccess) onSuccess();
    } else {
      toast.error(useAuthStore.getState().error || "Google login failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-end justify-center overflow-y-auto z-50 p-0 sm:p-4 md:items-center md:p-6 md:py-[10vh] animate-fade-in">
      <div 
        className="bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-premium max-w-md w-full max-h-[92dvh] md:max-h-[80vh] overflow-y-auto animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          title="Close dialog"
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground h-8 w-8 flex items-center justify-center rounded-full bg-background/50 hover:bg-background border border-border transition z-10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary via-indigo-650 to-indigo-550 p-6 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 mb-3">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Welcome to FileNova</h2>
            <Link 
              href="/login" 
              onClick={handleClose}
              className="text-[10px] text-indigo-200 hover:text-white flex items-center gap-1 font-bold underline transition"
            >
              <span>Full screen</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>
          <p className="text-xs text-white/80 mt-1.5 leading-4">
            Sign in to configure your workspaces, secure your documents, and manage premium subscriptions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border border-border/80 bg-muted/40 p-1 m-4 rounded-xl">
          <button
            onClick={() => { setActiveTab("login"); clearError(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === "login" ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab("signup"); clearError(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === "signup" ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
          >
            Create Account
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {showGoogleSim ? (
            <div className="space-y-4 py-1 animate-fade-in text-foreground">
              <div className="text-center font-sans">
                <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-2">
                  Sandbox Active
                </div>
                <h3 className="text-sm font-bold text-foreground">Choose a mock account</h3>
                <p className="text-[10px] text-muted-foreground">Select a test profile to verify authentication flows offline.</p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground">Connecting to Google services…</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Account List */}
                  <div className="border border-border rounded-xl divide-y divide-border overflow-hidden bg-background/50">
                    <button
                      onClick={async () => {
                        const email = "priya.sharma99@gmail.com";
                        const name = "Priya Sharma";
                        const success = await loginWithGoogle(email, name, "google_sub_priya99");
                        if (success) {
                          toast.success(`Logged in as Priya Sharma`);
                          setShowGoogleSim(false);
                          handleClose();
                          if (onSuccess) onSuccess();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted text-left transition"
                    >
                      <div className="h-7 w-7 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-650 dark:text-pink-300 font-bold text-[10px] flex items-center justify-center border border-pink-200">
                        PS
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground leading-none">Priya Sharma</p>
                        <p className="text-[9px] text-muted-foreground truncate mt-0.5">priya.sharma99@gmail.com</p>
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-md">Candidate</span>
                    </button>

                    <button
                      onClick={async () => {
                        const email = "rahul.csc.cafe@gmail.com";
                        const name = "Rahul Das (CSC Portal)";
                        const success = await loginWithGoogle(email, name, "google_sub_rahul_csc");
                        if (success) {
                          toast.success(`Logged in as Rahul Das`);
                          setShowGoogleSim(false);
                          handleClose();
                          if (onSuccess) onSuccess();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted text-left transition"
                    >
                      <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-650 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center border border-emerald-200">
                        RD
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground leading-none">Rahul Das</p>
                        <p className="text-[9px] text-muted-foreground truncate mt-0.5">rahul.csc.cafe@gmail.com</p>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-505/20 px-1.5 py-0.5 rounded-md">CSC Operator</span>
                    </button>

                    <button
                      onClick={async () => {
                        const email = "subhajitgho123@gmail.com";
                        const name = "Subhajit Ghosh";
                        const success = await loginWithGoogle(email, name, "google_sub_subhajitgho123");
                        if (success) {
                          toast.success(`Logged in as Subhajit Ghosh`);
                          setShowGoogleSim(false);
                          handleClose();
                          if (onSuccess) onSuccess();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted text-left transition"
                    >
                      <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center border border-indigo-200">
                        SG
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground leading-none">Subhajit Ghosh</p>
                        <p className="text-[9px] text-muted-foreground truncate mt-0.5">subhajitgho123@gmail.com</p>
                      </div>
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-550/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">Developer</span>
                    </button>
                  </div>

                  {/* Manual simulation block */}
                  <div className="pt-2.5 border-t border-border mt-3">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Or custom credentials</p>
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={googleName}
                          onChange={(e) => setGoogleName(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="Google Email"
                          value={googleEmail}
                          onChange={(e) => setGoogleEmail(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-primary focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleGoogleSimulate}
                        className="w-full py-2 text-xs font-black bg-primary text-primary-foreground rounded-lg shadow-sm hover:opacity-90 transition mt-1 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Authorize Sandbox Account
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowGoogleSim(false)}
                      className="w-full py-2.5 text-xs font-bold rounded-xl border border-border hover:bg-muted transition text-center"
                    >
                      Back to Classic Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {activeTab === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Email or Phone Number"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-bold text-destructive px-1">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div className="space-y-2.5">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="Phone Number (e.g. 9876543210)"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="Password (min 6 characters)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-bold text-destructive px-1">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {loading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border/80"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">or continue with</span>
                <div className="flex-grow border-t border-border/80"></div>
              </div>

              {/* Google OAuth & Sandbox */}
              <div className="w-full flex flex-col gap-3">
                {/* Native GSI Button target */}
                <div id="google-login-btn-modal" className="w-full min-h-[44px] flex justify-center"></div>

                <button
                  type="button"
                  onClick={() => setShowGoogleSim(true)}
                  className="w-full text-center py-2.5 text-[9px] font-bold text-primary hover:text-indigo-400 transition tracking-wide uppercase"
                >
                  🛠️ Developer Sandbox Simulator
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
