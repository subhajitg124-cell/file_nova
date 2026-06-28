import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, AlertCircle, CheckCircle2, ExternalLink, X, Star, Clock, Pin } from "lucide-react";
import { googleDriveProvider, dropboxProvider, googlePhotosProvider, urlImportProvider, cloudStore } from "@/lib/providers";
import type { CloudProvider, CloudImportFile } from "@/lib/providers";

interface CloudImportHubProps {
  onFilesSelected: (files: File[]) => void;
  allowedCategory?: "pdf" | "image" | "video" | "office" | null;
  disabled?: boolean;
}

type ImportState = "idle" | "loading" | "importing" | "done" | "error";

interface ProviderButton {
  provider: CloudProvider;
  state: ImportState;
  message: string;
}

const ALL_PROVIDERS: CloudProvider[] = [
  googleDriveProvider,
  dropboxProvider,
  googlePhotosProvider,
  urlImportProvider,
];

const PROVIDER_COLORS: Record<string, { border: string; bg: string; text: string; hover: string }> = {
  "google-drive": { border: "border-emerald-500/30", bg: "bg-emerald-500/8", text: "text-emerald-400", hover: "hover:bg-emerald-500/12" },
  dropbox: { border: "border-blue-500/30", bg: "bg-blue-500/8", text: "text-blue-400", hover: "hover:bg-blue-500/12" },
  "google-photos": { border: "border-amber-500/30", bg: "bg-amber-500/8", text: "text-amber-400", hover: "hover:bg-amber-500/12" },
  "url-import": { border: "border-violet-500/30", bg: "bg-violet-500/8", text: "text-violet-400", hover: "hover:bg-violet-500/12" },
};

