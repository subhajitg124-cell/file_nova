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
import { BackHomeBar } from "@/components/BackHomeBar";
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
import { Navbar } from "@/components/Navbar";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

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
  "file-zip-pdf": "🗜️",
  passport: "🛂",
  signature: "✍️",
  crop: "✂️",
  watermark: "💧",
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

const CATEGORY_PAGES: Record<string, { label: string; href: string }> = {
  pdf: { label: "PDF Tools", href: "/pdf-tools" },
  image: { label: "Image Tools", href: "/image-tools" },
  video: { label: "Video Tools", href: "/video-tools" },
  document: { label: "Document Tools", href: "/document-tools" },
  ocr: { label: "OCR & AI Tools", href: "/document-tools" },
  form: { label: "India Forms", href: "/india-tools" },
  audio: { label: "Audio Tools", href: "/video-tools" },
};

const SLUG_CATEGORY: Record<string, string> = {
  "merge-pdf": "pdf", "split-pdf": "pdf", "compress-pdf": "pdf", "rotate-pdf": "pdf",
  "unlock-pdf": "pdf", "protect-pdf": "pdf", "resize-pdf": "pdf", "pdf-to-word": "pdf",
  "pdf-to-jpg": "pdf", "jpg-to-pdf": "pdf", "word-to-pdf": "document",
  "ocr": "ocr", "ai-pdf-summary": "document", "remove-background": "image",
  "compress-image": "image", "resize-image": "image", "scholarship-zip": "form",
  "aadhaar-mask-pdf": "form", "pan-card-resize": "form", "government-form-fill": "form",
  "compress-pdf-for-upload": "pdf", "ai-ppt-maker": "document", "compress-doc": "document",
};

