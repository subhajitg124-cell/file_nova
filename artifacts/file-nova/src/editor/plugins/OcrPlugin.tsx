import React from "react";
import { Search, Copy, Download } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";

const OcrSection: React.FC<SectionProps> = ({ config, onConfigChange, onStatusMessage, onBusy, disabled, file }) => {
  const languages = [
    { code: "eng", label: "English" },
    { code: "hin", label: "Hindi" },
    { code: "ben", label: "Bengali" },
    { code: "tam", label: "Tamil" },
    { code: "tel", label: "Telugu" },
    { code: "kan", label: "Kannada" },
  ];
  const handleExtract = async () => {
    if (!file) return;
    onBusy(true);
    onStatusMessage("Extracting text...");
    try {
      const { createWorker } = await import("tesseract.js");
      const langStr = (config.ocrLanguages || ["eng"]).join("+");
      const worker = await createWorker(langStr);
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      onConfigChange("ocrText", text);
      onStatusMessage("Text extracted");
    } catch (err: any) {
      onStatusMessage(err.message || "OCR failed");
    } finally {
      onBusy(false);
    }
  };
  const handleCopy = () => {
    if (config.ocrText) navigator.clipboard.writeText(config.ocrText);
    onStatusMessage("Copied to clipboard");
  };
  const handleDownload = () => {
    if (!config.ocrText) return;
    const blob = new Blob([config.ocrText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "extracted-text.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Languages</label>
        <div className="flex flex-wrap gap-1.5">
          {languages.map((lang) => {
            const active = (config.ocrLanguages || ["eng"]).includes(lang.code);
            return (
              <button key={lang.code} type="button" onClick={() => {
                const current = config.ocrLanguages || ["eng"];
                const next = active ? current.filter((c: string) => c !== lang.code) : [...current, lang.code];
                onConfigChange("ocrLanguages", next.length ? next : ["eng"]);
              }}
                className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                  active ? "border-purple-500 bg-purple-500/10 text-white" : "border-white/10 bg-slate-950 text-slate-400 hover:text-white"
                }`} disabled={disabled}>
                {lang.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={handleExtract}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-500 py-2.5 text-xs font-black text-white hover:bg-purple-400 transition cursor-pointer shadow-md" disabled={disabled || !file}>
          <Search className="h-3.5 w-3.5" /> Extract
        </button>
        <button type="button" onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-900 transition cursor-pointer" disabled={!config.ocrText}>
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
      </div>
      <textarea value={config.ocrText || ""} onChange={(e) => onConfigChange("ocrText", e.target.value)}
        rows={6}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-xs text-white outline-none focus:border-purple-500 font-mono"
        placeholder="Extracted text appears here..." disabled={disabled} />
      <button type="button" onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-black text-slate-950 hover:bg-slate-200 transition cursor-pointer" disabled={!config.ocrText}>
        <Download className="h-3.5 w-3.5" /> Download Text
      </button>
    </div>
  );
};

export const ocrPlugin: EditorPlugin = {
  id: "ocr",
  name: "OCR Scan",
  sections: [
    { id: "ocr", label: "OCR Settings", icon: <Search className="h-4 w-4" />, component: OcrSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
