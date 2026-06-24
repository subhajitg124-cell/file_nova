import React, { useState } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { Search, Sliders, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";

export const OCRScanWorkspace: React.FC = () => {
  const {
    files,
    rawFiles,
    isProcessing: processorProcessing,
    isUploading,
    progress: processorProgress,
    result,
    error,
    handleFilesSelected,
    handleReset: resetProcessor,
    runProcessing,
  } = useToolProcessor("ocr", "ocr");

  // Local configurations
  const [languages, setLanguages] = useState<string[]>(["eng"]);
  const [format, setFormat] = useState<"txt" | "pdf" | "docx">("txt");
  const [mode, setMode] = useState<"fast" | "accurate">("fast");
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [extractedText, setExtractedText] = useState("");
  const [localProcessing, setLocalProcessing] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  const isReady = files.length > 0;

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang && l !== "eng") // eng is fallback, don't remove if it's the last one
        : [...prev, lang]
    );
  };

  const handleProcess = async () => {
    if (rawFiles.length === 0) return;

    if (mode === "accurate") {
      const options = {
        languages,
        format,
        preserveLayout,
      };
      await runProcessing(options);
      return;
    }

    // Client-side Fast Tesseract.js Mode
    setLocalProcessing(true);
    setLocalProgress(10);
    
    try {
      const file = rawFiles[0];
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(languages.join("+"));
      setLocalProgress(50);
      const { data: { text } } = await worker.recognize(file);
      setLocalProgress(90);
      
      setExtractedText(text);
      
      // Export as a text blob result
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      await runProcessing({}, blob);
      
      await worker.terminate();
    } catch (err: any) {
      toast.error(err.message || "Client-side OCR processing failed.");
    } finally {
      setLocalProcessing(false);
      setLocalProgress(0);
    }
  };

  const handleReset = () => {
    setExtractedText("");
    resetProcessor();
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Multilingual language selector chips */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">OCR Languages</label>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "eng", label: "English" },
            { id: "hin", label: "Hindi (हिन्दी)" },
            { id: "ben", label: "Bengali (বাংলা)" },
            { id: "tam", label: "Tamil (தமிழ்)" },
            { id: "tel", label: "Telugu (తెలుగు)" },
            { id: "kan", label: "Kannada (ಕನ್ನಡ)" },
          ].map((lang) => {
            const active = languages.includes(lang.id);
            return (
              <button
                key={lang.id}
                onClick={() => toggleLanguage(lang.id)}
                className={`py-2 px-3.5 rounded-xl border text-xs font-bold hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                  active
                    ? "border-purple-500 bg-purple-500/10 text-white"
                    : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Engine selection: Fast vs Accurate */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">OCR Engine Mode</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "fast", label: "Fast (Browser-local)", desc: "100% private, client-side" },
            { id: "accurate", label: "Accurate (Premium)", desc: "Server AI layout preservation" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as any)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                mode === item.id
                  ? "border-purple-500 bg-purple-500/10 text-white"
                  : "border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-300"
              }`}
            >
              <span className="text-xs font-black">{item.label}</span>
              <span className="text-[9px] text-slate-500 mt-1">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 font-medium">Output format</label>
        <div className="flex gap-4">
          {["TXT (Plain Text)", "PDF (Searchable)", "DOCX (Word)"].map((label, idx) => {
            const key = idx === 0 ? "txt" : idx === 1 ? "pdf" : "docx";
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                <input
                  type="radio"
                  name="format"
                  checked={format === key}
                  onChange={() => setFormat(key as any)}
                  className="text-purple-600 focus:ring-0 cursor-pointer"
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Advanced option checkboxes */}
      <div className="space-y-3 pt-3 border-t border-white/[0.05]">
        <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-300">
          <input
            type="checkbox"
            checked={preserveLayout}
            onChange={(e) => setPreserveLayout(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 text-purple-600 focus:ring-0 cursor-pointer"
          />
          <span>Preserve column structures and alignments</span>
        </label>
      </div>
    </div>
  );

  const previewPanel = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Column 1: Scanned image preview */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Source Document Preview</h4>
        <PreviewPanel files={rawFiles} slug="ocr" />
      </div>

      {/* Column 2: Editable text area */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Extracted Transcription</h4>
        {extractedText ? (
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full min-h-[260px] bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
            placeholder="Parsed text will display here..."
          />
        ) : (
          <div className="w-full min-h-[260px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
            <FileText className="h-8 w-8 text-slate-600 mb-2 stroke-[1.5]" />
            <span>Transcription empty. Click &quot;Process Files&quot; to parse text layers.</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ToolWorkspace
      toolName="OCR Scan to Text"
      toolDescription="Extract text from scanned PDF documents or camera images with multilingual Hindi and Bengali support."
      toolIcon={<Search className="h-5 w-5" />}
      accentColor="purple"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={localProcessing || processorProcessing}
      isUploading={isUploading}
      progress={localProgress || processorProgress}
      isReady={isReady}
      resultFile={result}
      onReset={handleReset}
      maxFiles={1}
      acceptedTypes={["image/*", ".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
};
export default OCRScanWorkspace;
