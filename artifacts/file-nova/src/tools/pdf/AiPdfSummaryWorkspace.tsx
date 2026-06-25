import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Sparkles, Languages, FileText } from "lucide-react";

export const AiPdfSummaryWorkspace: React.FC = () => {
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
  } = useToolProcessor("ai-pdf-summary", "edit");

  const [summaryLength, setSummaryLength] = useState<"short" | "medium" | "detailed">("medium");
  const [language, setLanguage] = useState("en");
  const [focusArea, setFocusArea] = useState("general");

  const isReady = files.length > 0;

  const handleProcess = async () => {
    await runProcessing({ summaryLength, language, focusArea });
  };

  const configPanel = (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">AI PDF Summary</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Get an intelligent summary of your PDF document. Our AI extracts key points, main ideas, and important details.
          </p>
        </div>
      </div>

      {/* Summary Length */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Summary Length</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "short", label: "Brief", desc: "Key points only" },
            { id: "medium", label: "Standard", desc: "Balanced summary" },
            { id: "detailed", label: "Detailed", desc: "Comprehensive" },
          ].map((len) => (
            <button
              key={len.id}
              onClick={() => setSummaryLength(len.id as any)}
              className={`p-3.5 rounded-2xl border text-left hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                summaryLength === len.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-muted text-foreground/80"
              }`}
            >
              <h4 className="text-xs font-bold leading-none">{len.label}</h4>
              <p className="text-[9px] text-muted-foreground mt-1">{len.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Languages className="h-3.5 w-3.5 text-primary" />
          Summary Language
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "en", label: "English" },
            { id: "hi", label: "हिन्दी" },
            { id: "mixed", label: "Mixed" },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                language === lang.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-muted text-foreground/80"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Area */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Focus Area</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "general", label: "General Summary", desc: "Overall overview" },
            { id: "legal", label: "Legal Focus", desc: "Key clauses & obligations" },
            { id: "academic", label: "Academic Focus", desc: "Research & findings" },
            { id: "business", label: "Business Focus", desc: "Decisions & action items" },
          ].map((area) => (
            <button
              key={area.id}
              onClick={() => setFocusArea(area.id)}
              className={`p-3 rounded-2xl border text-left hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                focusArea === area.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:bg-muted text-foreground/80"
              }`}
            >
              <h4 className="text-xs font-bold leading-none">{area.label}</h4>
              <p className="text-[9px] text-muted-foreground mt-1">{area.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-3 text-xs text-muted-foreground">
        <p className="font-bold text-foreground/80">AI-Powered Analysis</p>
        <p className="text-[10px] mt-1">Our AI reads and understands your document to create an accurate, context-aware summary.</p>
      </div>
    </div>
  );

  const previewPanel = (
    <PreviewPanel files={rawFiles} slug="ai-pdf-summary" options={{ summaryLength, language, focusArea }} />
  );

  return (
    <ToolWorkspace
      toolName="AI PDF Summary"
      toolDescription="Get intelligent summaries of your PDF documents using AI."
      toolIcon={<Sparkles className="h-5 w-5" />}
      accentColor="violet"
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

export default AiPdfSummaryWorkspace;