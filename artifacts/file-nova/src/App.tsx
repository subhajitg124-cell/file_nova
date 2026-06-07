import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { LazyMotion, domAnimation } from "framer-motion";
import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";
import Home from "@/pages/SimpleHome";
import Workspace from "@/pages/Home";
import ToolsPage from "@/pages/ToolsPage";
import ToolPage from "@/pages/ToolPage";

const MergePdf = React.lazy(() => import("@/pages/tools/MergePdf"));
const SplitPdf = React.lazy(() => import("@/pages/tools/SplitPdf"));
const CompressPdf = React.lazy(() => import("@/pages/tools/CompressPdf"));
const PdfToWord = React.lazy(() => import("@/pages/tools/PdfToWord"));
const PdfToJpg = React.lazy(() => import("@/pages/tools/PdfToJpg"));
const JpgToPdf = React.lazy(() => import("@/pages/tools/JpgToPdf"));
const RotatePdf = React.lazy(() => import("@/pages/tools/RotatePdf"));
const UnlockPdf = React.lazy(() => import("@/pages/tools/UnlockPdf"));
const ProtectPdf = React.lazy(() => import("@/pages/tools/ProtectPdf"));
const ResizePdf = React.lazy(() => import("@/pages/tools/ResizePdf"));
const PanCardResize = React.lazy(() => import("@/pages/tools/PanCardResize"));
const AadhaarMaskPdf = React.lazy(() => import("@/pages/tools/AadhaarMaskPdf"));
const GovernmentFormFill = React.lazy(() => import("@/pages/tools/GovernmentFormFill"));
const CompressPdfForUpload = React.lazy(() => import("@/pages/tools/CompressPdfForUpload"));
const Ocr = React.lazy(() => import("@/pages/tools/Ocr"));
const RemoveBackground = React.lazy(() => import("@/pages/tools/RemoveBackground"));
const ScholarshipZip = React.lazy(() => import("@/pages/tools/ScholarshipZip"));
const AiPdfSummary = React.lazy(() => import("@/pages/tools/AiPdfSummary"));
const ResizeImage = React.lazy(() => import("@/pages/tools/ResizeImage"));
const WordToPdf = React.lazy(() => import("@/pages/tools/WordToPdf"));
import PdfToolsPage from "@/pages/PdfToolsPage";
import ImageToolsPage from "@/pages/ImageToolsPage";
import VideoToolsPage from "@/pages/VideoToolsPage";
import DocumentToolsPage from "@/pages/DocumentToolsPage";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUpiPayments from "@/pages/AdminUpiPayments";
import AdminCouponManagement from "@/pages/AdminCouponManagement";
import AdminLogin from "@/pages/AdminLogin";
import PremiumSuite from "@/pages/PremiumSuite";
import PricingPage from "@/pages/PricingPage";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import HistoryPage from "@/pages/HistoryPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ReferralPage from "@/pages/ReferralPage";
import StudentOfferPage from "@/pages/StudentOfferPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ContactPage from "@/pages/Contact";
import ProfilePage from "@/pages/ProfilePage";
import { LanguageProvider } from "@/lib/i18n";
import { AdminProvider, useAdmin } from "@/lib/admin";
import { FileExpiryBar } from "@/components/FileExpiryBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Toaster } from "@/components/ui/sonner";
import { UpgradeLimitModal } from "@/components/UpgradeLimitModal";
import { GlobalNotice } from "@/components/GlobalNotice";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";
import { FileNovaAssistant } from "@/components/FileNovaAssistant";
import { SmartAssistant } from "@/assistant/components/SmartAssistant";
import { FloatingShortcuts } from "@/components/FloatingShortcuts";
import { FloatingParticles } from "@/components/AnimatedEffects";
import { useAuthStore } from "@/store/useAuthStore";
import { useFileStore } from "@/store/useFileStore";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BACKEND_URL, HAS_BACKEND } from "@/lib/api";
import { EditingWindow } from "@/components/EditingWindow";
import { apiClient, apiMock } from "@/lib/api";

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
  const { settings } = useAdmin();
  
  useEffect(() => {
    const classesToRemove = Array.from(document.documentElement.classList).filter(c => c.startsWith('event-theme-'));
    classesToRemove.forEach(c => document.documentElement.classList.remove(c));
    
    if (settings.eventTheme && settings.eventTheme !== 'none') {
      document.documentElement.classList.add(`event-theme-${settings.eventTheme}`);
    }
  }, [settings.eventTheme]);

  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/workspace" component={Workspace} />
        <Route path="/tools" component={ToolsPage} />

        {/* 18 Dedicated SEO-friendly Canonical Tool Pages */}
        <Route path="/merge-pdf">
          <React.Suspense fallback={<LoadingScreen />}><MergePdf /></React.Suspense>
        </Route>
        <Route path="/split-pdf">
          <React.Suspense fallback={<LoadingScreen />}><SplitPdf /></React.Suspense>
        </Route>
        <Route path="/compress-pdf">
          <React.Suspense fallback={<LoadingScreen />}><CompressPdf /></React.Suspense>
        </Route>
        <Route path="/pdf-to-word">
          <React.Suspense fallback={<LoadingScreen />}><PdfToWord /></React.Suspense>
        </Route>
        <Route path="/pdf-to-jpg">
          <React.Suspense fallback={<LoadingScreen />}><PdfToJpg /></React.Suspense>
        </Route>
        <Route path="/jpg-to-pdf">
          <React.Suspense fallback={<LoadingScreen />}><JpgToPdf /></React.Suspense>
        </Route>
        <Route path="/rotate-pdf">
          <React.Suspense fallback={<LoadingScreen />}><RotatePdf /></React.Suspense>
        </Route>
        <Route path="/unlock-pdf">
          <React.Suspense fallback={<LoadingScreen />}><UnlockPdf /></React.Suspense>
        </Route>
        <Route path="/protect-pdf">
          <React.Suspense fallback={<LoadingScreen />}><ProtectPdf /></React.Suspense>
        </Route>
        <Route path="/resize-pdf">
          <React.Suspense fallback={<LoadingScreen />}><ResizePdf /></React.Suspense>
        </Route>
        <Route path="/pan-card-resize">
          <React.Suspense fallback={<LoadingScreen />}><PanCardResize /></React.Suspense>
        </Route>
        <Route path="/aadhaar-mask-pdf">
          <React.Suspense fallback={<LoadingScreen />}><AadhaarMaskPdf /></React.Suspense>
        </Route>
        <Route path="/government-form-fill">
          <React.Suspense fallback={<LoadingScreen />}><GovernmentFormFill /></React.Suspense>
        </Route>
        <Route path="/compress-pdf-for-upload">
          <React.Suspense fallback={<LoadingScreen />}><CompressPdfForUpload /></React.Suspense>
        </Route>
        <Route path="/ocr">
          <React.Suspense fallback={<LoadingScreen />}><Ocr /></React.Suspense>
        </Route>
        <Route path="/remove-background">
          <React.Suspense fallback={<LoadingScreen />}><RemoveBackground /></React.Suspense>
        </Route>
        <Route path="/scholarship-zip">
          <React.Suspense fallback={<LoadingScreen />}><ScholarshipZip /></React.Suspense>
        </Route>
        <Route path="/ai-pdf-summary">
          <React.Suspense fallback={<LoadingScreen />}><AiPdfSummary /></React.Suspense>
        </Route>
        <Route path="/resize-image">
          <React.Suspense fallback={<LoadingScreen />}><ResizeImage /></React.Suspense>
        </Route>
        <Route path="/word-to-pdf">
          <React.Suspense fallback={<LoadingScreen />}><WordToPdf /></React.Suspense>
        </Route>

        <Route path="/pdf-tools">
          <React.Suspense fallback={<LoadingScreen />}><PdfToolsPage /></React.Suspense>
        </Route>
        <Route path="/image-tools">
          <React.Suspense fallback={<LoadingScreen />}><ImageToolsPage /></React.Suspense>
        </Route>
        <Route path="/video-tools">
          <React.Suspense fallback={<LoadingScreen />}><VideoToolsPage /></React.Suspense>
        </Route>
        <Route path="/document-tools">
          <React.Suspense fallback={<LoadingScreen />}><DocumentToolsPage /></React.Suspense>
        </Route>

        {/* 301-equivalent client redirects (old/legacy slugs) */}
        <Route path="/aadhaar-mask"><Redirect to="/aadhaar-mask-pdf" /></Route>
        <Route path="/merge"><Redirect to="/merge-pdf" /></Route>
        <Route path="/compress"><Redirect to="/compress-pdf" /></Route>
        <Route path="/split"><Redirect to="/split-pdf" /></Route>
        <Route path="/resize-image"><Redirect to="/resize-image" /></Route>
        <Route path="/word-to-pdf"><Redirect to="/word-to-pdf" /></Route>
        <Route path="/image-to-pdf"><Redirect to="/jpg-to-pdf" /></Route>
        <Route path="/pdf-to-image"><Redirect to="/pdf-to-jpg" /></Route>

        {/* Client-Side Redirects for Legacy /tools/* Paths */}
        <Route path="/tools/compress-pdf"><Redirect to="/compress-pdf" /></Route>
        <Route path="/tools/merge-pdf"><Redirect to="/merge-pdf" /></Route>
        <Route path="/tools/image-to-pdf"><Redirect to="/jpg-to-pdf" /></Route>
        <Route path="/tools/images-to-pdf"><Redirect to="/jpg-to-pdf" /></Route>
        <Route path="/tools/pdf-to-image"><Redirect to="/pdf-to-jpg" /></Route>
        <Route path="/tools/pdf-to-images"><Redirect to="/pdf-to-jpg" /></Route>
        <Route path="/tools/ocr"><Redirect to="/ocr" /></Route>
        <Route path="/tools/pdf-ocr"><Redirect to="/ocr" /></Route>
        <Route path="/tools/resize-image"><Redirect to="/resize-image" /></Route>
        <Route path="/tools/resize-photo"><Redirect to="/resize-image" /></Route>
        <Route path="/tools/word-to-pdf"><Redirect to="/word-to-pdf" /></Route>
        <Route path="/tools/docx-to-pdf"><Redirect to="/word-to-pdf" /></Route>
        <Route path="/tools/scholarship-zip"><Redirect to="/scholarship-zip" /></Route>
        <Route path="/tools/scholarship-zip-maker"><Redirect to="/scholarship-zip" /></Route>
        <Route path="/tools/scholarship"><Redirect to="/scholarship-zip" /></Route>
        <Route path="/tools/ai-pdf-summary"><Redirect to="/ai-pdf-summary" /></Route>
        <Route path="/tools/ai-summarize"><Redirect to="/ai-pdf-summary" /></Route>

        <Route path="/tools/:toolId" component={ToolPage} />
        <Route path="/premium" component={PremiumSuite} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/nova-control" component={AdminDashboard} />
        <Route path="/admin/upi-payments" component={AdminUpiPayments} />
        <Route path="/admin/coupons" component={AdminCouponManagement} />
        <Route path="/nova-login" component={AdminLogin} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/history" component={HistoryPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/referral" component={ReferralPage} />
        <Route path="/student-offer" component={StudentOfferPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const { initialized, fetchMe } = useAuthStore();
  const { 
    isMockMode, 
    editorOpen, 
    editorFile, 
    editorFileType, 
    closeEditor, 
    jobId, 
    setJobId, 
    addRawFiles, 
    addFiles, 
    setError, 
    setProcessing 
  } = useFileStore();
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [modalLimit, setModalLimit] = useState(3);
  const [modalUsage, setModalUsage] = useState(3);
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">(HAS_BACKEND ? "checking" : "online");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let height = "0px";
    if (!isOnline) {
      height = "38px";
    } else if (!isMockMode && HAS_BACKEND && (apiStatus === "offline" || apiStatus === "checking")) {
      height = "40px";
    }
    document.documentElement.style.setProperty("--banner-height", height);
    return () => {
      document.documentElement.style.setProperty("--banner-height", "0px");
    };
  }, [isOnline, apiStatus, isMockMode]);

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
      const url = typeof input === "string" ? input : (input instanceof URL ? input.toString() : (input && (input as Request).url ? (input as Request).url : ""));
      
      if (url && (url.includes("/api/") || url.startsWith("/api/"))) {
        try {
          const d = new Date();
          const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const hasYt = localStorage.getItem("fn_youtube_subscribed_at") === today;
          const hasInsta = localStorage.getItem("fn_instagram_followed_at") === today;
          const hasFb = localStorage.getItem("fn_facebook_followed_at") === today;

          let activeCount = 0;
          if (hasYt) activeCount++;
          if (hasInsta) activeCount++;
          if (hasFb) activeCount++;

          let bonusLimit = "";
          if (activeCount === 1) bonusLimit = "6";
          else if (activeCount === 2) bonusLimit = "8";
          else if (activeCount >= 3) bonusLimit = "12";

          if (bonusLimit) {
            const newInit = { ...(init || {}) };
            const newHeaders = { ...(newInit.headers || {}) };
            // @ts-ignore
            newHeaders["x-filenova-bonus-limit"] = bonusLimit;
            newInit.headers = newHeaders;
            args[1] = newInit;
          }
        } catch (_) {}
      }

      const response = await originalFetch(...args);
      if (response.status === 403) {
        const clone = response.clone();
        try {
          const data = await clone.json();
          if (data.error === "LIMIT_EXCEEDED" || data.limitReached) {
            setModalLimit(data.limit ?? 3);
            setModalUsage(data.limit ?? 3);
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
    if (!HAS_BACKEND) {
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
        const isHealthy = res.ok;
        setApiStatus(isHealthy ? "online" : "offline");
        if (!isHealthy) {
          useFileStore.setState({ isMockMode: true });
        }
        retries = 0;
      } catch {
        retries += 1;
        if (retries <= MAX_RETRIES) {
          retryTimer = setTimeout(checkApiHealth, 2000);
        } else {
          setApiStatus("offline");
          useFileStore.setState({ isMockMode: true });
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
  }, [retryTrigger]);

  useEffect(() => {
    const refCode = new URLSearchParams(window.location.search).get("ref");
    if (!refCode || !HAS_BACKEND) return;

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
                  {!isMockMode && (
                    <ConnectionStatusIndicator 
                      status={apiStatus} 
                      onRetry={() => setRetryTrigger(prev => prev + 1)} 
                    />
                  )}
                  <OfflineBanner />
                  <FloatingParticles />
                  <FloatingShortcuts />
                  <FileNovaAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
                  <AdminProvider>
                    <GlobalNotice />
                    <Router />
                    <FileExpiryBar />
                    <Toaster closeButton position="top-right" richColors />
                    <UpgradeLimitModal 
                      isOpen={limitModalOpen} 
                      onClose={() => setLimitModalOpen(false)} 
                      limit={modalLimit}
                      usage={modalUsage}
                    />
                    {editorOpen && editorFile && (
                      <EditingWindow
                        file={editorFile}
                        fileType={editorFileType}
                        onClose={closeEditor}
                        onDone={async (resultBlob) => {
                          const editedFile = new File([resultBlob], editorFile.name, { type: resultBlob.type });
                          closeEditor();
                          
                          setProcessing(true);
                          try {
                            const activeJobId = jobId || Math.random().toString(36).substring(2, 15);
                            setJobId(activeJobId);
                            addRawFiles([editedFile]);
                            const uploaded = isMockMode
                              ? await apiMock.uploadFiles([editedFile], activeJobId)
                              : await apiClient.uploadFiles([editedFile], activeJobId);
                            addFiles(uploaded);
                          } catch (err: any) {
                            setError(err.message || 'Upload failed.');
                          } finally {
                            setProcessing(false);
                          }
                        }}
                      />
                    )}
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
