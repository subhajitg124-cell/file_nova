import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChevronLeft, Sparkles, Mail, Phone, Lock, User, 
  ArrowRight, Loader, ShieldCheck, Zap, Files, EyeOff
} from "lucide-react";
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

type AuthTab = "login" | "signup";

export default function LoginPage() {
  const { login, signup, loginWithGoogle, loading, error, clearError, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [location, setLocation] = useLocation();

  // Redirect back if user is already logged in
  useEffect(() => {
    if (user) {
      // Check query params for redirect
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/";
      setLocation(redirectTo);
    }
  }, [user, setLocation]);

  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form states
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Sandbox simulation states
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxEmail, setSandboxEmail] = useState("john.doe@gmail.com");
  const [sandboxName, setSandboxName] = useState("John Doe");

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "1022082801397971-mockclientid.apps.googleusercontent.com";

  // Load Google Identity Services dynamically (backup mechanism)
  useEffect(() => {
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
  }, []);

  // Initialize and Render the native Google OAuth Sign-in Button
  useEffect(() => {
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

        const btnElement = document.getElementById("google-login-btn-page");
        if (btnElement) {
          g.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "large",
            width: btnElement.clientWidth || 380,
            text: "continue_with",
            shape: "rectangular",
          });
        }
      } catch (err) {
        console.error("Google Identity Services initialization failed:", err);
      }
    };

    // Retry initialization in case script loads with delay
    const interval = setInterval(() => {
      if ((window as any).google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [googleClientId, activeTab, showSandbox]);

  const handleGoogleCallback = async (response: any) => {
    const token = response.credential;
    try {
      const payload = decodeJwt(token);
      if (payload && payload.email) {
        const { email, name, sub } = payload;
        const success = await loginWithGoogle(email, name || "Google User", sub);
        if (success) {
          toast.success(`Logged in as ${name || email}`);
          const params = new URLSearchParams(window.location.search);
          setLocation(params.get("redirect") || "/");
        } else {
          toast.error("Google authentication failed in our system.");
        }
      } else {
        toast.error("Failed to parse Google profile credentials.");
      }
    } catch (err) {
      console.error("Google login callback error:", err);
      toast.error("Google OAuth token processing failed.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      toast.error("Please enter both your email/phone and password.");
      return;
    }
    const success = await login(loginIdentifier, loginPassword);
    if (success) {
      toast.success("Successfully logged in!");
      const params = new URLSearchParams(window.location.search);
      setLocation(params.get("redirect") || "/");
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
      // Automatically log in
      const loggedIn = await login(signupEmail, signupPassword);
      if (loggedIn) {
        const params = new URLSearchParams(window.location.search);
        setLocation(params.get("redirect") || "/");
      }
    } else {
      toast.error(useAuthStore.getState().error || "Failed to sign up.");
    }
  };

  const handleSandboxSimulate = async (email: string, name: string, sub: string) => {
    const success = await loginWithGoogle(email, name, sub);
    if (success) {
      toast.success(`Logged in as ${name} (Sandbox)`);
      setShowSandbox(false);
      const params = new URLSearchParams(window.location.search);
      setLocation(params.get("redirect") || "/");
    } else {
      toast.error("Sandbox simulation failed.");
    }
  };

  const handleCustomSandboxSimulate = async () => {
    if (!sandboxEmail) {
      toast.error("Email is required for sandbox simulation.");
      return;
    }
    const sub = `sandbox_sub_${sandboxEmail.replace(/[^a-zA-Z0-9]/g, "")}`;
    await handleSandboxSimulate(sandboxEmail, sandboxName || "Sandbox User", sub);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:grid md:grid-cols-12 overflow-hidden bg-mesh relative">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/65 backdrop-blur-md px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all hover:scale-105">
          <ChevronLeft className="h-4 w-4" />
          Back Home
        </Link>
      </div>

      {/* Left side: Premium Branding & Features (hidden on mobile) */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-4 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950/90 border-r border-border p-12 flex-col justify-between relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Branding header */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <img src="/logo.png" alt="FileNova logo" className="h-6 w-auto" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white">FileNova AI</span>
            <span className="block text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Premium Workspace</span>
          </div>
        </div>

        {/* Feature Highlights */}
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
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Zero-Log Encryption</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Documents are auto-deleted and never stored on persistent storage.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Elite Speed-Lane</p>
                <p className="text-[10px] text-slate-400 mt-0.5">High priority rendering and OCR models for premium tiers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Files className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Unified Form Desk</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Resize photos, mask Aadhaar numbers, and generate certificates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[10px] text-slate-500 font-semibold tracking-wider">
          FILENOVA SECURE SYSTEM • © {new Date().getFullYear()}
        </div>
      </div>

      {/* Right side: Login form (Centered on mobile/tablet, right span on desktop) */}
      <div className="flex-1 md:col-span-7 lg:col-span-8 flex flex-col justify-center items-center p-6 md:p-12 min-h-screen relative z-10">
        <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl shadow-premium p-8 relative animate-scale-in">
          
          {/* Header Mobile Brand (only visible on mobile/tablet) */}
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
              {activeTab === "login" 
                ? "Enter your credentials or use Google OAuth to log in." 
                : "Register for free to configure workspaces and remove daily limit gates."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border border-border/60 bg-muted/40 p-1 rounded-xl mb-6">
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

          {/* Form and OAuth area */}
          {showSandbox ? (
            /* Developer Sandbox simulation */
            <div className="space-y-4 py-2 animate-fade-in">
              <div className="text-center font-sans border-b border-border pb-3 mb-1">
                <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-2">
                  Sandbox Active
                </div>
                <h3 className="text-sm font-bold text-foreground">Select simulated local account</h3>
                <p className="text-[10px] text-muted-foreground">Used for testing authentication offline without setting up client credentials.</p>
              </div>

              <div className="space-y-2">
                {/* Account list */}
                <div className="border border-border rounded-xl divide-y divide-border overflow-hidden bg-background/50 shadow-inner">
                  {/* Option 1 */}
                  <button
                    onClick={() => handleSandboxSimulate("priya.sharma99@gmail.com", "Priya Sharma", "google_sub_priya99")}
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

                  {/* Option 2 */}
                  <button
                    onClick={() => handleSandboxSimulate("rahul.csc.cafe@gmail.com", "Rahul Das (CSC Portal)", "google_sub_rahul_csc")}
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

                  {/* Option 3 */}
                  <button
                    onClick={() => handleSandboxSimulate("subhajitgho123@gmail.com", "Subhajit Ghosh", "google_sub_subhajitgho123")}
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

                {/* Custom Mock fields */}
                <div className="pt-3 border-t border-border mt-3 space-y-2">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Or enter custom parameters</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Simulated Name"
                        value={sandboxName}
                        onChange={(e) => setSandboxName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Simulated Email"
                        value={sandboxEmail}
                        onChange={(e) => setSandboxEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg text-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCustomSandboxSimulate}
                    className="w-full py-2.5 text-xs font-black bg-primary text-primary-foreground rounded-lg shadow-sm hover:opacity-90 transition mt-1 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Simulate Sign In
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowSandbox(false)}
                  className="w-full py-2.5 text-xs font-bold rounded-xl border border-border hover:bg-muted transition text-center"
                >
                  Back to Classic Login
                </button>
              </div>
            </div>
          ) : (
            /* Standard Auth Interfaces */
            <div className="space-y-4">
              {activeTab === "login" ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Email or Phone Number"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-bold text-destructive px-1">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                /* Signup Form */
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div className="space-y-3">
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
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                      />
                    </div>
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
                        placeholder="Password (min 6 characters)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-all focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs font-bold text-destructive px-1">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border/80"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">or continue with</span>
                <div className="flex-grow border-t border-border/80"></div>
              </div>

              {/* Real Google OAuth Button container */}
              <div className="w-full flex flex-col gap-3">
                <div id="google-login-btn-page" className="w-full min-h-[44px] flex justify-center"></div>
                
                {/* Sandbox fallback switch */}
                <button
                  type="button"
                  onClick={() => setShowSandbox(true)}
                  className="w-full text-center py-2.5 text-[10px] font-bold text-primary hover:text-indigo-400 transition tracking-wide uppercase"
                >
                  🛠️ Developer Sandbox Simulator
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
