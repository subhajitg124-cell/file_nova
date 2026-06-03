import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  Search, Languages, User, Sparkles, ShieldCheck, Lock, ChevronRight, 
  GraduationCap, IdCard, FileText, Image as ImageIcon, Settings2, 
  Film, Crown, ArrowRight, ArrowUpRight, CheckCircle, Menu, X, HelpCircle,
  LayoutGrid
} from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { useLanguage, useTranslation } from "@/lib/i18n";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useAuthStore } from "@/store/useAuthStore";
import { useSubscription } from "@/hooks/useSubscription";

// Curated tools to display on the homepage grid
interface CuratedTool {
  id: string;
  title: string;
  description: string;
  category: "india" | "pdf" | "image" | "office" | "ai";
  action: () => void;
  badge?: string;
  icon: any;
}

export default function SimpleHome() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { premiumTier } = useSubscription();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | "india" | "pdf" | "image" | "office" | "ai">("all");

  const handleScholarshipClick = () => {
    setLocation("/tools/scholarship-zip");
  };

  const handleAadhaarClick = () => {
    setLocation("/tools/aadhaar-masking");
  };

  const handlePanClick = () => {
    setLocation("/tools/pan-card");
  };

  const handleResizeClick = () => {
    // Setup store for default resize and redirect
    useFileStore.getState().clearStore();
    useFileStore.getState().setSelectedSection("image");
    useFileStore.getState().setOperation("resize");
    setLocation("/workspace");
  };

  const handleCompressPdfClick = () => {
    useFileStore.getState().clearStore();
    useFileStore.getState().setSelectedSection("pdf");
    useFileStore.getState().setOperation("compress");
    setLocation("/workspace");
  };

  const handleMergePdfClick = () => {
    useFileStore.getState().clearStore();
    useFileStore.getState().setSelectedSection("pdf");
    useFileStore.getState().setOperation("merge");
    setLocation("/workspace");
  };

  const handleOcrClick = () => {
    useFileStore.getState().clearStore();
    useFileStore.getState().setSelectedSection("pdf");
    useFileStore.getState().setOperation("edit");
    useFileStore.getState().updateOptions({ operation: "pdf_ocr" });
    setLocation("/workspace");
  };

  const handleDocxToPdfClick = () => {
    useFileStore.getState().clearStore();
    useFileStore.getState().setSelectedSection("office");
    useFileStore.getState().setOperation("convert");
    useFileStore.getState().updateOptions({ operation: "docx_to_pdf" });
    setLocation("/workspace");
  };

  const handleRemoveBgClick = () => {
    useFileStore.getState().clearStore();
    useFileStore.getState().setSelectedSection("image");
    useFileStore.getState().setOperation("edit");
    useFileStore.getState().updateOptions({ operation: "remove_bg" });
    setLocation("/workspace");
  };

  const handleAiSummarizeClick = () => {
    useFileStore.getState().clearStore();
    useFileStore.getState().setSelectedSection("pdf");
    useFileStore.getState().setOperation("edit");
    useFileStore.getState().updateOptions({ operation: "pdf_summarize" });
    setLocation("/workspace");
  };

  const curatedTools: CuratedTool[] = [
    // India-Specific
    { id: "scholarship-zip", title: "Scholarship ZIP Maker", description: "Income, marksheet, bank passbook, photo & signature compiled in one ZIP.", category: "india", action: handleScholarshipClick, badge: "Popular", icon: GraduationCap },
    { id: "aadhaar-masking", title: "Aadhaar Card Masking", description: "Mask the first 8 digits of your Aadhaar card scan for secure uploads.", category: "india", action: handleAadhaarClick, badge: "Secure", icon: ShieldCheck },
    { id: "pan-card", title: "PAN Card Upload Fix", description: "Resize and optimize signature & photo scans for NSDL/UTI forms.", category: "india", action: handlePanClick, badge: "CSC Special", icon: IdCard },
    
    // PDF
    { id: "merge-pdf", title: "Merge PDF Files", description: "Combine multiple PDF documents into a single organized file.", category: "pdf", action: handleMergePdfClick, icon: FileText },
    { id: "compress-pdf", title: "Compress PDF", description: "Shrink PDF size to under 200KB to fit portal size restrictions.", category: "pdf", action: handleCompressPdfClick, icon: FileText },
    
    // Image
    { id: "resize-photo", title: "Resize Photo & Signature", description: "Resize images to custom width/height and format specifications.", category: "image", action: handleResizeClick, icon: ImageIcon },
    { id: "remove-bg", title: "AI Background Remover", description: "Remove image background automatically to output a transparent PNG.", category: "image", action: handleRemoveBgClick, badge: "New", icon: Sparkles },
    
    // Office
    { id: "docx-to-pdf", title: "DOCX to PDF Converter", description: "Convert Microsoft Word document (.docx) into standard readable PDF.", category: "office", action: handleDocxToPdfClick, icon: Settings2 },
    
    // AI
    { id: "pdf-ocr", title: "OCR Scan-to-Text", description: "Extract editable text from scanned certificate images and PDFs.", category: "ai", action: handleOcrClick, badge: "AI", icon: Sparkles },
    { id: "ai-summarize", title: "AI PDF Summarizer", description: "Generate structured, concise summaries from long PDF documents.", category: "ai", action: handleAiSummarizeClick, badge: "AI", icon: Sparkles }
  ];

  const filteredTools = curatedTools.filter(tool => {
    const matchesCategory = activeCategoryFilter === "all" || tool.category === activeCategoryFilter;
    const matchesSearch = !searchQuery || 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)] pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_right,_rgba(168,85,247,0.08),_transparent_70%)] pointer-events-none z-0" />

      {/* Header Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2.5 shrink-0">
              <div className="h-8.5 w-8.5 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-glow-indigo">
                FN
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-sm text-white block">FileNova.in</span>
                <span className="text-[10px] text-slate-500 block leading-none font-bold uppercase tracking-wider">CSC & Student Portal</span>
              </div>
            </a>
          </Link>

          {/* Search bar inside header */}
          <div className="relative max-w-sm w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 30+ document tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 text-white"
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
          <div className="flex items-center gap-4 shrink-0">
            {/* Language Selection */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-400">
              <Languages className="h-3.5 w-3.5" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent border-none outline-none text-slate-300 font-bold focus:ring-0 cursor-pointer"
                title="Select language"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>

            {/* Premium billing link */}
            <Link href="/pricing">
              <a className="hidden sm:flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold py-1.5 px-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all">
                <Crown className="h-3.5 w-3.5 fill-current" />
                Premium Suite
              </a>
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <UserProfileDropdown />
            ) : (
              <Link href="/login">
                <a className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3.5 rounded-lg transition-all shadow-glow-indigo">
                  Login
                </a>
              </Link>
            )}

            {/* Mobile Nav Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white md:hidden"
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
        <div className="md:hidden border-b border-slate-900 bg-slate-950 p-4 space-y-3 animate-fadeIn relative z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
            <Link href="/pricing">
              <a className="flex items-center justify-center gap-2 text-sm text-amber-400 font-bold py-2 border border-amber-500/20 bg-amber-500/5 rounded-lg">
                <Crown className="h-4 w-4 fill-current" />
                Premium Suite Billing
              </a>
            </Link>
            <Link href="/workspace">
              <a className="text-center text-sm bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2 rounded-lg">
                Open Document Workspace
              </a>
            </Link>
          </div>
        </div>
      )}

      {/* Hero / Quick Search Section */}
      <section className="pt-20 pb-16 px-4 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold text-indigo-400 mb-6 uppercase tracking-wider animate-pulse">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Smart Document Automation for India
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            What do you want to <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">do today?</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-lg mb-12 max-w-xl mx-auto">
            Process certificates, passport photos, and PDFs safely in your local browser. Ideal for CSC kiosks, cyber cafes, and students.
          </p>

          {/* Quick-Link Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button
              onClick={handleScholarshipClick}
              className="flex flex-col items-center justify-between p-6 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-indigo-500/35 rounded-2xl transition-all duration-300 group shadow-lg hover:shadow-glow-indigo-subtle"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm text-white block">Scholarship ZIP</span>
                <span className="text-[11px] text-slate-500 block mt-1">Compile portal ZIPs</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-4" />
            </button>

            <button
              onClick={handleResizeClick}
              className="flex flex-col items-center justify-between p-6 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-emerald-500/35 rounded-2xl transition-all duration-300 group shadow-lg hover:shadow-glow-emerald-subtle"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm text-white block">Resize Photo</span>
                <span className="text-[11px] text-slate-500 block mt-1">Selfies to exact dimensions</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all mt-4" />
            </button>

            <button
              onClick={handleCompressPdfClick}
              className="flex flex-col items-center justify-between p-6 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-purple-500/35 rounded-2xl transition-all duration-300 group shadow-lg hover:shadow-glow-purple-subtle"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="font-extrabold text-sm text-white block">Compress PDF</span>
                <span className="text-[11px] text-slate-500 block mt-1">Fit portal file limits</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all mt-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Flat horizontal Quick Actions */}
      <section className="py-6 border-y border-slate-900 bg-slate-950/40 relative z-10 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3.5">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider shrink-0 mr-2">Quick Actions:</span>
          {[
            { label: "Aadhaar Card Mask", action: handleAadhaarClick },
            { label: "NSDL PAN Resize", action: handlePanClick },
            { label: "Merge PDF", action: handleMergePdfClick },
            { label: "OCR Extraction", action: handleOcrClick },
            { label: "Signature Scale", action: handleResizeClick }
          ].map((act, i) => (
            <button
              key={i}
              onClick={act.action}
              className="inline-flex items-center bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs py-1.5 px-3.5 rounded-full transition-all"
            >
              {act.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Curated Grid Directory */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-indigo-400" />
                Featured Document Automation Tools
              </h2>
              <p className="text-slate-400 text-xs mt-1">Our client-side processors require zero file uploads to servers. Fast, secure, and private.</p>
            </div>
            
            <Link href="/tools">
              <a className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline">
                Explore all 30+ tools <ChevronRight className="h-4 w-4" />
              </a>
            </Link>
          </div>

          {/* Grid Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: "all", label: "All Curated" },
              { key: "india", label: "Indian Portals" },
              { key: "pdf", label: "PDF Tools" },
              { key: "image", label: "Image Tools" },
              { key: "office", label: "Office & Docs" },
              { key: "ai", label: "AI Suite" }
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategoryFilter(cat.key as any)}
                className={`py-1.5 px-3.5 rounded-lg border text-xs font-bold transition-all ${
                  activeCategoryFilter === cat.key
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200"
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
              return (
                <div
                  key={tool.id}
                  onClick={tool.action}
                  className="group bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-indigo-500/25 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <ToolIcon className="h-5 w-5" />
                      </div>
                      {tool.badge && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          tool.badge === "Popular" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25" :
                          tool.badge === "Secure" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" :
                          tool.badge === "AI" ? "bg-purple-500/10 text-purple-400 border-purple-500/25" :
                          "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-white mb-1.5 group-hover:text-indigo-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>{tool.category === "india" ? "India Portal" : tool.category}</span>
                    <span className="flex items-center gap-0.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-20 bg-slate-950 border-t border-slate-900 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-black text-white mb-3">
            Why 10,000+ Cyber Cafes & CSC Centers Trust FileNova
          </h2>
          <p className="text-slate-400 text-xs max-w-md mx-auto mb-12">
            Secure client-side utilities engineered for maximum confidentiality and offline capabilities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-bold text-sm text-white">100% Free & Unlimited</h3>
              <p className="text-xs text-slate-500 leading-relaxed">No registrations, no watermarks, completely free for student scholarship packing.</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-bold text-sm text-white">Instant Auto-Delete</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Processed files are cleared immediately from the browser storage in 1 hour.</p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="font-bold text-sm text-white">Client-Side Security</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Conversions occur in your browser cache. Documents never upload to servers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-16 bg-slate-950 relative z-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="space-y-3 col-span-1 sm:col-span-2">
            <span className="font-black text-white text-base block">FileNova.in</span>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              India's first AI-powered document automation desk built client-side. Optimize marksheets, mask Aadhaar, package scholarship ZIP portfolios in seconds.
            </p>
            <p className="text-[10px] text-slate-600 mt-4">
              © {new Date().getFullYear()} FileNova AI India. All rights reserved.
            </p>
          </div>

          <div>
            <span className="font-bold text-xs text-white uppercase tracking-wider block mb-4">Quick Directory</span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/tools"><a className="hover:text-indigo-400 transition-colors">All 30+ Tools</a></Link></li>
              <li><Link href="/workspace"><a className="hover:text-indigo-400 transition-colors">Document Desk</a></Link></li>
              <li><Link href="/pricing"><a className="hover:text-indigo-400 transition-colors">Pricing & Plans</a></Link></li>
              <li><Link href="/student-offer"><a className="hover:text-indigo-400 transition-colors">Student Discounts</a></Link></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-xs text-white uppercase tracking-wider block mb-4">Support & Legal</span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/blog"><a className="hover:text-indigo-400 transition-colors">Official Blog</a></Link></li>
              <li><Link href="/resources"><a className="hover:text-indigo-400 transition-colors">Kiosk Resources</a></Link></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}