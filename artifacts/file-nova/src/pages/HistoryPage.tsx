import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import {
  ArrowLeft, History, Search, Filter, FileText, Loader2,
  Monitor, Cloud, Trash2, Clock
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { BACKEND_URL, apiClient } from "@/lib/api";
import {
  getLocalHistory, clearLocalHistory,
  type LocalHistoryEntry,
} from "@/features/history/localHistory";
import { useAuthStore } from "@/store/useAuthStore";

interface FileHistoryItem {
  id: string;
  toolUsed: string;
  originalFilename: string;
  fileSize: number;
  processedAt: string;
  status: string;
}

const toolOptions = [
  "all", "merge", "compress", "resize", "enhance", "ocr", "split",
  "pdf_to_image", "image_to_pdf", "zip", "convert", "remove_bg"
];

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(ts: number | string): string {
  return new Date(typeof ts === "string" ? ts : ts).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Local History Tab ──────────────────────────────────────────────────────

function LocalHistoryTab() {
  const [entries, setEntries] = useState<LocalHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getLocalHistory());
  }, []);

  const handleClear = () => {
    clearLocalHistory();
    setEntries([]);
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl bg-background/30 text-center space-y-3">
        <Monitor className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-bold text-muted-foreground">No local history yet</p>
        <p className="text-sm text-muted-foreground/60 max-w-sm">
          Every time you process a file, your settings are saved here so you can reuse them instantly.
          No account needed — stored only on this device.
        </p>
        <Link href="/" className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition">
          Start processing →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Last {entries.length} tool use{entries.length !== 1 ? "s" : ""} on this device.
          Settings only — no file content stored.
        </p>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition px-3 py-1.5 rounded-lg border border-border hover:border-destructive/30 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear history
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{entry.toolLabel}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {Object.entries(entry.configUsed).slice(0, 3).map(([k, v]) => (
                  <span key={k} className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground">
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              {timeAgo(entry.timestamp)}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center pt-2">
        ↩ When you reopen a tool, FileNova offers to restore your last settings automatically.
      </p>
    </div>
  );
}

// ── Cloud History Tab (existing backend behaviour) ─────────────────────────

function CloudHistoryTab() {
  const { premiumTier, premiumEnabled, loading: subLoading } = useSubscription();
  const [history, setHistory] = useState<FileHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState<string>("all");
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getHistory();
      setHistory(data.history || []);
      if (premiumTier === "free" && data.totalCount > 5) setShowUpgradePrompt(true);
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.originalFilename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTool = selectedTool === "all" || item.toolUsed === selectedTool;
    return matchesSearch && matchesTool;
  });

  const isProUser = premiumEnabled && premiumTier !== "free";
  const displayLimit = isProUser ? 50 : 5;
  const displayHistory = filteredHistory.slice(0, displayLimit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search files..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/60" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)}
            title="Filter by tool"
            className="pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/60 appearance-none cursor-pointer">
            {toolOptions.map((tool) => (
              <option key={tool} value={tool}>{tool === "all" ? "All tools" : tool.replace("_", " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {showUpgradePrompt && !isProUser && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-amber-600">Free users can see only last 5 files</p>
            <p className="text-xs text-muted-foreground">Upgrade to Pro for unlimited history</p>
          </div>
          <Link href="/pricing" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition">
            Upgrade Now
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : displayHistory.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-border/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/80 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">File name</th>
                <th className="p-4">Tool used</th>
                <th className="p-4">Size</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {displayHistory.map((item) => (
                <tr key={item.id} className="hover:bg-muted/15 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-foreground truncate max-w-xs">{item.originalFilename}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-bold capitalize">
                      {item.toolUsed.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground font-mono text-sm">{formatSize(item.fileSize)}</td>
                  <td className="p-4 text-muted-foreground text-sm">{formatDate(item.processedAt)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold capitalize ${
                      item.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                      item.status === "failed" ? "bg-red-500/10 text-red-500" :
                      "bg-amber-500/10 text-amber-500"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl bg-background/30 text-center space-y-3">
          <Cloud className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-bold text-muted-foreground">No cloud history found</p>
          <p className="text-sm text-muted-foreground/60 max-w-sm">
            Cloud history requires a connected backend and an active account.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"local" | "cloud">("local");

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 font-sans">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          <div className="flex items-center gap-3">
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6 animate-fade-in">
        <section className="rounded-3xl border border-border bg-card p-8 shadow-premium">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-violet-500/10 text-violet-500 rounded-2xl flex items-center justify-center">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Processing History</h1>
              <p className="text-sm text-muted-foreground">
                Your recent tool uses — no account required for device history
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border w-fit mb-6">
            <button
              onClick={() => setActiveTab("local")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === "local"
                  ? "bg-card shadow-sm text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Monitor className="h-4 w-4" />
              This device
            </button>
            {user && (
              <button
                onClick={() => setActiveTab("cloud")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "cloud"
                    ? "bg-card shadow-sm text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Cloud className="h-4 w-4" />
                Cloud (account)
              </button>
            )}
          </div>

          {activeTab === "local" ? <LocalHistoryTab /> : <CloudHistoryTab />}
        </section>
      </main>
    </div>
  );
}