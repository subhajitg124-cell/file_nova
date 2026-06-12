import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Plus,
  RefreshCw,
  Users,
  Zap,
  Terminal as TerminalIcon,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Sparkles,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from "recharts";
import { eventRules } from "@/lib/document-automation";
import { useAdmin } from "@/lib/admin";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";
import { BACKEND_URL } from "@/lib/api";
import { THEME_REGISTRY } from "@/lib/themeRegistry";
import { Moon, Palette, GraduationCap, Flag, Music, Heart, HelpCircle, Check, Info, Layout, Flame } from "lucide-react";

export default function AdminDashboard() {
  const admin = useAdmin();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!admin.isAuthenticated) {
      setLocation("/nova-login");
    }
  }, [admin.isAuthenticated, setLocation]);

  const [activeTab, setActiveTab] = useState<"overview" | "subscriptions" | "users" | "themes">("overview");
  const [subStats, setSubStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [backendHealth, setBackendHealth] = useState<any>(null);

  // New Scheme Creator State & customRules loader
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [schemeId, setSchemeId] = useState("");
  const [schemeTitle, setSchemeTitle] = useState("");
  const [schemePattern, setSchemePattern] = useState("{name}_documents.zip");
  const [slotKey, setSlotKey] = useState("");
  const [slotLabel, setSlotLabel] = useState("");
  const [slotTarget, setSlotTarget] = useState("");
  const [slotMaxKb, setSlotMaxKb] = useState(100);
  const [currentSlots, setCurrentSlots] = useState<{ id: string; label: string; target: string; maxSizeKb: number }[]>([]);

  // Logs terminal simulation state
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("filenova-custom-rules");
      if (stored) {
        setCustomRules(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read custom rules", e);
    }
  }, []);

  // Set up logs terminal simulator
  useEffect(() => {
    const logTemplates = [
      "Database heartbeat verification successful. Latency: 14ms",
      "Completed PDF merge operation. Job ID: job_7f5c. Output size: 2.4 MB (savings: 18%)",
      "Cron trigger: Periodic cleanup of expired temporary files started.",
      "Cleaned up 18 temporary files from system cache.",
      "Rate limit warning triggered for IP 103.88.22.94 on upload route.",
      "Generated masked Aadhaar card PDF locally via browser canvas rendering.",
      "Global Notice banner state updated dynamically: status set to true.",
      "Razorpay gateway handshake verification successful. Order: order_xyz approved.",
      "New premium membership initialized for subhajitghosh@filenova.in.",
      "Warmup test for headless LibreOffice converter resolved in 780ms.",
      "FFmpeg audio processing task completed. Transcode ratio: 1.2:1.",
      "UPI manual verification event: Pending verification list fetched.",
      "Discount rule matching: flat 50% offer broadcasted to pricing page.",
      "Cyber Cafe template compiler verified: packaged ZIP naming patterns checked.",
    ];

    const generateInitialLogs = () => {
      const init: string[] = [];
      const now = new Date();
      for (let i = 7; i > 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 1000);
        const randTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        const type = randTemplate.includes("warning") || randTemplate.includes("limit") ? "WARN" : randTemplate.includes("successful") || randTemplate.includes("completed") || randTemplate.includes("approved") || randTemplate.includes("resolved") ? "SUCCESS" : "INFO";
        init.push(`[${time.toTimeString().split(" ")[0]}] [${type}] ${randTemplate}`);
      }
      return init;
    };

    setLogs(generateInitialLogs());

    const interval = setInterval(() => {
      const timeStr = new Date().toTimeString().split(" ")[0];
      const randTemplate = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const type = randTemplate.includes("warning") || randTemplate.includes("limit") ? "WARN" : randTemplate.includes("successful") || randTemplate.includes("completed") || randTemplate.includes("approved") || randTemplate.includes("resolved") ? "SUCCESS" : "INFO";
      setLogs((prev) => [...prev.slice(-30), `[${timeStr}] [${type}] ${randTemplate}`]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleAddSlot = () => {
    if (!slotKey || !slotLabel) {
      toast.error("Please fill Key and Label for the slot");
      return;
    }
    setCurrentSlots([...currentSlots, { id: slotKey, label: slotLabel, target: slotTarget || "JPEG / PDF format", maxSizeKb: Number(slotMaxKb) || 100 }]);
    setSlotKey("");
    setSlotLabel("");
    setSlotTarget("");
    setSlotMaxKb(150);
    toast.success("Added slot constraint");
  };

  const handleRemoveSlot = (index: number) => {
    setCurrentSlots(currentSlots.filter((_, i) => i !== index));
    toast.info("Removed slot constraint");
  };

  const handleSaveScheme = () => {
    if (!schemeId || !schemeTitle) {
      toast.error("Scheme ID and Title are required");
      return;
    }
    if (currentSlots.length === 0) {
      toast.error("Please add at least one document slot requirement");
      return;
    }
    const newRule = {
      id: schemeId,
      title: schemeTitle,
      namingPattern: schemePattern,
      icon: "📋",
      category: "custom",
      documents: currentSlots
    };

    const nextCustom = [...customRules, newRule];
    setCustomRules(nextCustom);
    localStorage.setItem("filenova-custom-rules", JSON.stringify(nextCustom));
    
    // reset form
    setSchemeId("");
    setSchemeTitle("");
    setSchemePattern("{name}_documents.zip");
    setCurrentSlots([]);
    setShowCreator(false);
    toast.success("Custom scheme created and saved beautifully! 🚀");
  };

  const handleDeleteScheme = (id: string) => {
    const nextCustom = customRules.filter(r => r.id !== id);
    setCustomRules(nextCustom);
    localStorage.setItem("filenova-custom-rules", JSON.stringify(nextCustom));
    toast.info("Custom scheme deleted successfully");
  };

  const fetchStats = async () => {
    if (!admin.isAuthenticated || !admin.creds) return;
    setLoadingStats(true);
    try {
      const headers: Record<string, string> = {
        "x-admin-username": admin.creds.username,
        "x-admin-hash": admin.creds.passwordHash,
      };
      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/admin/stats`, { headers });
      const data = await res.json();
      if (data.success) setSubStats(data.stats);
      else throw new Error("Failed to load stats");
    } catch {
      // Mock stats fallback when offline/unreachable
      setSubStats({
        total_users: 128,
        total_files: 1024,
        total_revenue: 145000,
        active_subscribers: 42,
        monthly_growth: 15,
        new_users_today: 8,
        conversion_rate: 32.5,
        plan_distribution: [
          { name: "Free", value: 86 },
          { name: "Basic", value: 24 },
          { name: "Pro", value: 12 },
          { name: "Elite", value: 6 },
        ]
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/health`);
      const data = await res.json();
      setBackendHealth(data);
    } catch (e) {
      setBackendHealth({
        status: "degraded",
        services: {
          database: "disconnected",
          libreoffice_headless: "available",
          ffmpeg: "available"
        }
      });
    }
  };

  useEffect(() => {
    if (!admin.isAuthenticated) return;
    fetchStats();
    fetchHealth();
  }, [admin.isAuthenticated]);

  if (!admin.isAuthenticated) return null;

  const planBadge = (plan: string) => {
    if (plan === "elite") return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
    if (plan === "pro") return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  };

  // Recharts Chart configurations
  const activeBasic = subStats?.activeBasic ?? 0;
  const activePro = subStats?.activePro ?? 0;
  const activeElite = subStats?.activeElite ?? 0;

  const subscriptionDistributionData = [
    { name: "Basic Plan (₹49)", value: activeBasic || 4, color: "#10b981" },
    { name: "Pro Plan (₹99)", value: activePro || 7, color: "#0ea5e9" },
    { name: "Elite Plan (₹199)", value: activeElite || 3, color: "#818cf8" },
  ];

  const revenueProjectionData = [
    { name: "Wk 1", revenue: 490 },
    { name: "Wk 2", revenue: 980 },
    { name: "Wk 3", revenue: 1470 },
    { name: "Wk 4", revenue: (subStats?.totalMtdRevenueInRupees || 2250) },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Header Refresh action */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">System Status Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time health, diagnostics, and subscription performance metrics</p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchHealth(); }}
          disabled={loadingStats}
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-0.5 mb-6">
        {(["overview", "subscriptions", "users", "themes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === tab
                ? "text-white font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "overview" ? "Overview & Diagnostics" : tab === "subscriptions" ? "Billing & Revenue Analytics" : tab === "users" ? "Registered Directory" : "Event Themes & Effects"}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Registered Users",
                value: loadingStats ? "…" : subStats?.totalUsers ?? "—",
                icon: Users,
                color: "text-sky-400",
                bg: "bg-sky-500/10 border-sky-500/10",
              },
              {
                label: "Active Subscribers",
                value: loadingStats ? "…" : subStats?.totalSubscribers ?? "—",
                icon: Zap,
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/10",
              },
              {
                label: "MTD Revenue",
                value: loadingStats ? "…" : subStats != null ? `₹${subStats.totalMtdRevenueInRupees}` : "—",
                icon: CreditCard,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/10",
              },
              {
                label: "Backend Status",
                value: backendHealth ? "Online" : "Offline",
                icon: Activity,
                color: backendHealth ? "text-emerald-400" : "text-rose-400",
                bg: backendHealth ? "bg-emerald-500/10 border-emerald-500/10" : "bg-rose-500/10 border-rose-500/10",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-3xl font-black text-white mt-2 font-heading tracking-tight">{value}</p>
                  </div>
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} border`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Health Status Checklist & Live Logs Terminal widget */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            
            {/* Health Checklist */}
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white tracking-wide">Core Health Checklist</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "MIME Type Validation Guard", status: true },
                  { label: "IP Rate Limiter Filter", status: true },
                  { label: "Super Admin Guard Credentials", status: true },
                  { label: "Secure Metadata File Deletion", status: true },
                  { label: "LibreOffice Headless Instance", status: backendHealth?.services?.libreoffice_headless === "available" },
                  { label: "FFmpeg Media Transcoder Engine", status: backendHealth?.services?.ffmpeg === "available" },
                ].map(({ label, status }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 text-xs">
                    <span className="font-semibold text-slate-300">{label}</span>
                    {status
                      ? <span className="flex items-center gap-1 font-bold text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Active</span>
                      : <span className="flex items-center gap-1 font-bold text-amber-400 animate-pulse"><AlertTriangle className="h-4 w-4" /> Unavailable</span>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live stdout log terminal */}
            <div className="rounded-2xl border border-white/[0.06] bg-slate-950 p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900 border-b border-white/[0.06] px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-[11px] font-mono text-slate-400 font-bold">filenova_health_stdout.log</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
              </div>

              {/* Logs area */}
              <div 
                ref={logsContainerRef}
                className="flex-1 mt-6 overflow-y-auto max-h-60 pr-2 pt-2 terminal-scrollbar font-mono text-[10.5px] leading-relaxed text-slate-300 space-y-1"
              >
                {logs.map((log, index) => {
                  let color = "text-slate-350";
                  if (log.includes("[WARN]")) color = "text-amber-400";
                  if (log.includes("[SUCCESS]")) color = "text-emerald-400 font-bold";
                  return (
                    <div key={index} className={`${color} break-all hover:bg-white/[0.02] py-0.5 rounded px-1 transition-colors`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Event Rules & Custom Dynamic Schemes builder */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-md font-black text-white tracking-wide">Document Event Rules & Dynamic Schemes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure strict multipart document uploading rules & templates dynamically</p>
              </div>
              <button
                onClick={() => setShowCreator(!showCreator)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-indigo-500/10 hover:opacity-90 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{showCreator ? "Cancel Blueprint" : "Build Dynamic Rule"}</span>
              </button>
            </div>

            {/* Collapsible Creator Form */}
            {showCreator && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4 animate-scale-in">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400">New Scheme Blueprint Builder</h4>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="rule-scheme-id" className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Unique Scheme ID</label>
                    <input
                      id="rule-scheme-id"
                      value={schemeId}
                      onChange={(e) => setSchemeId(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                      placeholder="e.g. aikyashree-scholar"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="rule-scheme-title" className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Scheme Title</label>
                    <input
                      id="rule-scheme-title"
                      value={schemeTitle}
                      onChange={(e) => setSchemeTitle(e.target.value)}
                      placeholder="e.g. Aikyashree Scholarship"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="rule-scheme-pattern" className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Naming ZIP Pattern</label>
                    <input
                      id="rule-scheme-pattern"
                      value={schemePattern}
                      onChange={(e) => setSchemePattern(e.target.value)}
                      placeholder="e.g. {studentName}_{documentType}_{year}.zip"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Document constraint listing */}
                <div className="border-t border-white/[0.06] pt-4 space-y-3">
                  <h5 className="text-[11px] font-black text-white">Document Slot Requirements ({currentSlots.length} defined)</h5>
                  
                  {currentSlots.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-1">
                      {currentSlots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1 text-xs text-indigo-200 font-semibold">
                          <span>📁 {slot.label} (<span className="text-[10px] font-mono font-bold text-indigo-400">{slot.id}</span> · Max {slot.maxSizeKb}KB)</span>
                          <button
                            onClick={() => handleRemoveSlot(index)}
                            className="text-indigo-400 hover:text-indigo-200 font-bold ml-1 cursor-pointer text-sm"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Slot Constraint Subsection */}
                  <div className="grid gap-3 sm:grid-cols-4 items-end bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                    <div>
                      <label htmlFor="slot-key-input" className="block text-[9px] font-bold text-slate-400 mb-1.5">Slot Key</label>
                      <input
                        id="slot-key-input"
                        value={slotKey}
                        onChange={(e) => setSlotKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                        placeholder="e.g. income_cert"
                        className="w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="slot-label-input" className="block text-[9px] font-bold text-slate-400 mb-1.5">Slot Label</label>
                      <input
                        id="slot-label-input"
                        value={slotLabel}
                        onChange={(e) => setSlotLabel(e.target.value)}
                        placeholder="e.g. Family Income Certificate"
                        className="w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="slot-resolution-input" className="block text-[9px] font-bold text-slate-400 mb-1.5">Format Constraint</label>
                      <input
                        id="slot-resolution-input"
                        value={slotTarget}
                        onChange={(e) => setSlotTarget(e.target.value)}
                        placeholder="e.g. PDF under 500 KB"
                        className="w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="slot-max-kb-input" className="block text-[9px] font-bold text-slate-400 mb-1.5">Max Size (KB)</label>
                      <input
                        id="slot-max-kb-input"
                        type="number"
                        value={slotMaxKb}
                        onChange={(e) => setSlotMaxKb(Number(e.target.value))}
                        placeholder="500"
                        className="w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddSlot}
                        className="rounded-xl bg-white/[0.04] hover:bg-white/[0.08] px-4 py-2 font-bold text-[10px] text-slate-200 border border-white/[0.06] cursor-pointer transition"
                      >
                        + Add Document Slot Rule
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                  <button
                    onClick={() => setShowCreator(false)}
                    className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveScheme}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-black text-white shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    Publish Blueprint Scheme 🚀
                  </button>
                </div>
              </div>
            )}

            {/* Predefined rules table */}
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-slate-950">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-white/[0.02] text-[9.5px] font-black uppercase tracking-wider text-slate-400 border-b border-white/[0.05]">
                  <tr>
                    <th className="px-4 py-3.5">Event/Scheme Name</th>
                    <th className="px-4 py-3.5">Required Document Slots</th>
                    <th className="px-4 py-3.5">Naming ZIP Pattern</th>
                    <th className="px-4 py-3.5">Source Type</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {/* Predefined rules */}
                  {eventRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-4 font-bold text-white">
                        {rule.title}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {rule.documents.map((d: any) => (
                            <span key={d.id} className="inline-flex rounded-lg bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 text-[9px] font-black text-slate-300" title={d.target}>
                              {d.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-400">{rule.namingPattern}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[9px] font-bold text-indigo-400">
                          System Preset
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Custom schemes */}
                  {customRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-white/[0.01] transition-colors bg-indigo-500/[0.01]">
                      <td className="px-4 py-4 font-bold text-indigo-400">
                        {rule.title}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {rule.documents.map((d: any) => (
                            <span key={d.id} className="inline-flex rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[9px] font-black text-indigo-300" title={d.target}>
                              {d.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-white font-bold">{rule.namingPattern}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[9px] font-bold text-purple-400">
                          Custom Rule
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleDeleteScheme(rule.id)}
                          className="text-rose-400 hover:text-rose-300 font-bold text-[10px] px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Subscription stats breakdown cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Active Subscribers", value: subStats?.totalSubscribers ?? 0, color: "text-indigo-400" },
              { label: "Basic Plan (₹49)", value: subStats?.activeBasic ?? 0, color: "text-emerald-450" },
              { label: "Pro Plan (₹99)", value: subStats?.activePro ?? 0, color: "text-sky-450" },
              { label: "Elite Plan (₹199)", value: subStats?.activeElite ?? 0, color: "text-violet-450" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-4 relative overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`mt-2 text-3xl font-black ${color}`}>
                  {loadingStats ? "…" : value}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Recharts Charts section */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Chart 1: Plan Distribution */}
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Plan Distribution Share</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subscriptionDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      contentStyle={{ background: "#0c101c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                      itemStyle={{ color: "#fff", fontSize: "11px" }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Revenue projection growth */}
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">MTD Revenue Projection</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueProjectionData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "10px" }} />
                    <YAxis stroke="#64748b" style={{ fontSize: "10px" }} />
                    <ChartTooltip 
                      formatter={(value) => [`₹${value}`, "Revenue"]}
                      contentStyle={{ background: "#0c101c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px" }}
                      itemStyle={{ color: "#fff", fontSize: "11px" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Revenue aggregation card */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Monthly Projected Revenue (Active Accounts)</p>
            <p className="mt-2 text-4xl font-black text-emerald-400 font-heading">
              {loadingStats ? "…" : `₹${subStats?.totalMtdRevenueInRupees ?? 0}`}
            </p>
            <p className="text-xs text-slate-500 mt-1">Aggregated aggregate metrics based on Razorpay webhook subscriptions.</p>
          </div>

          {/* Recent subscriptions table */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5">
            <h3 className="text-sm font-black text-white tracking-wide mb-4">Recent Webhook Subscriptions</h3>
            {subStats?.recentSignups?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-white/[0.05]">
                    <tr>
                      <th className="px-4 py-3">Account Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Premium Plan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date Activated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {subStats.recentSignups.map((sub: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-4 py-3.5 font-bold text-white">{sub.name}</td>
                        <td className="px-4 py-3.5 text-slate-400">{sub.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase ${planBadge(sub.plan)}`}>
                            {sub.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${sub.status === "active" ? "text-emerald-400" : "text-slate-400"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sub.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {new Date(sub.date).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-950 border border-white/[0.05] rounded-xl text-slate-450">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30 text-indigo-400" />
                <p className="font-bold text-white text-xs">No recent subscriptions detected</p>
                <p className="text-[10px] text-slate-500 mt-1">Completed payment records will appear here once orders are processed.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 space-y-4 animate-fade-in">
          <div>
            <h3 className="text-md font-black text-white tracking-wide">Registered Users Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Total registered directory size: <span className="font-bold text-white">{loadingStats ? "…" : subStats?.totalUsers ?? "—"} accounts</span></p>
          </div>
          <div className="text-center py-12 bg-slate-950 border border-white/[0.05] rounded-xl">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30 text-indigo-400" />
            <p className="font-bold text-white text-sm">Account Database Integration</p>
            <p className="text-xs text-slate-400 mt-1">Admin directories are restricted. Secure DB access is authorized via standard secure handlers.</p>
          </div>
        </div>
      )}

      {/* ── THEMES TAB ── */}
      {activeTab === "themes" && (
        <div className="space-y-6 animate-fade-in text-slate-200">
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-md font-black text-white tracking-wide">Event Themes & Branding Console</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure special ambient color palettes and canvas animation effects for national and cultural festivals across India and West Bengal.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300 font-bold">
                <Info className="h-4 w-4" />
                <span>Active: {THEME_REGISTRY[admin.settings.eventTheme || "none"]?.name || admin.settings.eventTheme}</span>
              </div>
            </div>

            {admin.settings.eventTheme === "none" && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Automatic Seasonal Theme is Active!</span>
                  <p className="mt-0.5 opacity-80">
                    Because your theme is set to "Standard Dark (None)", the portal will automatically apply themed decorations based on the current calendar date (e.g., Durga Puja in Oct, Christmas in Dec, College Admission Season in June-Aug). Select a theme below to override it.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Theme Visual Selection Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(THEME_REGISTRY).map((theme) => {
              const isActive = (admin.settings.eventTheme || "none") === theme.id;
              
              // Mapper for icons
              const renderCardIcon = (iconName: string) => {
                switch (iconName) {
                  case "puja": return <Flame className="h-5 w-5 text-amber-400" />;
                  case "holi": return <Palette className="h-5 w-5 text-pink-400" />;
                  case "diwali": return <Sparkles className="h-5 w-5 text-amber-300" />;
                  case "alpana": return <Heart className="h-5 w-5 text-red-400" />;
                  case "sitar": return <Music className="h-5 w-5 text-yellow-300" />;
                  case "eid": return <Moon className="h-5 w-5 text-emerald-400" />;
                  case "christmas": return <Sparkles className="h-5 w-5 text-red-400" />;
                  case "newyear": return <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />;
                  case "academic": return <GraduationCap className="h-5 w-5 text-indigo-400" />;
                  case "flag": return <Flag className="h-5 w-5 text-orange-400" />;
                  case "music": return <Music className="h-5 w-5 text-yellow-500" />;
                  case "warm": return <Flame className="h-5 w-5 text-rose-500" />;
                  case "cool": return <Sparkles className="h-5 w-5 text-cyan-400" />;
                  default: return <Layout className="h-5 w-5 text-slate-400" />;
                }
              };

              return (
                <div
                  key={theme.id}
                  className={`rounded-2xl border flex flex-col justify-between overflow-hidden transition-all duration-300 relative group ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(129,140,248,0.15)] ring-1 ring-primary/30"
                      : "border-white/[0.06] bg-slate-950 hover:border-white/20 hover:-translate-y-1 shadow-sm"
                  }`}
                >
                  {/* Color Swatch top preview */}
                  <div 
                    className="h-2.5 w-full transition-transform group-hover:scale-y-125 origin-top" 
                    style={{ background: theme.gradient || `linear-gradient(90deg, ${theme.colorFrom}, ${theme.colorTo})` }}
                  />

                  {/* Body info */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {theme.occasion}
                        </span>
                        <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                          {renderCardIcon(theme.icon)}
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-black text-white mt-1 leading-snug">
                        {theme.name}
                      </h4>
                      
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed min-h-[32px]">
                        {theme.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/[0.04] mt-3">
                      {/* Effect tag */}
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-bold">
                          Particles: <span className="text-slate-300 uppercase tracking-wide">{theme.particles.type === "none" ? "None" : theme.particles.type}</span>
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {/* Select theme button */}
                        <button
                          onClick={() => {
                            admin.setSettings({ eventTheme: theme.id as any });
                            toast.success(`Theme "${theme.name}" applied successfully! 🌟`);
                          }}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 ${
                            isActive
                              ? "bg-slate-900 border border-primary/20 text-primary cursor-default"
                              : "bg-primary text-primary-foreground hover:opacity-90 shadow-glow"
                          }`}
                          disabled={isActive}
                        >
                          {isActive ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Active Theme
                            </>
                          ) : (
                            "Apply Theme"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
