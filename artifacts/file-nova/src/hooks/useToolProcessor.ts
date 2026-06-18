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
    customFileName,
  } = useFileStore();

  const { premiumEnabled, incrementFeatureUse } = useSubscription();

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

    const getFinalName = (defaultExt: string, configOutputName?: string): string => {
      const ext = defaultExt.startsWith(".") ? defaultExt : `.${defaultExt}`;
      if (!premiumEnabled) {
        return getBrandedFileName(slug, ext);
      }
      if (customFileName.trim()) {
        const cleanName = customFileName.trim();
        return cleanName.toLowerCase().endsWith(ext.toLowerCase()) ? cleanName : `${cleanName}${ext}`;
      }
      if (configOutputName) {
        return configOutputName;
      }
      const baseInputName = files[0]?.name ? files[0].name.replace(/\.[^/.]+$/, "") : "output";
      return baseInputName + "_processed" + ext;
    };

    try {
      // 1. Check if client-side result is provided directly (for local tools)
      if (clientSideResultBlob) {
        // Mock a slight delay for realism
        for (let i = 20; i <= 100; i += 20) {
          setProgress(i);
          await new Promise(r => setTimeout(r, 100));
        }
        const url = URL.createObjectURL(clientSideResultBlob);
        const ext = getExtensionForMime(clientSideResultBlob.type, files[0].name);
        const name = getFinalName(ext, configOptions.outputName);
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
        let resultBlob: Blob | null = null;
        try {
          if (slug === "merge-pdf") {
            const { runClientSidePdfMerge } = await import("@/lib/processing/pdf/client-pdf");
            resultBlob = await runClientSidePdfMerge(rawFiles, configOptions.pageRanges as string[] | undefined);
          } else if (slug === "compress-pdf") {
            const { runClientSidePdfCompress } = await import("@/lib/processing/pdf/client-pdf");
            const targetSizeKb = configOptions.targetSizeKb;
            if (targetSizeKb) {
              const targetBytes = targetSizeKb * 1024;
              let quality = 90;
              let lastBlob: Blob | null = null;
              
              // Iterate quality downwards to meet target size, max 5 iterations
              for (let iter = 0; iter < 5; iter++) {
                const blob = await runClientSidePdfCompress(rawFiles[0], quality);
                lastBlob = blob;
                if (blob.size <= targetBytes || quality <= 30) {
                  break;
                }
                quality -= 15;
              }
              resultBlob = lastBlob;
            } else {
              const quality = configOptions.level === "screen" ? 40 : configOptions.level === "ebook" ? 70 : 90;
              resultBlob = await runClientSidePdfCompress(rawFiles[0], quality);
            }
          } else if (slug === "split-pdf") {
            const { runClientSidePdfSplit } = await import("@/lib/processing/pdf/client-pdf");
            const mode = configOptions.split_mode || "all";
            const splitEvery = configOptions.parts_count || 1;
            const splitRange = configOptions.split_range || "1";
            const splitBlobs = await runClientSidePdfSplit(rawFiles[0], mode === "parts" ? "every" : mode, splitEvery, splitRange);
            
            if (splitBlobs.length > 1) {
              const JSZip = (await import('jszip')).default;
              const zip = new JSZip();
              splitBlobs.forEach((b, idx) => {
                zip.file(`split-${idx + 1}.pdf`, b);
              });
              resultBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
            } else if (splitBlobs.length === 1) {
              resultBlob = splitBlobs[0];
            }
          } else if (slug === "rotate-pdf") {
            const { runClientSidePdfRotate } = await import("@/lib/processing/pdf/client-pdf");
            const rotation = configOptions.rotation || 90;
            const mode = configOptions.pageScope === "custom" ? "specific" : "all";
            const rangeStr = configOptions.customRange || "1";
            const pageList: number[] = [];
            if (mode === "specific") {
              const parts = rangeStr.split(",").map((p: string) => p.trim());
              parts.forEach((part: string) => {
                if (part.includes("-")) {
                  const [s, e] = part.split("-").map(Number);
                  if (!isNaN(s) && !isNaN(e)) {
                    for (let i = s; i <= e; i++) pageList.push(i);
                  }
                } else {
                  const pNum = Number(part);
                  if (!isNaN(pNum)) pageList.push(pNum);
                }
              });
            }
            resultBlob = await runClientSidePdfRotate(rawFiles[0], rotation, mode, pageList);
          } else if (slug === "unlock-pdf") {
            const { runClientSidePdfUnlock } = await import("@/lib/processing/pdf/client-pdf");
            resultBlob = await runClientSidePdfUnlock(rawFiles[0], configOptions.password || "");
          } else if (slug === "jpg-to-pdf") {
            const { runClientSideImagesToPdf } = await import("@/lib/processing/pdf/client-pdf");
            resultBlob = await runClientSideImagesToPdf(rawFiles);
          } else if (slug === "pdf-to-jpg") {
            const { runClientSidePdfToImages } = await import("@/lib/processing/pdf/client-pdf");
            resultBlob = await runClientSidePdfToImages(rawFiles[0], 150);
          } else if (slug === "resize-image") {
            const { cropImage, rotateFlipImage, resizeImage } = await import("@/lib/processing/image/client-image");
            let currentFile = rawFiles[0];

            // 1. Crop if parameters are present and enabled
            if (
              configOptions.cropEnabled &&
              typeof configOptions.cropX === "number" &&
              typeof configOptions.cropY === "number" &&
              typeof configOptions.cropWidth === "number" &&
              typeof configOptions.cropHeight === "number"
            ) {
              const croppedBlob = await cropImage(
                currentFile,
                configOptions.cropX,
                configOptions.cropY,
                configOptions.cropWidth,
                configOptions.cropHeight,
                configOptions.outputFormat || configOptions.imageFormat || undefined
              );
              currentFile = new File([croppedBlob], currentFile.name, { type: croppedBlob.type });
            }

            // 2. Rotate / Flip if parameters are present
            if (configOptions.rotation || configOptions.flipH || configOptions.flipV) {
              const rotatedBlob = await rotateFlipImage(
                currentFile,
                configOptions.rotation || 0,
                !!configOptions.flipH,
                !!configOptions.flipV,
                configOptions.outputFormat || configOptions.imageFormat || undefined
              );
              currentFile = new File([rotatedBlob], currentFile.name, { type: rotatedBlob.type });
            }

            // 3. Resize if width/height are set
            const targetW = configOptions.resizeWidth || configOptions.width;
            const targetH = configOptions.resizeHeight || configOptions.height;
            if (targetW || targetH) {
              const img = new Image();
              img.src = URL.createObjectURL(currentFile);
              await new Promise<void>((resolve) => {
                img.onload = () => resolve();
              });
              const w = targetW || Math.round((img.naturalWidth * (targetH || img.naturalHeight)) / img.naturalHeight);
              const h = targetH || Math.round((img.naturalHeight * (targetW || img.naturalWidth)) / img.naturalWidth);
              URL.revokeObjectURL(img.src);

              const resizedBlob = await resizeImage(
                currentFile,
                w,
                h,
                (configOptions.outputFormat || configOptions.imageFormat || "png") as any,
                configOptions.quality ? configOptions.quality / 100 : 0.92
              );
              currentFile = new File([resizedBlob], currentFile.name, { type: resizedBlob.type });
            }

            resultBlob = currentFile;
          } else if (slug === "remove-background") {
            const { removeImageBackground } = await import("@/lib/processing/image/client-image");
            resultBlob = await removeImageBackground(rawFiles[0], configOptions.outputFormat || "png");
          } else if (slug === "compress-image") {
            const { compressImage } = await import("@/lib/processing/image/client-image");
            const qualOpt = configOptions.quality;
            const qual = typeof qualOpt === 'number'
              ? (qualOpt <= 1 ? qualOpt : qualOpt / 100)
              : 0.82;
            const maxW = configOptions.resizeWidth || configOptions.resize_width || undefined;
            const maxH = configOptions.resizeHeight || configOptions.resize_height || undefined;
            const format = configOptions.targetFormat || configOptions.imageFormat || undefined;
            resultBlob = await compressImage(rawFiles[0], qual, maxW, maxH, format);
          }
        } catch (localErr) {
          console.error("Local client-side execution failed, falling back to mock simulation:", localErr);
        }

        if (resultBlob) {
          setProgress(100);
          const isZip = resultBlob.type.includes("zip") || resultBlob.type.includes("octet-stream");
          const ext = isZip ? ".zip" : getExtensionForMime(resultBlob.type, rawFiles[0].name);
          const name = getFinalName(ext, configOptions.outputName);
          const url = URL.createObjectURL(resultBlob);
          const sizeStr = formatSize(resultBlob.size);

          const originalSize = rawFiles.reduce((acc, f) => acc + f.size, 0);
          const reduction = Math.max(0, originalSize - resultBlob.size);
          const savingsPct = Math.round((reduction / originalSize) * 100);
          const savings = savingsPct > 0 ? `${savingsPct}% smaller` : undefined;

          setResult({ name, url, size: sizeStr, savings });
          incrementFeatureUse();
          toast.success("Processing complete!");
        } else {
          // Fallback to simulation
          await new Promise<void>((resolve, reject) => {
            apiMock.simulateProcessing(
              activeJobId,
              operation,
              files,
              (p) => setProgress(p),
              (downloadUrl, savings) => {
                const ext = getExtensionForMime(files[0].type, files[0].name);
                const name = getFinalName(ext, configOptions.outputName);
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
        }
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

            const ext = getExtensionForMime(files[0].type, files[0].name);
            const name = getFinalName(ext, configOptions.outputName);
            setResult({
              name,
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

export function getExtensionForMime(mime: string, filename = ""): string {
  const m = mime.toLowerCase();
  const f = filename.toLowerCase();
  if (m.includes("pdf") || f.endsWith(".pdf")) return ".pdf";
  if (m.includes("jpeg") || m.includes("jpg") || f.endsWith(".jpg") || f.endsWith(".jpeg")) return ".jpg";
  if (m.includes("png") || f.endsWith(".png")) return ".png";
  if (m.includes("webp") || f.endsWith(".webp")) return ".webp";
  if (m.includes("word") || m.includes("docx") || f.endsWith(".docx")) return ".docx";
  if (m.includes("zip") || f.endsWith(".zip")) return ".zip";
  
  if (filename.includes(".")) {
    const ext = filename.split('.').pop();
    if (ext) return `.${ext.toLowerCase()}`;
  }
  return ".bin";
}

export function getBrandedFileName(slug: string, extension: string): string {
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  const mapping: Record<string, string> = {
    "compress-pdf": "filenovapdfcompress",
    "compress-pdf-for-upload": "filenovapdfcompress",
    "merge-pdf": "filenovapdfmerge",
    "split-pdf": "filenovapdfsplit",
    "rotate-pdf": "filenovapdfrotate",
    "protect-pdf": "filenovapdfprotect",
    "unlock-pdf": "filenovapdfunlock",
    "aadhaar-mask-pdf": "filenovaaadhaarmask",
    "pan-card-resize": "filenovapancardresize",
    "scholarship-zip": "filenovascholarshipzip",
    "compress-image": "filenovaimagecompress",
    "resize-image": "filenovaimageresize",
    "resize-photo": "filenovaimageresize",
    "remove-background": "filenovabgremove",
    "ocr": "filenovaocrscan",
    "pdf-to-word": "filenovapdftoword",
    "pdf-to-jpg": "filenovapdftojpg",
    "jpg-to-pdf": "filenovajpgtopdf",
    "word-to-pdf": "filenovawordtopdf",
    "ai-ppt-maker": "filenovaaipptmaker",
    "ai-pdf-summary": "filenovaaipdfsummary",
  };
  const baseName = mapping[slug] || `filenova${slug.replace(/-/g, "")}`;
  return `${baseName}${ext}`;
}

export function getOutputExtensionForSlug(slug: string, inputFiles: any[] = []): string {
  switch (slug) {
    case "pdf-to-word":
      return ".docx";
    case "word-to-pdf":
    case "jpg-to-pdf":
      return ".pdf";
    case "pdf-to-jpg":
      return ".jpg";
    case "scholarship-zip":
      return ".zip";
    case "ai-ppt-maker":
      return ".pptx";
    case "remove-background":
      return ".png";
    case "ocr":
    case "ai-pdf-summary":
      return ".txt";
    default:
      if (inputFiles && inputFiles.length > 0) {
        return getExtensionForMime(inputFiles[0].type, inputFiles[0].name);
      }
      return ".pdf";
  }
}
