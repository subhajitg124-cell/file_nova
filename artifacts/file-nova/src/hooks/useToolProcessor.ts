import { useState, useEffect } from "react";
import { useFileStore, FileRecord } from "@/store/useFileStore";
import { useSubscription } from "@/hooks/useSubscription";
import { apiClient, apiMock } from "@/lib/api";
import { toast } from "sonner";

export interface ProcessedResult {
  name: string;
  url: string;
  size: string;
  savings?: string;
}

export function useToolProcessor(slug: string, operation: string) {
  const {
    isMockMode,
    files,
    rawFiles,
    addRawFiles,
    addFiles,
    clearStore,
    removeFile,
  } = useFileStore();

  const { incrementFeatureUse } = useSubscription();

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync with store values
  const handleFilesSelected = async (selected: File[]) => {
    setError(null);
    setIsProcessing(true);
    setProgress(15);
    try {
      const activeJobId = Math.random().toString(36).substring(2, 15);
      addRawFiles(selected);
      const uploaded = isMockMode
        ? await apiMock.uploadFiles(selected, activeJobId)
        : await apiClient.uploadFiles(selected, activeJobId);
      addFiles(uploaded);
      setProgress(100);
      toast.success("Files uploaded successfully.");
    } catch (err: any) {
      setError(err.message || "File upload failed.");
      toast.error(err.message || "File upload failed");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    clearStore();
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const runProcessing = async (configOptions: Record<string, any> = {}, clientSideResultBlob?: Blob | null) => {
    if (files.length === 0) {
      toast.error("Please select a file first.");
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(null);
    const activeJobId = Math.random().toString(36).substring(2, 15);

    try {
      // 1. Check if client-side result is provided directly (for local tools)
      if (clientSideResultBlob) {
        // Mock a slight delay for realism
        for (let i = 20; i <= 100; i += 20) {
          setProgress(i);
          await new Promise(r => setTimeout(r, 100));
        }
        const url = URL.createObjectURL(clientSideResultBlob);
        const name = files[0].name.replace(/\.[^/.]+$/, "") + "_processed" + getExtensionForMime(clientSideResultBlob.type);
        const sizeStr = formatSize(clientSideResultBlob.size);
        
        // Calculate savings
        const originalSize = files.reduce((acc, f) => acc + f.size, 0);
        const reduction = Math.max(0, originalSize - clientSideResultBlob.size);
        const savingsPct = Math.round((reduction / originalSize) * 100);
        const savings = savingsPct > 0 ? `${savingsPct}% smaller` : undefined;

        setResult({ name, url, size: sizeStr, savings });
        incrementFeatureUse();
        toast.success("Processing complete!");
        return;
      }

      // 2. Otherwise run API or Simulated Processing
      if (isMockMode) {
        await new Promise<void>((resolve, reject) => {
          apiMock.simulateProcessing(
            activeJobId,
            operation,
            files,
            (p) => setProgress(p),
            (downloadUrl, savings) => {
              const name = files[0].name.replace(/\.[^/.]+$/, "") + "_processed" + getExtensionForMime(files[0].type);
              const totalSize = files.reduce((acc, f) => acc + f.size, 0);
              const newSize = savings ? savings.newSize : Math.round(totalSize * 0.75);
              const pct = savings ? savings.percent : 25;
              setResult({
                name,
                url: downloadUrl,
                size: formatSize(newSize),
                savings: pct > 0 ? `${pct}% smaller` : undefined,
              });
              incrementFeatureUse();
              resolve();
            },
            (err) => {
              reject(new Error(err));
            }
          );
        });
      } else {
        // Upload & trigger real server-side API processing
        await apiClient.startProcessing(activeJobId, operation, configOptions);
        setProgress(40);
        
        let attempts = 0;
        const maxAttempts = 30;
        let completed = false;

        while (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1500));
          const status = await apiClient.pollStatus(activeJobId);
          
          if (status.status === "completed") {
            const downloadUrl = apiClient.getDownloadUrl(activeJobId);
            const sizeStr = status.output_size_bytes ? formatSize(status.output_size_bytes) : "Unknown size";
            let savings: string | undefined;
            
            if (status.output_size_bytes) {
              const originalSize = files.reduce((acc, f) => acc + f.size, 0);
              const reduction = Math.max(0, originalSize - status.output_size_bytes);
              const pct = Math.round((reduction / originalSize) * 100);
              if (pct > 0) savings = `${pct}% smaller`;
            }

            setResult({
              name: files[0].name.replace(/\.[^/.]+$/, "") + "_processed" + getExtensionForMime(files[0].type),
              url: downloadUrl,
              size: sizeStr,
              savings,
            });
            incrementFeatureUse();
            completed = true;
            break;
          } else if (status.status === "failed") {
            throw new Error(status.error || "Processing failed on backend");
          }
          
          setProgress((prev) => Math.min(95, prev + 10));
          attempts++;
        }

        if (!completed) {
          throw new Error("Job polling timed out.");
        }
      }
      toast.success("Processing complete!");
    } catch (err: any) {
      setError(err.message || "Processing failed.");
      toast.error(err.message || "Processing failed");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return {
    files,
    rawFiles,
    isProcessing,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
  };
}

function getExtensionForMime(mime: string): string {
  if (mime.includes("pdf")) return ".pdf";
  if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("word") || mime.includes("docx")) return ".docx";
  if (mime.includes("zip")) return ".zip";
  return ".bin";
}
