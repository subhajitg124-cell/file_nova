import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { LazyMotion, domAnimation } from "framer-motion";
import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";
import Home from "@/pages/SimpleHome";
import Workspace from "@/pages/Home";
import ToolsPage from "@/pages/ToolsPage";
import ToolPage from "@/pages/ToolPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUpiPayments from "@/pages/AdminUpiPayments";
import AdminCouponManagement from "@/pages/AdminCouponManagement";
import AdminLogin from "@/pages/AdminLogin";
import PremiumSuite from "@/pages/PremiumSuite";
import PricingPage from "@/pages/PricingPage";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ReferralPage from "@/pages/ReferralPage";
import StudentOfferPage from "@/pages/StudentOfferPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ContactPage from "@/pages/Contact";
import ProfilePage from "@/pages/ProfilePage";
import { LanguageProvider } from "@/lib/i18n";
import { AdminProvider } from "@/lib/admin";
import { FileExpiryBar } from "@/components/FileExpiryBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Toaster } from "@/components/ui/sonner";
import { UpgradeLimitModal } from "@/components/UpgradeLimitModal";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";
import { FileNovaAssistant } from "@/components/FileNovaAssistant";
import { FloatingShortcuts } from "@/components/FloatingShortcuts";
import { FloatingParticles } from "@/components/AnimatedEffects";
import { useAuthStore } from "@/store/useAuthStore";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BACKEND_URL } from "@/lib/api";

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
  onReset: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
          <div className="bg-slate-900/40 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center backdrop-blur-2xl">
            <div className="w-16 h-16 bg-red-550/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-400 mb-6 text-xs leading-relaxed">
              {this.state.error?.message || "An unexpected application error occurred."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  this.props.onReset();
                  this.setState({ hasError: false, error: null });
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition font-bold text-xs cursor-pointer"
              >
                🔄 Try again
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 py-3 rounded-xl hover:bg-slate-750 transition text-xs font-bold cursor-pointer"
              >
                🗑️ Clear data & restart
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left border-t border-white/[0.08] pt-4">
                <summary className="cursor-pointer text-[10px] text-slate-500 font-bold select-none focus:outline-none">
                  Error details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-slate-950/80 border border-white/5 rounded-xl text-[10px] text-red-400 overflow-auto max-h-40 font-mono">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/tools" component={ToolsPage} />
      <Route path="/tools/:toolId" component={ToolPage} />
      <Route path="/premium" component={PremiumSuite} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/nova-control" component={AdminDashboard} />
      <Route path="/admin/upi-payments" component={AdminUpiPayments} />
      <Route path="/admin/coupons" component={AdminCouponManagement} />
      <Route path="/nova-login" component={AdminLogin} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/referral" component={ReferralPage} />
      <Route path="/student-offer" component={StudentOfferPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { initialized, fetchMe } = useAuthStore();
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [modalLimit, setModalLimit] = useState(3);
  const [modalUsage, setModalUsage] = useState(3);
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">("checking");
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const handleOpenAI = () => setAssistantOpen(true);
    window.addEventListener("openAIAssistant", handleOpenAI);
    return () => window.removeEventListener("openAIAssistant", handleOpenAI);
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [input, init] = args;
      const response = await originalFetch(input, init);
      if (response.status === 403) {
        const clone = response.clone();
        try {
          const data = await clone.json();
          if (data.limitReached) {
            setModalLimit(data.limit ?? 3);
            setModalUsage(data.usage ?? 3);
            setLimitModalOpen(true);
          }
        } catch (_) {
          // Ignore json parsing issues
        }
      }
      return response;
    };

    const handleLimitReached = (e: any) => {
      const data = e.detail;
      setModalLimit(data.limit ?? 3);
      setModalUsage(data.usage ?? 3);
      setLimitModalOpen(true);
    };

    window.addEventListener("filenova-limit-reached" as any, handleLimitReached);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("filenova-limit-reached" as any, handleLimitReached);
    };
  }, []);

  useEffect(() => {
    if (!BACKEND_URL) {
      setApiStatus("online");
      return;
    }
    let retryTimer: ReturnType<typeof setTimeout>;
    let retries = 0;
    const MAX_RETRIES = 3;

    const checkApiHealth = async () => {
      try {
        setApiStatus("checking");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${BACKEND_URL}/api/healthz`, {
          method: "GET",
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        });
        clearTimeout(timeout);
        setApiStatus(res.ok ? "online" : "offline");
        retries = 0;
      } catch {
        retries += 1;
        if (retries <= MAX_RETRIES) {
          retryTimer = setTimeout(checkApiHealth, 2000);
        } else {
          setApiStatus("offline");
          retries = 0;
        }
      }
    };

    checkApiHealth();
    const healthCheckInterval = setInterval(() => {
      retries = 0;
      checkApiHealth();
    }, 60000);

    const handleOnline = () => {
      retries = 0;
      setApiStatus("checking");
      checkApiHealth();
    };
    const handleOffline = () => setApiStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(retryTimer);
      clearInterval(healthCheckInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const refCode = new URLSearchParams(window.location.search).get("ref");
    if (!refCode) return;

    localStorage.setItem("filenova_referral_code", refCode);
    fetch(`${BACKEND_URL}/api/v1/referral/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: refCode }),
    }).catch(() => {
      // Referral click tracking should never block app usage.
    });
  }, []);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset}>
            <LazyMotion features={domAnimation}>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <LanguageProvider>
                  <ConnectionStatusIndicator status={apiStatus} />
                  <ScrollToTop />
                  <FloatingParticles />
                  <FloatingShortcuts />
                  <FileNovaAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
                  <AdminProvider>
                    <Router />
                    <OfflineBanner />
                    <FileExpiryBar />
                    <Toaster closeButton position="top-right" richColors />
                    <UpgradeLimitModal 
                      isOpen={limitModalOpen} 
                      onClose={() => setLimitModalOpen(false)} 
                      limit={modalLimit}
                      usage={modalUsage}
                    />
                  </AdminProvider>
                </LanguageProvider>
              </WouterRouter>
            </LazyMotion>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  );
}

export default App;
