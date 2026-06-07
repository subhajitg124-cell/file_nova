import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  Search, Languages, User, Sparkles, ShieldCheck, Lock, ChevronRight, 
  GraduationCap, IdCard, FileText, Image as ImageIcon, Settings2, 
  Film, Crown, ArrowRight, ArrowUpRight, CheckCircle, Menu, X, HelpCircle,
  LayoutGrid, Upload
} from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { useLanguage, useTranslation } from "@/lib/i18n";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanBadge } from "@/components/PlanBadge";
import { ToolSearch } from "@/components/ToolSearch";
import { setPageMeta } from "@/lib/seo";


// Curated tools to display on the homepage grid
interface CuratedTool {
  id: string;
  title: string;
  description: string;
  category: "india" | "pdf" | "image" | "office" | "ai";
  action: () => void;
  badge?: string;
  icon: any;
  tags?: string[];
}

export default function SimpleHome() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { premiumTier, useCount } = useSubscription();
  const { language, setLanguage } = useLanguage();
  const { tText } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | "india" | "pdf" | "image" | "office" | "ai">("all");
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);

  // Homepage SEO
  useEffect(() => {
    setPageMeta({
      title: "FileNova — Free Document Tools for India | PDF, Aadhaar, Scholarship",
      description: "Compress PDFs, mask Aadhaar cards, resize passport photos, generate Scholarship ZIPs for SVMCM/OASIS/Kanyashree. 100% free, browser-based, no uploads.",
      canonical: "/",
      keywords: "pdf tools india, aadhaar masking, scholarship zip, compress pdf, resize photo, csc portal tools, oasis scholarship documents",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FileNova",
        url: "https://filenova.in",
        description: "Free document automation tools for Indian students and CSC operators",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://filenova.in/tools?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    });
  }, []);

  // Drag and drop / picker modal state
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [showPickerModal, setShowPickerModal] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const file = filesArray[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (ext === "pdf") {
        routeToTool("compress-pdf", file);
      } else if (["jpeg", "jpg", "png", "webp"].includes(ext || "")) {
        routeToTool("images-to-pdf", file);
      } else {
        setDroppedFile(file);
        setShowPickerModal(true);
      }
    }
  };

  const routeToTool = (toolId: string, file: File) => {
    const canonicalMap: Record<string, string> = {
      "compress-pdf": "compress-pdf",
      "merge-pdf": "merge-pdf",
      "image-to-pdf": "image-to-pdf",
      "images-to-pdf": "image-to-pdf",
      "pdf-to-image": "pdf-to-image",
      "pdf-to-images": "pdf-to-image",
      "ocr": "ocr",
      "pdf-ocr": "ocr",
      "resize-photo": "resize-image",
      "resize-image": "resize-image",
      "remove-bg": "remove-background",
      "remove-background": "remove-background",
      "aadhaar-masking": "aadhaar-mask",
      "aadhaar-mask": "aadhaar-mask",
      "pan-card": "pan-card-resize",
      "pan-card-resize": "pan-card-resize",
      "docx-to-pdf": "word-to-pdf",
      "word-to-pdf": "word-to-pdf",
      "scholarship-zip-maker": "scholarship-zip",
      "scholarship-zip": "scholarship-zip",
      "scholarship": "scholarship-zip",
      "ai-summarize": "ai-pdf-summary",
      "ai-pdf-summary": "ai-pdf-summary"
    };

    const targetSlug = canonicalMap[toolId] || `tools/${toolId}`;
    window.history.pushState({ droppedFile: file }, "", `/${targetSlug}`);
    window.dispatchEvent(new Event("popstate"));
  };

  const getSuggestedTools = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const type = file.type;
    
    if (ext === 'docx' || ext === 'doc') {
      return [
        { id: 'word-to-pdf', title: 'Word to PDF Converter', desc: 'Convert Word document to PDF' }
      ];
    }
    if (ext === 'xlsx' || ext === 'xls') {
      return [
        { id: 'xlsx-to-csv', title: 'XLSX to CSV Converter', desc: 'Convert spreadsheet to CSV' }
      ];
    }
    if (ext === 'csv') {
      return [
        { id: 'csv-to-xlsx', title: 'CSV to XLSX Converter', desc: 'Convert CSV to spreadsheet' }
      ];
    }
    if (type.startsWith('video/')) {
      return [
        { id: 'compress-video', title: 'Compress Video', desc: 'Reduce MP4/video file size' },
        { id: 'trim-video', title: 'Trim Video', desc: 'Cut and trim video segments' }
      ];
    }
    if (type.startsWith('audio/')) {
      return [
        { id: 'compress-audio', title: 'Compress Audio', desc: 'Reduce audio file size' }
      ];
    }
    if (ext === 'svg') {
      return [
        { id: 'svg-to-png', title: 'SVG to PNG Converter', desc: 'Render vector graphics to PNG image' }
      ];
    }
    return [
      { id: 'compress-pdf', title: 'Compress PDF', desc: 'Reduce PDF file size' },
      { id: 'merge-pdf', title: 'Merge PDF Files', desc: 'Combine multiple PDFs' },
      { id: 'resize-image', title: 'Resize Photo', desc: 'Resize to exact dimensions' },
      { id: 'scholarship-zip', title: 'Scholarship ZIP', desc: 'Compile student docs' }
    ];
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const header = document.querySelector("header");
      const mobileMenu = document.querySelector(".mobile-menu-panel");
      if (
        header && !header.contains(event.target as Node) &&
        mobileMenu && !mobileMenu.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const handleScholarshipClick = () => {
    setLocation("/scholarship-zip");
  };

  const handleAadhaarClick = () => {
    setLocation("/aadhaar-mask");
  };

  const handlePanClick = () => {
    setLocation("/pan-card-resize");
  };

  const handleResizeClick = () => {
    setLocation("/resize-image");
  };

  const handleCompressPdfClick = () => {
    setLocation("/compress-pdf");
  };

  const handleMergePdfClick = () => {
    setLocation("/merge-pdf");
  };

  const handleOcrClick = () => {
    setLocation("/ocr");
  };

  const handleDocxToPdfClick = () => {
    setLocation("/word-to-pdf");
  };

  const handleRemoveBgClick = () => {
    setLocation("/remove-background");
  };

  const handleAiSummarizeClick = () => {
    setLocation("/ai-pdf-summary");
  };

  const curatedTools: CuratedTool[] = [
    // India-Specific
    { id: "scholarship-zip", title: "Scholarship ZIP Maker", description: "Income, marksheet, bank passbook, photo & signature compiled in one ZIP.", category: "india", action: handleScholarshipClick, badge: "Popular", icon: GraduationCap, tags: ["scholarship", "zip", "svmcm", "oasis", "kanyashree", "annapurna"] },
    { id: "aadhaar-masking", title: "Aadhaar Card Masking", description: "Mask the first 8 digits of your Aadhaar card scan for secure uploads.", category: "india", action: handleAadhaarClick, badge: "Secure", icon: ShieldCheck, tags: ["aadhaar", "mask", "uidai", "card", "security"] },
    { id: "pan-card", title: "PAN Card Upload Fix", description: "Resize and optimize signature & photo scans for NSDL/UTI forms.", category: "india", action: handlePanClick, badge: "CSC Special", icon: IdCard, tags: ["pan", "signature", "photo", "nsdl", "uti"] },
    
    // PDF
    { id: "merge-pdf", title: "Merge PDF Files", description: "Combine multiple PDF documents into a single organized file.", category: "pdf", action: handleMergePdfClick, icon: FileText, tags: ["merge", "combine", "pdf", "join"] },
    { id: "compress-pdf", title: "Compress PDF", description: "Shrink PDF size to under 200KB to fit portal size restrictions.", category: "pdf", action: handleCompressPdfClick, icon: FileText, tags: ["compress", "pdf", "shrink", "size", "under 200kb"] },
    
    // Image
    { id: "resize-photo", title: "Resize Photo & Signature", description: "Resize images to custom width/height and format specifications.", category: "image", action: handleResizeClick, icon: ImageIcon, tags: ["resize", "photo", "signature", "width", "height", "crop"] },
    { id: "remove-bg", title: "AI Background Remover", description: "Remove image background automatically to output a transparent PNG.", category: "image", action: handleRemoveBgClick, badge: "New", icon: Sparkles, tags: ["bg", "background", "remove", "transparent", "png", "ai"] },
    
    // Office
    { id: "docx-to-pdf", title: "DOCX to PDF Converter", description: "Convert Microsoft Word document (.docx) into standard readable PDF.", category: "office", action: handleDocxToPdfClick, icon: Settings2, tags: ["docx", "word", "pdf", "convert"] },
    
    // AI
    { id: "pdf-ocr", title: "OCR Scan-to-Text", description: "Extract editable text from scanned certificate images and PDFs.", category: "ai", action: handleOcrClick, badge: "AI", icon: Sparkles, tags: ["ocr", "scan", "text", "extract", "image"] },
    { id: "ai-summarize", title: "AI PDF Summarizer", description: "Generate structured, concise summaries from long PDF documents.", category: "ai", action: handleAiSummarizeClick, badge: "AI", icon: Sparkles, tags: ["summarize", "summary", "ai", "pdf", "long"] }
  ];

  const filteredTools = curatedTools.filter(tool => {
    const matchesCategory = activeCategoryFilter === "all" || tool.category === activeCategoryFilter;
    const matchesSearch = !searchQuery || 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative"
    >
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
              <span className="font-extrabold text-sm text-foreground block">FileNova.in</span>
              <span className="text-[10px] text-muted-foreground block leading-none font-bold uppercase tracking-wider">CSC & STUDENT PORTAL</span>
            </div>
          </Link>

          {/* Search bar inside header */}
          <div className="relative max-w-sm w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder={tText("Search 30+ document tools...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-card border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-muted-foreground/60 text-foreground"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                title="Clear search query"
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder={tText("Search tools...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
            />
          </div>
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

      {premiumTier === "free" && showUpgradeBanner && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-indigo-900 border-b border-indigo-500/20 py-2 px-4 text-center text-xs font-bold text-slate-200 flex items-center justify-center gap-2 relative z-20">
          <span>{tText("Free plan:")} {Math.max(0, 3 - useCount)} {tText("of 3 uses remaining today")} → <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 underline">{tText("Upgrade to Pro ₹99/month")}</Link></span>
          <button
            onClick={() => setShowUpgradeBanner(false)}
            className="absolute right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Hero / Quick Search Section */}
      <section className="pt-20 pb-16 px-4 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold text-indigo-400 mb-6 uppercase tracking-wider animate-pulse">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            {tText("Smart Document Automation for India")}
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            {tText("What do you want to")} <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">{tText("do today?")}</span>
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm md:text-lg mb-12 max-w-xl mx-auto">
            {tText("Process certificates, passport photos, and PDFs safely in your local browser. Ideal for CSC kiosks, cyber cafes, and students.")}
          </p>

          {/* Quick-Link Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link
              href="/scholarship-zip"
              className="flex flex-col items-center justify-between p-6 bg-card hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-border dark:border-slate-900 hover:border-indigo-500/35 rounded-2xl transition-all duration-300 group shadow-lg hover:shadow-glow-indigo-subtle cursor-pointer text-left block"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{tText("Scholarship ZIP")}</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-500 block mt-1">{tText("Compile portal ZIPs")}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-4" />
            </Link>

            <Link
              href="/resize-image"
              className="flex flex-col items-center justify-between p-6 bg-card hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-border dark:border-slate-900 hover:border-emerald-500/35 rounded-2xl transition-all duration-300 group shadow-lg hover:shadow-glow-emerald-subtle cursor-pointer text-left block"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{tText("Resize Photo")}</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-500 block mt-1">{tText("Selfies to exact dimensions")}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all mt-4" />
            </Link>

            <Link
              href="/compress-pdf"
              className="flex flex-col items-center justify-between p-6 bg-card hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-border dark:border-slate-900 hover:border-purple-500/35 rounded-2xl transition-all duration-300 group shadow-lg hover:shadow-glow-purple-subtle cursor-pointer text-left block"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{tText("Compress PDF")}</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-500 block mt-1">{tText("Fit portal file limits")}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all mt-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Flat horizontal Quick Actions */}
      <section className="py-6 border-y border-border dark:border-slate-900 bg-card/40 dark:bg-slate-950/40 relative z-10 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3.5">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider shrink-0 mr-2">{tText("Quick Actions:")}</span>
          {[
            { label: tText("Aadhaar Card Mask"), href: "/aadhaar-mask" },
            { label: tText("NSDL PAN Resize"), href: "/pan-card-resize" },
            { label: tText("Merge PDF"), href: "/merge-pdf" },
            { label: tText("OCR Extraction"), href: "/ocr" },
            { label: tText("Signature Scale"), href: "/resize-image" }
          ].map((act, i) => (
            <Link
              key={i}
              href={act.href}
              className="inline-flex items-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 font-bold text-xs py-1.5 px-3.5 rounded-full transition-all cursor-pointer shadow-sm animate-pulse-hover"
            >
              {act.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Main Curated Grid Directory */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                {tText("Featured Document Automation Tools")}
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-xs mt-1">{tText("Our client-side processors require zero file uploads to servers. Fast, secure, and private.")}</p>
            </div>
            
            <Link href="/tools" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline">
              {tText("Explore all 30+ tools")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Grid Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: "all", label: tText("All Curated") },
              { key: "india", label: tText("Indian Portals") },
              { key: "pdf", label: tText("PDF Tools") },
              { key: "image", label: tText("Image Tools") },
              { key: "office", label: tText("Office & Docs") },
              { key: "ai", label: tText("AI Suite") }
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategoryFilter(cat.key as any)}
                className={`py-1.5 px-3.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryFilter === cat.key
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-glow-indigo"
                    : "bg-white dark:bg-slate-900/60 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-700 hover:text-gray-900 dark:hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const ToolIcon = tool.icon || HelpCircle;
              const canonicalUrl = 
                tool.id === "scholarship-zip" ? "/scholarship-zip" :
                tool.id === "aadhaar-masking" ? "/aadhaar-mask" :
                tool.id === "pan-card" ? "/pan-card-resize" :
                tool.id === "merge-pdf" ? "/merge-pdf" :
                tool.id === "compress-pdf" ? "/compress-pdf" :
                tool.id === "resize-photo" ? "/resize-image" :
                tool.id === "remove-bg" ? "/remove-background" :
                tool.id === "docx-to-pdf" ? "/word-to-pdf" :
                tool.id === "pdf-ocr" ? "/ocr" :
                tool.id === "ai-summarize" ? "/ai-pdf-summary" :
                `/tools/${tool.id}`;

              return (
                <Link
                  key={tool.id}
                  href={canonicalUrl}
                  className="group bg-white dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-gray-200 dark:border-slate-800 hover:border-indigo-400/40 dark:hover:border-indigo-500/25 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md text-left block"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-850 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <ToolIcon className="h-5 w-5" />
                      </div>
                      {tool.badge && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          tool.badge === "Popular" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25" :
                          tool.badge === "Secure" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" :
                          tool.badge === "AI" ? "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/25" :
                          "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-border dark:border-slate-700"
                        }`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tText(tool.title)}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                      {tText(tool.description)}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-900/60 flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider">
                    <span>{tText(tool.category === "india" ? "Indian Portals" : tool.category === "pdf" ? "PDF Tools" : tool.category === "image" ? "Image Tools" : tool.category === "office" ? "Office & Docs" : tool.category === "ai" ? "AI Suite" : tool.category)}</span>
                    <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-900 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3">
            {tText("Why 10,000+ Cyber Cafes & CSC Centers Trust FileNova")}
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-xs max-w-md mx-auto mb-12">
            {tText("Secure client-side utilities engineered for maximum confidentiality and offline capabilities.")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{tText("100% Free & Unlimited")}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">{tText("No registrations, no watermarks, completely free for student scholarship packing.")}</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{tText("Instant Auto-Delete")}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">{tText("Processed files are cleared immediately from the browser storage in 1 hour.")}</p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{tText("Client-Side Security")}</h3>
              <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">{tText("Conversions occur in your browser cache. Documents never upload to servers.")}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Global Drag and Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-900/90 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-indigo-500 m-4 rounded-3xl animate-fadeIn pointer-events-none">
          <div className="bg-slate-900/60 border border-white/10 p-12 rounded-3xl text-center space-y-4 max-w-sm">
            <div className="h-16 w-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
              <Upload className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white">{tText("Drop anywhere to upload")}</h3>
            <p className="text-xs text-slate-400">{tText("We'll automatically configure the correct tools for your file")}</p>
          </div>
        </div>
      )}

      {/* Tool Picker Modal */}
      {showPickerModal && droppedFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-sm text-foreground">{tText("Choose a Tool")}</h3>
              <button 
                onClick={() => { setShowPickerModal(false); setDroppedFile(null); }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer"
                title="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{tText("You dropped:")}</p>
              <p className="text-xs font-black text-gray-900 dark:text-white truncate bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border">{droppedFile.name}</p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {getSuggestedTools(droppedFile).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setShowPickerModal(false);
                    setDroppedFile(null);
                    routeToTool(tool.id, droppedFile);
                  }}
                  className="w-full text-left p-3 rounded-xl border border-border hover:border-indigo-500/35 bg-card hover:bg-indigo-500/5 transition duration-200 flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="block text-xs font-black text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tText(tool.title)}</span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">{tText(tool.desc)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
