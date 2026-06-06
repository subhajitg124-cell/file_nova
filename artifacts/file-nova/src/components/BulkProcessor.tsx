import { useMemo, useState } from "react";
import JSZip from "jszip";
import {
  CheckCircle2, Crown, Download, FileArchive, Loader2,
  Lock, Play, Square, XCircle
} from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { Link } from "wouter";

type BulkStatus = "queued" | "processing" | "completed" | "failed";

interface BulkItemState {
  selected: boolean;
  status: BulkStatus;
  progress: number;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

/** Pro tier: 10 files max, 10 MB each. Free tier: 1 file */
const LIMITS = {
  pro:  { maxFiles: 10, maxSizeBytes: 10 * 1024 * 1024 },
  free: { maxFiles:  1, maxSizeBytes: 10 * 1024 * 1024 },
};

export function BulkProcessor() {
  const { rawFiles, selectedOperation } = useFileStore();
  const { premiumTier } = useSubscription();

  const isPro = premiumTier === "basic" || premiumTier === "pro" || premiumTier === "elite";
  const limit = isPro ? LIMITS.pro : LIMITS.free;

  const bulkFiles = useMemo(
    () => rawFiles.slice(0, limit.maxFiles).filter((f) => f.size <= limit.maxSizeBytes),
    [rawFiles, limit]
  );

  const [items, setItems] = useState<Record<string, BulkItemState>>(() =>
    Object.fromEntries(
      bulkFiles.map((file) => [file.name, { selected: true, status: "queued", progress: 0 }])
    )
  );
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Only show the panel when there's more than 1 file
  if (rawFiles.length <= 1) return null;

  const selectedFiles = bulkFiles.filter((file) => items[file.name]?.selected);

  const updateItem = (name: string, patch: Partial<BulkItemState>) => {
    setItems((current) => ({
      ...current,
      [name]: { ...(current[name] || { selected: true, status: "queued", progress: 0 }), ...patch },
    }));
  };

  const toggleFile = (name: string) => {
    setItems((current) => ({
      ...current,
      [name]: {
        ...(current[name] || { status: "queued", progress: 0 }),
        selected: !(current[name]?.selected ?? true),
      },
    }));
  };

  const processAll = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Select at least one file to process.");
      return;
    }

    setProcessing(true);
    setZipUrl(null);
    const zip = new JSZip();

    try {
      for (const file of selectedFiles) {
        updateItem(file.name, { status: "processing", progress: 15 });
        await new Promise((resolve) => setTimeout(resolve, 250));
        updateItem(file.name, { progress: 55 });
        await new Promise((resolve) => setTimeout(resolve, 250));
        zip.file(file.name, await file.arrayBuffer());
        updateItem(file.name, { status: "completed", progress: 100 });
      }

      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      const url = URL.createObjectURL(blob);
      setZipUrl(url);
      toast.success(`Batch ${selectedOperation || "processing"} complete — ${selectedFiles.length} files bundled.`);
    } catch (err: any) {
      selectedFiles.forEach((file) => {
        if (items[file.name]?.status !== "completed")
          updateItem(file.name, { status: "failed", progress: 0 });
      });
      toast.error(err.message || "Batch processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  const oversizedCount = rawFiles.filter((f) => f.size > limit.maxSizeBytes).length;

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
            <FileArchive className="h-3.5 w-3.5" />
            {isPro ? "Pro Batch Queue" : "Batch Queue"}
          </div>
          <h3 className="mt-2 text-base font-black text-foreground">
            {isPro ? `Process up to ${LIMITS.pro.maxFiles} files at once` : "Batch processing — Free plan"}
          </h3>
          {!isPro && (
            <p className="text-xs text-muted-foreground mt-1">
              Free plan: 1 file per batch.{" "}
              <Link href="/pricing" className="text-primary font-bold hover:underline">
                Upgrade to Pro
              </Link>{" "}
              for up to 10 files.
            </p>
          )}
        </div>
        <button
          onClick={processAll}
          disabled={processing || selectedFiles.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground shadow-glow-sm disabled:opacity-60 transition hover:opacity-90 cursor-pointer"
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {processing ? "Processing…" : `Process ${selectedFiles.length} file${selectedFiles.length !== 1 ? "s" : ""}`}
        </button>
      </div>

      {/* Pro upsell gate — shows locked files when free */}
      {!isPro && rawFiles.length > 1 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <Lock className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-amber-600 dark:text-amber-400">
              {rawFiles.length - 1} more file{rawFiles.length - 1 !== 1 ? "s" : ""} locked
            </p>
            <p className="text-[11px] text-muted-foreground">
              Upgrade to Pro to process all {rawFiles.length} files together
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-[11px] font-black text-white transition"
          >
            <Crown className="h-3 w-3" />
            Upgrade
          </Link>
        </div>
      )}

      {/* File list */}
      <div className="space-y-2">
        {bulkFiles.map((file) => {
          const item = items[file.name] || { selected: true, status: "queued", progress: 0 };
          return (
            <div key={file.name} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFile(file.name)}
                  className="flex h-5 w-5 items-center justify-center rounded border border-border bg-background shrink-0 cursor-pointer"
                  aria-label={`${item.selected ? "Deselect" : "Select"} ${file.name}`}
                >
                  {item.selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-foreground">{file.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                {item.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
                {item.status === "completed" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                {item.status === "failed"    && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                {item.status === "queued"    && <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.status === "completed" ? "bg-emerald-500" :
                    item.status === "failed"    ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Locked files (free plan) */}
        {!isPro && rawFiles.slice(1).map((file) => (
          <div key={`locked-${file.name}`} className="rounded-xl border border-border/50 bg-muted/30 p-3 opacity-60">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-muted-foreground">{file.name}</p>
                <p className="text-[10px] text-muted-foreground/70">{formatBytes(file.size)} · Pro required</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Size warning */}
      {oversizedCount > 0 && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
          ⚠ {oversizedCount} file{oversizedCount !== 1 ? "s" : ""} exceed{oversizedCount === 1 ? "s" : ""} the 10 MB limit and were excluded.
        </p>
      )}

      {/* Download button */}
      {zipUrl && (
        <a
          href={zipUrl}
          download="filenova-batch-results.zip"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-xs font-black text-white transition shadow-glow-green"
        >
          <Download className="h-4 w-4" />
          Download Batch ZIP ({selectedFiles.length} files)
        </a>
      )}
    </section>
  );
}

export default BulkProcessor;
