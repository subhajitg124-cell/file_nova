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

export default function ToolsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "pdf" | "image" | "office" | "video" | "india" | "ai">("all");

  const handleSelectTool = (actionName: string) => {
    setLocation(`/tools/${actionName}`);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none z-0" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLocation("/")}
              className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                FileNova Tools Directory
              </span>
            </div>
          </div>
          <Link href="/workspace">
            <a className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-glow-indigo">
              Open Workspace <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-12 relative z-10">
        {/* Page Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Explore All Document Tools
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Search and select from our suite of 30+ client-side tools designed for Indian CSC, cyber cafes, and student applications.
          </p>
        </div>

        {/* Search & Categories Bar */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 backdrop-blur-md mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tools (e.g. merge, compress, aadhaar, signature)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Categories grid */}
          <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-slate-900">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as any)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-bold transition-all ${
                    activeCategory === cat.key
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-glow-indigo"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const ToolIcon = tool.icon || HelpCircle;
              return (
                <div
                  key={`${tool.actionName}-${tool.title}`}
                  onClick={() => handleSelectTool(tool.actionName)}
                  className="group relative bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900 hover:border-indigo-500/35 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-glow-indigo-subtle"
                >
                  <div>
                    {/* Header: Icon + Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <ToolIcon className="h-5 w-5" />
                      </div>
                      {tool.badge && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          tool.badgeColor === "indigo" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25" :
                          tool.badgeColor === "rose" ? "bg-rose-500/10 text-rose-400 border-rose-500/25" :
                          tool.badgeColor === "amber" ? "bg-amber-500/10 text-amber-400 border-amber-500/25" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        }`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-white mb-1.5 group-hover:text-indigo-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-900/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>{tool.category === "india" ? "India-Specific" : tool.category}</span>
                    <span className="flex items-center gap-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Launch <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/20 border border-slate-900 border-dashed rounded-2xl">
            <HelpCircle className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No tools match your criteria</p>
            <p className="text-xs text-slate-600 mt-1">Try resetting your filters or search keywords</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              className="mt-4 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg transition-colors font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
