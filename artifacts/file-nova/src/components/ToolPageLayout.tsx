import React, { useEffect, useState, type ReactNode } from "react";
import { useLocation, Link } from "wouter";
import {
  ChevronRight, ChevronLeft, Languages, Sparkles, FileText, Image as ImageIcon,
  Crown, User, Menu, X, ArrowLeft, Upload, HelpCircle, AlertTriangle, BookOpen, PlayCircle, CheckCircle2, ArrowDown, Settings2, Download, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const FAQItemComponent = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/60 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left py-2 text-sm font-bold text-foreground hover:text-brand-primary transition-colors focus:outline-none group cursor-pointer"
      >
        <span className="flex items-center gap-3">
          <span className="text-brand-primary font-black">?</span>
          <span>{q}</span>
        </span>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-300 shrink-0 ${isOpen ? "rotate-90 text-brand-primary" : "group-hover:translate-x-0.5"}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground leading-relaxed pl-6 pb-3 pt-1">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
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

  // Close popovers on outside click
  useEffect(() => {
    if (!settingsOpen && !moreMenuOpen && !mobileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const header = document.querySelector("header");
      if (!header || header.contains(target)) return;
      if (mobileMenuOpen) setMobileMenuOpen(false);
      if (settingsOpen) setSettingsOpen(false);
      if (moreMenuOpen) setMoreMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen, settingsOpen, moreMenuOpen]);

  if (!content) return null;

  const step = downloadUrl ? 3 : (files.length > 0 && selectedOperation) ? 2 : 1;
  const isScholarshipZip = slug === "scholarship-zip";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)] pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_70%)] pointer-events-none z-0" />

      {/* Header Nav */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="sticky top-0 z-40 w-full bg-transparent py-3 px-3 sm:px-4 transition-all duration-300"
      >
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur-xl shadow-premium relative overflow-hidden group/nav">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/10 to-brand-primary/0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Logo - compact, tagline only in hero */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 relative z-10">
            <img src="/logo.png" alt="FileNova logo" className="h-8 w-auto" />
            <span className="font-extrabold text-sm text-foreground hidden sm:block">FileNova</span>
          </Link>

          {/* Right Action Menu */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative z-10">

            {/* Combined Settings (Language + Theme) - icon only */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all cursor-pointer"
                aria-label="Settings"
                title="Settings"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 bg-card border border-border rounded-xl shadow-xl p-4 space-y-4 z-50 min-w-[200px]"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{tText("Theme")}</p>
                      <ThemeToggle />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{tText("Language")}</p>
                      <LanguageSelector />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Secondary Desktop Nav - inline at xl+ (1280px+) */}
            <div className="hidden xl:flex items-center gap-1">
              <PopularToolsDropdown />
              <Link href="/india-tools" className="flex items-center gap-1 text-[11px] text-emerald-500 hover:text-emerald-400 font-bold py-1.5 px-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all whitespace-nowrap">
                🇮🇳 {tText("India Tools")}
              </Link>
              <Link href="/workflows" className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-400 font-bold py-1.5 px-2.5 rounded-lg border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all whitespace-nowrap">
                <Zap className="h-3.5 w-3.5" />
                {tText("Workflows")}
              </Link>
              <Link href="/workspace" className="flex items-center gap-1 text-[11px] text-foreground hover:text-primary font-bold py-1.5 px-2.5 rounded-lg border border-border bg-card hover:border-primary/35 hover:bg-primary/10 transition-all whitespace-nowrap">
                <FileText className="h-3.5 w-3.5" />
                {tText("Workspace")}
              </Link>
            </div>

            {/* "More" Dropdown - replaces secondary nav at lg-xl (1024-1280px), hidden at xl+ */}
            <div className="hidden lg:block xl:hidden relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1 text-[11px] font-bold text-foreground py-1.5 px-2.5 rounded-lg border border-border bg-card hover:bg-accent/60 transition-all cursor-pointer whitespace-nowrap"
              >
                <Menu className="h-3.5 w-3.5" />
                {tText("Menu")}
              </button>
              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 bg-card border border-border rounded-xl shadow-xl p-2 z-50 min-w-[190px] space-y-0.5"
                  >
                    <div className="px-2 py-1.5"><PopularToolsDropdown /></div>
                    <Link href="/india-tools" onClick={() => setMoreMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-emerald-500 hover:bg-accent/60 transition-colors">
                      🇮🇳 {tText("India Tools")}
                    </Link>
                    <Link href="/workflows" onClick={() => setMoreMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-indigo-500 hover:bg-accent/60 transition-colors">
                      <Zap className="h-4 w-4" /> {tText("Workflows")}
                    </Link>
                    <Link href="/workspace" onClick={() => setMoreMenuOpen(false)} className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold text-foreground hover:bg-accent/60 transition-colors">
                      <FileText className="h-4 w-4" /> {tText("Workspace")}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Premium Suite CTA - highest contrast, solid gradient button */}
            <Link href="/pricing" className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 px-3 py-2 rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0 active:scale-95">
              <Crown className="h-3.5 w-3.5 fill-current" />
              {tText("Premium")}
            </Link>

            {/* Profile Dropdown & Plan Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="hidden sm:block">
                <PlanBadge />
              </div>
              {user ? (
                <UserProfileDropdown />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-3 py-2 text-[11px] font-black text-white transition-all duration-300 shadow-sm whitespace-nowrap shrink-0 border border-indigo-500/30 hover:scale-[1.02] active:scale-95"
                >
                  {tText("Login")}
                </Link>
              )}
            </div>

            {/* Mobile Nav Toggle - hidden at lg (1024px+) */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-accent/50 rounded-lg text-muted-foreground hover:text-foreground lg:hidden cursor-pointer"
              aria-label="Toggle mobile menu"
              title="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Panel - hidden at lg+ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="mobile-menu-panel lg:hidden border border-border/60 bg-background/95 backdrop-blur-xl p-4 space-y-3 rounded-2xl shadow-premium mt-2 mx-4 overflow-hidden relative z-30"
          >
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="flex items-center justify-center gap-2 text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 rounded-lg">
                <Crown className="h-4 w-4 fill-current" />
                {tText("Premium Suite")}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/workspace" className="text-center text-sm bg-card border border-border text-foreground font-bold py-2 rounded-lg">
                <FileText className="h-4 w-4 inline-block mr-1.5" />{tText("Open Document Workspace")}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/workflows" className="flex items-center justify-center gap-2 text-sm text-indigo-500 font-bold py-2 border border-indigo-500/20 bg-indigo-500/5 rounded-lg">
                <Zap className="h-4 w-4" />
                {tText("Workflows")}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/india-tools" className="flex items-center justify-center gap-2 text-sm text-emerald-500 font-bold py-2 border border-emerald-500/20 bg-emerald-500/5 rounded-lg">
                🇮🇳 {tText("India Tools")}
              </Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/contact" className="text-center text-sm border border-border text-foreground font-bold py-2 rounded-lg">
                {tText("📞 Contact Support")}
              </Link>
              <div className="flex items-center justify-between px-4 py-2 border border-border bg-card rounded-lg">
                <span className="text-xs font-bold text-muted-foreground">{tText("Theme")}</span>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between px-4 py-2 border border-border bg-card rounded-lg">
                <span className="text-xs font-bold text-muted-foreground">{tText("Language")}</span>
                <LanguageSelector />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {['aadhaar-mask-pdf', 'pan-card-resize', 'scholarship-zip', 'government-form-fill', 'compress-pdf-for-upload'].includes(slug) && (
              <div className="mb-6 space-y-3">
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-tight shadow-sm select-none">
                    🔒 Processed in your browser — never uploaded
                  </span>
                </div>
                <div className="flex justify-center">
                  <Link href="/india-tools" className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                    🇮🇳 View all India Tools
                  </Link>
                </div>
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
          <div className="border-t border-border/60 pt-12 mb-12 max-w-3xl mx-auto animate-fade-up">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="space-y-1">
              {content.faqs.map((faq, i) => (
                <FAQItemComponent key={i} q={faq.q} a={faq.a} />
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

      {/* Workflow Suggestion Banner */}
      {['compress-pdf', 'merge-pdf', 'resize-photo', 'aadhaar-mask', 'compress-image', 'protect-pdf'].includes(slug) && (
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <Link
            href="/workflows"
            className="flex items-center gap-4 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 hover:border-indigo-500/40 hover:from-indigo-500/15 hover:via-violet-500/15 hover:to-indigo-500/15 transition-all group"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">
                Combine this with other tools →
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Build a workflow: compress + resize + protect — all in one click. No code, no signup.
              </p>
            </div>
            <span className="text-xs text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
              Open Workflows <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}
