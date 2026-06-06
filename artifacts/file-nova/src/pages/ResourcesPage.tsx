import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, GraduationCap, Award, FileText, CheckCircle2,
  AlertTriangle, Upload, ExternalLink, RefreshCw, Sparkles, BookOpen,
  HelpCircle, Check, PlayCircle, ShieldCheck, Printer, Server, Palette, Fingerprint
} from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { Footer } from "@/components/Footer";
import { createUpiLink } from "@/lib/upi";
import { UpiSupportModal } from "@/components/UpiSupportModal";
import { useFileStore } from "@/store/useFileStore";
import { WB_REQUIREMENTS, SchemeRequirement, DocumentSpec } from "@/data/wbRequirements";
import { Confetti } from "@/components/AnimatedEffects";
import { toast } from "sonner";

interface ValidationResult {
  docName: string;
  fileName: string;
  fileSizeKB: number;
  fileFormat: string;
  imgDimensions?: { width: number; height: number };
  isValid: boolean;
  errors: string[];
}

export default function ResourcesPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"guide" | "operator">("guide");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "scholarship" | "examination" | "admission" | "scheme">("all");
  const [selectedScheme, setSelectedScheme] = useState<SchemeRequirement>(WB_REQUIREMENTS[0]);
  
  // File Checker states
  const [checkingDocSpec, setCheckingDocSpec] = useState<DocumentSpec | null>(null);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [upiOpen, setUpiOpen] = useState(false);
  const [upiAmount, setUpiAmount] = useState(10);
  const [upiNote, setUpiNote] = useState("Chai for FileNova");

  const triggerUpi = (e: React.MouseEvent, amount: number, note: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
      setUpiAmount(amount);
      setUpiNote(note);
      setUpiOpen(true);
    }
  };

  // Filter schemes
  const filteredSchemes = WB_REQUIREMENTS.filter((scheme) => {
    const matchesCategory = selectedCategory === "all" || scheme.category === selectedCategory;
    const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scheme.bengaliName && scheme.bengaliName.includes(searchQuery)) ||
      scheme.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Reset validations when scheme changes
  useEffect(() => {
    setValidationResults({});
    setCheckingDocSpec(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedScheme]);

  // Check if all mandatory documents are valid
  const checkOverallSuccess = (results: Record<string, ValidationResult>) => {
    const mandatoryDocs = selectedScheme.documents.filter(d => d.mandatory);
    if (mandatoryDocs.length === 0) return;

    const allMandatoryValid = mandatoryDocs.every(d => results[d.name]?.isValid);
    if (allMandatoryValid) {
      setShowConfetti(true);
      toast.success("Congratulations! All mandatory documents are 100% compliant!", {
        duration: 5000,
        description: "You are ready to upload these files to the portal!"
      });
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  // Validate file
  const validateUploadedFile = (file: File, spec: DocumentSpec) => {
    const fileName = file.name;
    const fileSizeKB = file.size / 1024;
    const extension = fileName.split(".").pop()?.toUpperCase() || "";
    
    // Check format
    const errors: string[] = [];
    const expectedFormat = spec.format;
    
    // Simple format normalization
    let isFormatValid = false;
    if (expectedFormat === "PDF" && extension === "PDF") {
      isFormatValid = true;
    } else if (["JPG", "JPEG", "PNG"].includes(expectedFormat) && ["JPG", "JPEG", "PNG"].includes(extension)) {
      isFormatValid = true;
    }

    if (!isFormatValid) {
      errors.push(`Invalid file format: ${extension} (Expected: ${expectedFormat})`);
    }

    // Check size
    if (fileSizeKB > spec.maxSizeKB) {
      errors.push(`File size ${fileSizeKB.toFixed(1)} KB exceeds the limit of ${spec.maxSizeKB} KB`);
    }
    if (spec.minSizeKB && fileSizeKB < spec.minSizeKB) {
      errors.push(`File size ${fileSizeKB.toFixed(1)} KB is below the minimum required ${spec.minSizeKB} KB`);
    }

    // Check dimensions for images
    if (spec.dimensions && ["JPG", "JPEG", "PNG"].includes(extension)) {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const reqW = spec.dimensions!.width;
        const reqH = spec.dimensions!.height;
        const unit = spec.dimensions!.unit;

        // Give a tiny tolerance of 2px
        if (Math.abs(width - reqW) > 2 || Math.abs(height - reqH) > 2) {
          errors.push(`Dimensions are ${width}x${height} ${unit} (Expected: ${reqW}x${reqH} ${unit})`);
        }

        const result: ValidationResult = {
          docName: spec.name,
          fileName,
          fileSizeKB,
          fileFormat: extension,
          imgDimensions: { width, height },
          isValid: errors.length === 0,
          errors
        };

        const updated = { ...validationResults, [spec.name]: result };
        setValidationResults(updated);
        checkOverallSuccess(updated);
      };
      img.src = URL.createObjectURL(file);
    } else {
      // Non-image or PDF validation
      const result: ValidationResult = {
        docName: spec.name,
        fileName,
        fileSizeKB,
        fileFormat: extension,
        isValid: errors.length === 0,
        errors
      };

      const updated = { ...validationResults, [spec.name]: result };
      setValidationResults(updated);
      checkOverallSuccess(updated);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && checkingDocSpec) {
      validateUploadedFile(files[0], checkingDocSpec);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && checkingDocSpec) {
      validateUploadedFile(files[0], checkingDocSpec);
    }
  };

  const clearValidation = (docName: string) => {
    const copy = { ...validationResults };
    delete copy[docName];
    setValidationResults(copy);
  };

  const cscOperatorTools = [
    {
      title: "Hostinger Web Hosting",
      category: "Digital Desk & Portfolios",
      tag: "Best Deal",
      tagColor: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      desc: "Set up a professional website or digital shopfront for your CSC cyber cafe. Hostinger offers fast server speeds, easy-to-use WordPress tools, and a free custom domain.",
      features: [
        "Free Custom Domain Name (.in / .com)",
        "Free Unlimited SSL Certificates",
        "99.9% Uptime Guarantee",
        "24/7 Premium Local Support"
      ],
      ctaText: "Get Hosting Deal (75% Off)",
      ctaUrl: "https://www.hostinger.in/",
      icon: <Server className="h-6 w-6" />,
      popular: true
    },
    {
      title: "Canva Pro",
      category: "Design & Custom Forms",
      tag: "Student Choice",
      tagColor: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
      desc: "Perfect for designing high-fidelity resumes, passport photo layouts, custom flyers, certificates, and crop borders. Unlock premium templates, fonts, and one-click background removers.",
      features: [
        "100M+ Premium Photos & Videos",
        "One-Click Image Background Remover",
        "Resize designs instantly for prints",
        "Custom Brand Kits & Fonts"
      ],
      ctaText: "Try Canva Pro Free",
      ctaUrl: "https://www.canva.com/",
      icon: <Palette className="h-6 w-6" />
    },
    {
      title: "EcoTank Inkjet Printers",
      category: "High-Volume Hardware",
      tag: "Cafe Classic",
      tagColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      desc: "Minimize your cost per page for student assignments and government application printouts. EcoTank printers offer ultra-low-cost color prints with easy ink refills.",
      features: [
        "Ultra-low-cost printing (9 paise/page)",
        "Wi-Fi connectivity for mobile prints",
        "Fast scan-to-PDF desk workflows",
        "High bottle yield (up to 7,500 pages)"
      ],
      ctaText: "View Printers on Amazon",
      ctaUrl: "https://www.amazon.in/s?k=ecotank+printer",
      icon: <Printer className="h-6 w-6" />
    },
    {
      title: "Biometric Scanners & e-Sign",
      category: "Identity & Portal Auth",
      tag: "CSC Mandatory",
      tagColor: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
      desc: "Required for Aadhaar Enabled Payment System (AePS), PMGDISHA, DigiLocker, and state e-district portals. Secure high-durability optical fingerprint scanners (Mantra/Morpho).",
      features: [
        "UIDAI RD Service approved scanners",
        "Plug-and-play USB & OTG support",
        "Perfect for PM-Kisan authentication",
        "High-performance biometric matching"
      ],
      ctaText: "Shop Scanners on Amazon",
      ctaUrl: "https://www.amazon.in/s?k=mantra+mfs100+scanner",
      icon: <Fingerprint className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <Confetti show={showConfetti} />

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_65%)] pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_right,_rgba(168,85,247,0.06),_transparent_70%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border dark:border-slate-900 bg-card/85 dark:bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/65 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all hover:scale-105">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </a>
          </Link>

          <UserProfileDropdown />
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-10 px-4 relative z-10 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold text-indigo-400 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          West Bengal Portal Specifications
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Document Guides & <br />
          <span className="bg-gradient-to-r from-indigo-650 via-purple-605 to-indigo-650 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Operator Resources</span>
        </h1>
        <p className="text-slate-650 dark:text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
          Verify local marksheet/photo requirements for West Bengal schemes, test your files locally, or browse curated operator recommendations.
        </p>

        {/* Tab Selection */}
        <div className="flex justify-center pt-6">
          <div className="flex bg-muted border border-border p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("guide")}
              className={`py-2 px-6 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "guide" ? "bg-indigo-600 text-white shadow-glow-indigo" : "text-muted-foreground hover:text-foreground"}`}
            >
              WB Schemes & Exams Guide
            </button>
            <button
              onClick={() => setActiveTab("operator")}
              className={`py-2 px-6 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "operator" ? "bg-indigo-600 text-white shadow-glow-indigo" : "text-muted-foreground hover:text-foreground"}`}
            >
              CSC Cafe Operator Toolkit
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 pb-24 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "guide" ? (
            <motion.div
              key="guide-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Schemes list / Search */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-card/30 dark:bg-slate-900/30 border border-border dark:border-slate-900 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search schemes, e.g. SVMCM..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-border dark:border-slate-900 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>

                  {/* Category filters */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: "all", label: "All" },
                      { key: "scholarship", label: "Scholarships" },
                      { key: "scheme", label: "Schemes" },
                      { key: "examination", label: "Exams" }
                    ].map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key as any)}
                        className={`py-1 px-3 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                          selectedCategory === cat.key
                            ? "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                            : "bg-white dark:bg-slate-950/40 border-border dark:border-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schemes list container */}
                <div className="bg-card/25 dark:bg-slate-900/20 border border-border dark:border-slate-900 rounded-3xl p-2.5 max-h-[460px] overflow-y-auto space-y-1.5 scrollbar-none shadow-md">
                  {filteredSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => setSelectedScheme(scheme)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        selectedScheme.id === scheme.id
                          ? "bg-indigo-900/20 border-indigo-500/30 text-indigo-650 dark:text-white"
                          : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/30 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <div>
                        <span className="font-extrabold text-xs block leading-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{scheme.name}</span>
                        <span className="text-[10px] text-slate-500 block mt-1 uppercase font-bold tracking-wider">{scheme.category}</span>
                      </div>
                      <span className="text-[10px] bg-muted border border-border px-2 py-0.5 rounded text-muted-foreground font-bold transition-all uppercase">Open</span>
                    </button>
                  ))}

                  {filteredSchemes.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-500">
                      No matching portals found.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Portal Details & Interactive Checker */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Information Desk */}
                <div className="bg-card dark:bg-slate-900/40 border border-border dark:border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedScheme.name}</h2>
                    {selectedScheme.bengaliName && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{selectedScheme.bengaliName}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-slate-500 font-semibold">
                      <span>Department: <strong className="text-slate-700 dark:text-slate-355">{selectedScheme.department}</strong></span>
                      <a href={selectedScheme.officialWebsite} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-bold">
                        Official Portal <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Eligibility list */}
                  <div className="p-4 bg-muted/30 dark:bg-slate-950/60 border border-border dark:border-slate-900 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Eligibility Criteria</span>
                    <ul className="space-y-1.5">
                      {selectedScheme.eligibility.map((el, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed font-medium">
                          <Check className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span>{el}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Requirements details list */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Required Documents & File Checker</span>
                    <div className="space-y-3">
                      {selectedScheme.documents.map((doc, idx) => {
                        const vResult = validationResults[doc.name];
                        const isChecking = checkingDocSpec?.name === doc.name;

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all ${
                              vResult
                                ? vResult.isValid
                                  ? "bg-emerald-500/[0.03] border-emerald-500/25"
                                  : "bg-rose-500/[0.03] border-rose-500/25"
                                : isChecking
                                ? "bg-indigo-500/[0.04] border-indigo-500/40"
                                : "bg-muted/10 dark:bg-slate-950/40 border border-border dark:border-slate-900"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{doc.name}</span>
                                  {doc.mandatory ? (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 font-bold uppercase">Mandatory</span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 font-bold uppercase border border-border dark:border-transparent">Optional</span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">{doc.description}</p>
                                
                                {/* Constraints badges */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  <span className="text-[9px] bg-card px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-bold border border-border dark:border-slate-850">Format: {doc.format}</span>
                                  <span className="text-[9px] bg-card px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-bold border border-border dark:border-slate-850">Size: {doc.minSizeKB ? `${doc.minSizeKB}-` : ""}{doc.maxSizeKB} KB max</span>
                                  {doc.dimensions && (
                                    <span className="text-[9px] bg-card px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-bold border border-border dark:border-slate-850">Dimensions: {doc.dimensions.width}x{doc.dimensions.height} {doc.dimensions.unit}</span>
                                  )}
                                </div>
                              </div>

                              {/* Validation Actions / State */}
                              <div className="flex items-center gap-2 shrink-0">
                                {vResult ? (
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <span className={`text-xs font-bold block ${vResult.isValid ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                        {vResult.isValid ? "Valid document" : "Validation failed"}
                                      </span>
                                      <span className="text-[10px] text-slate-500 block max-w-[150px] truncate">{vResult.fileName}</span>
                                    </div>
                                    <button
                                      onClick={() => clearValidation(doc.name)}
                                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                                      title="Clear file test"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setCheckingDocSpec(doc);
                                      setTimeout(() => fileInputRef.current?.click(), 50);
                                    }}
                                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-card hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-border dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                  >
                                    <Upload className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                                    Verify File
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Validation Errors detail */}
                            {vResult && !vResult.isValid && (
                              <div className="mt-3 p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl space-y-1">
                                {vResult.errors.map((err, i) => (
                                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-rose-400 leading-normal font-semibold">
                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                                    <span>{err}</span>
                                  </div>
                                ))}
                                
                                {/* Quick Fix Shortcuts */}
                                <div className="flex gap-2 pt-2 border-t border-rose-500/10 mt-2">
                                  {doc.format === "PDF" ? (
                                    <button
                                      onClick={() => {
                                        useFileStore.getState().clearStore();
                                        useFileStore.getState().setSelectedSection("pdf");
                                        useFileStore.getState().setOperation("compress");
                                        setLocation("/workspace");
                                      }}
                                      className="py-1 px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-[10px] font-black text-indigo-400 transition"
                                    >
                                      Go Compress PDF
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        useFileStore.getState().clearStore();
                                        useFileStore.getState().setSelectedSection("image");
                                        useFileStore.getState().setOperation("resize");
                                        setLocation("/workspace");
                                      }}
                                      className="py-1 px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-[10px] font-black text-emerald-400 transition"
                                    >
                                      Resize & Crop Image
                                    </button>
                                  )}
                                  {selectedScheme.toolId === "scholarship-zip" && (
                                    <button
                                      onClick={() => setLocation("/tools/scholarship-zip")}
                                      className="py-1 px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-[10px] font-black text-indigo-400 transition"
                                    >
                                      Sikshashree ZIP Maker
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Validation Success note */}
                            {vResult && vResult.isValid && (
                              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold px-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Checked locally inside browser cache. 100% compliant.</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct portal links */}
                  {selectedScheme.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 italic bg-muted/40 p-3 rounded-xl border border-border leading-normal">
                      Note: {selectedScheme.notes}
                    </p>
                  )}
                </div>

              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={checkingDocSpec?.format === "PDF" ? ".pdf" : ".jpg,.jpeg,.png"}
                onChange={handleFileChange}
                title="Upload verification document"
                placeholder="Upload verification document"
              />
            </motion.div>
          ) : (
            <motion.div
              key="operator-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cscOperatorTools.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`relative flex flex-col justify-between rounded-3xl border p-6 transition duration-300 ${
                      rec.popular
                        ? "border-indigo-500/35 bg-indigo-900/5 shadow-lg"
                        : "border-border bg-card dark:border-slate-900 dark:bg-slate-950/40 hover:border-border/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                    }`}
                  >
                    {rec.popular && (
                      <span className="absolute -top-3 right-6 rounded-full bg-indigo-600 border border-indigo-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-glow-indigo">
                        ⭐ Operator Essential
                      </span>
                    )}
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="rounded-2xl bg-white dark:bg-slate-950 border border-border dark:border-slate-900 p-3 text-indigo-600 dark:text-indigo-400 shadow-inner">
                          {rec.icon}
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${rec.tagColor}`}>
                          {rec.tag}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{rec.category}</p>
                      <h3 className="mt-1.5 text-lg font-black text-slate-900 dark:text-white">{rec.title}</h3>
                      <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{rec.desc}</p>
                      
                      <ul className="mt-5 space-y-2">
                        {rec.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-border dark:border-slate-900/50">
                      <a
                        href={rec.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition cursor-pointer ${rec.popular ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo" : "bg-card hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-border dark:border-slate-850"}`}
                      >
                        <span>{rec.ctaText}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Support / Donation Section */}
      <section className="border-t border-border bg-card/60 dark:bg-slate-950/60 px-4 py-16 text-center relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <span>☕ Support FileNova Project</span>
            </h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              FileNova is built to keep Indian document utilities accessible and 100% private. If our platform saves you money on premium PDF tools, consider supporting our work!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={createUpiLink(10, "Chai for FileNova")}
              onClick={(e) => triggerUpi(e, 10, "Chai for FileNova")}
              className="inline-flex items-center gap-2 rounded-xl bg-card hover:bg-amber-500/5 border border-border hover:border-amber-500/40 px-5 py-2.5 text-xs font-black transition cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <span>☕ Buy Chai (₹10)</span>
            </a>
            <a
              href={createUpiLink(50, "Support FileNova")}
              onClick={(e) => triggerUpi(e, 50, "Support FileNova")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-black text-white shadow-glow-indigo cursor-pointer transition"
            >
              <span>❤️ Support Project (₹50)</span>
            </a>
          </div>
        </div>
      </section>

      <UpiSupportModal
        isOpen={upiOpen}
        onClose={() => setUpiOpen(false)}
        amount={upiAmount}
        note={upiNote}
      />

      <Footer />
    </div>
  );
}
