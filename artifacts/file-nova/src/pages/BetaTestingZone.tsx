import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ShieldAlert,
  RefreshCw,
  Trash2,
  Terminal,
  Sliders,
  Cpu,
  Layers,
  Wifi,
  WifiOff,
  Database,
  Timer,
  ChevronLeft,
  Sparkles,
  Play,
  Check,
  ToggleLeft,
  AlertTriangle,
  FileCode,
  SlidersHorizontal,
  Mail,
  Lock,
} from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { FeatureKey, isFeatureEnabled } from "@/features.config";

const FEATURES_LIST: Array<{ key: FeatureKey; label: string; desc: string }> = [
  { key: "whatsapp", label: "WhatsApp Secure Share", desc: "Share files with expiring links over WhatsApp" },
  { key: "digilocker", label: "DigiLocker Connector", desc: "Consent-first portal connector for verified documents" },
  { key: "autofill", label: "AI Form Autofill", desc: "Extract identity details dynamically into form slots" },
  { key: "voice", label: "Voice Assistant", desc: "Multilingual guidance for local operations" },
  { key: "scanner", label: "Document Scanner", desc: "Edge detection and color enhancement on camera input" },
  { key: "qr", label: "QR Verification", desc: "Scan and generate expiring QR credentials" },
  { key: "aadhaar", label: "Aadhaar Masking", desc: "Anonymize Aadhaar numbers prior to file generation" },
  { key: "exam", label: "Exam Toolkit", desc: "Crop and compress image templates according to college boards" },
  { key: "cafe", label: "Cyber Café Mode", desc: "Manage queues and load persistent user packages" },
  { key: "bulk", label: "Bulk Upload", desc: "Batch operation list processing and export center routing" },
  { key: "assistant", label: "AI Smart Assistant", desc: "Portal recommendation guides and hints" },
  { key: "security", label: "Security Center", desc: "Integrity validation and anti-malware verification center" },
];

interface LogEntry {
  id: string;
  time: string;
  type: "info" | "success" | "warn" | "error" | "worker";
  message: string;
}