function ProviderIcon({ provider, size = "h-10 w-10" }: { provider: CloudProvider; size?: string }) {
  const colors = PROVIDER_COLORS[provider.id] || PROVIDER_COLORS["google-drive"];
  return (
    <div className={`${size} rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
      {provider.icon}
    </div>
  );
}

export const CloudImportHub: React.FC<CloudImportHubProps> = ({ onFilesSelected, allowedCategory, disabled }) => {
  const [expanded, setExpanded] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlState, setUrlState] = useState<ImportState>("idle");
  const [urlMessage, setUrlMessage] = useState("");
  const [providers, setProviders] = useState<ProviderButton[]>(
    ALL_PROVIDERS.map((p) => ({ provider: p, state: "idle" as ImportState, message: "" }))
  );
  const [showRecent, setShowRecent] = useState(false);
  const [recentFiles, setRecentFiles] = useState<CloudImportFile[]>([]);

  const imageOnly = allowedCategory === "image";
  const showGooglePhotos = !allowedCategory || allowedCategory === "image";

  useEffect(() => {
    setRecentFiles(cloudStore.getAll());
  }, []);

  const handleProviderPick = useCallback(async (idx: number) => {
    if (disabled) return;
    const entry = providers[idx];
    if (entry.state === "importing") return;

    setProviders((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, state: "loading" as ImportState, message: "Connecting..." } : p))
    );

    try {
      if (!(await entry.provider.isConnected())) {
        await entry.provider.authenticate();
      }
      setProviders((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, state: "importing" as ImportState, message: "Selecting files..." } : p))
      );

      const files = await entry.provider.pickFiles({
        multiple: true,
        imageOnly: imageOnly && entry.provider.supportsImageOnly(),
      });

      if (files.length > 0) {
        cloudStore.setLastUsedProvider(entry.provider.id);
        setProviders((prev) =>
          prev.map((p, i) => (i === idx ? { ...p, state: "done" as ImportState, message: `${files.length} file(s) imported` } : p))
        );
        onFilesSelected(files);
        setTimeout(() => {
          setProviders((prev) =>
            prev.map((p, i) => (i === idx ? { ...p, state: "idle" as ImportState, message: "" } : p))
          );
        }, 2000);
      } else {
        setProviders((prev) =>
          prev.map((p, i) => (i === idx ? { ...p, state: "idle" as ImportState, message: "" } : p))
        );
      }
    } catch (err: any) {
      setProviders((prev) =>
        prev.map((p, i) =>
          i === idx ? { ...p, state: "error" as ImportState, message: err.message || "Import failed" } : p
        )
      );
      setTimeout(() => {
        setProviders((prev) =>
          prev.map((p, i) => (i === idx ? { ...p, state: "idle" as ImportState, message: "" } : p))
        );
      }, 4000);
    }
  }, [providers, onFilesSelected, imageOnly, disabled]);

  const handleUrlImport = useCallback(async () => {
    if (!urlInput.trim() || disabled) return;
    setUrlState("loading");
    setUrlMessage("Validating URL...");

    try {
      const file = await urlImportProvider.pickFromUrl(urlInput.trim());
      if (file) {
        setUrlState("done");
        setUrlMessage(`Imported: ${file.name}`);
        onFilesSelected([file]);
        setUrlInput("");
        setTimeout(() => setUrlState("idle"), 2000);
      }
    } catch (err: any) {
      setUrlState("error");
      setUrlMessage(err.message || "Import failed");
      setTimeout(() => setUrlState("idle"), 5000);
    }
  }, [urlInput, onFilesSelected, disabled]);

  const visibleProviders = providers.filter((p) => {
    if (p.provider.id === "google-photos" && !showGooglePhotos) return false;
    return true;
  });

  return (
    <div className="w-full space-y-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-border/60 bg-card/30 hover:bg-card/50 text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
      >
        <Upload className="h-3.5 w-3.5" />
        {expanded ? "Hide import sources" : "Import from cloud"}
        <span className="text-[9px] text-muted-foreground/60">(Google Drive, Dropbox, Photos, URL)</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-xl space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {visibleProviders.map((entry, idx) => {
                  const colors = PROVIDER_COLORS[entry.provider.id] || PROVIDER_COLORS["google-drive"];
                  return (
                    <button
                      id={`btn-cloud-${entry.provider.id}`}
                      key={entry.provider.id}
                      onClick={() => handleProviderPick(idx)}
                      disabled={disabled || entry.state === "importing"}
                      className={`
                        relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer
                        ${entry.state === "loading" || entry.state === "importing"
                          ? "border-primary/40 bg-primary/5"
                          : entry.state === "done"
                            ? "border-emerald-500/40 bg-emerald-500/8"
                            : entry.state === "error"
                              ? "border-red-500/40 bg-red-500/8"
                              : `${colors.border} ${colors.bg} ${colors.hover} hover:scale-[1.02]`
                        }
                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {entry.state === "loading" || entry.state === "importing" ? (
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        </div>
                      ) : entry.state === "done" ? (
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                      ) : (
                        <ProviderIcon provider={entry.provider} />
                      )}
                      <span className="text-[10px] font-bold text-foreground text-center leading-tight">
                        {entry.state === "loading"
                          ? "Connecting..."
                          : entry.state === "importing"
                            ? "Selecting..."
                            : entry.state === "done"
                              ? "Imported!"
                              : entry.state === "error"
                                ? "Failed"
                                : entry.provider.name}
                      </span>
                      {entry.message && entry.state !== "idle" && (
                        <span className="text-[8px] text-muted-foreground text-center leading-tight max-w-full truncate px-1">
                          {entry.message}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* URL Import */}
              <div className="pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
                      placeholder="Paste a file URL to import..."
                      disabled={disabled || urlState === "loading"}
                      className="w-full h-9 px-3 pr-8 rounded-xl bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-50"
                    />
                    {urlInput && (
                      <button
                        type="button"
                        onClick={() => setUrlInput("")}
                        title="Clear URL input"
                        aria-label="Clear URL input"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleUrlImport}
                    disabled={!urlInput.trim() || disabled || urlState === "loading"}
                    className="h-9 px-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold hover:bg-violet-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                  >
                    {urlState === "loading" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                    Import
                  </button>
                </div>
                {urlState === "error" && (
                  <p className="mt-1.5 text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {urlMessage}
                  </p>
                )}
                {urlState === "done" && (
                  <p className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {urlMessage}
                  </p>
                )}
              </div>

              {/* Recent cloud imports */}
              {recentFiles.length > 0 && (
                <div className="pt-2 border-t border-border/40">
                  <button
                    onClick={() => setShowRecent(!showRecent)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Clock className="h-3 w-3" />
                    Recent cloud imports ({recentFiles.length})
                  </button>
                  <AnimatePresence>
                    {showRecent && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1 max-h-40 overflow-y-auto"
                      >
                        {recentFiles.map((file) => (
                          <div
                            key={`${file.source}:${file.name}:${file.importedAt}`}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/40 text-[10px]"
                          >
                            <span className="text-muted-foreground font-mono text-[9px] uppercase">{file.source}</span>
                            <span className="flex-1 truncate text-foreground font-medium">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                cloudStore.togglePin(file);
                                setRecentFiles(cloudStore.getAll());
                              }}
                              title={cloudStore.isPinned(file) ? "Unpin file" : "Pin file"}
                              aria-label={cloudStore.isPinned(file) ? "Unpin file" : "Pin file"}
                              className={`p-0.5 transition-colors ${cloudStore.isPinned(file) ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"}`}
                            >
                              <Pin className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CloudImportHub;
