import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Link as WouterLink, useLocation, useRoute } from "wouter";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Bot, BarChart3, Activity, Zap, Shield, Search, Package,
  Puzzle, Rocket, Terminal, Database, Globe, FolderOpen, BrainCircuit, Bug,
  Radio, ToggleLeft, FlaskConical, Palette, Play, Accessibility,
  Smartphone, Link, Trash2, Droplets, Variable, Key, Download, Upload,
  ScanLine, Beaker, BookOpen, Code, FileText, ExternalLink, Check,
  Clock, Users, HardDrive, Thermometer, RefreshCw,
  Layers, Server, Wifi, Hash, PanelLeftClose, PanelLeft, Search as SearchIcon,
  SlidersHorizontal, Percent, Menu, X
} from "lucide-react";

const BUILD_VERSION = import.meta.env.VITE_APP_VERSION || "2.0.0-dev";
const GIT_HASH = "a3f1c8e";

type Section =
  | "dashboard" | "ai-studio" | "analytics" | "usage-metrics" | "performance"
  | "security" | "seo" | "bundle" | "plugins" | "deployment" | "api-explorer"
  | "storage" | "routes" | "sitemap" | "ai-assistant" | "error-logs"
  | "workers" | "feature-flags" | "experiments" | "theme-lab" | "animation-lab"
  | "component-lib" | "responsive" | "accessibility" | "broken-links"
  | "cache" | "local-storage" | "env-vars" | "sessions" | "export-diag"
  | "import-settings" | "metadata" | "testing" | "release-notes";

interface SidebarItem {
  id: Section;
  icon: ReactNode;
  label: string;
  badge?: string;
}

