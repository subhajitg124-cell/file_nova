import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  ChevronRight, Languages, Sparkles, FileText, Image as ImageIcon,
  Crown, User, Menu, X, ArrowLeft, Upload, HelpCircle, AlertTriangle, Cpu
} from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { useLanguage, useTranslation } from "@/lib/i18n";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlanBadge } from "@/components/PlanBadge";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { useSubscription } from "@/hooks/useSubscription";
import { setPageMeta, toolJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getToolContent } from "@/data/toolContent";
import ScholarshipZIPMaker from "@/pages/ScholarshipZIPMaker";

// Import Workspace components
import { UploadZone } from "@/components/workspace/UploadZone";
import { PreviewCanvas } from "@/components/workspace/PreviewCanvas";
import { OptionsPanel } from "@/components/workspace/OptionsPanel";
import { ProgressTracker } from "@/components/workspace/ProgressTracker";
import { DownloadHub } from "@/components/workspace/DownloadHub";
import { BulkProcessor } from "@/components/BulkProcessor";
import { apiClient, apiMock } from "@/lib/api";

interface DedicatedToolPageProps {
  params: {
    slug: string;
  };
}

const ACCENT_CLASSES = {
  indigo: {
    bgGlow: "bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)]",
    textGradient: "from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400",
    borderHover: "hover:border-indigo-500/30",
    glow: "shadow-glow-indigo",
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
  },
  purple: {
    bgGlow: "bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.15),_transparent_60%)]",
    textGradient: "from-purple-600 via-pink-605 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400",
    borderHover: "hover:border-purple-500/30",
    glow: "shadow-glow-purple",
    badge: "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/25",
    iconBg: "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400"
  },
  emerald: {
    bgGlow: "bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_60%)]",
    textGradient: "from-emerald-600 via-teal-600 to-emerald-600 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-400",
    borderHover: "hover:border-emerald-500/30",
    glow: "shadow-glow-emerald",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
  },
  amber: {
    bgGlow: "bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.15),_transparent_60%)]",
    textGradient: "from-amber-600 via-orange-600 to-amber-600 dark:from-amber-400 dark:via-orange-400 dark:to-amber-400",
    borderHover: "hover:border-amber-500/30",
    glow: "shadow-glow-amber",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    iconBg: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
  },
  rose: {
    bgGlow: "bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.15),_transparent_60%)]",
    textGradient: "from-rose-600 via-pink-600 to-rose-600 dark:from-rose-400 dark:via-pink-400 dark:to-rose-400",
    borderHover: "hover:border-rose-500/30",
    glow: "shadow-glow-rose",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    iconBg: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
  },
  sky: {
    bgGlow: "bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_60%)]",
    textGradient: "from-sky-600 via-blue-600 to-sky-600 dark:from-sky-400 dark:via-blue-400 dark:to-sky-400",
    borderHover: "hover:border-sky-500/30",
    glow: "shadow-glow-sky",
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    iconBg: "bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400"
  }
};

