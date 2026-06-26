import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { 
  Search, Languages, User, Sparkles, ShieldCheck, Lock, ChevronRight, 
  GraduationCap, IdCard, FileText, Image as ImageIcon, Settings2, 
  Film, Crown, ArrowRight, ArrowUpRight, CheckCircle, Menu, X, HelpCircle,
  LayoutGrid, Upload, Zap, Merge, Scissors, FileDown, RotateCw,
  FileUp, FileKey, Unlock, Fingerprint, FileImage, FileSpreadsheet,
  FileSearch, BrainCircuit, FileCheck2, BookOpen, ScanLine, Globe,
  Camera, Wallet, BadgePercent, MessageCircle, PanelRightOpen, Star, Clock
} from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { useLanguage, useTranslation } from "@/lib/i18n";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { useSubscription } from "@/hooks/useSubscription";
import { PlanBadge } from "@/components/PlanBadge";
import { ToolSearch } from "@/components/ToolSearch";
import { useSEO } from "@/hooks/useSEO";
import { PopularToolsGrid } from "@/components/PopularToolsGrid";
import { SmartSearchBar } from "@/components/SmartSearchBar";
import { PopularToolsDropdown } from "@/components/PopularToolsDropdown";
import { ReactableGreeting } from "@/components/events/ReactableGreeting";
import { Navbar } from "@/components/Navbar";


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

