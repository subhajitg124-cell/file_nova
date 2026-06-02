import { useMemo, useState } from "react";
import JSZip from "jszip";
import { CheckCircle2, Download, FileArchive, Loader2, Play, Square, XCircle } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { toast } from "sonner";

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

export function BulkProcessor() {
  const { rawFiles, selectedOperation } = useFileStore();
  const [items, setItems] = useState<Record<string, BulkItemState>>(() =>
    Object.fromEntries(rawFiles.slice(0, 10).map((file) => [file.name, { selected: true, status: "queued", progress: 0 }]))
  );
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const bulkFiles = useMemo(() => rawFiles.slice(0, 10), [rawFiles]);
  const selectedFiles = bulkFiles.filter((file) => items[file.name]?.selected);

  if (bulkFiles.length <= 1) return null;

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

      const blob = await zip.generateAsync({ type: "blob" });
      setZipUrl(URL.createObjectURL(blob));
      toast.success(`Bulk ${selectedOperation || "processing"} complete.`);
    } catch (err: any) {
      selectedFiles.forEach((file) => {
        if (items[file.name]?.status !== "completed") updateItem(file.name, { status: "failed", progress: 0 });
      });
      toast.error(err.message || "Bulk processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
            <FileArchive className="h-3.5 w-3.5" />
            Pro bulk queue
          </div>
          <h3 className="mt-2 text-base font-black text-foreground">Process up to 10 files at once</h3>
        </div>
        <button
          onClick={processAll}
          disabled={processing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Process All
        </button>
      </div>

      <div className="space-y-2">
        {bulkFiles.map((file) => {
          const item = items[file.name] || { selected: true, status: "queued", progress: 0 };
          return (
            <div key={file.name} className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleFile(file.name)} className="flex h-5 w-5 items-center justify-center rounded border border-border bg-background" aria-label={`Select ${file.name}`}>
                  {item.selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-foreground">{file.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                {item.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {item.status === "completed" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {item.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                {item.status === "queued" && <Square className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {zipUrl && (
        <a href={zipUrl} download="filenova-bulk-results.zip" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white">
          <Download className="h-4 w-4" />
          Download all as ZIP
        </a>
      )}
    </section>
  );
}

export default BulkProcessor;