export default function DedicatedToolPage({ params }: DedicatedToolPageProps) {
  const slug = params.slug.toLowerCase().trim();
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

  const content = getToolContent(slug);

  // Health check
  useEffect(() => {
    const fetchHealth = async () => {
      const res = await apiClient.checkHealth();
      setBackendStatus(res.healthy, res.capabilities);
      if (!res.healthy) useFileStore.setState({ isMockMode: true });
    };
    fetchHealth();
  }, [setBackendStatus]);

  // Setup SEO and store configuration
  useEffect(() => {
    if (!content) {
      setLocation("/404");
      return;
    }

    setIsConfigured(false);
    
    // Set Page Metadata
    const title = content.metaTitle;
    const description = content.metaDescription;
    const keywords = content.keywords;
    const canonical = `/${content.slug}`;

    const appJsonLd = toolJsonLd({
      name: content.h1.split("—")[0].trim(),
      description: content.metaDescription,
      url: `https://filenova.in/${content.slug}`,
      category: content.schemaCategory
    });

    const breadcrumbLd = breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: content.breadcrumb[0], url: content.breadcrumb[1] },
      { name: content.h1.split("—")[0].trim(), url: `/${content.slug}` }
    ]);

    const faqLd = faqJsonLd(content.faqs);

    setPageMeta({
      title,
      description,
      keywords,
      canonical,
      jsonLd: [appJsonLd, breadcrumbLd, faqLd]
    });

    // Configure store operations
    const store = useFileStore.getState();
    store.clearStore();

    switch (slug) {
      case "compress-pdf":
        store.setSelectedSection("pdf");
        store.setOperation("compress");
        break;
      case "merge-pdf":
        store.setSelectedSection("pdf");
        store.setOperation("merge");
        break;
      case "image-to-pdf":
        store.setSelectedSection("pdf");
        store.setOperation("convert");
        store.updateOptions({ operation: "images_to_pdf" });
        break;
      case "pdf-to-image":
        store.setSelectedSection("pdf");
        store.setOperation("convert");
        store.updateOptions({ operation: "pdf_to_images" });
        break;
      case "ocr":
        store.setSelectedSection("pdf");
        store.setOperation("edit");
        store.updateOptions({ operation: "pdf_ocr" });
        break;
      case "resize-image":
        store.setSelectedSection("image");
        store.setOperation("resize");
        store.updateOptions({ operation: "resize" });
        break;
      case "remove-background":
        store.setSelectedSection("image");
        store.setOperation("edit");
        store.updateOptions({ operation: "remove_bg" });
        break;
      case "aadhaar-mask":
        store.setSelectedSection("image");
        store.setOperation("resize");
        store.updateOptions({
          operation: "resize",
          resizeType: "dimensions",
          width: 856,
          height: 540,
          resize_width: 856,
          resize_height: 540,
          resize_lock_aspect: false
        });
        break;
      case "pan-card-resize":
        store.setSelectedSection("image");
        store.setOperation("pancard");
        break;
      case "word-to-pdf":
        store.setSelectedSection("office");
        store.setOperation("convert");
        store.updateOptions({ operation: "docx_to_pdf" });
        break;
      case "ai-pdf-summary":
        store.setSelectedSection("pdf");
        store.setOperation("edit");
        store.updateOptions({ operation: "pdf_summarize" });
        break;
      default:
        break;
    }

    // Check for preloaded/dropped file in history state
    const droppedFile = window.history.state?.droppedFile;
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
        } catch (err: any) {
          store.setError(err.message || 'Preload upload failed.');
        } finally {
          store.setProcessing(false);
        }
      })();
    }

    setIsConfigured(true);
  }, [slug, content]);

  if (!content) return null;

  const accent = ACCENT_CLASSES[content.accentColor] || ACCENT_CLASSES.indigo;
  const step = downloadUrl ? 3 : (files.length > 0 && selectedOperation) ? 2 : 1;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative">
      {/* Background Gradients */}
      <div className={`absolute top-0 left-0 right-0 h-[600px] ${accent.bgGlow} pointer-events-none z-0`} />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_70%)] pointer-events-none z-0" />

      {/* Header Nav */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logo.png" alt="FileNova logo" className="h-9 w-auto" />
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm text-foreground block">FileNova.in</span>
              <span className="text-[10px] text-muted-foreground block leading-none font-bold uppercase tracking-wider">CSC & STUDENT PORTAL</span>
            </div>
          </Link>

          {/* Right Action Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Selection */}
            <div className="hidden lg:flex items-center gap-1 bg-card border border-border rounded-lg px-2.5 py-1 text-xs text-muted-foreground">
              <Languages className="h-3.5 w-3.5" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent border-none outline-none text-foreground font-bold focus:ring-0 cursor-pointer"
                title="Select language"
              >
                <option value="en" className="bg-card text-foreground">English</option>
                <option value="hi" className="bg-card text-foreground">हिन्दी</option>
                <option value="bn" className="bg-card text-foreground">বাংলা</option>
                <option value="te" className="bg-card text-foreground">తెలుగు</option>
                <option value="mr" className="bg-card text-foreground">मराठी</option>
                <option value="ta" className="bg-card text-foreground">தமிழ்</option>
                <option value="gu" className="bg-card text-foreground">ગુજરાતી</option>
                <option value="kn" className="bg-card text-foreground">ಕನ್ನಡ</option>
                <option value="ml" className="bg-card text-foreground">മലയാളം</option>
                <option value="pa" className="bg-card text-foreground">ਪੰਜਾਬੀ</option>
                <option value="or" className="bg-card text-foreground">ଓଡ଼ିଆ</option>
                <option value="as" className="bg-card text-foreground">অসমীয়া</option>
                <option value="ur" className="bg-card text-foreground">اردو</option>
                <option value="ne" className="bg-card text-foreground">नेपाली</option>
                <option value="sat" className="bg-card text-foreground">ᱥᱟᱱᱛᱟᱲᱤ</option>
              </select>
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
            <div className="flex items-center justify-between px-4 py-2 border border-border bg-card rounded-xl">
              <span className="text-xs font-bold text-muted-foreground">{tText("Theme Mode")}</span>
              <ThemeToggle />
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
        <nav className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <Link href={content.breadcrumb[1]} className="hover:text-primary transition-colors">{content.breadcrumb[0]}</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-slate-800 dark:text-slate-200">{content.h1.split("—")[0].trim()}</span>
        </nav>

        {/* Page Header (H1 + Intro) */}
        <div className="mb-10 text-left space-y-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            {content.h1}
          </h1>
          <p className="text-gray-600 dark:text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
            {content.intro}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {content.benefits.map((benefit, i) => (
            <div key={i} className={`bg-card/40 border border-border/80 rounded-2xl p-5 ${accent.borderHover} transition-all duration-300`}>
              <div className="text-2xl mb-3">{benefit.icon}</div>
              <h3 className="font-extrabold text-sm text-foreground mb-1.5">{benefit.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Workspace Area */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-12">
          {/* Workspace Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />

          {/* Wizard step indicator (when files loaded and not scholarship-zip) */}
          {files.length > 0 && slug !== "scholarship-zip" && (
            <div className="w-full max-w-sm mx-auto flex items-center justify-between relative px-2 mb-8">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2 -z-10" />
              <div
                className="absolute top-1/2 left-0 h-px bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              />
              {[{l:'Upload',n:1},{l:'Configure',n:2},{l:'Export',n:3}].map(({l,n}) => (
                <div key={n} className="flex flex-col items-center bg-card px-3 gap-1.5">
                  <span className={`h-7 w-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${step >= n ? 'border-primary bg-primary text-primary-foreground shadow-glow' : 'border-border bg-slate-900 text-muted-foreground'}`}>
                    {n}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${step >= n ? 'text-primary' : 'text-muted-foreground'}`}>{l}</span>
                </div>
              ))}
            </div>
          )}

          {/* Load/Embed Content */}
          {!isConfigured ? (
            <div className="text-center py-20">
              <Sparkles className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-muted-foreground">Configuring workspace...</p>
            </div>
          ) : slug === "scholarship-zip" ? (
            <ScholarshipZIPMaker isEmbedded={true} />
          ) : files.length === 0 ? (
            <div className="space-y-4">
              <UploadZone allowedCategory={selectedSection} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 2: configure + process */}
              {step === 2 && (
                <div className="space-y-6">
                  {rawFiles.length > 1 ? (
                    <BulkProcessor />
                  ) : isProcessing ? (
                    <ProgressTracker />
                  ) : (
                    <div className="space-y-8">
                      <PreviewCanvas />
                      <OptionsPanel />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: download */}
              {step === 3 && (
                <DownloadHub />
              )}
            </div>
          )}
        </div>

        {/* How-To Steps Section */}
        <div className="border-t border-border/60 pt-12 mb-12">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6">
            How to {content.h1.split("—")[0].trim().replace(" Online", "").toLowerCase()} in 4 Easy Steps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.steps.map((step, i) => (
              <div key={i} className="flex flex-col space-y-2 relative">
                <div className="flex items-center gap-3">
                  <span className={`h-8 w-8 rounded-full ${accent.iconBg} flex items-center justify-center font-black text-sm shrink-0`}>
                    {step.step}
                  </span>
                  <h3 className="font-extrabold text-sm text-foreground">{step.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-11">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-border/60 pt-12 mb-12">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions (FAQ)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.faqs.map((faq, i) => (
              <div key={i} className="space-y-2">
                <h3 className="font-bold text-sm text-foreground flex items-start gap-2">
                  <span className="text-indigo-500 font-black">?</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-4">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Tools Section */}
        <div className="border-t border-border/60 pt-12">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6">
            Related Tools You Might Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.relatedTools.map((tool, i) => (
              <Link
                key={i}
                href={`/${tool.slug}`}
                className="group bg-card/40 hover:bg-card border border-border/80 hover:border-primary/30 rounded-2xl p-5 transition-all duration-350 flex items-start gap-3.5 shadow-sm hover:shadow-md"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-border flex items-center justify-center text-xl shrink-0">
                  {tool.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">{tool.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-1">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