export default function BetaTestingZone() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { premiumTier, refreshStatus } = useSubscription();
  const { isMockMode, toggleMockMode, clearStore } = useFileStore();

  // Redirect if not developer (subhajitgho123@gmail.com, super_admin, admin, or developer)
  useEffect(() => {
    const isDeveloperOrAdmin = user && (
      user.email?.toLowerCase() === "subhajitgho123@gmail.com" || 
      user.role === "super_admin" || 
      user.role === "admin" || 
      user.role === "developer"
    );
    if (!isDeveloperOrAdmin) {
      toast.error("Access Denied: Developer Whitelist Required.");
      setLocation("/");
    }
  }, [user, setLocation]);

  // States
  const [latency, setLatency] = useState(() => {
    const saved = localStorage.getItem("filenova_simulated_latency");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [simulateOffline, setSimulateOffline] = useState(() => {
    return localStorage.getItem("filenova_simulate_backend_offline") === "true";
  });

  const [featureOverrides, setFeatureOverrides] = useState<Record<FeatureKey, boolean>>(() => {
    const overrides: Record<string, boolean> = {};
    FEATURES_LIST.forEach((f) => {
      const saved = localStorage.getItem(`filenova_feature_override_${f.key}`);
      overrides[f.key] = saved === null ? isFeatureEnabled(f.key) : saved === "true";
    });
    return overrides as Record<FeatureKey, boolean>;
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      time: new Date().toLocaleTimeString(),
      type: "info",
      message: "FileNova telemetry logger active. Welcome, Administrator.",
    },
  ]);

  const [activeWorkerProcesses, setActiveWorkerProcesses] = useState<number>(0);
  const logTerminalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logTerminalContainerRef.current) {
      logTerminalContainerRef.current.scrollTop = logTerminalContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Log handler
  const appendLog = (message: string, type: LogEntry["type"] = "info") => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      time: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [...prev, entry]);
  };

  // Feature Flag toggle
  const handleToggleFeature = (key: FeatureKey) => {
    const currentVal = featureOverrides[key];
    const newVal = !currentVal;
    
    localStorage.setItem(`filenova_feature_override_${key}`, String(newVal));
    setFeatureOverrides((prev) => ({ ...prev, [key]: newVal }));
    appendLog(`Feature override set: ${key.toUpperCase()} = ${newVal}`, newVal ? "success" : "warn");
    toast.success(`${key} override saved.`);
  };

  // Latency changes
  const handleLatencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setLatency(val);
    localStorage.setItem("filenova_simulated_latency", String(val));
    appendLog(`Simulated network delay set to ${val}ms.`, "info");
  };

  // Backend offline simulation toggle
  const handleToggleOfflineSim = () => {
    const newVal = !simulateOffline;
    setSimulateOffline(newVal);
    localStorage.setItem("filenova_simulate_backend_offline", String(newVal));
    appendLog(`Simulate Backend Offline state set to ${newVal}.`, newVal ? "error" : "success");
    toast.info(`Backend simulation: ${newVal ? "Offline" : "Live"}`);
    
    // Dispatch offline event to update components immediately
    window.dispatchEvent(new Event("online"));
  };

  // Clear IndexedDB Cache
  const handleResetIndexedDB = async () => {
    appendLog("Initiating database purge target: filenova-file-manager...", "warn");
    try {
      const req = indexedDB.deleteDatabase("filenova-file-manager");
      req.onsuccess = () => {
        appendLog("IndexedDB 'filenova-file-manager' purged successfully.", "success");
        toast.success("IndexedDB files database cleared.");
      };
      req.onerror = () => {
        appendLog("Error deleting IndexedDB cache.", "error");
        toast.error("IndexedDB deletion failed.");
      };
    } catch (e: any) {
      appendLog(`IndexedDB delete exception: ${e.message}`, "error");
    }
  };

  // Clear storage trackers
  const handleResetLocalStorage = () => {
    appendLog("Clearing user limit and ad session keys from localStorage...", "warn");
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    localStorage.removeItem(`fn_ads_${todayKey}`);
    localStorage.removeItem(`fn_uses_${todayKey}`);
    localStorage.removeItem("fn_premium_enabled");
    localStorage.removeItem("fn_youtube_subscribed_at");
    localStorage.removeItem("fn_instagram_followed_at");
    localStorage.removeItem("fn_facebook_followed_at");
    
    appendLog("localStorage keys purged. Limit states refreshed.", "success");
    toast.success("Limit trackers reset.");
    refreshStatus();
  };

  // Flush Zustand
  const handleFlushZustand = () => {
    appendLog("Triggering clearStore() inside Zustand files storage...", "warn");
    clearStore();
    appendLog("Zustand client file cache flushed.", "success");
    toast.success("Client file store cleared.");
  };

  // Simulate worker thread event
  const handleSimulateWorker = () => {
    if (activeWorkerProcesses >= 3) {
      appendLog("System warning: Maximum simulated worker threads active.", "error");
      return;
    }
    
    setActiveWorkerProcesses((prev) => prev + 1);
    const id = Math.random().toString(36).substring(5).toUpperCase();
    appendLog(`[Worker-${id}] Spawning new thread for local WebAssembly processing...`, "worker");
    
    setTimeout(() => {
      appendLog(`[Worker-${id}] Parsing PDF file catalog & outline...`, "worker");
    }, 600);

    setTimeout(() => {
      appendLog(`[Worker-${id}] Running page compress pass 1 (Re-encoding images)...`, "worker");
    }, 1400);

    setTimeout(() => {
      appendLog(`[Worker-${id}] Compression complete. Saved 64.2% size. File ready.`, "success");
      setActiveWorkerProcesses((prev) => prev - 1);
    }, 2500);
  };

  // Simulate worker error event
  const handleSimulateError = () => {
    appendLog("Simulating crash inside client execution thread...", "error");
    appendLog("Uncaught Error: WASM memory allocation out of bounds in client-pdf.ts (line 124)", "error");
    appendLog("Injecting limit exception to test ErrorBoundary coverage...", "warn");
    
    window.dispatchEvent(
      new CustomEvent("filenova-limit-reached", {
        detail: { limit: 3, usage: 3 },
      })
    );
    
    toast.error("Simulated client error boundary triggered.");
  };

  const isDeveloperOrAdmin = user && (
    user.email?.toLowerCase() === "subhajitgho123@gmail.com" || 
    user.role === "super_admin" || 
    user.role === "admin" || 
    user.role === "developer"
  );
  if (!isDeveloperOrAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased relative overflow-hidden pb-12">
      {/* Background glow animations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-white/[0.08] hover:bg-slate-800 hover:text-white transition">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                  Developer Mode
                </span>
                <span className="text-[10px] text-slate-500">v1.2.0-beta</span>
              </div>
              <h1 className="text-lg font-black text-white flex items-center gap-1.5">
                <Sliders className="h-4.5 w-4.5 text-indigo-400" />
                FileNova Beta Testing Zone
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 px-4 py-2 text-xs font-black text-white shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all">
              Launch App
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Side: Developer Toggles & Controls */}
        <div className="space-y-6">
          {/* Developer status card */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent blur-md pointer-events-none" />
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Whitelist Account</p>
                <h2 className="text-2xl font-black text-white flex items-center gap-1.5 mt-1">
                  {user.name || "Subhajit Ghosh"}
                  <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="flex flex-col sm:items-end justify-center space-y-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-400">
                  <Lock className="h-3 w-3 mr-1 fill-emerald-400" />
                  ALL FEATURES Bypassed (FREE)
                </span>
                <div className="text-[10px] text-slate-500">
                  Daily Usage Limit: <span className="font-bold text-slate-300">Infinity</span> · Tier: <span className="font-bold text-indigo-400 uppercase">{premiumTier}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Feature Overrides Grid */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-5 backdrop-blur-md space-y-4">
            <div>
              <h3 className="font-black text-white text-base">Visual Feature Flag Overrides</h3>
              <p className="text-xs text-slate-500 mt-0.5">Toggle local client-side visibility and availability for modular portals. Overrides save to session localstorage.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {FEATURES_LIST.map((feature) => {
                const isActive = featureOverrides[feature.key];
                return (
                  <button
                    key={feature.key}
                    onClick={() => handleToggleFeature(feature.key)}
                    className={`flex items-start justify-between text-left rounded-xl border p-3.5 transition duration-300 ${
                      isActive
                        ? "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50"
                        : "border-white/[0.05] bg-slate-950/40 hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <span className={`block text-xs font-black transition ${isActive ? "text-white" : "text-slate-400"}`}>
                        {feature.label}
                      </span>
                      <span className="block text-[10px] text-slate-500 leading-normal">
                        {feature.desc}
                      </span>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {isActive ? (
                        <div className="h-5 w-8 rounded-full bg-indigo-600 p-0.5 transition flex justify-end">
                          <div className="h-4 w-4 rounded-full bg-white shadow-md" />
                        </div>
                      ) : (
                        <div className="h-5 w-8 rounded-full bg-slate-800 p-0.5 transition flex justify-start">
                          <div className="h-4 w-4 rounded-full bg-slate-600 shadow-md" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cache purging and clean operations */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-5 backdrop-blur-md space-y-4">
            <div>
              <h3 className="font-black text-white text-base flex items-center gap-1.5">
                <Database className="h-4.5 w-4.5 text-indigo-400" />
                Workspace Cache cleaners
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Reset local client-side states, purge IndexedDB document files, and verify fresh startup state.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={handleResetIndexedDB}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/[0.06] bg-slate-950/50 hover:bg-slate-900 hover:border-amber-500/30 transition text-center group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300">
                  <Trash2 className="h-4.5 w-4.5" />
                </div>
                <span className="block text-xs font-black text-white mt-3">Reset IndexedDB</span>
                <span className="block text-[9px] text-slate-500 mt-1">Deletes all saved workspace files</span>
              </button>

              <button
                onClick={handleResetLocalStorage}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/[0.06] bg-slate-950/50 hover:bg-slate-900 hover:border-amber-500/30 transition text-center group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300">
                  <RefreshCw className="h-4.5 w-4.5" />
                </div>
                <span className="block text-xs font-black text-white mt-3">Clear limits cache</span>
                <span className="block text-[9px] text-slate-500 mt-1">Resets ads watched and usage limits</span>
              </button>

              <button
                onClick={handleFlushZustand}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/[0.06] bg-slate-950/50 hover:bg-slate-900 hover:border-red-500/30 transition text-center group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition duration-300">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <span className="block text-xs font-black text-white mt-3">Flush Zustand Store</span>
                <span className="block text-[9px] text-slate-500 mt-1">Clears active files and state settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Environment Overrides and Live Logging */}
        <div className="space-y-6">
          {/* Simulator options */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-5 backdrop-blur-md space-y-4">
            <div>
              <h3 className="font-black text-white text-base flex items-center gap-1.5">
                <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-400" />
                Environment Sandbox Modifiers
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Simulate latency constraints and offline flows to test frontend resilience.</p>
            </div>

            <div className="space-y-4 bg-slate-950/40 rounded-xl p-4 border border-white/[0.04]">
              {/* Standalone/Mock Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="block text-xs font-black text-white">Mock Processing Mode</span>
                  <span className="block text-[10px] text-slate-500">Run simulations instead of real WebAssembly</span>
                </div>
                <button
                  onClick={() => {
                    toggleMockMode();
                    const nextMode = !isMockMode;
                    localStorage.setItem("filenova_mock_mode_manual", String(nextMode));
                    appendLog(`Mock Mode toggled: ${nextMode}`, nextMode ? "warn" : "info");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    isMockMode
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : "bg-slate-800 text-slate-300 border-transparent hover:bg-slate-700"
                  }`}
                >
                  {isMockMode ? "Mock Active" : "WASM Engine"}
                </button>
              </div>

              {/* Server health check simulation */}
              <div className="flex items-center justify-between border-t border-white/[0.04] pt-3.5">
                <div className="space-y-0.5">
                  <span className="block text-xs font-black text-white">Simulate Backend Offline</span>
                  <span className="block text-[10px] text-slate-500">Forces client to report server down</span>
                </div>
                <button
                  onClick={handleToggleOfflineSim}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    simulateOffline
                      ? "bg-red-500/10 text-red-500 border-red-500/30"
                      : "bg-slate-800 text-slate-300 border-transparent hover:bg-slate-700"
                  }`}
                >
                  {simulateOffline ? (
                    <>
                      <WifiOff className="h-3.5 w-3.5" />
                      Offline
                    </>
                  ) : (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                      Online
                    </>
                  )}
                </button>
              </div>

              {/* Latency Slider */}
              <div className="border-t border-white/[0.04] pt-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="latency-slider" className="text-xs font-black text-white">Simulated Network Delay</label>
                  <span className="text-xs font-bold text-indigo-400 font-mono">{latency} ms</span>
                </div>
                <div className="flex items-center gap-3">
                  <Timer className="h-4 w-4 text-slate-500 shrink-0" />
                  <input
                    id="latency-slider"
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={latency}
                    onChange={handleLatencyChange}
                    title="Simulated Network Delay Slider"
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <p className="text-[9px] text-slate-500">Injects artificial sleep inside `fetch()` interceptors.</p>
              </div>
            </div>
          </div>

          {/* Telemetry Logger Log Console */}
          <div className="rounded-2xl border border-white/[0.08] bg-slate-900/40 p-5 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-base flex items-center gap-1.5">
                  <Terminal className="h-4.5 w-4.5 text-indigo-400" />
                  Telemetry Log Monitor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time worker thread event visualizer.</p>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-white transition font-bold"
              >
                Clear logs
              </button>
            </div>

            {/* Terminal console */}
            <div 
              ref={logTerminalContainerRef}
              className="h-64 rounded-xl border border-white/[0.05] bg-black/60 p-4 font-mono text-[10px] leading-relaxed overflow-y-auto space-y-1.5 shadow-inner select-text"
            >
              {logs.map((log) => {
                let colorClass = "text-slate-400";
                if (log.type === "success") colorClass = "text-emerald-400 font-bold";
                else if (log.type === "warn") colorClass = "text-amber-400 font-bold";
                else if (log.type === "error") colorClass = "text-rose-500 font-bold";
                else if (log.type === "worker") colorClass = "text-indigo-400";

                return (
                  <div key={log.id} className="flex items-start gap-1.5">
                    <span className="text-slate-600 shrink-0 font-sans">[{log.time}]</span>
                    <span className={colorClass}>{log.message}</span>
                  </div>
                );
              })}
              {activeWorkerProcesses > 0 && (
                <div className="flex items-center gap-1.5 text-indigo-400 animate-pulse">
                  <span className="text-slate-600 font-sans">[{new Date().toLocaleTimeString()}]</span>
                  <span>⚙️ Process worker running on active thread...</span>
                </div>
              )}
            </div>

            {/* Log tools */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSimulateWorker}
                disabled={activeWorkerProcesses > 0}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.04] py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Spawn Worker
              </button>
              <button
                onClick={handleSimulateError}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.04] py-2 text-xs font-bold cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Trigger Crash
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