interface ToolCardProps {
  tool: any;
  categoryOverride?: string;
  index: number;
  tText: (key: string) => string;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, categoryOverride, index, tText }) => {
  const ToolIcon = tool.icon || HelpCircle;
  const cat = categoryOverride || tool.category || "pdf";
  const displayCategory = 
    cat === "india" ? tText("Indian Portals") :
    cat === "pdf" ? tText("PDF Tools") :
    cat === "image" ? tText("Image Tools") :
    cat === "office" ? tText("Office & Docs") :
    cat === "ai" ? tText("AI Suite") :
    tText(cat);

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleQuickActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const canonicalMap: Record<string, string> = {
        "compress-pdf": "compress-pdf",
        "merge-pdf": "merge-pdf",
        "image-to-pdf": "image-to-pdf",
        "images-to-pdf": "image-to-pdf",
        "pdf-to-image": "pdf-to-image",
        "pdf-to-images": "pdf-to-image",
        "ocr": "ocr",
        "pdf-ocr": "ocr",
        "resize-photo": "resize-photo",
        "resize-image": "resize-photo",
        "remove-bg": "remove-background",
        "remove-background": "remove-background",
        "aadhaar-masking": "aadhaar-mask-pdf",
        "aadhaar-mask": "aadhaar-mask-pdf",
        "pan-card": "pan-card-resize",
        "pan-card-resize": "pan-card-resize",
        "docx-to-pdf": "word-to-pdf",
        "word-to-pdf": "word-to-pdf",
        "scholarship-zip-maker": "scholarship-zip",
        "scholarship-zip": "scholarship-zip",
        "ai-summarize": "ai-pdf-summary",
        "ai-pdf-summary": "ai-pdf-summary"
      };
      
      const targetSlug = canonicalMap[tool.id] || tool.canonical.replace(/^\//, "");
      window.history.pushState({ droppedFile: file, autoProcess: true }, "", `/${targetSlug}`);
      window.dispatchEvent(new Event("popstate"));
    }
  };

  const isQuickTool = ["merge-pdf", "compress-pdf", "aadhaar-masking", "pan-card", "scholarship-zip"].includes(tool.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={tool.canonical}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative fn-clay rounded-xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-[var(--fn-shadow-elevated)] hover:-translate-y-1 text-left block overflow-hidden min-h-[200px]"
      >
        {/* Dynamic cursor-spotlight shine overlay */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
            style={{
              background: `radial-gradient(130px circle at ${coords.x}px ${coords.y}px, rgba(79, 70, 229, 0.08), transparent 80%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 fn-glass rounded-xl p-2 flex items-center justify-center text-[var(--fn-accent-primary)] group-hover:scale-110 group-hover:rotate-[4deg] transition-all duration-300">
              <ToolIcon className="h-5 w-5" />
            </div>
            {tool.badge && (
              <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider border ${
                tool.badge === "Popular" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25" :
                tool.badge === "Secure" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" :
                tool.badge === "AI" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25" :
                "bg-brand-primary/10 text-brand-primary border-brand-primary/25"
              }`}>
                {tool.badge}
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1.5 group-hover:text-brand-primary transition-colors">
            {tool.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {tool.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            <span>{displayCategory}</span>
            <span className="flex items-center gap-0.5 text-brand-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5">
              {tText("Open")} <ChevronRight className="h-3 w-3" />
            </span>
          </div>

          {isQuickTool && (
            <div className="pt-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                title="Upload file for quick action"
                aria-label="Upload file for quick action"
                accept={
                  tool.id === "compress-pdf" || tool.id === "merge-pdf" || tool.id === "aadhaar-masking"
                    ? "application/pdf"
                    : tool.id === "pan-card"
                    ? "image/png,image/jpeg,image/jpg"
                    : "*/*"
                }
              />
              <button
                onClick={handleQuickActionClick}
                className="w-full text-center py-1.5 px-3 bg-brand-accent hover:bg-amber-600 active:scale-95 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                {tool.id === "compress-pdf" ? tText("Quick Compress →") :
                 tool.id === "merge-pdf" ? tText("Quick Merge →") :
                 tool.id === "aadhaar-masking" ? tText("Quick Mask →") :
                 tool.id === "pan-card" ? tText("Quick Resize →") :
                 tText("Quick ZIP →")}
              </button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default function SimpleHome() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { premiumTier, useCount, getDailyLimit } = useSubscription();
  const { language, setLanguage } = useLanguage();
  const { tText } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [recentToolItems, setRecentToolItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [directoryExpanded, setDirectoryExpanded] = useState(false);

  const pdfToolsList = [
    { id: "merge-pdf", title: tText("Merge PDF Files"), description: tText("Upload your PDFs. We'll join them together into one neat document in seconds."), icon: Merge, canonical: "/merge-pdf", category: "pdf", tags: ["merge", "combine", "pdf", "join"] },
    { id: "split-pdf", title: tText("Split PDF"), description: tText("Separate pages or extract the exact page numbers you need from your PDF."), icon: Scissors, canonical: "/split-pdf", category: "pdf", tags: ["split", "extract", "pdf", "pages"] },
    { id: "compress-pdf", title: tText("Compress PDF"), description: tText("Shrink your PDF down to under 200KB so it fits any portal upload limit."), icon: FileDown, canonical: "/compress-pdf", category: "pdf", tags: ["compress", "pdf", "shrink", "size", "under 200kb"] },
    { id: "rotate-pdf", title: tText("Rotate PDF"), description: tText("Turn your PDF pages to the correct portrait or landscape orientation."), icon: RotateCw, canonical: "/rotate-pdf", category: "pdf", tags: ["rotate", "pdf", "turn", "orientation"] },
    { id: "resize-pdf", title: tText("Resize PDF"), description: tText("Fit your PDF pages to standard A4, Letter, or custom print sizes."), icon: FileUp, canonical: "/resize-pdf", category: "pdf", tags: ["resize", "pdf", "size", "a4", "dimensions"] },
    { id: "protect-pdf", title: tText("Protect PDF"), description: tText("Add password protection to secure your confidential documents."), icon: FileKey, canonical: "/protect-pdf", category: "pdf", tags: ["protect", "secure", "password", "encrypt"] },
    { id: "unlock-pdf", title: tText("Unlock PDF"), description: tText("Remove the password lock from your PDF to make it editable."), icon: Unlock, canonical: "/unlock-pdf", category: "pdf", tags: ["unlock", "decrypt", "password", "remove"] }
  ];

  const imageToolsList = [
    { id: "pan-card", title: tText("PAN Card Photo Resize"), description: tText("Select your photo or signature. We'll size it to exact NSDL/UTI portal dimensions."), icon: IdCard, canonical: "/pan-card-resize", badge: "India", category: "india", tags: ["pan", "signature", "photo", "nsdl", "uti"] },
    { id: "aadhaar-masking", title: tText("Aadhaar Mask PDF"), description: tText("Drop your Aadhaar scan. We'll black out the first 8 digits to keep your privacy safe."), icon: Fingerprint, canonical: "/aadhaar-mask-pdf", badge: "India", category: "india", tags: ["aadhaar", "mask", "uidai", "card", "security"] },
    { id: "government-form-fill", title: tText("Government Form Fill"), description: tText("Fill Aadhaar, PAN, and passport PDF application forms online."), icon: FileCheck2, canonical: "/government-form-fill", badge: "India", category: "india", tags: ["form", "fill", "aadhaar", "pan", "passport"] },
    { id: "compress-pdf-for-upload", title: tText("Compress for Upload"), description: tText("Select a PDF. We'll shrink it down to exact government sizes (100KB, 200KB, or 1MB)."), icon: FileUp, canonical: "/compress-pdf-for-upload", badge: "India", category: "india", tags: ["compress", "upload", "100kb", "200kb", "portal"] },
    { id: "scholarship-zip", title: tText("Scholarship ZIP Maker"), description: tText("Drop marksheets, income certificates, and passbook photos. We'll zip them up for SVMCM/OASIS portals."), icon: GraduationCap, canonical: "/scholarship-zip", badge: "Popular", category: "india", tags: ["scholarship", "zip", "svmcm", "oasis", "kanyashree", "annapurna"] }
  ];

  const aiToolsList = [
    { id: "pdf-ocr", title: tText("OCR Scan-to-Text"), description: tText("Upload scanned certificates or JPGs. We'll read the text so you can copy and edit it."), icon: ScanLine, canonical: "/ocr", badge: "AI", category: "ai", tags: ["ocr", "scan", "text", "extract", "image", "pdf"] },
    { id: "remove-bg", title: tText("AI Background Remover"), description: tText("Drop your photo. Our AI will clean off the background to give you a transparent PNG instantly."), icon: Sparkles, canonical: "/remove-background", badge: "New", category: "ai", tags: ["bg", "background", "remove", "transparent", "png", "ai"] },
    { id: "ai-summarize", title: tText("AI PDF Summarizer"), description: tText("Upload a long document. We'll summarize the main points in a few bullets."), icon: BrainCircuit, canonical: "/ai-pdf-summary", badge: "AI", category: "ai", tags: ["summarize", "summary", "ai", "pdf", "long"] }
  ];

  const officeToolsList = [
    { id: "pdf-to-word", title: tText("PDF to Word"), description: tText("Convert any PDF document into an editable Microsoft Word (.docx) file."), icon: FileText, canonical: "/pdf-to-word", category: "office", tags: ["pdf", "word", "docx", "convert"] },
    { id: "pdf-to-jpg", title: tText("PDF to JPG"), description: tText("Extract pages from your PDF document as clean JPG images."), icon: FileImage, canonical: "/pdf-to-jpg", category: "office", tags: ["pdf", "jpg", "images", "extract"] },
    { id: "jpg-to-pdf", title: tText("JPG to PDF"), description: tText("Turn your photos or document scans into a single high-quality PDF."), icon: FileImage, canonical: "/jpg-to-pdf", category: "office", tags: ["jpg", "pdf", "images", "convert"] },
    { id: "docx-to-pdf", title: tText("Word to PDF"), description: tText("Save your Word documents (.docx) as standard readable PDFs."), icon: FileSpreadsheet, canonical: "/word-to-pdf", category: "office", tags: ["docx", "word", "pdf", "convert"] }
  ];

  const allSearchableTools = [
    ...pdfToolsList,
    ...imageToolsList,
    ...aiToolsList,
    ...officeToolsList
  ];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("filenova-recent-tools") || "[]");
      if (Array.isArray(stored) && stored.length > 0) {
        const allItems = [...pdfToolsList, ...imageToolsList, ...aiToolsList, ...officeToolsList];
        const matched = stored
          .map((key: string) => {
            const parts = key.split(":");
            if (parts.length < 3) return null;
            const actionName = parts[1];
            return allItems.find(t => {
              if (t.id === "compress-pdf" && actionName === "compress") return true;
              if (t.id === "merge-pdf" && actionName === "merge") return true;
              if (t.id === "resize-photo" && actionName === "resize") return true;
              if (t.id === "remove-bg" && actionName === "remove_bg") return true;
              if (t.id === "docx-to-pdf" && actionName === "docx_to_pdf") return true;
              if (t.id === "pdf-ocr" && actionName === "pdf_ocr") return true;
              if (t.id === "ai-summarize" && actionName === "pdf_summarize") return true;
              if (t.id === "pan-card" && actionName === "pancard") return true;
              return false;
            });
          })
          .filter((t): t is any => t !== null && t !== undefined);
        
        const unique = Array.from(new Set(matched)).slice(0, 4);
        setRecentToolItems(unique);
      }
    } catch (e) {
      console.error("Failed to load recent tools", e);
    }
  }, []);

  // Homepage SEO
  useSEO({
    title: "FileNova – Free Online PDF Tools for India",
    description:
      "Free online PDF tools built for India. Merge, split, compress, convert PDFs. Plus Aadhaar masking, PAN card resize, and government form filling — no signup needed.",
    canonical: "https://filenova.in/",
    keywords:
      "pdf tools online free, merge pdf, compress pdf, pdf to word, aadhaar mask, pan card resize, government form pdf, india pdf tools",
    isHomepage: true,
  });

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
        { id: 'compress-doc', title: 'Compress Office Docs', desc: 'Reduce spreadsheet and document size' }
      ];
    }
    if (ext === 'csv') {
      return [
        { id: 'word-to-pdf', title: 'Word to PDF', desc: 'Convert documents to PDF format' }
      ];
    }
    if (type.startsWith('video/')) {
      return [
        { id: 'compress-image', title: 'Compress Image', desc: 'Reduce image file size' },
        { id: 'jpg-to-pdf', title: 'JPG to PDF', desc: 'Convert images to PDF' }
      ];
    }
    if (type.startsWith('audio/')) {
      return [
        { id: 'compress-image', title: 'Compress Image', desc: 'Reduce image file size' }
      ];
    }
    if (ext === 'svg') {
      return [
        { id: 'compress-image', title: 'Compress Image', desc: 'Reduce image file size' }
      ];
    }
    return [
      { id: 'compress-pdf', title: 'Compress PDF', desc: 'Reduce PDF file size' },
      { id: 'merge-pdf', title: 'Merge PDF Files', desc: 'Combine multiple PDFs' },
      { id: 'resize-image', title: 'Resize Photo', desc: 'Resize to exact dimensions' },
      { id: 'scholarship-zip', title: 'Scholarship ZIP', desc: 'Compile student docs' }
    ];
  };

  const filteredTools = allSearchableTools.filter(tool => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.id.toLowerCase().includes(query) ||
      (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  const renderToolCard = (tool: any, categoryOverride?: string, index: number = 0) => {
    return <ToolCard tool={tool} categoryOverride={categoryOverride} index={index} tText={tText} />;
  };

  return (
    <main
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen fn-aurora-bg text-foreground font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative"
    >
      {/* Premium background grid & radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-70" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_65%)] pointer-events-none z-0" />

      {/* Navigation */}
      <Navbar />

      {premiumTier === "free" && showUpgradeBanner && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-indigo-900 border-b border-indigo-500/20 py-2 px-4 text-center text-xs font-bold text-indigo-100 flex items-center justify-center gap-2 relative z-20">
          <span>{tText("Free plan:")} {Math.max(0, getDailyLimit() - useCount)} {tText("of")} {getDailyLimit()} {tText("uses remaining today")} → <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 underline">{tText("Upgrade to Pro ₹99/month")}</Link></span>
          <button
            onClick={() => setShowUpgradeBanner(false)}
            className="absolute right-4 text-indigo-300 hover:text-white cursor-pointer"
            aria-label="Dismiss upgrade banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Hero / Quick Search Section */}
      <section className="pt-20 pb-16 px-4 relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-lg text-xs font-bold text-brand-primary mb-6 uppercase tracking-wider"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            {tText("Smart Document Automation for India")}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight font-display"
          >
            {tText("What do you want to")} <br />
            <span className="bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-primary-dark bg-clip-text text-transparent">{tText("do today?")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-sm md:text-lg mb-12 max-w-xl mx-auto"
          >
            {tText("Process certificates, passport photos, and PDFs safely in your local browser. Ideal for CSC kiosks, cyber cafes, and students.")}
          </motion.p>

          {/* Most Needed Right Now */}
          <div className="text-left max-w-4xl mx-auto mt-12 mb-4">
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand-accent animate-pulse" />
              {tText("Most Needed Right Now")}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">{tText("Fast shortcuts for admission & scholarship forms")}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 max-w-4xl mx-auto"
          >
            {[
              { id: "scholarship-zip", title: tText("Scholarship ZIP"), desc: tText("SVMCM/OASIS files to ZIP"), icon: GraduationCap, href: "/scholarship-zip", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
              { id: "aadhaar-masking", title: tText("Aadhaar Mask"), desc: tText("Hide first 8 digits"), icon: Fingerprint, href: "/aadhaar-mask-pdf", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
              { id: "compress-pdf", title: tText("Compress PDF"), desc: tText("Shrink under 200KB"), icon: FileDown, href: "/compress-pdf", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
              { id: "pan-card", title: tText("PAN Resize"), desc: tText("NSDL/UTI photo & sign"), icon: IdCard, href: "/pan-card-resize", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
              { id: "merge-pdf", title: tText("Merge PDFs"), desc: tText("Combine multiple PDFs"), icon: Merge, href: "/merge-pdf", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" }
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex flex-col justify-between p-4 fn-clay transition-all duration-200 group cursor-pointer text-left block min-h-[140px] hover:shadow-[var(--fn-shadow-elevated)] hover:-translate-y-1"
                >
                  <div className="h-8 w-8 fn-glass rounded-xl p-2 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-all duration-300">
                    <IconComp className="h-4.5 w-4.5 text-[var(--fn-accent-primary)]" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[12px] text-foreground block group-hover:text-brand-primary transition-colors leading-tight">{item.title}</span>
                    <span className="text-[9px] text-muted-foreground block mt-0.5 leading-normal">{item.desc}</span>
                  </div>
                  <span className="text-[9px] text-[var(--fn-accent-primary)] font-bold mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Site Description Block */}
      <section className="pb-10 px-4 relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tText("FileNova is a free online PDF toolkit built for India. Merge, split, compress, convert PDFs and manage Indian government documents — Aadhaar, PAN, marksheets — right in your browser. No signup. No app. Just fast, secure PDF tools.")}
        </p>
      </section>

      {/* Flat horizontal Quick Actions */}
      <section className="py-6 border-y border-border bg-card/40 relative z-10 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider shrink-0 mr-2">{tText("Quick Actions:")}</span>
          {[
            { label: tText("Aadhaar Card Mask"), href: "/aadhaar-mask-pdf" },
            { label: tText("NSDL PAN Resize"), href: "/pan-card-resize" },
            { label: tText("Merge PDF"), href: "/merge-pdf" },
            { label: tText("OCR Extraction"), href: "/ocr" },
            { label: tText("Signature Scale"), href: "/resize-pdf" }
          ].map((act, i) => (
            <Link
              key={i}
              href={act.href}
              className="inline-flex items-center bg-card hover:bg-accent border border-border text-foreground font-bold text-xs py-1.5 px-3.5 rounded-lg transition-all cursor-pointer shadow-sm animate-pulse-hover"
            >
              {act.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Tools Grid */}
      <PopularToolsGrid />

      {/* Main Curated Grid Directory */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-xl font-black text-foreground flex items-center gap-2 font-display">
                <ShieldCheck className="h-6 w-6 text-brand-primary" />
                {tText("Guaranteed Data Privacy & Safety")}
              </h2>
              <p className="text-muted-foreground text-xs mt-1">{tText("Our client-side processors require zero file uploads to servers. Fast, secure, and private.")}</p>
            </div>
            
            <Link href="/tools" className="text-xs text-brand-primary hover:text-brand-primary-dark font-bold flex items-center gap-1 hover:underline">
              {tText("Explore all 30+ tools")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Category Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-border">
            {[
              { id: null, label: tText("All Categories"), icon: "🌐" },
              { id: "india", label: tText("India Schemes"), icon: "🇮🇳" },
              { id: "pdf", label: tText("PDF Tools"), icon: "📄" },
              { id: "image", label: tText("Image Tools"), icon: "🖼️" },
              { id: "office", label: tText("Office & Docs"), icon: "📊" },
              { id: "ai", label: tText("AI Suite"), icon: "✨" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== null) {
                    setDirectoryExpanded(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-brand-primary/45 hover:text-foreground"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {searchQuery ? (
            <div className="space-y-6">
              <div className="border-b border-border pb-2 flex items-center justify-between">
                <h3 className="text-base font-black text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
                  <Search className="h-4 w-4 text-brand-primary" />
                  {tText("Search Results")}
                </h3>
                {filteredTools.length > 0 && (
                  <span className="text-xs text-muted-foreground font-bold">
                    {filteredTools.length} {tText("tools found")}
                  </span>
                )}
              </div>
              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredTools.map((tool, i) => renderToolCard(tool, undefined, i))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                  <p className="text-sm text-muted-foreground">{tText("No tools match your search query.")}</p>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="mt-4 inline-flex items-center justify-center text-xs font-bold text-brand-primary hover:underline cursor-pointer bg-transparent border-0 outline-none"
                  >
                    {tText("Clear Search")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {recentToolItems.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-border pb-2">
                    <h3 className="text-sm font-black text-brand-primary uppercase tracking-wider flex items-center gap-2 font-display">
                      <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                      {tText("Recently Used Tools")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentToolItems.map((tool, i) => renderToolCard(tool, undefined, i))}
                  </div>
                </div>
              )}

              {/* Collapsed Directory Trigger */}
              {!directoryExpanded && selectedCategory === null ? (
                <div className="flex flex-col items-center justify-center py-8 bg-brand-primary/[0.02] border border-dashed border-border rounded-xl p-8 text-center space-y-4">
                  <p className="text-xs text-muted-foreground max-w-sm">
                    {tText("Access 60+ other specialized PDF and image tools for formatting, cropping, OCR, and AI summaries.")}
                  </p>
                  <button
                    onClick={() => setDirectoryExpanded(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    {tText("Browse all 60+ tools")}
                  </button>
                </div>
              ) : (
                <div className="space-y-16 animate-fade-in">
                  {/* Category Sections */}
                  {(selectedCategory === null || selectedCategory === "india") && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-2">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
                          <GraduationCap className="h-4.5 w-4.5 text-brand-primary" />
                          {tText("India Portal & Scholarship Lab")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {imageToolsList.map((tool, i) => renderToolCard(tool, "india", i))}
                      </div>
                    </div>
                  )}

                  {(selectedCategory === null || selectedCategory === "pdf") && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-2">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
                          <FileText className="h-4.5 w-4.5 text-brand-primary" />
                          {tText("Popular PDF Tools")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {pdfToolsList.map((tool, i) => renderToolCard(tool, "pdf", i))}
                      </div>
                    </div>
                  )}

                  {(selectedCategory === null || selectedCategory === "ai") && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-2">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
                          <Sparkles className="h-4.5 w-4.5 text-brand-primary" />
                          {tText("AI-Powered Suite")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {aiToolsList.map((tool, i) => renderToolCard(tool, "ai", i))}
                      </div>
                    </div>
                  )}

                  {(selectedCategory === null || selectedCategory === "office") && (
                    <div className="space-y-6">
                      <div className="border-b border-border pb-2">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 font-display">
                          <LayoutGrid className="h-4.5 w-4.5 text-brand-primary" />
                          {tText("Office & Document Suite")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {officeToolsList.map((tool, i) => renderToolCard(tool, "office", i))}
                      </div>
                    </div>
                  )}

                  {selectedCategory === null && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => {
                          setDirectoryExpanded(false);
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-secondary hover:bg-accent text-foreground text-xs font-bold rounded-lg border border-border transition-all cursor-pointer"
                      >
                        {tText("Collapse Directory ▴")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why FileNova Section */}
      <section className="py-20 bg-card border-t border-border relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-black text-foreground mb-3 font-display">
            {tText("Built for Indian Portals, Not Generic Forms")}
          </h2>
          <p className="text-muted-foreground text-xs max-w-md mx-auto mb-12">
            {tText("FileNova is engineered by a B.Tech CSE student in West Bengal. Over 2,800+ files processed locally in India this month.")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            {/* Bento Card 1: Aadhaar safety (2-col flagship bento block) */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="md:col-span-2 p-8 bg-[var(--fn-surface)] dark:bg-[rgba(15,22,38,0.7)] border border-[var(--fn-border)] dark:border-white/10 shadow-[var(--fn-shadow-card)] backdrop-blur-md rounded-3xl space-y-4 transition-all relative overflow-hidden flex flex-col md:flex-row gap-6 items-center justify-between group"
            >
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "var(--fn-aurora)" }} />
              <div className="space-y-3 max-w-sm">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 flex items-center justify-center font-bold text-lg">🔒</div>
                <h3 className="font-extrabold text-sm text-[var(--fn-text-primary)] dark:text-white">{tText("Aadhaar safety: Local-first processing")}</h3>
                <p className="text-xs text-[var(--fn-text-secondary)] dark:text-slate-400 leading-relaxed">
                  {tText("Aadhaar masking, PAN resizing, and photos are processed entirely within your browser sandboxed sandbox. Your document files never upload to any remote server.")}
                </p>
              </div>
              
              {/* Animated Interactive Masking Simulation Card */}
              <div className="w-full max-w-[240px] bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-2xl relative overflow-hidden select-none shrink-0">
                <div className="absolute top-0 right-0 p-1 px-2 rounded-bl-xl bg-emerald-500/15 border-l border-b border-emerald-500/20 text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Client Side
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">🇮🇳</div>
                  <div>
                    <div className="h-1.5 w-16 bg-gray-200 dark:bg-slate-800 rounded" />
                    <div className="h-1 w-10 bg-gray-100 dark:bg-slate-900 rounded mt-1" />
                  </div>
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">{tText("Aadhaar Number")}</div>
                  <div className="h-8 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-slate-850 flex items-center justify-center px-3 font-mono text-xs text-gray-500 dark:text-slate-350 relative overflow-hidden">
                    <motion.span
                      animate={{
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        times: [0, 0.5, 1],
                      }}
                      className="absolute"
                    >
                      xxxx xxxx 9012
                    </motion.span>
                    <motion.span
                      animate={{
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        times: [0, 0.5, 1],
                      }}
                      className="absolute text-emerald-500 dark:text-emerald-450 font-bold"
                    >
                      xxxx xxxx 9012
                    </motion.span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px] text-gray-400 dark:text-slate-500 pt-1 border-t border-gray-100 dark:border-slate-900">
                  <span>Status:</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                    Secured
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 2: Built for Indian portals (1-col bento block) */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 bg-[var(--fn-surface)] border border-[var(--fn-border)] dark:border-white/10 shadow-[var(--fn-shadow-card)] rounded-3xl space-y-4 transition-all flex flex-col justify-between hover:shadow-[var(--fn-shadow-elevated)]"
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400 flex items-center justify-center font-bold text-lg">🇮🇳</div>
                <h3 className="font-extrabold text-sm text-[var(--fn-text-primary)] dark:text-white">{tText("Built for Indian portals")}</h3>
                <p className="text-xs text-[var(--fn-text-secondary)] dark:text-slate-400 leading-relaxed">
                  {tText("Exact pixel dimensions and KB compression ranges for NSP, SVMCM, OASIS, NSDL/UTI — preconfigured to bypass verification errors.")}
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--fn-border)] dark:border-slate-900/40 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                <span className="text-[var(--fn-text-tertiary)] dark:text-gray-500">OASIS • NSP • SVMCM</span>
                <span className="text-[var(--fn-accent-india)] dark:text-emerald-400">100% Match</span>
              </div>
            </motion.div>

            {/* Bento Card 3: No account, no wait (1-col bento block) */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 bg-[var(--fn-surface)] border border-[var(--fn-border)] dark:border-white/10 shadow-[var(--fn-shadow-card)] rounded-3xl space-y-4 transition-all flex flex-col justify-between hover:shadow-[var(--fn-shadow-elevated)]"
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">⚡</div>
                <h3 className="font-extrabold text-sm text-[var(--fn-text-primary)] dark:text-white">{tText("Zero delays or email blocks")}</h3>
                <p className="text-xs text-[var(--fn-text-secondary)] dark:text-slate-400 leading-relaxed">
                  {tText("Every tool functions instantly upon landing. No email login gates, no captcha loops, and no downloads wait queue.")}
                </p>
              </div>
              <div className="pt-2 border-t border-[var(--fn-border)] dark:border-slate-900/40 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                <span className="text-[var(--fn-text-tertiary)] dark:text-gray-500">Direct Access</span>
                <span className="text-[var(--fn-accent-india)] dark:text-emerald-400">100% Free</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[var(--fn-bg)] border-t border-[var(--fn-border)] overflow-hidden relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center mb-12">
          <h2 className="text-xl md:text-2xl font-black text-[var(--fn-text-primary)] mb-3 font-display">
            {tText("Trusted by 10,000+ CSC Operators & Students")}
          </h2>
          <p className="text-[var(--fn-text-secondary)] text-xs max-w-md mx-auto">
            {tText("See how cyber cafe owners and students across India use FileNova to speed up portal applications.")}
          </p>
        </div>

        {/* Infinite Marquee Container */}
        <div className="relative w-full flex items-center justify-start py-4">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--fn-bg)] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--fn-bg)] to-transparent z-20 pointer-events-none" />
          
          <div className="animate-marquee animate-marquee-hover-pause flex gap-6">
            {[
              {
                name: "Subrata Das",
                role: "Cyber Cafe Owner, Kolkata",
                quote: "Resizing PAN card photos for NSDL/UTI used to take me 5 minutes in Photoshop. Now I do it in 5 seconds on FileNova."
              },
              {
                name: "Amit Sen",
                role: "CSC Operator, Burdwan",
                quote: "The Aadhaar masking tool is fantastic. Knowing that the Aadhaar PDF doesn't upload to any server gives my customers complete peace of mind."
              },
              {
                name: "Priya Banerjee",
                role: "Student, Jadavpur University",
                quote: "I needed a ZIP file containing specific PDF and JPG files under 2MB for SVMCM scholarship portal. FileNova did it in one click."
              },
              {
                name: "Rajesh Kumar",
                role: "Cyber Cafe Operator, Asansol",
                quote: "I process dozens of NSP scholarship documents daily. The bulk compression tool is exceptionally fast and keeps the text readable."
              },
              {
                name: "Vikram Singh",
                role: "Cyber Cafe Owner, Siliguri",
                quote: "No email verification gate, no ads, no wait queues. Just pure speed. Perfect for running a busy service kiosk."
              }
            ].map((t, i) => (
              <div key={`t1-${i}`} className="w-[300px] shrink-0 p-6 fn-glass border border-[var(--fn-border)] rounded-2xl space-y-4 hover:border-[var(--fn-accent-primary)]/45 transition-all select-none">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-primary to-indigo-650 flex items-center justify-center font-bold text-white text-xs">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--fn-text-primary)]">{t.name}</h4>
                    <p className="text-[10px] text-[var(--fn-text-secondary)] font-medium">{t.role}</p>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--fn-text-primary)] leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
            ))}
            {[
              {
                name: "Subrata Das",
                role: "Cyber Cafe Owner, Kolkata",
                quote: "Resizing PAN card photos for NSDL/UTI used to take me 5 minutes in Photoshop. Now I do it in 5 seconds on FileNova."
              },
              {
                name: "Amit Sen",
                role: "CSC Operator, Burdwan",
                quote: "The Aadhaar masking tool is fantastic. Knowing that the Aadhaar PDF doesn't upload to any server gives my customers complete peace of mind."
              },
              {
                name: "Priya Banerjee",
                role: "Student, Jadavpur University",
                quote: "I needed a ZIP file containing specific PDF and JPG files under 2MB for SVMCM scholarship portal. FileNova did it in one click."
              },
              {
                name: "Rajesh Kumar",
                role: "Cyber Cafe Operator, Asansol",
                quote: "I process dozens of NSP scholarship documents daily. The bulk compression tool is exceptionally fast and keeps the text readable."
              },
              {
                name: "Vikram Singh",
                role: "Cyber Cafe Owner, Siliguri",
                quote: "No email verification gate, no ads, no wait queues. Just pure speed. Perfect for running a busy service kiosk."
              }
            ].map((t, i) => (
              <div key={`t2-${i}`} className="w-[300px] shrink-0 p-6 fn-glass border border-[var(--fn-border)] rounded-2xl space-y-4 hover:border-[var(--fn-accent-primary)]/45 transition-all select-none">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-primary to-indigo-650 flex items-center justify-center font-bold text-white text-xs">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--fn-text-primary)]">{t.name}</h4>
                    <p className="text-[10px] text-[var(--fn-text-secondary)] font-medium">{t.role}</p>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--fn-text-primary)] leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Global Drag and Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-900/90 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-indigo-500 m-4 rounded-xs animate-fadeIn pointer-events-none">
          <div className="bg-slate-900/60 border border-white/10 p-12 rounded-xs text-center space-y-4 max-w-sm">
            <div className="h-16 w-16 bg-indigo-500/10 border border-indigo-500/20 rounded-xs flex items-center justify-center mx-auto animate-bounce">
              <Upload className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-white">{tText("Drop anywhere to upload")}</h3>
            <p className="text-xs text-slate-400">{tText("We'll automatically configure the correct tools for your file")}</p>
          </div>
        </div>
      )}

      {/* Tool Picker Modal */}
      {showPickerModal && droppedFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Choose a tool" onKeyDown={(e) => { if (e.key === "Escape") { setShowPickerModal(false); setDroppedFile(null); } }}>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xs p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-sm text-foreground">{tText("Choose a Tool")}</h3>
              <button 
                onClick={() => { setShowPickerModal(false); setDroppedFile(null); }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{tText("You dropped:")}</p>
              <p className="text-xs font-black text-foreground truncate bg-muted p-2.5 rounded-xs border border-border">{droppedFile.name}</p>
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
                  className="w-full text-left p-3 rounded-xs border border-border hover:border-indigo-500/35 bg-card hover:bg-indigo-500/5 transition duration-200 flex items-center justify-between group cursor-pointer"
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
    </main>
  );
}
