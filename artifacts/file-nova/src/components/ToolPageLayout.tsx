import React, { useEffect, useState, type ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { 
  ChevronRight, ChevronLeft, Languages, Sparkles, FileText, Image as ImageIcon,
  Crown, User, Menu, X, ArrowLeft, Upload, HelpCircle, AlertTriangle, BookOpen, PlayCircle, CheckCircle2, ArrowDown, Settings2, Download, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useFileStore } from "@/store/useFileStore";
import { useLanguage, useTranslation } from "@/lib/i18n";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import Footer from "@/components/Footer";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PopularToolsDropdown } from "@/components/PopularToolsDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { useSubscription } from "@/hooks/useSubscription";
import { useSEO } from "@/hooks/useSEO";
import { toolContentMap } from "@/data/toolContent";
import ScholarshipZIPMaker from "@/pages/ScholarshipZIPMaker";
import { ReactableGreeting } from "@/components/events/ReactableGreeting";

// Import Workspace components
import { UploadZone } from "@/components/workspace/UploadZone";
import { PreviewCanvas } from "@/components/workspace/PreviewCanvas";
import { OptionsPanel } from "@/components/workspace/OptionsPanel";
import { ProgressTracker } from "@/components/workspace/ProgressTracker";
import { DownloadHub } from "@/components/workspace/DownloadHub";
import { BulkProcessor } from "@/components/BulkProcessor";
import { WorkspaceProgress } from "@/components/workspace/WorkspaceProgress";
import { apiClient, apiMock } from "@/lib/api";

// Import shared tool components
import { BeforeAfterComparison } from "@/components/shared/BeforeAfterComparison";
import { EstimatedOutputSize } from "@/components/shared/EstimatedOutputSize";
import { ToolPreview } from "@/components/shared/ToolPreview";
import { StepByStepGuide } from "@/components/shared/StepByStepGuide";
import { ToolSettingsPanel } from "@/components/shared/ToolSettingsPanel";

interface ToolPageLayoutProps {
  slug: string;
  children?: ReactNode;
}

const ICON_MAP: Record<string, string> = {
  files: "📄",
  scissors: "✂️",
  "file-zip": "🗜️",
  "file-word": "📝",
  photo: "🖼️",
  "file-text": "📋",
  rotate: "🔄",
  "lock-open": "🔓",
  lock: "🔒",
  resize: "⤡",
  "credit-card": "💳",
  "id-badge": "🪪",
  clipboard: "📋",
  "cloud-upload": "☁️",
  scan: "🔍",
  eraser: "🧹",
  sparkles: "✨",
};

const BENEFITS = [
  {
    icon: "🔒",
    title: "100% Private",
    description: "All processing happens locally inside your browser. Your files never leave your device."
  },
  {
    icon: "⚡",
    title: "Instant Results",
    description: "No queues or wait times. Get your documents processed in seconds."
  },
  {
    icon: "📱",
    title: "Mobile Friendly",
    description: "Optimized for Android & iOS. Access all tools directly from your phone."
  },
  {
    icon: "🆓",
    title: "Completely Free",
    description: "No sign-up or registration required. Free forever for students and CSC operators."
  }
];