const POPULAR_TOOLS: { label: string; slug: string; icon: string }[] = [
  { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
  { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
  { label: "Split PDF", slug: "split-pdf", icon: "scissors" },
  { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
  { label: "JPG to PDF", slug: "jpg-to-pdf", icon: "photo" },
  { label: "Word to PDF", slug: "word-to-pdf", icon: "file-text" },
  { label: "Mask Aadhaar", slug: "aadhaar-mask-pdf", icon: "id-badge" },
  { label: "PAN Card Resize", slug: "pan-card-resize", icon: "credit-card" },
  { label: "OCR", slug: "ocr", icon: "scan" },
  { label: "AI Summary", slug: "ai-pdf-summary", icon: "sparkles" },
  { label: "Remove Background", slug: "remove-background", icon: "eraser" },
  { label: "Resize Image", slug: "resize-image", icon: "resize" },
];

const CATEGORY_TOOLS: Record<string, { label: string; slug: string; icon: string }[]> = {
  pdf: [
    { label: "Merge PDF", slug: "merge-pdf", icon: "files" },
    { label: "Split PDF", slug: "split-pdf", icon: "scissors" },
    { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
    { label: "Rotate PDF", slug: "rotate-pdf", icon: "rotate" },
    { label: "Protect PDF", slug: "protect-pdf", icon: "lock" },
    { label: "Unlock PDF", slug: "unlock-pdf", icon: "lock-open" },
    { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
    { label: "PDF to JPG", slug: "pdf-to-jpg", icon: "photo" },
  ],
  image: [
    { label: "Compress Image", slug: "compress-image", icon: "file-zip" },
    { label: "Resize Image", slug: "resize-image", icon: "resize" },
    { label: "Remove Background", slug: "remove-background", icon: "eraser" },
    { label: "JPG to PDF", slug: "jpg-to-pdf", icon: "photo" },
  ],
  form: [
    { label: "Mask Aadhaar", slug: "aadhaar-mask-pdf", icon: "id-badge" },
    { label: "PAN Card Resize", slug: "pan-card-resize", icon: "credit-card" },
    { label: "Government Form Fill", slug: "government-form-fill", icon: "clipboard" },
    { label: "Scholarship ZIP", slug: "scholarship-zip", icon: "file-zip" },
  ],
  document: [
    { label: "Word to PDF", slug: "word-to-pdf", icon: "file-word" },
    { label: "Compress Doc", slug: "compress-doc", icon: "file-zip" },
    { label: "AI PPT Maker", slug: "ai-ppt-maker", icon: "sparkles" },
  ],
  ocr: [
    { label: "OCR", slug: "ocr", icon: "scan" },
    { label: "AI PDF Summary", slug: "ai-pdf-summary", icon: "sparkles" },
  ],
};

const WORKFLOW_CHAINS: Record<string, { slug: string; label: string; icon: string }> = {
  "compress-pdf": { slug: "merge-pdf", label: "Merge PDFs", icon: "files" },
  "merge-pdf": { slug: "compress-pdf", label: "Compress PDF", icon: "file-zip" },
  "jpg-to-pdf": { slug: "compress-pdf", label: "Compress PDF", icon: "file-zip" },
  "pdf-to-word": { slug: "compress-doc", label: "Compress Document", icon: "file-zip" },
  "word-to-pdf": { slug: "compress-pdf", label: "Compress PDF", icon: "file-zip" },
  "split-pdf": { slug: "merge-pdf", label: "Merge PDFs", icon: "files" },
  "remove-background": { slug: "jpg-to-pdf", label: "Convert to PDF", icon: "photo" },
  "resize-image": { slug: "compress-image", label: "Compress Image", icon: "file-zip" },
  "compress-image": { slug: "jpg-to-pdf", label: "Convert to PDF", icon: "photo" },
  "protect-pdf": { slug: "unlock-pdf", label: "Unlock PDF", icon: "lock-open" },
  "unlock-pdf": { slug: "protect-pdf", label: "Protect PDF", icon: "lock" },
  "aadhaar-mask-pdf": { slug: "pan-card-resize", label: "PAN Card Resize", icon: "credit-card" },
  "pan-card-resize": { slug: "aadhaar-mask-pdf", label: "Mask Aadhaar", icon: "id-badge" },
  "ocr": { slug: "ai-pdf-summary", label: "AI PDF Summary", icon: "sparkles" },
  "ai-pdf-summary": { slug: "ocr", label: "OCR PDF", icon: "scan" },
  "government-form-fill": { slug: "compress-pdf-for-upload", label: "Compress for Upload", icon: "file-zip" },
  "scholarship-zip": { slug: "compress-pdf-for-upload", label: "Compress for Upload", icon: "file-zip" },
  "compress-pdf-for-upload": { slug: "scholarship-zip", label: "Scholarship ZIP", icon: "file-zip" },
  "rotate-pdf": { slug: "split-pdf", label: "Split PDF", icon: "scissors" },
  "resize-pdf": { slug: "compress-pdf", label: "Compress PDF", icon: "file-zip" },
};

const RECENT_TOOLS_KEY = "filenova-recent-tool-pages";

function trackRecentTool(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY) || "[]");
    const updated = [slug, ...stored.filter((s: string) => s !== slug)].slice(0, 6);
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

function getRecentTools(): { label: string; slug: string; icon: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const stored: string[] = JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY) || "[]");
    const all: Record<string, { label: string; slug: string; icon: string }> = {};
    [...POPULAR_TOOLS, ...Object.values(CATEGORY_TOOLS).flat()].forEach(t => { all[t.slug] = t; });
    return stored.map(s => all[s]).filter(Boolean).slice(0, 4);
  } catch { return []; }
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return <Link key={i} href={`/${match[2]}`} className="text-primary hover:underline font-semibold">{match[1]}</Link>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function ToolPageLayout({ slug, children }: ToolPageLayoutProps) {
  const content = toolContentMap[slug];
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { premiumTier } = useSubscription();
  const { language, setLanguage } = useLanguage();
  const { tText } = useTranslation();

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

    trackRecentTool(slug);
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

      {/* Navigation */}
      <Navbar showSearch={false} />

      {/* Offline Simulator Warning */}
      {!isMockMode && !backendHealthy && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2 relative z-20">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          FastAPI backend is offline — running in Standalone Simulator mode.
        </div>
      )}

       {/* Main Container */}
       <main className="max-w-5xl mx-auto px-4 pt-10 pb-20 relative z-10">
         
         {/* Back Navigation */}
         <div className="mb-4">
           <BackHomeBar />
         </div>

         {/* Breadcrumb with category context */}
         <Breadcrumb aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-6">
           <BreadcrumbList className="flex flex-wrap items-center gap-1.5 break-words text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
             <BreadcrumbItem>
               <BreadcrumbLink href="/" className="hover:text-primary transition-colors">Home</BreadcrumbLink>
             </BreadcrumbItem>
             <BreadcrumbSeparator><ChevronRight className="h-3 w-3" /></BreadcrumbSeparator>
             <BreadcrumbItem>
               <BreadcrumbLink href="/tools" className="hover:text-primary transition-colors">All Tools</BreadcrumbLink>
             </BreadcrumbItem>
             {(() => {
               const cat = SLUG_CATEGORY[slug] || (content.toolCategory as string);
               const catPage = CATEGORY_PAGES[cat];
               if (catPage) {
                 return (<><BreadcrumbSeparator><ChevronRight className="h-3 w-3" /></BreadcrumbSeparator><BreadcrumbItem><BreadcrumbLink href={catPage.href} className="hover:text-primary transition-colors">{catPage.label}</BreadcrumbLink></BreadcrumbItem></>);
               }
               return null;
             })()}
             <BreadcrumbSeparator><ChevronRight className="h-3 w-3" /></BreadcrumbSeparator>
             <BreadcrumbItem>
               <BreadcrumbPage className="text-slate-800 dark:text-slate-200">{content.toolName}</BreadcrumbPage>
             </BreadcrumbItem>
           </BreadcrumbList>
         </Breadcrumb>

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
              <p key={i}><LinkifiedText text={paragraph} /></p>
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

        {/* Suggested Next Tool */}
        {WORKFLOW_CHAINS[slug] && (
          <div className="border-t border-border/60 pt-12">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-4">
              Suggested Next Step
            </h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-xl">
              After using {content.toolName}, many users also need this tool:
            </p>
            <div className="max-w-sm">
              <Link
                href={`/${WORKFLOW_CHAINS[slug].slug}`}
                className="group flex items-center gap-4 bg-card/40 hover:bg-card border border-border/80 hover:border-primary/30 rounded-xs p-5 transition-all shadow-sm hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-border flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {ICON_MAP[WORKFLOW_CHAINS[slug].icon] ?? "🔧"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{WORKFLOW_CHAINS[slug].label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Continue your document workflow</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          </div>
        )}

        {/* More [Category] Tools */}
        {(() => {
          const cat = SLUG_CATEGORY[slug] || (content.toolCategory as string);
          const tools = CATEGORY_TOOLS[cat];
          if (!tools || tools.length === 0) return null;
          const catPage = CATEGORY_PAGES[cat];
          const otherTools = tools.filter(t => t.slug !== slug);
          if (otherTools.length === 0) return null;
          return (
            <div className="border-t border-border/60 pt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                  More {catPage ? catPage.label : "Tools"}
                </h2>
                {catPage && (
                  <Link href={catPage.href} className="text-xs font-bold text-primary hover:underline">
                    View all →
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {otherTools.slice(0, 4).map((tool, i) => (
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
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">Open {tool.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Popular Tools */}
        <div className="border-t border-border/60 pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
              Popular Tools
            </h2>
            <Link href="/tools" className="text-xs font-bold text-primary hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_TOOLS.filter(t => t.slug !== slug).slice(0, 8).map((tool, i) => (
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
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">Open {tool.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

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
