import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileText } from "lucide-react";

export const PdfToWordWorkspace: React.FC = () => {
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
  } = useToolProcessor("pdf-to-word", "convert");

  const [outputFormat, setOutputFormat] = useState<"docx" | "rtf">("docx");

  const isReady = files.length > 0;

  const handleProcess = async () => {
    await runProcessing({ outputFormat });
  };

  const configPanel = (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">PDF to Word Conversion</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Convert your PDF files into fully editable Word documents. Text, images, and formatting are preserved for easy editing.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Output Format</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "docx", label: "Word (.docx)", desc: "Microsoft Word" },
            { id: "rtf", label: "Rich Text (.rtf)", desc: "Universal format" },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setOutputFormat(fmt.id as any)}
              className={`p-3.5 rounded-2xl border text-left hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                outputFormat === fmt.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-muted text-foreground/80"
              }`}
            >
              <h4 className="text-xs font-bold leading-none">{fmt.label}</h4>
              <p className="text-[9px] text-muted-foreground mt-1">{fmt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-foreground/80 font-bold">Tip:</span>
        <span>Scanned PDFs may require OCR for text extraction</span>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="pdf-to-word" options={{ outputFormat }} />
  );

  return (
    <ToolWorkspace
      toolName="PDF to Word"
      toolDescription="Convert PDF files to editable Word documents."
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
      acceptedTypes={[".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};

export default PdfToWordWorkspace;