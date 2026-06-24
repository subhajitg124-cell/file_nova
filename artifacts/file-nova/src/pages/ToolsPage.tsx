import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  Search, X, Star, Sparkles, LayoutGrid, FileText, Image as ImageIcon, 
  Settings2, Film, ArrowLeft, ArrowUpRight, ShieldCheck, GraduationCap, 
  IdCard, ChevronRight, Landmark, BriefcaseBusiness, HelpCircle
} from "lucide-react";
import { TOOLS, ToolItem } from "@/components/workspace/ToolGrid";

// Custom Indian Government workflows to merge with the tools list
interface CustomTool {
  actionName: string;
  title: string;
  description: string;
  category: "india" | "ai" | "pdf" | "image" | "office" | "video";
  badge?: string;
  badgeColor?: string;
  icon: any;
}

const CUSTOM_INDIAN_TOOLS: CustomTool[] = [
  { actionName: "scholarship-zip", title: "Scholarship ZIP Maker", description: "Income, marksheet, bank passbook, photo & signature packed in one ZIP.", category: "india", badge: "Student", badgeColor: "indigo", icon: GraduationCap },
  { actionName: "aadhaar-masking", title: "Aadhaar Card Masking", description: "Securely mask first 8 digits of Aadhaar card scans before submission.", category: "india", badge: "Privacy", badgeColor: "rose", icon: ShieldCheck },
  { actionName: "pan-card", title: "PAN Card Upload Fix", description: "Resize photo, signature & ID proof for NSDL/UTI application portal.", category: "india", badge: "NSDL/UTI", badgeColor: "amber", icon: IdCard },
  { actionName: "passport-photo", title: "AI Passport Photo Maker", description: "Auto-crop selfies to official 200x230px dimensions and under 50KB.", category: "india", badge: "CSC Special", badgeColor: "emerald", icon: Landmark },
  { actionName: "signature-resize", title: "Signature Resize & Crop", description: "Trim and scale signature scans for government and exam portal uploads.", category: "india", badge: "Fast", badgeColor: "blue", icon: BriefcaseBusiness }
];

interface BentoToolCardProps {
  tool: CustomTool;
  getCanonicalUrl: (actionName: string) => string;
}

const BentoToolCard: React.FC<BentoToolCardProps> = ({ tool, getCanonicalUrl }) => {
  const ToolIcon = tool.icon || HelpCircle;
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isBentoWide = ["scholarship-zip", "aadhaar-masking", "compress-pdf", "merge-pdf", "resize-photo", "pan-card"].includes(tool.actionName);

  return (
    <Link
      href={getCanonicalUrl(tool.actionName)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-card hover:bg-slate-50 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-border dark:border-slate-900 hover:border-indigo-500/35 rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-glow-indigo-subtle block text-left overflow-hidden min-h-[190px]
        ${isBentoWide ? "sm:col-span-2" : "col-span-1"}
      `}
    >
      {/* Dynamic cursor-spotlight shine overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(140px circle at ${coords.x}px ${coords.y}px, rgba(79, 70, 229, 0.09), transparent 80%)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        {/* Header: Icon + Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-950 border border-border dark:border-slate-850 flex items-center justify-center text-indigo-650 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-[3deg] transition-all duration-300">
            <ToolIcon className="h-5 w-5" />
          </div>
          {tool.badge && (
            <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider border ${
              tool.badgeColor === "indigo" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25" :
              tool.badgeColor === "rose" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25" :
              tool.badgeColor === "amber" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25" :
              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
            }`}>
              {tool.badge}
            </span>
          )}
        </div>

        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {tool.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border dark:border-slate-900/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider relative z-10">
        <span className="capitalize">{tool.category === "india" ? "India-Specific" : tool.category}</span>
        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5">
          Launch <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
};

export default function ToolsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "pdf" | "image" | "office" | "video" | "india" | "ai">("all");

  const getCanonicalUrl = (actionName: string) => {
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
    const slug = canonicalMap[actionName];
    return slug ? `/${slug}` : `/tools/${actionName}`;
  };

  // Convert standard TOOLS list to fit the CustomTool interface
  const standardToolsMapped: CustomTool[] = TOOLS.map(t => ({
    actionName: t.actionName,
    title: t.title,
    description: t.description,
    category: t.badge === "AI" ? "ai" : (t.category as any),
    badge: t.badge,
    badgeColor: t.badgeColor || "emerald",
    icon: t.icon
  }));

  // Combine standard tools and custom Indian tools, filtering out duplicates
  const allTools: CustomTool[] = [...CUSTOM_INDIAN_TOOLS];
  standardToolsMapped.forEach(st => {
    if (!allTools.some(t => t.actionName === st.actionName && t.title === st.title)) {
      allTools.push(st);
    }
  });

  const categories = [
    { key: "all", label: "All Tools", icon: LayoutGrid },
    { key: "india", label: "India Schemes", icon: Landmark },
    { key: "pdf", label: "PDF Tools", icon: FileText },
    { key: "image", label: "Image Tools", icon: ImageIcon },
    { key: "office", label: "Office & Docs", icon: Settings2 },
    { key: "video", label: "Video & Audio", icon: Film },
    { key: "ai", label: "AI Suite", icon: Sparkles }
  ];

  // Filter tools based on query and active category
  const q = searchQuery.toLowerCase();
  const filteredTools = allTools.filter(tool => {
    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
    const matchesSearch = !q || 
      tool.title.toLowerCase().includes(q) || 
      tool.description.toLowerCase().includes(q) || 
      tool.actionName.toLowerCase().includes(q);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-background text-foreground font-sans pb-24 relative">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/10 via-background to-background dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 pointer-events-none z-0" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-border dark:border-slate-900 bg-card/85 dark:bg-slate-950/80 backdrop-blur-xl py-4 px-6">
        <nav aria-label="Tools directory" className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLocation("/")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                FileNova Tools Directory
              </span>
            </div>
          </div>
          <Link href="/workspace" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-glow-indigo cursor-pointer">
            Open Workspace <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-12 relative z-10">
        {/* Page Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            Explore All Document Tools
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Search and select from our suite of 30+ client-side tools designed for Indian CSC, cyber cafes, and student applications.
          </p>
        </div>

        {/* Search & Categories Bar */}
        <div className="bg-card/45 dark:bg-slate-900/40 border border-border dark:border-slate-900 rounded-2xl p-4 backdrop-blur-md mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools (e.g. merge, compress, aadhaar, signature)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-950 border border-border dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-muted-foreground/60 dark:placeholder:text-slate-600 text-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Categories grid */}
          <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-border dark:border-slate-900">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as any)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat.key
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-glow-indigo"
                      : "bg-white dark:bg-slate-950/60 border-border dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <CatIcon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Results Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredTools.map((tool) => (
              <BentoToolCard key={`${tool.actionName}-${tool.title}`} tool={tool} getCanonicalUrl={getCanonicalUrl} />
            ))}
          </div>

        ) : (
          <div className="text-center py-20 bg-card/20 dark:bg-slate-900/20 border border-border dark:border-slate-900 border-dashed rounded-2xl">
            <HelpCircle className="h-10 w-10 text-slate-400 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No tools match your criteria</p>
            <p className="text-xs text-slate-400 dark:text-slate-650 mt-1">Try resetting your filters or search keywords</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              className="mt-4 text-xs bg-card hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-border dark:border-transparent text-slate-700 dark:text-slate-300 py-1.5 px-3 rounded-lg transition-colors font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