const SIDEBAR_SECTIONS: SidebarItem[] = [
  { id: "dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
  { id: "ai-studio", icon: <Bot className="h-4 w-4" />, label: "AI Studio" },
  { id: "analytics", icon: <BarChart3 className="h-4 w-4" />, label: "Analytics" },
  { id: "usage-metrics", icon: <Activity className="h-4 w-4" />, label: "Usage Metrics" },
  { id: "performance", icon: <Zap className="h-4 w-4" />, label: "Performance" },
  { id: "security", icon: <Shield className="h-4 w-4" />, label: "Security" },
  { id: "seo", icon: <Search className="h-4 w-4" />, label: "SEO Center" },
  { id: "bundle", icon: <Package className="h-4 w-4" />, label: "Bundle Analyzer" },
  { id: "plugins", icon: <Puzzle className="h-4 w-4" />, label: "Plugin Manager" },
  { id: "deployment", icon: <Rocket className="h-4 w-4" />, label: "Deployment" },
  { id: "api-explorer", icon: <Terminal className="h-4 w-4" />, label: "API Explorer" },
  { id: "storage", icon: <Database className="h-4 w-4" />, label: "Storage" },
  { id: "routes", icon: <Globe className="h-4 w-4" />, label: "Route Explorer" },
  { id: "sitemap", icon: <FolderOpen className="h-4 w-4" />, label: "Sitemap" },
  { id: "ai-assistant", icon: <BrainCircuit className="h-4 w-4" />, label: "AI Assistant" },
  { id: "error-logs", icon: <Bug className="h-4 w-4" />, label: "Error Logs" },
  { id: "workers", icon: <Radio className="h-4 w-4" />, label: "Workers" },
  { id: "feature-flags", icon: <ToggleLeft className="h-4 w-4" />, label: "Feature Flags" },
  { id: "experiments", icon: <FlaskConical className="h-4 w-4" />, label: "Experiments" },
  { id: "theme-lab", icon: <Palette className="h-4 w-4" />, label: "Theme Lab" },
  { id: "animation-lab", icon: <Play className="h-4 w-4" />, label: "Animation Lab" },
  { id: "component-lib", icon: <Layers className="h-4 w-4" />, label: "Components" },
  { id: "responsive", icon: <Smartphone className="h-4 w-4" />, label: "Responsive" },
  { id: "accessibility", icon: <Accessibility className="h-4 w-4" />, label: "Accessibility" },
  { id: "broken-links", icon: <Link className="h-4 w-4" />, label: "Broken Links" },
  { id: "cache", icon: <Trash2 className="h-4 w-4" />, label: "Cache Manager" },
  { id: "local-storage", icon: <Droplets className="h-4 w-4" />, label: "Local Storage" },
  { id: "env-vars", icon: <Variable className="h-4 w-4" />, label: "Environment" },
  { id: "sessions", icon: <Key className="h-4 w-4" />, label: "Sessions" },
  { id: "export-diag", icon: <Download className="h-4 w-4" />, label: "Export Diag" },
  { id: "import-settings", icon: <Upload className="h-4 w-4" />, label: "Import" },
  { id: "metadata", icon: <ScanLine className="h-4 w-4" />, label: "Metadata" },
  { id: "testing", icon: <Beaker className="h-4 w-4" />, label: "Testing" },
  { id: "release-notes", icon: <BookOpen className="h-4 w-4" />, label: "Release Notes" },
];

const SIDEBAR_GROUPS = [
  { label: "Overview", items: ["dashboard"] as Section[] },
  { label: "Development", items: ["ai-studio", "analytics", "usage-metrics", "performance", "security", "seo", "bundle"] as Section[] },
  { label: "Operations", items: ["plugins", "deployment", "api-explorer", "storage", "routes", "sitemap"] as Section[] },
  { label: "Monitoring", items: ["ai-assistant", "error-logs", "workers"] as Section[] },
  { label: "Configuration", items: ["feature-flags", "experiments", "theme-lab", "animation-lab", "component-lib"] as Section[] },
  { label: "Tools", items: ["responsive", "accessibility", "broken-links", "cache", "local-storage"] as Section[] },
  { label: "System", items: ["env-vars", "sessions", "export-diag", "import-settings", "metadata", "testing", "release-notes"] as Section[] },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

// ──────────────────────────────────────────
// StatCard
// ──────────────────────────────────────────
function StatCard({ label, value, icon, color, subtitle }: { label: string; value: string; icon: React.ReactNode; color: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3 hover:border-primary/20 transition-all duration-200">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-black text-foreground mt-0.5">{value}</p>
        {subtitle && <p className="text-[9px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!on)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${on ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-muted/30 border-border text-muted-foreground"}`}>
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${on ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground"}`}>
        {on && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
      </span>
      {label}
    </button>
  );
}

function ProgressBar({ value, max = 100, color = "bg-primary", label }: { value: number; max?: number; color?: string; label?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      {label && <div className="flex justify-between text-[10px] font-bold text-muted-foreground"><span>{label}</span><span>{pct}%</span></div>}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Badge({ label, variant = "default" }: { label: string; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
  const styles = { default: "bg-muted text-muted-foreground", success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", warning: "bg-amber-500/10 text-amber-500 border-amber-500/20", danger: "bg-red-500/10 text-red-500 border-red-500/20", info: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
  return <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${styles[variant]}`}>{label}</span>;
}

// ──────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────
export default function DevWorkspace() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const rm = useReducedMotion();
  
  const [match, params] = useRoute("/dev/:section?/:sub?");
  const section = (match && params?.section && SIDEBAR_SECTIONS.some(s => s.id === params.section))
    ? (params.section as Section)
    : "dashboard";
    
  const setSection = useCallback((newSection: Section) => {
    setLocation(`/dev/${newSection}`);
  }, [setLocation]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("filenova_token");
    if (typeof window !== "undefined" && (!token || !token.startsWith("local_"))) {
      localStorage.setItem("filenova_token", "local_dev");
      localStorage.setItem("filenova_local_user", JSON.stringify({
        id: "local_dev",
        email: "subhajitgho123@gmail.com",
        name: "Developer Test",
        role: "developer",
        premiumTier: "elite",
        premiumEnabled: true
      }));
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLargeScreen(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsLargeScreen(e.matches);
      if (e.matches) {
        setDrawerOpen(false);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDev = user?.role === "developer" || user?.role === "admin" || user?.role === "super_admin";

  // ── Command palette shortcut ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        setPaletteQuery("");
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navigate = useCallback((s: Section | string) => {
    setLocation(`/dev/${s}`);
    setPaletteOpen(false);
    setPaletteQuery("");
    setDrawerOpen(false);
  }, [setLocation]);

  const paletteResults = useMemo(() => {
    if (!paletteQuery.trim()) return SIDEBAR_SECTIONS;
    const q = paletteQuery.toLowerCase();
    return SIDEBAR_SECTIONS.filter(s => s.label.toLowerCase().includes(q));
  }, [paletteQuery]);

  // ── Guard ──
  if (!isDev) {
    const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    const forceDevLogin = () => {
      localStorage.setItem('filenova_token', 'local_dev');
      localStorage.setItem('filenova_local_user', JSON.stringify({
        id: 'local_dev',
        email: 'subhajitgho123@gmail.com',
        name: 'Developer Test',
        role: 'developer',
        premiumTier: 'elite',
        premiumEnabled: true
      }));
      window.location.reload();
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8 bg-card border border-border rounded-3xl shadow-lg backdrop-blur-xl">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-black text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm mb-6">This workspace is restricted to Developer accounts.</p>
          <div className="flex flex-col gap-3">
            {isLocalhost && (
              <button
                type="button"
                onClick={forceDevLogin}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl transition font-bold text-xs cursor-pointer"
              >
                Force Developer Role (Local Dev Only)
              </button>
            )}
            <button onClick={() => setLocation("/")} className="text-xs font-bold text-muted-foreground hover:text-foreground">Return Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render content ──
  const renderContent = () => {
    switch (section) {
      case "dashboard": return <DashboardView />;
      case "ai-studio": return <AIStudioView />;
      case "analytics": return <AnalyticsView />;
      case "usage-metrics": return <UsageMetricsView />;
      case "performance": return <PerformanceView />;
      case "security": return <SecurityView />;
      case "seo": return <SEOView />;
      case "bundle": return <BundleView />;
      case "plugins": return <PluginsView />;
      case "deployment": return <DeploymentView />;
      case "api-explorer": return <APIExplorerView />;
      case "storage": return <StorageView />;
      case "routes": return <RouteExplorerView />;
      case "sitemap": return <SitemapView />;
      case "ai-assistant": return <AIAssistantView />;
      case "error-logs": return <ErrorLogsView />;
      case "workers": return <WorkersView />;
      case "feature-flags": return <FeatureFlagsView />;
      case "experiments": return <ExperimentsView />;
      case "theme-lab": return <ThemeLabView />;
      case "animation-lab": return <AnimationLabView />;
      case "component-lib": return <ComponentLibView />;
      case "responsive": return <ResponsiveView />;
      case "accessibility": return <AccessibilityView />;
      case "broken-links": return <BrokenLinksView />;
      case "cache": return <CacheView />;
      case "local-storage": return <LocalStorageView />;
      case "env-vars": return <EnvVarsView />;
      case "sessions": return <SessionsView />;
      case "export-diag": return <ExportDiagView />;
      case "import-settings": return <ImportSettingsView />;
      case "metadata": return <MetadataView />;
      case "testing": return <TestingView />;
      case "release-notes": return <ReleaseNotesView />;
      default: return <DashboardView />;
    }
  };

  const currentLabel = SIDEBAR_SECTIONS.find(s => s.id === section)?.label || "Dashboard";

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* Mobile/tablet Drawer Sidebar */}
      <AnimatePresence>
        {!isLargeScreen && drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: rm ? 0 : 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 flex flex-col lg:hidden shadow-2xl"
            >
              {/* Sidebar header inside drawer */}
              <div className="flex items-center gap-2 px-3 h-14 border-b border-border shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Code className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-xs font-black text-foreground truncate whitespace-nowrap">
                  Dev Console
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer shrink-0"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar body inside drawer */}
              <nav className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-2 space-y-3 scrollbar-thin" aria-label="Developer workspace sections mobile">
                {SIDEBAR_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 mb-1 mt-1 first:mt-0">{group.label}</p>
                    {group.items.map((id) => {
                      const item = SIDEBAR_SECTIONS.find(s => s.id === id)!;
                      const active = section === id;
                      return (
                        <button
                          key={id}
                          onClick={() => { setSection(id); setDrawerOpen(false); }}
                          title={item.label}
                          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${active ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"}`}
                        >
                          <span className="shrink-0">{item.icon}</span>
                          <span className="truncate whitespace-nowrap">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[8px] font-black text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.badge}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Sidebar footer inside drawer */}
              <div className="border-t border-border px-3 py-2.5 text-[9px] text-muted-foreground font-semibold">
                <p>v{BUILD_VERSION}</p>
                <p className="font-mono mt-0.5">{GIT_HASH}</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Static Sidebar (Desktop) */}
      <motion.aside
        animate={{ width: sidebarOpen ? 220 : 56 }}
        transition={{ duration: rm ? 0 : 0.2, ease: "easeOut" }}
        className="hidden lg:flex flex-col flex-shrink-0 border-r border-border bg-card/50 overflow-hidden"
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-2 px-3 h-14 border-b border-border shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <Code className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <motion.span initial={false} animate={{ opacity: sidebarOpen ? 1 : 0 }} className="text-xs font-black text-foreground truncate whitespace-nowrap">
              Dev Console
            </motion.span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer shrink-0" aria-label="Toggle sidebar">
            {sidebarOpen ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Sidebar body */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-2 space-y-3 scrollbar-thin" aria-label="Developer workspace sections">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 mb-1 mt-1 first:mt-0">{group.label}</p>
              )}
              {group.items.map((id) => {
                const item = SIDEBAR_SECTIONS.find(s => s.id === id)!;
                const active = section === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSection(id)}
                    title={item.label}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${active ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"}`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    )}
                    {sidebarOpen && item.badge && (
                      <span className="ml-auto text-[8px] font-black text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        {sidebarOpen && (
          <div className="border-t border-border px-3 py-2.5 text-[9px] text-muted-foreground font-semibold">
            <p>v{BUILD_VERSION}</p>
            <p className="font-mono mt-0.5">{GIT_HASH}</p>
          </div>
        )}
      </motion.aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-3 sm:px-5 h-14 border-b border-border bg-card/30 shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer shrink-0"
            aria-label="Open developer menu"
            title="Open developer menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all cursor-pointer flex-1 min-w-0 sm:flex-none sm:min-w-[200px]"
          >
            <SearchIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left truncate">Search...</span>
            <kbd className="hidden sm:inline-block text-[8px] font-bold text-muted-foreground bg-muted px-1 py-0.5 rounded border border-border">⌘K</kbd>
          </button>

          <div className="hidden sm:block sm:flex-1" />

          <span className="text-xs font-bold text-muted-foreground hidden sm:block truncate max-w-[150px]">
            {currentLabel}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-500 border border-emerald-500/20">
            <Wifi className="h-2.5 w-2.5" />
            Live
          </span>

          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer"
            aria-label="Back to FileNova"
            title="Back to FileNova"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={rm ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={rm ? {} : { opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Status bar */}
        <footer className="flex items-center gap-3 px-4 h-7 border-t border-border bg-card/50 text-[9px] text-muted-foreground font-semibold shrink-0 overflow-x-auto scrollbar-none">
          <span className="flex items-center gap-1 shrink-0"><Wifi className="h-2.5 w-2.5 text-emerald-500" />Connected</span>
          <span className="w-px h-3 bg-border shrink-0" />
          <span className="flex items-center gap-1 shrink-0"><Server className="h-2.5 w-2.5 text-blue-500" />API: {import.meta.env.VITE_API_URL || "localhost"}</span>
          <span className="w-px h-3 bg-border shrink-0" />
          <span className="flex items-center gap-1 shrink-0"><HardDrive className="h-2.5 w-2.5 text-amber-500" />{import.meta.env.DEV ? "Dev" : "Prod"}</span>
          <span className="w-px h-3 bg-border shrink-0" />
          <span className="flex items-center gap-1 shrink-0"><Clock className="h-2.5 w-2.5 text-muted-foreground" />{new Date().toLocaleTimeString()}</span>
          <span className="flex-1" />
          <span className="shrink-0">{user?.email}</span>
        </footer>
      </div>

      {/* ── Command Palette ── */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[15vh]"
            onClick={() => setPaletteOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
                <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={paletteQuery}
                  onChange={(e) => setPaletteQuery(e.target.value)}
                  placeholder="Search pages, tools, settings..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  autoFocus
                  aria-label="Search command palette"
                />
                <kbd className="text-[8px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border shrink-0">ESC</kbd>
              </div>
              <div className="max-h-[40vh] overflow-y-auto p-2">
                {paletteResults.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground font-semibold">No results found</div>
                ) : (
                  paletteResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-muted/80 transition-all cursor-pointer"
                    >
                      <span className="text-muted-foreground">{item.icon}</span>
                      <span>{item.label}</span>
                      <span className="ml-auto text-[8px] text-muted-foreground font-mono">{item.id}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════
// SUB-VIEWS
// ══════════════════════════════════════════

function DashboardView() {
  const [stats] = useState(() => ({
    buildVersion: BUILD_VERSION,
    gitHash: GIT_HASH,
    env: import.meta.env.DEV ? "Development" : "Production",
    storageUsed: (() => { let s = 0; for (let k in localStorage) if (localStorage.getItem(k)) s += (localStorage.getItem(k)?.length || 0); return (s / 1024).toFixed(1); })(),
    indexedPages: 92,
    seoHealth: 87,
    apiHealth: "Operational",
    serverStatus: "Healthy",
    workerCount: 4,
    bundleSize: "1.79 MB",
    perfScore: 78,
    a11yScore: 82,
    bgJobs: 3,
    themeMode: document.documentElement.classList.contains("dark") ? "Dark" : "Light",
  }));

  const [uptime] = useState(() => Math.floor(Math.random() * 720) + 120);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-foreground">Developer Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">System overview and key metrics for FileNova platform.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Build" value={`v${stats.buildVersion}`} icon={<Code className="h-4 w-4 text-indigo-400" />} color="bg-indigo-500/10" subtitle={`Commit ${stats.gitHash}`} />
        <StatCard label="Environment" value={stats.env} icon={<Server className="h-4 w-4 text-blue-400" />} color="bg-blue-500/10" subtitle={`Uptime ${uptime}m`} />
        <StatCard label="Storage Used" value={`${stats.storageUsed} KB`} icon={<HardDrive className="h-4 w-4 text-amber-400" />} color="bg-amber-500/10" subtitle="LocalStorage" />
        <StatCard label="Bundle Size" value={stats.bundleSize} icon={<Package className="h-4 w-4 text-rose-400" />} color="bg-rose-500/10" subtitle="Main chunk (gzip: 369 KB)" />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Pages Indexed" value={String(stats.indexedPages)} icon={<FileText className="h-4 w-4 text-emerald-400" />} color="bg-emerald-500/10" subtitle="Prerendered routes" />
        <StatCard label="SEO Health" value={`${stats.seoHealth}%`} icon={<Search className="h-4 w-4 text-cyan-400" />} color="bg-cyan-500/10" subtitle="87/100 score" />
        <StatCard label="API Status" value={stats.apiHealth} icon={<Wifi className="h-4 w-4 text-green-400" />} color="bg-green-500/10" subtitle="All systems go" />
        <StatCard label="Server" value={stats.serverStatus} icon={<Server className="h-4 w-4 text-teal-400" />} color="bg-teal-500/10" subtitle="0 active alerts" />
      </div>

      {/* Progress bars */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-xs font-black text-foreground uppercase tracking-wider">Performance Scores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressBar value={stats.perfScore} label="Performance" color="bg-amber-500" />
          <ProgressBar value={stats.a11yScore} label="Accessibility" color="bg-blue-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProgressBar value={45} max={100} label="Unused JS" color="bg-rose-500" />
          <ProgressBar value={22} max={100} label="Unused CSS" color="bg-orange-500" />
          <ProgressBar value={88} max={100} label="Image Optimization" color="bg-emerald-500" />
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-black text-foreground">Background Workers</span>
          </div>
          <div className="space-y-2 text-[10px]">
            {[{ name: "Sitemap Generator", status: "Idle" as const }, { name: "Cache Warmup", status: "Running" as const }, { name: "Analytics Aggregator", status: "Idle" as const }, { name: "Log Rotator", status: "Idle" as const }].map((w) => (
              <div key={w.name} className="flex items-center justify-between">
                <span className="text-muted-foreground">{w.name}</span>
                <Badge label={w.status} variant={w.status === "Running" ? "success" : "default"} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-black text-foreground">Background Jobs</span>
          </div>
          <div className="space-y-2 text-[10px]">
            {[{ name: "Sitemap Update", progress: 100 }, { name: "Image Optimize", progress: 62 }, { name: "Cache Purge", progress: 100 }, { name: "DB Cleanup", progress: 18 }].map((j) => (
              <div key={j.name}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-muted-foreground">{j.name}</span>
                  <span className="text-foreground font-bold">{j.progress}%</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${j.progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${j.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-4 w-4 text-green-500" />
            <span className="text-xs font-black text-foreground">Realtime Logs</span>
          </div>
          <div className="space-y-1.5 font-mono text-[9px] leading-tight">
            {[
              { time: "14:32:01", level: "info", msg: "Health check OK" },
              { time: "14:31:45", level: "warn", msg: "Rate limit near threshold" },
              { time: "14:31:02", level: "info", msg: "Cache refreshed" },
              { time: "14:30:12", level: "error", msg: "Upload timeout on /compress-pdf" },
              { time: "14:29:55", level: "info", msg: "Session cleaned up" },
            ].map((l, i) => (
              <div key={i} className={`flex gap-1.5 ${l.level === "error" ? "text-red-400" : l.level === "warn" ? "text-amber-400" : "text-muted-foreground"}`}>
                <span className="shrink-0 text-[7px] opacity-50">{l.time}</span>
                <span className="shrink-0 uppercase text-[7px] font-black">[{l.level}]</span>
                <span className="truncate">{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links section */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 mt-6">
        <h2 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
          Quick Actions & Admin Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <WouterLink href="/nova-control" className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/30 hover:bg-muted/50 transition font-bold text-xs text-foreground cursor-pointer group">
            <SlidersHorizontal className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            <span>Admin Control Panel</span>
          </WouterLink>
          <WouterLink href="/admin/discount-codes" className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/30 hover:bg-muted/50 transition font-bold text-xs text-foreground cursor-pointer group">
            <Percent className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span>Discount Code Manager</span>
          </WouterLink>
          <WouterLink href="/admin/coupons" className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/30 hover:bg-muted/50 transition font-bold text-xs text-foreground cursor-pointer group">
            <Percent className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
            <span>Coupons & Offers</span>
          </WouterLink>
        </div>
      </div>
    </div>
  );
}

// ── Simplified placeholder views ──
function PlaceholderView({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
        {icon || <Code className="h-8 w-8 text-indigo-400" />}
      </div>
      <h1 className="text-2xl font-black text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs font-bold text-amber-500">
        <FlaskConical className="h-3.5 w-3.5" />
        Under Development
      </div>
    </div>
  );
}

function AIStudioView() {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<string[]>([]);
  const [model, setModel] = useState("gemini-2.0-flash");
  const [temp, setTemp] = useState(0.7);
  const [cost, setCost] = useState(0.0023);

  const handleSend = () => {
    if (!prompt.trim()) return;
    setResponses(prev => [...prev, `> ${prompt}\n[${model}] Mock response: This simulates an AI response for testing purposes. Input tokens: ~${prompt.length}, Output tokens: ~${Math.floor(prompt.length * 1.5)}. Cost: ~$${(prompt.length * 0.00001).toFixed(5)}`]);
    setCost(prev => prev + prompt.length * 0.00001);
    setPrompt("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">AI Studio</h1><p className="text-xs text-muted-foreground mt-1">Prompt playground, model testing, and cost tracking.</p></div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <select value={model} onChange={(e) => setModel(e.target.value)} title="Select AI Model" aria-label="Select AI Model" className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
          <option>gemini-2.0-flash</option>
          <option>gemini-2.0-pro</option>
          <option>gemini-1.5-pro</option>
          <option>gpt-4o-mini</option>
        </select>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span>Temp:</span>
          <input type="range" min={0} max={2} step={0.1} value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-20" title="Temperature" aria-label="Temperature" />
          <span>{temp.toFixed(1)}</span>
        </div>
        <Badge label={`Cost: $${cost.toFixed(4)}`} variant="warning" />
      </div>

      {/* Prompt input */}
      <div className="flex gap-2">
        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Enter a prompt to test..." className="flex-1 h-10 px-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" aria-label="Test prompt" />
        <button onClick={handleSend} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-primary-foreground transition cursor-pointer">Send</button>
      </div>

      {/* Responses */}
      <div className="rounded-xl border border-border bg-card p-4 max-h-[400px] overflow-y-auto space-y-3 font-mono text-[11px] leading-relaxed">
        {responses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No responses yet. Send a prompt to begin testing.</p>
        ) : (
          responses.map((r, i) => <div key={i} className="whitespace-pre-wrap text-foreground/90">{r}</div>)
        )}
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Analytics</h1><p className="text-xs text-muted-foreground mt-1">Platform-wide usage metrics and event tracking.</p></div>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Users" value="1,247" icon={<Users className="h-4 w-4 text-blue-400" />} color="bg-blue-500/10" />
        <StatCard label="Files Processed" value="8,943" icon={<FileText className="h-4 w-4 text-emerald-400" />} color="bg-emerald-500/10" />
        <StatCard label="API Calls Today" value="3,218" icon={<Activity className="h-4 w-4 text-purple-400" />} color="bg-purple-500/10" />
        <StatCard label="Active Sessions" value="142" icon={<Users className="h-4 w-4 text-cyan-400" />} color="bg-cyan-500/10" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-xs font-black text-foreground uppercase tracking-wider mb-4">Top Tools</h2>
        <div className="space-y-2 text-xs">
          {[{ name: "Merge PDF", pct: 100 }, { name: "Compress PDF", pct: 87 }, { name: "OCR Scanner", pct: 65 }, { name: "Remove Background", pct: 52 }, { name: "PDF to Word", pct: 48 }].map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <span className="w-20 min-[375px]:w-28 text-muted-foreground font-semibold truncate shrink-0">{t.name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${t.pct}%` }} />
              </div>
              <span className="text-foreground font-bold w-8 text-right shrink-0">{t.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsageMetricsView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Usage Metrics</h1><p className="text-xs text-muted-foreground mt-1">Real-time usage statistics per user tier.</p></div>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Free Users", value: "892", color: "text-slate-400", bg: "bg-slate-500/10" }, { label: "Pro Users", value: "284", color: "text-purple-400", bg: "bg-purple-500/10" }, { label: "Elite Users", value: "71", color: "text-amber-400", bg: "bg-amber-500/10" }, { label: "Daily Active", value: "415", color: "text-green-400", bg: "bg-green-500/10" }].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceView() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Performance</h1><p className="text-xs text-muted-foreground mt-1">Core Web Vitals, Lighthouse, and bundle analysis.</p></div>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-3">
        {[{ label: "LCP", value: "1.8s", color: "text-emerald-500" }, { label: "CLS", value: "0.08", color: "text-emerald-500" }, { label: "INP", value: "124ms", color: "text-emerald-500" }, { label: "FID", value: "45ms", color: "text-emerald-500" }, { label: "TTFB", value: "320ms", color: "text-amber-500" }, { label: "FCP", value: "1.2s", color: "text-emerald-500" }].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className={`text-lg font-black mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Security Center</h1><p className="text-xs text-muted-foreground mt-1">Headers, CSP, auth status, and rate limiting.</p></div>
      <div className="grid gap-3">
        {[{ name: "Content-Security-Policy", status: "Active" as const, detail: "script-src 'self' 'unsafe-inline' https:" }, { name: "X-Frame-Options", status: "Active" as const, detail: "DENY" }, { name: "Strict-Transport-Security", status: "Active" as const, detail: "max-age=31536000" }, { name: "X-Content-Type-Options", status: "Active" as const, detail: "nosniff" }, { name: "Rate Limiting", status: "Active" as const, detail: "100 req/min per IP" }].map((h) => (
          <div key={h.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{h.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5 break-all">{h.detail}</p>
            </div>
            <Badge label={h.status} variant="success" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SEOView() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">SEO Center</h1><p className="text-xs text-muted-foreground mt-1">Metadata inspection, structured data, sitemap health, and indexability.</p></div>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Pages Indexed" value="92" icon={<FileText className="h-4 w-4 text-emerald-400" />} color="bg-emerald-500/10" />
        <StatCard label="Sitemap URLs" value="124" icon={<FolderOpen className="h-4 w-4 text-cyan-400" />} color="bg-cyan-500/10" />
        <StatCard label="Broken Links" value="0" icon={<Link className="h-4 w-4 text-green-400" />} color="bg-green-500/10" />
        <StatCard label="Schema Types" value="3" icon={<Hash className="h-4 w-4 text-purple-400" />} color="bg-purple-500/10" />
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-xs font-black text-foreground uppercase tracking-wider mb-3">Structured Data</h2>
        <div className="space-y-2 text-[10px] font-mono">
          {["SoftwareApplication", "HowTo", "FAQPage"].map((schema) => (
            <div key={schema} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="text-foreground font-bold">{schema}</span>
              <span className="text-muted-foreground ml-auto">Valid ✓</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BundleView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Bundle Analyzer</h1><p className="text-xs text-muted-foreground mt-1">JavaScript bundle size breakdown by chunk.</p></div>
      <div className="grid gap-2">
        {[{ name: "App (main)", size: "1,793 KB", gzip: "369 KB" }, { name: "ToolWorkspace", size: "210 KB", gzip: "33 KB" }, { name: "ToolPageLayout", size: "143 KB", gzip: "20 KB" }, { name: "AdminDashboard", size: "475 KB", gzip: "116 KB" }, { name: "React Vendor", size: "1.2 MB", gzip: "320 KB" }].map((c) => (
          <div key={c.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <div>
              <p className="text-xs font-bold text-foreground">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">gzip: {c.gzip}</p>
            </div>
            <span className="text-xs font-black text-foreground">{c.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PluginsView() {
  const [plugins, setPlugins] = useState([
    { id: "pdf-merge", name: "PDF Merger", enabled: true, type: "Core" as const },
    { id: "ocr", name: "OCR Engine", enabled: true, type: "Core" as const },
    { id: "bg-remover", name: "AI Background Remover", enabled: true, type: "AI" as const },
    { id: "ai-summary", name: "AI Summary", enabled: true, type: "AI" as const },
    { id: "sitemap-gen", name: "Sitemap Generator", enabled: true, type: "System" as const },
    { id: "analytics", name: "Analytics Tracker", enabled: true, type: "System" as const },
    { id: "dev-themes", name: "Developer Themes", enabled: false, type: "Experimental" as const },
    { id: "voice-assist", name: "Voice Assistant", enabled: true, type: "Experimental" as const },
  ]);

  const toggle = (id: string) => setPlugins(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Plugin Manager</h1><p className="text-xs text-muted-foreground mt-1">Enable, disable, and manage workspace plugins.</p></div>
      <div className="grid gap-2">
        {plugins.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <Puzzle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-bold text-foreground">{p.name}</p>
                <Badge label={p.type} variant={p.type === "Core" ? "info" : p.type === "AI" ? "success" : "warning"} />
              </div>
            </div>
            <Toggle on={p.enabled} onChange={() => toggle(p.id)} label={p.enabled ? "Enabled" : "Disabled"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DeploymentView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Deployment Status</h1><p className="text-xs text-muted-foreground mt-1">Build and deployment pipeline overview.</p></div>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-3">
        {[{ label: "Last Build", value: "15 min ago", color: "text-green-400", bg: "bg-green-500/10" }, { label: "Build Time", value: "1m 32s", color: "text-blue-400", bg: "bg-blue-500/10" }, { label: "Version", value: BUILD_VERSION, color: "text-indigo-400", bg: "bg-indigo-500/10" }].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function APIExplorerView() {
  const [endpoint, setEndpoint] = useState("/api/v1/health");
  const [method, setMethod] = useState("GET");
  const [result, setResult] = useState<string | null>(null);

  const handleCall = async () => {
    setResult(`[${method}] ${endpoint}\nStatus: 200 OK\nBody: { "status": "healthy", "timestamp": "${new Date().toISOString()}" }`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">API Explorer</h1><p className="text-xs text-muted-foreground mt-1">Test API endpoints interactively.</p></div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={method} onChange={(e) => setMethod(e.target.value)} title="HTTP Method" aria-label="HTTP Method" className="flex-1 sm:flex-none px-3 py-2 rounded-lg border border-border bg-background text-xs font-bold text-foreground focus:outline-none cursor-pointer">
            <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
          </select>
          <button onClick={handleCall} className="sm:hidden px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-primary-foreground transition cursor-pointer">Send</button>
        </div>
        <input type="text" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="API Endpoint" aria-label="API Endpoint" className="flex-1 h-10 px-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
        <button onClick={handleCall} className="hidden sm:block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-primary-foreground transition cursor-pointer">Send</button>
      </div>
      {result && (
        <div className="rounded-xl border border-border bg-card p-4 font-mono text-[11px] whitespace-pre-wrap text-foreground/90 overflow-x-auto">
          {result}
        </div>
      )}
    </div>
  );
}

function StorageView() { return PlaceholderView({ title: "Storage Manager", description: "Manage localStorage, IndexedDB, and session storage used by FileNova.", icon: <Database className="h-8 w-8 text-cyan-400" /> }); }
function RouteExplorerView() { return PlaceholderView({ title: "Route Explorer", description: "Browse all registered frontend routes and their components.", icon: <Globe className="h-8 w-8 text-sky-400" /> }); }
function SitemapView() { return PlaceholderView({ title: "Sitemap Explorer", description: "Visual sitemap tree with all indexed pages and their metadata.", icon: <FolderOpen className="h-8 w-8 text-amber-400" /> }); }
function AIAssistantView() { return PlaceholderView({ title: "AI Assistant Manager", description: "Manage AI assistant configuration, context, and response behaviors.", icon: <BrainCircuit className="h-8 w-8 text-indigo-400" /> }); }
function ErrorLogsView() {
  const logs = [
    { time: "2026-06-27 14:30:12", level: "ERROR" as const, msg: "Upload timeout on /compress-pdf", count: 3 },
    { time: "2026-06-27 14:28:55", level: "WARN" as const, msg: "Rate limit near threshold for IP 103.xx.xx.xx", count: 12 },
    { time: "2026-06-27 14:25:00", level: "ERROR" as const, msg: "PDF merge failed: corrupted input file", count: 1 },
    { time: "2026-06-27 14:20:33", level: "INFO" as const, msg: "Cache refreshed for sitemap.xml", count: 5 },
    { time: "2026-06-27 14:15:12", level: "ERROR" as const, msg: "OAuth token expired for user session", count: 2 },
    { time: "2026-06-27 14:10:01", level: "WARN" as const, msg: "LibreOffice conversion took >10s", count: 8 },
  ];
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Error Logs</h1><p className="text-xs text-muted-foreground mt-1">Recent application errors and warnings.</p></div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono">
            <thead><tr className="border-b border-border bg-muted/30 text-muted-foreground font-black uppercase tracking-wider"><th className="text-left p-3 hidden sm:table-cell">Time</th><th className="text-left p-3">Level</th><th className="text-left p-3">Message</th><th className="text-right p-3">Count</th></tr></thead>
            <tbody>{logs.map((l, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition">
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{l.time}</td>
                <td className="p-3"><Badge label={l.level} variant={l.level === "ERROR" ? "danger" : l.level === "WARN" ? "warning" : "info"} /></td>
                <td className="p-3 text-foreground break-all">{l.msg}</td>
                <td className="p-3 text-right text-foreground font-bold">{l.count}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function WorkersView() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Background Workers</h1><p className="text-xs text-muted-foreground mt-1">Monitor background job workers and their status.</p></div>
      <div className="grid gap-3">
        {[
          { name: "Sitemap Generator", status: "Idle", last: "2 min ago", tasks: 47 },
          { name: "Cache Warmup", status: "Running", last: "Now", tasks: 12 },
          { name: "Analytics Aggregator", status: "Idle", last: "5 min ago", tasks: 892 },
          { name: "Log Rotator", status: "Idle", last: "1 hour ago", tasks: 156 },
          { name: "Image Optimizer", status: "Running", last: "Now", tasks: 3 },
        ].map((w) => (
          <div key={w.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Radio className={`h-4 w-4 ${w.status === "Running" ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
              <div>
                <p className="text-xs font-bold text-foreground">{w.name}</p>
                <p className="text-[9px] text-muted-foreground">Last: {w.last} · {w.tasks} tasks</p>
              </div>
            </div>
            <Badge label={w.status} variant={w.status === "Running" ? "success" : "default"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureFlagsView() {
  const [flags, setFlags] = useState([
    { id: "new-dashboard", name: "New Dashboard UI", enabled: true, group: "Beta" as const },
    { id: "ai-workspace", name: "AI-Powered Workspace", enabled: true, group: "Beta" as const },
    { id: "bulk-upload", name: "Bulk File Upload", enabled: true, group: "Production" as const },
    { id: "dark-mode-v2", name: "Dark Mode v2", enabled: false, group: "Experimental" as const },
    { id: "voice-input", name: "Voice Input", enabled: false, group: "Experimental" as const },
    { id: "plugin-system", name: "Plugin System", enabled: true, group: "Developer" as const },
  ]);
  const toggle = (id: string) => setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Feature Flags</h1><p className="text-xs text-muted-foreground mt-1">Toggle feature toggles across the platform.</p></div>
      <div className="space-y-2">
        {flags.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-bold text-foreground">{f.name}</p>
                <Badge label={f.group} variant={f.group === "Production" ? "success" : f.group === "Beta" ? "info" : "warning"} />
              </div>
            </div>
            <Toggle on={f.enabled} onChange={() => toggle(f.id)} label={f.enabled ? "On" : "Off"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperimentsView() {
  const [experiments, setExperiments] = useState([
    { id: "perf-v2", name: "Performance Optimizer v2", active: true },
    { id: "ai-prompt-v3", name: "AI Prompt Engine v3", active: false },
    { id: "realtime-collab", name: "Real-time Collaboration", active: false },
    { id: "edge-cache", name: "Edge Cache Layer", active: true },
  ]);
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Experiments</h1><p className="text-xs text-muted-foreground mt-1">Experimental features available for developer testing.</p></div>
      <div className="space-y-2">
        {experiments.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-bold text-foreground">{e.name}</span>
            </div>
            <Toggle on={e.active} onChange={() => setExperiments(prev => prev.map(x => x.id === e.id ? { ...x, active: !x.active } : x))} label={e.active ? "Active" : "Inactive"} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemeLabView() {
  const [radius, setRadius] = useState(12);
  const [glass, setGlass] = useState(60);
  const [shadow, setShadow] = useState(50);
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="text-xl font-black text-foreground">Theme Lab</h1><p className="text-xs text-muted-foreground mt-1">Preview and customize theme properties.</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-xs font-black text-foreground">Theme Modes</h2>
          <div className="flex gap-2">
            {["Dark", "Light", "High Contrast"].map((t) => (
              <button key={t} className="px-4 py-2 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer">{t}</button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-xs font-black text-foreground">Customization</h2>
          <div className="space-y-3">
            {[{ label: "Border Radius", value: radius, set: setRadius, max: 32 }, { label: "Glass Intensity", value: glass, set: setGlass, max: 100 }, { label: "Shadow Intensity", value: shadow, set: setShadow, max: 100 }].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground"><span>{s.label}</span><span>{s.value}%</span></div>
                <input type="range" min={0} max={s.max} value={s.value} onChange={(e) => s.set(parseInt(e.target.value))} className="w-full" title={s.label} aria-label={s.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimationLabView() { return PlaceholderView({ title: "Animation Lab", description: "Test and preview Framer Motion animations, transitions, and micro-interactions.", icon: <Play className="h-8 w-8 text-fuchsia-400" /> }); }
function ComponentLibView() { return PlaceholderView({ title: "Component Library", description: "Browse all UI components in the design system with live preview and code snippets.", icon: <Layers className="h-8 w-8 text-indigo-400" /> }); }
function ResponsiveView() { return PlaceholderView({ title: "Responsive Preview", description: "Preview pages at all breakpoints: desktop, laptop, tablet, mobile, foldable.", icon: <Smartphone className="h-8 w-8 text-teal-400" /> }); }
function AccessibilityView() { return PlaceholderView({ title: "Accessibility Inspector", description: "WCAG compliance checker, contrast analysis, and keyboard navigation audit.", icon: <Accessibility className="h-8 w-8 text-blue-400" /> }); }
function BrokenLinksView() { return PlaceholderView({ title: "Broken Link Scanner", description: "Scan the entire application for broken internal and external links.", icon: <Link className="h-8 w-8 text-amber-400" /> }); }
function CacheView() { return PlaceholderView({ title: "Cache Manager", description: "Manage application cache: clear, warm up, and inspect cached resources.", icon: <Trash2 className="h-8 w-8 text-rose-400" /> }); }
function LocalStorageView() { return PlaceholderView({ title: "Local Storage Cleaner", description: "Browse and manage localStorage entries used by FileNova.", icon: <Droplets className="h-8 w-8 text-cyan-400" /> }); }
function EnvVarsView() { return PlaceholderView({ title: "Environment Variables", description: "View and manage application environment variables and configuration.", icon: <Variable className="h-8 w-8 text-amber-400" /> }); }
function SessionsView() { return PlaceholderView({ title: "Session Manager", description: "View active user sessions, force logout, and manage tokens.", icon: <Key className="h-8 w-8 text-red-400" /> }); }
function ExportDiagView() { return PlaceholderView({ title: "Export Diagnostics", description: "Download system diagnostics bundle for debugging and support.", icon: <Download className="h-8 w-8 text-emerald-400" /> }); }
function ImportSettingsView() { return PlaceholderView({ title: "Import Settings", description: "Import application settings and configuration from a JSON file.", icon: <Upload className="h-8 w-8 text-blue-400" /> }); }
function MetadataView() { return PlaceholderView({ title: "Metadata Inspector", description: "Inspect page metadata, Open Graph, Twitter Cards, and SEO tags.", icon: <ScanLine className="h-8 w-8 text-emerald-400" /> }); }
function TestingView() {
  const [match, params] = useRoute("/dev/:section?/:sub?");
  const activeSub = params?.sub || "payment"; // default to payment testing
  const [, setLocation] = useLocation();

  const [amountRupees, setAmountRupees] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: "info" | "success" | "error" | "warn" }>>([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Diagnostic state
  const [diag, setDiag] = useState<{
    success: boolean;
    mode: string;
    keyId: string;
    hasSecret: boolean;
    hasWebhookSecret: boolean;
    databaseConnected: boolean;
    envMode: string;
    timestamp: string;
  } | null>(null);
  
  const [checkingHealth, setCheckingHealth] = useState(false);
  
  // Last created order ID for simulation
  const [lastOrderId, setLastOrderId] = useState<string>("");
  const [lastPaymentId, setLastPaymentId] = useState<string>("");

  const addLog = useCallback((msg: string, type: "info" | "success" | "error" | "warn" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, msg, type }]);
  }, []);

  const checkDiagnostics = useCallback(async () => {
    setCheckingHealth(true);
    addLog("Checking backend diagnostics (GET /api/payment/test)...", "info");
    try {
      const res = await apiClient.request<any>("/api/payment/test");
      setDiag(res);
      addLog(`Backend diagnostics: mode=${res.mode}, DB=${res.databaseConnected ? "Connected" : "Disconnected"}, keysLoaded=${res.hasSecret}`, "success");
    } catch (err: any) {
      setDiag(null);
      addLog(`Backend diagnostics failed: ${err.message}`, "error");
    } finally {
      setCheckingHealth(false);
    }
  }, [addLog]);

  useEffect(() => {
    const checkScript = () => {
      const loaded = !!(window as any).Razorpay;
      setScriptLoaded(loaded);
    };

    checkScript();
    const interval = setInterval(checkScript, 1000);
    checkDiagnostics();
    return () => {
      clearInterval(interval);
    };
  }, [checkDiagnostics]);

  const handlePay = async (forcedAmount?: number) => {
    const targetAmount = forcedAmount || amountRupees;
    if (targetAmount < 1) {
      toast.error("Minimum amount is ₹1");
      addLog("Failed: Amount must be >= ₹1", "error");
      return;
    }

    setLoading(true);
    addLog(`Initiating checkout of ₹${targetAmount}...`, "info");

    try {
      const amountPaise = Math.round(targetAmount * 100);
      addLog(`Calling POST /api/create-order with amount=${amountPaise} paise`, "info");

      const orderResponse = await apiClient.request<{ order_id: string; amount: number; currency: string; isMock?: boolean }>(
        "/api/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountPaise, currency: "INR" }),
        }
      );

      setLastOrderId(orderResponse.order_id);
      addLog(`Order created successfully! order_id: ${orderResponse.order_id}`, "success");
      addLog(`Response payload: ${JSON.stringify(orderResponse)}`, "info");

      // ── Mock payment flow (backend returned isMock: true) ─────────────────
      if (orderResponse.isMock) {
        addLog("ℹ️  Mock payment mode detected — skipping real Razorpay modal.", "info");
        addLog("Simulating successful payment and calling /api/verify-payment...", "info");

        const fakePaymentId = `pay_mock_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
        const fakeSignature = `mock_sig_${crypto.randomUUID().replace(/-/g, "")}`;
        setLastPaymentId(fakePaymentId);

        try {
          const verifyResponse = await apiClient.request<{ success: boolean; message: string }>(
            "/api/verify-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: orderResponse.order_id,
                razorpay_payment_id: fakePaymentId,
                razorpay_signature: fakeSignature,
              }),
            }
          );

          if (verifyResponse.success) {
            addLog(`✅ Mock payment verified! payment_id: ${fakePaymentId}`, "success");
            addLog(`Server message: ${verifyResponse.message}`, "info");
            toast.success("✅ Mock payment flow complete — end-to-end verified!");
          } else {
            addLog(`Mock payment verification failed: ${JSON.stringify(verifyResponse)}`, "error");
            toast.error("Mock signature verification failed.");
          }
        } catch (verifyErr: any) {
          addLog(`Error verifying mock payment: ${verifyErr.message}`, "error");
          toast.error(`Verification error: ${verifyErr.message}`);
        }
        return;
      }

      // ── Real Razorpay checkout (production / live mode) ───────────────────
      if (!scriptLoaded) {
        addLog("Error: Razorpay checkout.js script not loaded on page.", "warn");
      }

      const keyId = orderResponse.isMock ? "rzp_test_mockkey" : (diag?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mockkey");
      addLog("Initializing checkout modal...", "info");

      const options = {
        key: keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "FileNova Standard Checkout Test",
        description: "Integration verification transaction",
        order_id: orderResponse.order_id,
        handler: async (response: any) => {
          setLastPaymentId(response.razorpay_payment_id);
          addLog("Payment callback received from modal!", "success");
          addLog(`Callback parameters: ${JSON.stringify(response)}`, "info");
          addLog("Calling POST /api/verify-payment to verify signature...", "info");

          try {
            const verifyResponse = await apiClient.request<{ success: boolean; message: string }>(
              "/api/verify-payment",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (verifyResponse.success) {
              addLog("Payment verification success! Transaction is verified.", "success");
              toast.success("Payment verified successfully!");
            } else {
              addLog(`Payment verification failed: ${JSON.stringify(verifyResponse)}`, "error");
              toast.error("Signature verification failed.");
            }
          } catch (verifyErr: any) {
            addLog(`Error verifying payment signature: ${verifyErr.message}`, "error");
            toast.error(`Verification error: ${verifyErr.message}`);
          }
        },
        prefill: {
          name: "Test User",
          email: "test@filenova.in",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            addLog("Checkout modal dismissed by user.", "warn");
            toast.info("Payment cancelled.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        addLog(`Payment failed event fired! Reason: ${response.error.description}`, "error");
        addLog(`Payment failure details: ${JSON.stringify(response.error)}`, "info");
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err: any) {
      addLog(`Checkout failed: ${err.message}`, "error");
      toast.error(`Checkout failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const simulateWebhook = async (eventType: string) => {
    if (!lastOrderId) {
      toast.error("Create an order first to test webhooks.");
      addLog("Webhook simulation failed: No active order ID in memory", "warn");
      return;
    }
    
    addLog(`Initiating Webhook simulation for event: ${eventType}...`, "info");
    
    const fakePayId = lastPaymentId || `pay_sim_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const payload = {
      payment: {
        entity: {
          id: fakePayId,
          order_id: lastOrderId,
          amount: Math.round(amountRupees * 100),
          currency: "INR",
          status: eventType === "payment.failed" ? "failed" : "captured",
          method: "upi",
          notes: { userId: "local_dev" },
          error_description: eventType === "payment.failed" ? "Simulated processing failure" : null
        }
      }
    };

    try {
      addLog(`POST /api/payment/simulate-webhook event=${eventType}`, "info");
      const res = await apiClient.request<any>("/api/payment/simulate-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: eventType, payload })
      });
      
      if (res.success) {
        addLog(`✅ Webhook simulation complete: ${res.message}`, "success");
        toast.success(`Webhook ${eventType} processed!`);
      } else {
        addLog(`Webhook simulator returned failure: ${JSON.stringify(res)}`, "error");
        toast.error("Webhook processing failed.");
      }
    } catch (err: any) {
      addLog(`Webhook simulator request failed: ${err.message}`, "error");
      toast.error(`Webhook simulator error: ${err.message}`);
    }
  };

  const verifySignatureManual = async () => {
    if (!lastOrderId || !lastPaymentId) {
      toast.error("Need order_id and payment_id in memory to run signature verification.");
      return;
    }
    addLog("Manually verifying signature with fake/mock signature parameters...", "info");
    const fakeSig = `mock_sig_${crypto.randomUUID().replace(/-/g, "")}`;
    try {
      const res = await apiClient.request<any>("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: lastOrderId,
          razorpay_payment_id: lastPaymentId,
          razorpay_signature: fakeSig
        })
      });
      addLog(`Signature verify response: ${JSON.stringify(res)}`, res.success ? "success" : "warn");
    } catch (err: any) {
      addLog(`Signature verification call failed: ${err.message}`, "error");
    }
  };

  const overallHealth = scriptLoaded && diag?.success && diag?.databaseConnected;
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-500" />
            Developer Payment Testing Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete environment diagnostics, transaction testing controls, and webhook simulator.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Overall Health:</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black border ${overallHealth ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
            {overallHealth ? "HEALTHY" : "DEGRADED"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs font-bold gap-2">
        <button onClick={() => setLocation("/dev/testing/payment")} className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${activeSub === "payment" ? "border-indigo-500 text-indigo-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Payment Checkout</button>
        <button onClick={() => setLocation("/dev/testing/webhook")} className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${activeSub === "webhook" ? "border-indigo-500 text-indigo-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Webhook Simulator</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Diagnostics & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diagnostics Panel */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">Environment & Keys Status</h2>
              <button 
                type="button"
                disabled={checkingHealth}
                onClick={checkDiagnostics} 
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${checkingHealth ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/20 border border-border flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Frontend Keys</span>
                <div className="flex items-center justify-between mt-2 font-mono text-[9px]">
                  <span>VITE_RAZORPAY_KEY_ID:</span>
                  <span className={import.meta.env.VITE_RAZORPAY_KEY_ID ? "text-emerald-400 font-bold" : "text-amber-500"}>
                    {import.meta.env.VITE_RAZORPAY_KEY_ID ? "✅ Loaded" : "❌ Missing (rzp_test_mockkey)"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 font-mono text-[9px]">
                  <span>VITE_API_URL:</span>
                  <span className={import.meta.env.VITE_API_URL ? "text-emerald-400 font-bold" : "text-slate-400"}>
                    {import.meta.env.VITE_API_URL ? `✅ ${import.meta.env.VITE_API_URL}` : "❌ Missing (Relative)"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Backend Keys</span>
                <div className="flex items-center justify-between mt-2 font-mono text-[9px]">
                  <span>RAZORPAY_KEY_ID:</span>
                  <span className={diag?.keyId ? "text-emerald-400 font-bold" : "text-amber-500"}>
                    {diag?.keyId ? `✅ ${diag.keyId.slice(0, 15)}...` : "❌ Missing"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 font-mono text-[9px]">
                  <span>RAZORPAY_KEY_SECRET:</span>
                  <span className={diag?.hasSecret ? "text-emerald-400 font-bold" : "text-red-500 font-bold"}>
                    {diag?.hasSecret ? "✅ Loaded" : "❌ Missing"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Integrations & Webhook</span>
                <div className="flex items-center justify-between mt-2 font-mono text-[9px]">
                  <span>Razorpay SDK:</span>
                  <span className={scriptLoaded ? "text-emerald-400 font-bold" : "text-red-500 font-bold"}>
                    {scriptLoaded ? "✅ Loaded" : "❌ Missing"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 font-mono text-[9px]">
                  <span>RAZORPAY_WEBHOOK_SECRET:</span>
                  <span className={diag?.hasWebhookSecret ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                    {diag?.hasWebhookSecret ? "✅ Loaded" : "❌ Missing"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border flex flex-col justify-between">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Database & System</span>
                <div className="flex items-center justify-between mt-2 font-mono text-[9px]">
                  <span>PostgreSQL (Drizzle):</span>
                  <span className={diag?.databaseConnected ? "text-emerald-400 font-bold" : "text-red-500 font-bold"}>
                    {diag?.databaseConnected ? "✅ Connected" : "❌ Disconnected"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 font-mono text-[9px]">
                  <span>NODE_ENV:</span>
                  <span className="text-indigo-400 font-bold uppercase">{diag?.envMode || "development"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <button type="button" onClick={checkDiagnostics} className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/40 text-[10px] font-bold text-foreground cursor-pointer transition">Test Backend Connection</button>
              <button 
                type="button"
                onClick={() => {
                  addLog(`SDK details: window.Razorpay = ${!!(window as any).Razorpay}`, "info");
                  toast.info("Razorpay SDK loaded: " + !!(window as any).Razorpay);
                }} 
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/40 text-[10px] font-bold text-foreground cursor-pointer transition"
              >
                Test Razorpay SDK
              </button>
              <button 
                type="button"
                onClick={() => {
                  setLastOrderId("");
                  setLastPaymentId("");
                  setLogs([]);
                  addLog("Reset all payment test data and cleared terminal console logs.", "info");
                  toast.success("Test variables cleared.");
                }} 
                className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted/40 text-[10px] font-bold text-foreground cursor-pointer transition"
              >
                Reset Test Data
              </button>
            </div>
          </div>

          {activeSub === "payment" ? (
            /* Checkout View */
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">Create Test Transaction</h2>
              
              <div className="space-y-4">
                {/* Preset Options */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Select Plan Amount Preset</span>
                  <div className="grid grid-cols-2 min-[400px]:grid-cols-4 gap-2">
                    {[1, 10, 99, 199].map((amt) => (
                      <button 
                        type="button"
                        key={amt} 
                        onClick={() => setAmountRupees(amt)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition cursor-pointer ${amountRupees === amt ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"}`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="test-amount-input-custom" className="text-[10px] uppercase font-bold text-muted-foreground">Custom Amount (Rupees)</label>
                    <input 
                      id="test-amount-input-custom"
                      type="number" 
                      min="1" 
                      value={amountRupees} 
                      onChange={(e) => setAmountRupees(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 outline-none font-bold" 
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end text-[10px] text-muted-foreground">
                    <div className="flex justify-between"><span>Calculated paise:</span><span className="font-mono font-bold text-foreground">{Math.round(amountRupees * 100)} paise</span></div>
                    <div className="flex justify-between mt-1"><span>Mode:</span><span className="font-bold text-indigo-400 uppercase">{diag?.mode || "detecting..."}</span></div>
                  </div>
                </div>

                <div className="flex flex-col min-[450px]:flex-row gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => handlePay()} 
                    disabled={loading}
                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Open Razorpay Checkout"}
                  </button>
                  <button 
                    type="button"
                    onClick={verifySignatureManual}
                    disabled={!lastOrderId || !lastPaymentId}
                    className="px-4 h-10 bg-card hover:bg-muted/30 border border-border text-xs font-bold text-foreground rounded-xl cursor-pointer transition disabled:opacity-50"
                  >
                    Verify Payment Signature
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Webhook Simulator View */
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">Webhook Simulator</h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This simulator makes a POST request to `/api/payment/simulate-webhook` to execute webhook handlers directly. Ensure you have created an order above.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2 bg-muted/20 border border-border rounded-lg">
                    <span className="text-[9px] text-muted-foreground font-black uppercase">Active Order ID</span>
                    <p className="text-foreground font-bold mt-1 text-[10px] truncate">{lastOrderId || "(None - Create an order first)"}</p>
                  </div>
                  <div className="p-2 bg-muted/20 border border-border rounded-lg">
                    <span className="text-[9px] text-muted-foreground font-black uppercase">Active Payment ID</span>
                    <p className="text-foreground font-bold mt-1 text-[10px] truncate">{lastPaymentId || "(Generated dynamically on trigger)"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    type="button"
                    disabled={!lastOrderId} 
                    onClick={() => simulateWebhook("payment.captured")} 
                    className="h-10 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    Simulate Success Webhook
                  </button>
                  <button 
                    type="button"
                    disabled={!lastOrderId} 
                    onClick={() => simulateWebhook("payment.failed")} 
                    className="h-10 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    Simulate Failure Webhook
                  </button>
                  <button 
                    type="button"
                    disabled={!lastOrderId} 
                    onClick={() => simulateWebhook("refund.processed")} 
                    className="h-10 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-500 text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    Simulate Refund Webhook
                  </button>
                  <button 
                    type="button"
                    disabled={!lastOrderId} 
                    onClick={() => simulateWebhook("subscription.cancelled")} 
                    className="h-10 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    Simulate Cancel Webhook
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Verification Logs Console */}
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col h-[400px] lg:h-[500px]">
          <h2 className="text-xs font-black uppercase text-foreground mb-3 flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Verification Console Logs
          </h2>
          <div className="flex-1 bg-black/40 border border-border rounded-lg p-3 font-mono text-[9px] overflow-y-auto space-y-2 select-text leading-relaxed">
            {logs.length === 0 ? (
              <span className="text-muted-foreground italic">No logs generated. Initiate connections or checkout orders to start logging.</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-muted-foreground shrink-0 select-none">[{log.time}]</span>
                  <span
                    className={
                      log.type === "success"
                        ? "text-emerald-400 font-bold"
                        : log.type === "error"
                          ? "text-red-400 font-bold"
                          : log.type === "warn"
                            ? "text-amber-400 font-bold"
                            : "text-slate-200"
                    }
                  >
                    {log.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function ReleaseNotesView() { return PlaceholderView({ title: "Release Notes", description: "View changelog and release history for all FileNova versions.", icon: <BookOpen className="h-8 w-8 text-sky-400" /> }); }
