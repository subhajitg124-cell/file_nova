import React, { useState, useEffect } from "react";
import { ToolWorkspace, ToolControl, ToolWorkspaceStat } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileText } from "lucide-react";

export const CompressDocWorkspace: React.FC = () => {
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
  } = useToolProcessor("compress-doc", "compress");

  // Local state configurations
  const [compressPreset, setCompressPreset] = useState<"web" | "balanced" | "high" | "custom">("balanced");
  const [customTargetConfig, setCustomTargetConfig] = useState({
    targetSize: "200",
    targetSizeUnit: "KB" as "MB" | "KB",
    autoAdjust: true
  });
  const [targetSizeInitialized, setTargetSizeInitialized] = useState(false);

  const isReady = files.length > 0;

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
    let quality = 75; // Balanced
    let compression_target = 40; // Default savings

    if (compressPreset === "web") {
      quality = 55;
      compression_target = 65;
    } else if (compressPreset === "high") {
      quality = 92;
      compression_target = 15;
    } else if (compressPreset === "custom") {
      const originalBytes = files.reduce((acc, f) => acc + f.size, 0);
      let targetSizeKb = parseFloat(customTargetConfig.targetSize) || 200;
      if (customTargetConfig.targetSizeUnit === "MB") {
        targetSizeKb = targetSizeKb * 1024;
      }
      const targetBytes = targetSizeKb * 1024;
      // Formula: compression_target = max(0, min(90, (1 - targetBytes/originalBytes) * 100))
      compression_target = Math.max(0, Math.min(90, Math.round((1 - targetBytes / originalBytes) * 100)));
      quality = Math.max(10, Math.min(95, 100 - compression_target));
    }

    const options = {
      preset: compressPreset,
      quality,
      compression_target,
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
      value: compressPreset,
      onChange: (val) => setCompressPreset(val as any),
      options: [
        { value: "balanced", label: "Balanced", desc: "Optimal quality & file size savings (Default)", quality: "Standard" },
        { value: "high", label: "High Quality", desc: "Best layout fidelity with minimal downsampling", quality: "Fidelity" },
        { value: "web", label: "Web Small", desc: "Aggressive optimization for email & web uploads", quality: "Smallest" },
        { value: "custom", label: "Custom Target Size", desc: "Specify custom size limit (e.g. for portal upload limits)", quality: "Manual" }
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
          kb = rawSize * 1025;
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
    <PreviewPanel files={rawFiles} slug="compress-doc" />
  );

  return (
    <ToolWorkspace
      toolName="Compress Document"
      toolDescription="Optimize Microsoft Word, Excel, and PowerPoint documents size by reducing media quality and metadata."
      toolIcon={<FileText className="h-5 w-5" />}
      accentColor="blue"
      controlsConfig={controlsConfig}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleResetAll}
      maxFiles={1}
      acceptedTypes={[".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
      stats={getStats()}
      processingStatus={processingStatus}
    />
  );
};

export default CompressDocWorkspace;
