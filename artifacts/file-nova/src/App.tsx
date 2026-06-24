import { Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { LazyMotion, domAnimation } from "framer-motion";
import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Router } from "@/routes";
import { EventProvider } from "@/components/events/EventProvider";
import { LanguageProvider } from "@/lib/i18n";
import { AdminProvider } from "@/lib/admin";
import { FileExpiryBar } from "@/components/FileExpiryBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Toaster } from "@/components/ui/sonner";
import { UpgradeLimitModal } from "@/components/UpgradeLimitModal";
import { GlobalNotice } from "@/components/GlobalNotice";
import { ConnectionStatusIndicator } from "@/components/ConnectionStatusIndicator";
import { FileNovaAssistant } from "@/components/FileNovaAssistant";
import { FloatingShortcuts } from "@/components/FloatingShortcuts";
import { FloatingParticles, CursorGlow } from "@/components/AnimatedEffects";
import { useAuthStore } from "@/store/useAuthStore";
import { useFileStore } from "@/store/useFileStore";
import { LoadingScreen } from "@/components/LoadingScreen";
import { BACKEND_URL, HAS_BACKEND } from "@/lib/api";
import { EditingWindow } from "@/components/EditingWindow";
import { apiClient, apiMock } from "@/lib/api";
import { setupFetchInterceptor } from "@/lib/fetchInterceptor";
import { CheckoutModal } from "@/components/CheckoutModal";

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
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
          <div className="bg-card border border-border p-8 rounded-3xl shadow-lg max-w-lg w-full text-center backdrop-blur-xl">
            <div className="w-16 h-16 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6 text-xs leading-relaxed">
              {this.state.error?.message || "An unexpected application error occurred."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  this.props.onReset();
                  this.setState({ hasError: false, error: null });
                }}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition font-bold text-xs cursor-pointer"
              >
                Try again
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full bg-secondary border border-border text-foreground py-3 rounded-xl hover:bg-accent transition text-xs font-bold cursor-pointer"
              >
                Clear data &amp; restart
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left border-t border-border pt-4">
                <summary className="cursor-pointer text-[10px] text-muted-foreground font-bold select-none focus:outline-none">
                  Error details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-background border border-border rounded-xl text-[10px] text-destructive overflow-auto max-h-40 font-mono">
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

function App({ ssrPath }: { ssrPath?: string } = {}) {
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
    setProcessing,
    selectedOperation
  } = useFileStore();
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [modalLimit, setModalLimit] = useState(3);
  const [modalUsage, setModalUsage] = useState(3);
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">(HAS_BACKEND ? "checking" : "online");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);
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
    return setupFetchInterceptor(setLimitModalOpen, setModalLimit, setModalUsage);
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
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.referralId) {
          localStorage.setItem("filenova_referral_tracking_id", data.referralId);
        }
      })
      .catch(() => {});
  }, []);

  if (!initialized && !ssrPath) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset}>
            <LazyMotion features={domAnimation}>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} ssrPath={ssrPath}>
                <LanguageProvider>
                  {!isMockMode && (
                    <ConnectionStatusIndicator
                      status={apiStatus}
                      onRetry={() => setRetryTrigger(prev => prev + 1)}
                    />
                  )}
                  <OfflineBanner />
                  <FloatingParticles />
                  <CursorGlow />
                  <FloatingShortcuts />
                  <FileNovaAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
                  <AdminProvider>
                    <EventProvider>
                      <GlobalNotice />
                      <div id="main-content"><Router /></div>
                    </EventProvider>
                    <FileExpiryBar />
                    <Toaster closeButton position="top-right" richColors />
                    <UpgradeLimitModal
                      isOpen={limitModalOpen}
                      onClose={() => setLimitModalOpen(false)}
                      limit={modalLimit}
                      usage={modalUsage}
                    />
                    <CheckoutModal />
                    {editorOpen && editorFile && (
                      <EditingWindow
                        file={editorFile}
                        fileType={editorFileType}
                        toolType={selectedOperation === 'pancard' ? 'pan-resize' : (selectedOperation || 'default') as any}
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