export function ToolPageLayout({ slug, children }: ToolPageLayoutProps) {
  const content = toolContentMap[slug];
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { premiumTier } = useSubscription();
  const { language, setLanguage } = useLanguage();
  const { tText } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // File store state
  const {
    files, selectedOperation, isProcessing, downloadUrl, isMockMode,
    backendHealthy, backendCapabilities, setBackendStatus, selectedSection, setSelectedSection, clearStore,
    rawFiles
  } = useFileStore();

  // Health check
  useEffect(() => {
    const fetchHealth = async () => {
      const res = await apiClient.checkHealth();
      setBackendStatus(res.healthy, res.capabilities);
      if (!res.healthy) useFileStore.setState({ isMockMode: true });
    };
    fetchHealth();
  }, [setBackendStatus]);

  // Set configured status and handle file dropping logic
  useEffect(() => {
    if (!content) {
      setLocation("/404");
      return;
    }

    setIsConfigured(false);

    // Check for preloaded/dropped file in history state
    const store = useFileStore.getState();
    const droppedFile = window.history.state?.droppedFile;
    const shouldAutoProcess = window.history.state?.autoProcess;
    if (droppedFile) {
      window.history.replaceState(null, "");
      (async () => {
        store.addRawFiles([droppedFile]);
        const activeJobId = Math.random().toString(36).substring(2, 15);
        store.setJobId(activeJobId);
        store.setProcessing(true);
        try {
          const isMock = store.isMockMode;
          const uploaded = isMock
            ? await apiMock.uploadFiles([droppedFile], activeJobId)
            : await apiClient.uploadFiles([droppedFile], activeJobId);
          store.addFiles(uploaded);

          if (shouldAutoProcess) {
            const freshState = useFileStore.getState();
            const op = freshState.selectedOperation || (slug === 'merge-pdf' ? 'merge' : 'compress');
            freshState.setOperation(op);
            freshState.setProcessing(true);
            
            const processJobId = Math.random().toString(36).substring(2, 15);
            freshState.setJobId(processJobId);
            
            if (isMock) {
              await apiMock.simulateProcessing(
                processJobId,
                op,
                freshState.files,
                (p) => freshState.setProgress(p),
                (downloadUrl, savings) => {
                  freshState.setDownloadUrl(downloadUrl);
                  if (savings) freshState.setSavings(savings);
                },
                (err) => freshState.setError(err)
              );
            } else {
              await apiClient.startProcessing(processJobId, op, freshState.operationOptions);
              let attempts = 0;
              const maxAttempts = 60;
              while (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 2000));
                const status = await apiClient.pollStatus(processJobId);
                if (status.status === 'completed') {
                  const downloadUrl = apiClient.getDownloadUrl(processJobId);
                  freshState.setDownloadUrl(downloadUrl);
                  break;
                } else if (status.status === 'failed') {
                  throw new Error(status.error || 'Processing failed');
                }
                attempts++;
              }
            }
          }
        } catch (err: any) {
          store.setError(err.message || 'Preload upload failed.');
        } finally {
          store.setProcessing(false);
        }
      })();
    }

    setIsConfigured(true);
  }, [slug, content, setLocation]);

   // Inject SEO metadata
   useSEO({
     title: content?.title || "FileNova Tool",
     description: content?.metaDescription || "",
     canonical: `https://filenova.in/${slug}`,
     keywords: content?.keywords || "",
     toolName: content?.toolName || "",
     toolDescription: content?.toolDescription || "",
     faqs: content?.faqs || [],
     steps: content?.steps,
     howToName: content?.howToName,
     isHomepage: false,
     toolCategory: content?.toolCategory
   });

  if (!content) return null;

  const step = downloadUrl ? 3 : (files.length > 0 && selectedOperation) ? 2 : 1;
  const isScholarshipZip = slug === "scholarship-zip";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)] pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_70%)] pointer-events-none z-0" />

      {/* Header Nav */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="FileNova logo" className="h-9 w-auto" />
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm text-foreground block">FileNova</span>
              <span className="text-[10px] text-muted-foreground block leading-none font-bold uppercase tracking-wider">CSC & STUDENT PORTAL</span>
            </div>
          </Link>

          {/* Right Action Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
             {/* Popular Tools Shortcuts */}
             <div className="hidden md:block">
               <PopularToolsDropdown />
             </div>

             <div className="hidden md:block">
               <LanguageSelector />
             </div>

             <div className="hidden md:block">
               <ReactableGreeting />
             </div>
             
             <ThemeToggle />

            <Link href="/workspace" className="hidden md:flex items-center gap-1 text-xs text-foreground hover:text-primary font-bold py-1.5 px-3 rounded-lg border border-border bg-card hover:border-indigo-500/35 hover:bg-indigo-500/10 transition-all">
              <FileText className="h-3.5 w-3.5" />
              {tText("Workspace")}
            </Link>

            {/* Premium billing link */}
            <Link href="/pricing" className="hidden sm:flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold py-1.5 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all">
              <Crown className="h-3.5 w-3.5 fill-current" />
              {tText("Premium Suite")}
            </Link>

            {/* Profile Dropdown & Plan Badge */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:block">
                <PlanBadge />
              </div>
              {user ? (
                <UserProfileDropdown />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 text-xs font-black text-white transition-all duration-300 shadow-glow whitespace-nowrap shrink-0 border border-indigo-500/30 hover:scale-[1.02] active:scale-95"
                >
                  {tText("Login")}
                </Link>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white md:hidden cursor-pointer"
              aria-label="Toggle mobile menu"
              title="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="mobile-menu-panel md:hidden border-b border-border bg-background p-4 space-y-3 animate-fadeIn relative z-30">
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="flex items-center justify-center gap-2 text-sm text-amber-400 font-bold py-2 border border-amber-500/20 bg-amber-500/5 rounded-lg">
              <Crown className="h-4 w-4 fill-current" />
              {tText("Premium Suite Billing")}
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/workspace" className="text-center text-sm bg-card border border-border text-foreground font-bold py-2 rounded-lg">
              {tText("Open Document Workspace")}
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/contact" className="text-center text-sm border border-border text-foreground font-bold py-2 rounded-lg">
              {tText("📞 Contact Support")}
            </Link>
            <div className="flex items-center justify-between px-4 py-2 border border-border bg-card rounded-xs">
              <span className="text-xs font-bold text-muted-foreground">{tText("Theme Mode")}</span>
              <div className="flex items-center gap-2">
                <ReactableGreeting />
                <ThemeToggle />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2 border border-border bg-card rounded-xs">
              <span className="text-xs font-bold text-muted-foreground">{tText("Language")}</span>
              <LanguageSelector />
            </div>
          </div>
        </div>
      )}

      {/* Offline Simulator Warning */}
      {!isMockMode && !backendHealthy && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 relative z-20">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          FastAPI backend is offline — running in Standalone Simulator mode.
        </div>
      )}

       {/* Main Container */}
       <main className="max-w-5xl mx-auto px-4 pt-10 pb-20 relative z-10">
         
         {/* Visual Breadcrumb */}
         <nav className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-6" aria-label="Breadcrumb">
           <Link href="/" className="hover:text-primary transition-colors">Home</Link>
           <ChevronRight className="h-3 w-3 text-slate-600" />
           <Link href="/tools" className="hover:text-primary transition-colors">All Tools</Link>
           <ChevronRight className="h-3 w-3 text-slate-600" />
           <span className="text-slate-800 dark:text-slate-200">{content.toolName}</span>
         </nav>

         {/* Page Header (H1 + Intro) */}
         <div className="mb-10 text-left space-y-4">
           <div className="flex items-center gap-3.5 flex-wrap">
             <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
               {content.h1}
             </h1>
             {content.badge && (
               <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                 {content.badge}
               </span>
             )}
           </div>
           <p className="text-gray-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
             {content.toolDescription}
           </p>
         </div>

         {/* Benefits Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
           {BENEFITS.map((benefit, i) => (
             <div key={i} className="bg-card/40 border border-border/80 rounded-xs p-5 hover:border-indigo-500/30 transition-all duration-300">
               <div className="text-2xl mb-3">{benefit.icon}</div>
               <h3 className="font-extrabold text-sm text-foreground mb-1.5">{benefit.title}</h3>
               <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
             </div>
           ))}
         </div>

         {/* How It Works / Step-by-Step Guide */}
         {content.steps && content.steps.length > 0 && (
           <div className="mb-12">
             <StepByStepGuide 
               title={content.howToName || `How to ${content.toolName}`}
               steps={content.steps}
               toolSlug={slug}
             />
           </div>
         )}

         {/* Workspace Area */}
         <div id="workspace-area" className="bg-card border border-border/80 rounded-xs p-6 sm:p-8 shadow-xl relative overflow-hidden mb-12">
           {/* Workspace Accent Glow */}
           <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />

           {/* Step indicator */}
           {!isScholarshipZip && (
              <WorkspaceProgress currentStep={step} />
            )}

            {/* Sensitive Client-side Badge */}
            {['aadhaar-mask-pdf', 'pan-card-resize', 'scholarship-zip'].includes(slug) && (
              <div className="mb-6 flex justify-center">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-tight shadow-sm select-none">
                  🔒 Processed in your browser — never uploaded
                </span>
              </div>
            )}

           {/* Tool-specific Preview (before upload) */}
           {!isConfigured ? (
             <div className="text-center py-20">
               <Sparkles className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
               <p className="text-xs font-bold text-muted-foreground">Configuring workspace...</p>
             </div>
           ) : children ? (
             children
           ) : isScholarshipZip ? (
             <ScholarshipZIPMaker isEmbedded={true} />
           ) : files.length === 0 ? (
             <div className="space-y-4">
               <UploadZone allowedCategory={selectedSection} />
               {/* Tool preview for empty state */}
               <ToolPreview slug={slug} />
             </div>
           ) : (
             <div className="space-y-6">
               {/* Step 1: Preview files / tool-specific interface */}
               {step === 1 && files.length > 0 && (
                 <div className="space-y-6">
                   <PreviewCanvas />
                   <div className="flex justify-center">
                     <button 
                       onClick={() => useFileStore.setState({ selectedOperation: files.length > 1 ? 'merge' : 'compress' })}
                       className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 transition shadow-glow"
                     >
                       <Settings2 className="h-4 w-4" />
                       Configure Settings
                     </button>
                   </div>
                 </div>
               )}

               {/* Step 2: configure + process */}
               {step === 2 && (
                 <div className="space-y-6">
                   {isProcessing ? (
                     <ProgressTracker />
                   ) : (
                     <ToolSettingsPanel slug={slug} />
                   )}
                 </div>
               )}

               {/* Step 3: download */}
               {step === 3 && (
                 <div className="space-y-6">
                   <BeforeAfterComparison />
                   <DownloadHub />
                 </div>
               )}
             </div>
           )}
         </div>

        {/* SEO Content Block */}
        <div className="border-t border-border/60 pt-12 mb-12">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6">
            About {content.toolName}
          </h2>
          <div className="space-y-4 max-w-4xl text-sm text-gray-600 dark:text-slate-350 leading-relaxed">
            {content.seoBody.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        {content.faqs && content.faqs.length > 0 && (
          <div className="border-t border-border/60 pt-12 mb-12">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.faqs.map((faq, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="font-bold text-sm text-foreground flex items-start gap-2">
                    <span className="text-indigo-500 font-black">?</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-4">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Tools Section */}
        {content.relatedTools && content.relatedTools.length > 0 && (
          <div className="border-t border-border/60 pt-12">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6">
              Related Tools You Might Need
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {content.relatedTools.map((tool, i) => (
                <Link
                  key={i}
                  href={`/${tool.slug}`}
                  className="group bg-card/40 hover:bg-card border border-border/80 hover:border-primary/30 rounded-xs p-5 transition-all duration-350 flex items-start gap-3.5 shadow-sm hover:shadow-md"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-border flex items-center justify-center text-xl shrink-0">
                    {ICON_MAP[tool.icon] ?? "🔧"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">{tool.label}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">Open {tool.label} tool</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
