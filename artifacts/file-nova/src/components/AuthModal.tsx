import React, { useState } from "react";
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
  const { login, signup, loginWithGoogle, loading, error, clearError } = useAuthStore();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    clearError();
    onClose();
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
    if (!loginIdentifier || !loginPassword) {
      toast.error("Please enter both credentials.");
      return;
    }
    const success = await login(loginIdentifier, loginPassword);
    if (success) {
      finishAuth("Successfully logged in!");
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

    const success = await signup(signupEmail, signupPhone || null, signupPassword, signupName || null);
    if (success) {
      finishAuth("Account created successfully!");
    } else {
      toast.error(useAuthStore.getState().error || "Failed to sign up.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-end justify-center overflow-y-auto z-50 p-0 sm:p-4 md:items-center md:p-6 md:py-[10vh] animate-fade-in">
      <div
        className="bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-premium max-w-md w-full max-h-[92dvh] md:max-h-[80vh] overflow-y-auto animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          title="Close dialog"
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground h-8 w-8 flex items-center justify-center rounded-full bg-background/50 hover:bg-background border border-border transition z-10 cursor-pointer"
        >
          <X className="h-4 w-4" />
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
            Sign in to configure your workspaces, secure your documents, and manage premium subscriptions.
          </p>
        </div>

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

          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Email or Phone Number" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
              </div>
              {error && <p className="text-xs font-bold text-destructive px-1">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Full Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="email" placeholder="Email Address" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="tel" placeholder="Phone Number (e.g. 9876543210)" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="password" placeholder="Password (min 6 characters)" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
              </div>
              {error && <p className="text-xs font-bold text-destructive px-1">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-glow transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50">
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
