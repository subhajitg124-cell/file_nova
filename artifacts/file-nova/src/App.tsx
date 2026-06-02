import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { LazyMotion, domAnimation } from "framer-motion";
import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUpiPayments from "@/pages/AdminUpiPayments";
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
import { LanguageProvider } from "@/lib/i18n";
import { AdminProvider } from "@/lib/admin";
import { FileExpiryBar } from "@/components/FileExpiryBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Toaster } from "@/components/ui/sonner";
import { UpgradeLimitModal } from "@/components/UpgradeLimitModal";

const queryClient = new QueryClient();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
              {this.state.error?.message || "An unexpected application error occurred."}
            </p>
            <button
              onClick={() => {
                this.props.onReset();
                this.setState({ hasError: false, error: null });
              }}
              className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
            >
              Try again
            </button>
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
      <Route path="/premium" component={PremiumSuite} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/nova-control" component={AdminDashboard} />
      <Route path="/admin/upi-payments" component={AdminUpiPayments} />
      <Route path="/nova-login" component={AdminLogin} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/referral" component={ReferralPage} />
      <Route path="/student-offer" component={StudentOfferPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [modalLimit, setModalLimit] = useState(3);
  const [modalUsage, setModalUsage] = useState(3);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
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

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset}>
            <LazyMotion features={domAnimation}>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <LanguageProvider>
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
