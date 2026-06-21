import React, { useState, useEffect } from "react";
import { ToolWorkspace, ToolControl, ToolWorkspaceStat } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Zap } from "lucide-react";

export const CompressPDFWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
    processingStatus,
  } = useToolProcessor("compress-pdf", "compress");

  // Local state configurations
  const [level, setLevel] = useState<"screen" | "ebook" | "print" | "custom">("ebook");
  const [customTargetConfig, setCustomTargetConfig] = useState({
    targetSize: "200",
    targetSizeUnit: "KB" as "MB" | "KB",
    autoAdjust: true
  });
  const [targetSizeInitialized, setTargetSizeInitialized] = useState(false);
  const [compressImages, setCompressImages] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);

  const isReady = files.length > 0;

  useEffect(() => {
    if (isReady && typeof window !== "undefined" && window.history.state?.autoProcess) {
      window.history.replaceState({ ...window.history.state, autoProcess: false }, "");
      handleProcess();
    }
  }, [files, isReady]);

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
    let targetSizeKb: number | undefined = undefined;
    if (level === "custom") {
      const rawSize = parseFloat(customTargetConfig.targetSize) || 0;
      if (customTargetConfig.targetSizeUnit === "MB") {
        targetSizeKb = Math.round(rawSize * 1024);
      } else {
        targetSizeKb = Math.round(rawSize);
      }
    }
    const options = {
      level,
      targetSizeKb,
      compressImages,
      removeMetadata,
      dpi: level === "screen" ? 72 : level === "ebook" ? 150 : 300,
    };
    await runProcessing(options);
  };

  const handleResetAll = () => {
    handleReset();
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
      id: "preset",
      label: "Compression Preset",
      type: "radio-cards",
      value: level,
      onChange: (val) => setLevel(val),
      options: [
        { value: "print", label: "Print", desc: "High Quality (300 DPI)", quality: "300 DPI" },
        { value: "ebook", label: "Ebook", desc: "Balanced Size (150 DPI)", quality: "150 DPI" },
        { value: "screen", label: "Screen", desc: "Max Compression (72 DPI)", quality: "72 DPI" },
        { value: "custom", label: "Custom Target Size", desc: "Specify custom size limit", quality: "Manual" }
      ]
    },
    ...(level === "custom" ? [{
      id: "custom-target",
      label: "Target File Size Limit",
      type: "custom-target-size" as const,
      value: customTargetConfig,
      onChange: (val: any) => setCustomTargetConfig(val),
      min: Math.min(0.2, parseFloat((files.reduce((acc, f) => acc + f.size, 0) * 0.1 / (1024 * 1024)).toFixed(2))),
      max: parseFloat((files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)),
      step: 0.1
    }] : []),
    {
      id: "compressImages",
      label: "Downsample and compress images inside PDF",
      type: "toggle",
      value: compressImages,
      onChange: (val) => setCompressImages(val),
      advanced: true
    },
    {
      id: "removeMetadata",
      label: "Strip XML metadata & annotations",
      type: "toggle",
      value: removeMetadata,
      onChange: (val) => setRemoveMetadata(val),
      advanced: true
    }
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
      if (level === "custom") {
        const rawSize = parseFloat(customTargetConfig.targetSize) || 0;
        let kb = rawSize;
        if (customTargetConfig.targetSizeUnit === "MB") {
          kb = rawSize * 1024;
        }
        estBytes = kb * 1024;
      } else {
        const multiplier = level === "screen" ? 0.35 : level === "ebook" ? 0.6 : 0.85;
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
    <PreviewPanel files={rawFiles} slug="compress-pdf" options={{ level }} />
  );

  return (
    <ToolWorkspace
      toolName="Compress PDF"
      toolDescription="Reduce the file size of your PDF documents while keeping optimal text and image quality."
      toolIcon={<Zap className="h-5 w-5" />}
      accentColor="emerald"
      controlsConfig={controlsConfig}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleResetAll}
      maxFiles={1}
      acceptedTypes={[".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
      stats={getStats()}
      processingStatus={processingStatus}
    />
  );
};

export default CompressPDFWorkspace;
