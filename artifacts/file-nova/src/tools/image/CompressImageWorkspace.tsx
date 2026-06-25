import React, { useState, useEffect } from "react";
import { ToolWorkspace, ToolControl, ToolWorkspaceStat } from "@/components/workspace/ToolWorkspace";
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileArchive } from "lucide-react";
import { toast } from "sonner";

export const CompressImageWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing,
    isUploading,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset: resetProcessor,
    runProcessing,
  } = useToolProcessor("compress-image", "compress");

  // Local configurations
  const [compressPreset, setCompressPreset] = useState<"web" | "balanced" | "high" | "custom">("balanced");
  const [targetFormat, setTargetFormat] = useState<"original" | "webp" | "jpeg" | "png">("original");
  const [customTargetConfig, setCustomTargetConfig] = useState({
    targetSize: "200",
    targetSizeUnit: "KB" as "MB" | "KB",
    autoAdjust: true
  });
  const [targetSizeInitialized, setTargetSizeInitialized] = useState(false);

  // Preview Object URLs
  const [origUrl, setOrigUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const isReady = files.length > 0;

  // Handle initial file selection to create Object URL
  useEffect(() => {
    if (rawFiles.length > 0) {
      const url = URL.createObjectURL(rawFiles[0]);
      setOrigUrl(url);
      setCompressedUrl(null);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setOrigUrl(null);
      setCompressedUrl(null);
    }
  }, [rawFiles]);

  // Handle result file generation to create Object URL
  useEffect(() => {
    if (result) {
      setCompressedUrl(result.url);
    }
  }, [result]);

  // Symmetrical target size initialization: default to 40% of original size
  useEffect(() => {
    if (files.length > 0 && !targetSizeInitialized) {
      const originalSize = files.reduce((acc, f) => acc + f.size, 0);
      const defaultTargetBytes = originalSize * 0.4;
      const defaultTargetKb = Math.round(defaultTargetBytes / 1024);
      setCustomTargetConfig(prev => ({
        ...prev,
        targetSize: String(defaultTargetKb),
        targetSizeUnit: "KB"
      }));
      setTargetSizeInitialized(true);
    }
  }, [files, targetSizeInitialized]);

  useEffect(() => {
    if (files.length === 0) {
      setTargetSizeInitialized(false);
    }
  }, [files]);

  const handleProcess = async () => {
    if (rawFiles.length === 0) return;
    const file = rawFiles[0];

    try {
      // Determine format mime type
      let mimeType = file.type;
      if (targetFormat === "webp") mimeType = "image/webp";
      else if (targetFormat === "jpeg") mimeType = "image/jpeg";
      else if (targetFormat === "png") mimeType = "image/png";

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            reject(new Error("Canvas context initialization failed"));
            return;
          }

          ctx.drawImage(img, 0, 0);

          if (compressPreset === "custom") {
            // Target size mode: 5-pass binary search loop over canvas quality (0.10 - 0.95)
            let targetSizeKb = parseFloat(customTargetConfig.targetSize) || 200;
            if (customTargetConfig.targetSizeUnit === "MB") {
              targetSizeKb = targetSizeKb * 1024;
            }
            const targetBytes = targetSizeKb * 1024;
            
            let low = 0.10;
            let high = 0.95;
            let currentQuality = 0.75; // Initial guess
            let bestBlob: Blob | null = null;
            let iteration = 0;

            const isBetter = (newBlob: Blob, currentBest: Blob | null): boolean => {
              if (!currentBest) return true;
              const newSize = newBlob.size;
              const bestSize = currentBest.size;
              const newFits = newSize <= targetBytes;
              const bestFits = bestSize <= targetBytes;

              if (newFits && !bestFits) return true;
              if (!newFits && bestFits) return false;
              if (newFits && bestFits) {
                return newSize > bestSize; // Prefer larger size (higher quality)
              }
              return newSize < bestSize; // Neither fits, prefer smaller size
            };

            const runPass = () => {
              if (iteration >= 5) {
                if (bestBlob) {
                  const configOpts: Record<string, any> = {};
                  if (bestBlob.size > targetBytes * 1.1) {
                    const actualKb = (bestBlob.size / 1024).toFixed(1);
                    configOpts.warningMessage = `Closest achievable size: ${actualKb} KB (couldn't reach ${targetSizeKb} KB without unacceptable quality loss).`;
                  }
                  runProcessing(configOpts, bestBlob).then(resolve).catch(reject);
                } else {
                  reject(new Error("Compression failed to produce any valid image blob"));
                }
                return;
              }

              iteration++;
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    runPass();
                    return;
                  }

                  if (isBetter(blob, bestBlob)) {
                    bestBlob = blob;
                  }

                  // Binary search logic:
                  // Higher quality means bigger size.
                  // If size > target, quality is too high -> reduce quality ceiling
                  if (blob.size > targetBytes) {
                    high = currentQuality - 0.01;
                  } else {
                    low = currentQuality + 0.01;
                  }

                  currentQuality = (low + high) / 2;
                  runPass();
                },
                mimeType,
                currentQuality
              );
            };

            runPass();
          } else {
            // Standard preset/quality mode
            const quality = compressPreset === "web" ? 0.5 : compressPreset === "balanced" ? 0.8 : 0.95;
            canvas.toBlob(
              async (blob) => {
                if (blob) {
                  await runProcessing({}, blob);
                  resolve();
                } else {
                  reject(new Error("Compression failed"));
                }
              },
              mimeType,
              quality
            );
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
      });
    } catch (err: any) {
      toast.error(err.message || "Image compression failed.");
    }
  };

  const handleResetAll = () => {
    setCompressedUrl(null);
    resetProcessor();
    setTargetSizeInitialized(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Build dynamic controlsConfig for bento sidebar auto-rendering
  const controlsConfig: ToolControl[] = [
    {
      id: "targetFormat",
      label: "Target Format",
      type: "radio-cards",
      value: targetFormat,
      onChange: (val) => setTargetFormat(val as any),
      options: [
        { value: "original", label: "Original Format", desc: "Keep original file type extension" },
        { value: "webp", label: "WebP Format", desc: "Highly optimized modern web image" },
        { value: "jpeg", label: "JPEG Format", desc: "Universal standard compatible image format" },
        { value: "png", label: "PNG Format", desc: "Lossless compression format with transparency support" }
      ]
    },
    {
      id: "preset",
      label: "Compression Preset",
      type: "radio-cards",
      value: compressPreset,
      onChange: (val) => setCompressPreset(val as any),
      options: [
        { value: "balanced", label: "Balanced", desc: "Optimal quality and file size (80%)" },
        { value: "high", label: "High Quality", desc: "Best image fidelity with light optimization (95%)" },
        { value: "web", label: "Web Small", desc: "Maximum size savings (50%)" },
        { value: "custom", label: "Custom Target Size", desc: "Precisely target a maximum file size" }
      ]
    },
    ...(compressPreset === "custom" ? [{
      id: "custom-target",
      label: "Target File Size Limit",
      type: "custom-target-size" as const,
      value: customTargetConfig,
      onChange: (val: any) => setCustomTargetConfig(val),
      min: Math.min(0.01, parseFloat((files.reduce((acc, f) => acc + f.size, 0) * 0.05 / (1024 * 1024)).toFixed(3))),
      max: parseFloat((files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)),
      step: 0.01
    }] : [])
  ];

  // Dynamic stats calculation (including real-time update before process)
  const getStats = (): ToolWorkspaceStat[] => {
    if (files.length === 0) return [];
    const originalSize = files.reduce((acc, f) => acc + f.size, 0);
    const originalStr = formatBytes(originalSize);

    let resultStr = "-";
    let savingsStr = "-";
    let savingsTone: "default" | "success" | "info" = "default";

    if (result) {
      resultStr = result.size;
      if (result.savings) {
        savingsStr = result.savings;
        savingsTone = "success";
      }
    } else {
      let estBytes = originalSize;
      if (compressPreset === "custom") {
        const rawSize = parseFloat(customTargetConfig.targetSize) || 0;
        let kb = rawSize;
        if (customTargetConfig.targetSizeUnit === "MB") {
          kb = rawSize * 1024;
        }
        estBytes = kb * 1024;
      } else {
        const multiplier = compressPreset === "web" ? 0.35 : compressPreset === "balanced" ? 0.6 : 0.85;
        estBytes = originalSize * multiplier;
      }

      resultStr = formatBytes(estBytes);
      const reduction = Math.max(0, originalSize - estBytes);
      const savingsPct = Math.round((reduction / originalSize) * 100);
      savingsStr = `${savingsPct}% saved`;
      savingsTone = "info";
    }

    return [
      { label: "Original Size", value: originalStr },
      { label: "Est. Output Size", value: resultStr },
      { label: "Est. Saved %", value: savingsStr, tone: savingsTone }
    ];
  };

  const previewPanel = (
    <div className="w-full">
      {origUrl ? (
        <BeforeAfterSlider
          beforeTitle="Raw Input Photo"
          afterTitle="Optimized Output"
          beforeImage={origUrl}
          afterImage={compressedUrl || origUrl}
          mode={compressedUrl ? "slider" : "side-by-side"}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed border-border rounded-2xl min-h-[150px] text-muted-foreground text-xs">
          <FileArchive className="h-8 w-8 mb-2 stroke-[1.5] animate-pulse" />
          <span>Upload an image to see visual compression slider.</span>
        </div>
      )}
    </div>
  );

  return (
    <ToolWorkspace
      toolName="Compress Image"
      toolDescription="Reduce photo sizes locally on your device with visual slider verification."
      toolIcon={<FileArchive className="h-5 w-5" />}
      accentColor="emerald"
      controlsConfig={controlsConfig}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      isUploading={isUploading}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleResetAll}
      maxFiles={1}
      acceptedTypes={["image/*"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
      stats={getStats()}
    />
  );
};

export default CompressImageWorkspace;
