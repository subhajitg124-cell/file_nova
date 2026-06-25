import React from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileText, ArrowRight } from "lucide-react";

export const WordToPdfWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing,
    isUploading,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
  } = useToolProcessor("word-to-pdf", "convert");

  const isReady = files.length > 0;

  const handleProcess = async () => {
    await runProcessing({});
  };

  const configPanel = (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">Word to PDF Conversion</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Upload your Word document (.docx) and we'll convert it to a clean, professional PDF. Formatting, images, and layout are preserved.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Input Format</p>
          <p className="text-sm font-bold text-foreground mt-1">.docx</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Output Format</p>
          <p className="text-sm font-bold text-primary mt-1">.pdf</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-foreground/80 font-bold">Supported:</span>
        <span>Microsoft Word (.docx), Rich Text (.rtf)</span>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="word-to-pdf" options={{}} />
  );

  return (
    <ToolWorkspace
      toolName="Word to PDF"
      toolDescription="Convert Word documents to professional PDF files instantly."
      toolIcon={<FileText className="h-5 w-5" />}
      accentColor="blue"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      isUploading={isUploading}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleReset}
      maxFiles={1}
      acceptedTypes={[".docx", ".rtf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};

export default WordToPdfWorkspace;