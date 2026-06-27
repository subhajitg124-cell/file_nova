import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Code, FlaskConical, Bot, BarChart3, Puzzle, ToggleLeft, Search, Zap, Package, Image,
  Shield, FileCheck, Link, BrainCircuit, Activity, Wrench, Gauge, Globe, Route,
  Palette, Play, Accessibility, Smartphone, ScanLine, FileText, FolderOpen, Trash2,
  Bug, Radio, Cpu, ChevronLeft, ExternalLink, Terminal
} from "lucide-react";

const DEV_TOOLS = [
  { id: "beta", icon: FlaskConical, label: "Beta Features", desc: "Toggle experimental features", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10 border-fuchsia-500/20" },
  { id: "ai-prompt", icon: Bot, label: "AI Prompt Studio", desc: "Test AI prompts & responses", color: "text-violet-500", bg: "bg-violet-500/10 border-violet-500/20" },
  { id: "analytics", icon: BarChart3, label: "Analytics Dashboard", desc: "Usage metrics & trends", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "plugins", icon: Puzzle, label: "Plugin Manager", desc: "Manage tool plugins", color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/20" },
  { id: "feature-flags", icon: ToggleLeft, label: "Feature Flags", desc: "Toggle feature toggles", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  { id: "seo", icon: Search, label: "SEO Inspector", desc: "Inspect page metadata", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: "lighthouse", icon: Zap, label: "Lighthouse Report", desc: "Performance audits", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { id: "bundle", icon: Package, label: "Bundle Analyzer", desc: "Analyze JS bundle size", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
  { id: "assets", icon: Image, label: "Asset Optimizer", desc: "Optimize images & assets", color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/20" },
  { id: "security", icon: Shield, label: "Security Scanner", desc: "Scan for vulnerabilities", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  { id: "sitemap", icon: FileCheck, label: "Sitemap Validator", desc: "Validate XML sitemaps", color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { id: "broken-links", icon: Link, label: "Broken Link Checker", desc: "Find broken links", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  { id: "ai-debug", icon: BrainCircuit, label: "AI Assistant Debug", desc: "Debug AI responses", color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { id: "usage", icon: Activity, label: "Usage Analytics", desc: "Real-time usage stats", color: "text-lime-500", bg: "bg-lime-500/10 border-lime-500/20" },
  { id: "maintenance", icon: Wrench, label: "Maintenance Mode", desc: "Toggle maintenance", color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/20" },
  { id: "perf-monitor", icon: Gauge, label: "Performance Monitor", desc: "Monitor app performance", color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  { id: "api-explorer", icon: Terminal, label: "API Explorer", desc: "Test API endpoints", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "routes", icon: Route, label: "Route Inspector", desc: "View all app routes", color: "text-sky-500", bg: "bg-sky-500/10 border-sky-500/20" },
  { id: "theme-preview", icon: Palette, label: "Theme Preview", desc: "Preview color themes", color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/20" },
  { id: "animations", icon: Play, label: "Animation Preview", desc: "Test animations", color: "text-fuchsia-400", bg: "bg-fuchsia-400/10 border-fuchsia-400/20" },
  { id: "a11y", icon: Accessibility, label: "Accessibility Checker", desc: "WCAG compliance check", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { id: "responsive", icon: Smartphone, label: "Responsive Preview", desc: "Preview all breakpoints", color: "text-teal-400", bg: "bg-teal-400/10 border-teal-400/20" },
  { id: "metadata", icon: ScanLine, label: "Metadata Inspector", desc: "Inspect page metadata", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  { id: "robots", icon: FileText, label: "Robots.txt Viewer", desc: "View robots.txt config", color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/20" },
  { id: "sitemap-explorer", icon: FolderOpen, label: "Sitemap Explorer", desc: "Browse sitemap tree", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
  { id: "storage", icon: Database, label: "Storage Manager", desc: "Manage local storage", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  { id: "cache", icon: Trash2, label: "Cache Cleaner", desc: "Clear app cache", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20" },
  { id: "experiments", icon: FlaskConical, label: "Experimental Features", desc: "Try experimental features", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  { id: "errors", icon: Bug, label: "Error Logs", desc: "View error logs", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  { id: "worker-status", icon: Radio, label: "Worker Status", desc: "Monitor background workers", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  { id: "bg-jobs", icon: Cpu, label: "Background Jobs", desc: "Job queue status", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
];

function Database({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
}

export default function DeveloperWorkspace() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDev = user?.role === 'developer';

  if (!isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-black text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">This workspace is only available to Developer accounts.</p>
          <button onClick={() => setLocation("/")} className="text-sm font-bold text-primary hover:underline">Return Home</button>
        </div>
      </div>
    );
  }

  const filtered = DEV_TOOLS.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setLocation("/")} className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/50 transition cursor-pointer">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                <Code className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground">Developer Workspace</h1>
                <p className="text-xs text-muted-foreground font-semibold">{user?.email} · Developer Build</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-3 py-1 text-[10px] font-black text-indigo-400 border border-indigo-500/30">
              <Terminal className="h-3 w-3" />
              v{import.meta.env.VITE_APP_VERSION || "2.0.0-dev"}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search developer tools..."
            aria-label="Search developer tools"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground font-semibold">
          <span className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-green-500" />
            Server: Healthy
          </span>
          <span className="flex items-center gap-1">
            <Radio className="h-3.5 w-3.5 text-blue-500" />
            Mode: {import.meta.env.DEV ? "Development" : "Production"}
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5 text-amber-500" />
            {DEV_TOOLS.length} Tools
          </span>
        </div>

        {/* Tool grid */}
        <div role="grid" aria-label="Developer tools" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.button
                role="gridcell"
                key={tool.id}
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? { duration: 0 } : { delay: i * 0.02, duration: 0.2 }}
                onMouseEnter={() => setHovered(tool.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(tool.id)}
                onBlur={() => setHovered(null)}
                whileHover={reducedMotion ? {} : { scale: 1.03 }}
                whileTap={reducedMotion ? {} : { scale: 0.97 }}
                onClick={() => setLocation("/beta-test")}
                aria-label={`${tool.label}: ${tool.desc}`}
                className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border ${tool.bg} hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 cursor-pointer text-left`}
              >
                <div className={`w-9 h-9 rounded-lg ${tool.bg} flex items-center justify-center`}>
                  <Icon className={`h-4.5 w-4.5 ${tool.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-foreground leading-tight">{tool.label}</p>
                  <p className="text-[9px] text-muted-foreground font-semibold mt-0.5 leading-tight">{tool.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div role="status" className="text-center py-16">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground">No tools match your search</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different keyword</p>
          </div>
        )}
      </div>
    </div>
  );
}
