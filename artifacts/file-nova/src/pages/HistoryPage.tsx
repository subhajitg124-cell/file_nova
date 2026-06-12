import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { ArrowLeft, History, Search, Filter, FileText, ChevronLeft, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { BACKEND_URL } from "@/lib/api";

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

export default function HistoryPage() {
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
      const res = await fetch(`${BACKEND_URL}/api/v1/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        if (premiumTier === "free" && data.totalCount > 5) {
          setShowUpgradePrompt(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.originalFilename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTool = selectedTool === "all" || item.toolUsed === selectedTool;
    return matchesSearch && matchesTool;
  });

  const isProUser = premiumEnabled && premiumTier !== "free";
  const displayLimit = isProUser ? 50 : 5;
  const displayHistory = filteredHistory.slice(0, displayLimit);

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh pb-16 font-sans">
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
              <h1 className="text-3xl font-black">File Processing History</h1>
              <p className="text-sm text-muted-foreground">
                {isProUser ? "All your processed files" : "Last 5 files - Upgrade for full history"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/60"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                title="Filter by tool"
                className="pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/60 appearance-none cursor-pointer"
              >
                {toolOptions.map(tool => (
                  <option key={tool} value={tool}>
                    {tool === "all" ? "All tools" : tool.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showUpgradePrompt && !isProUser && (
            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between gap-3">
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
              <History className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-bold text-muted-foreground">No processing history found</p>
              <p className="text-sm text-muted-foreground/60 max-w-sm">
                Files you process will appear here. Start by uploading a file on the home page.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}