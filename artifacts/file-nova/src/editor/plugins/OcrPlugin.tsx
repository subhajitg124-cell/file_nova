import React from "react";
import { Search, Copy, Download, FileText } from "lucide-react";
import type { EditorPlugin, SectionProps } from "../types";
import { BentoCard } from "../components/BentoCard";
import { PremiumButton } from "../components/PremiumButton";
import { HintCard } from "../components/HintCard";

const languages = [
  { code: "eng", label: "English" },
  { code: "hin", label: "हिन्दी" },
  { code: "ben", label: "বাংলা" },
  { code: "tam", label: "தமிழ்" },
  { code: "tel", label: "తెలుగు" },
  { code: "kan", label: "ಕನ್ನಡ" },
];

const OcrSection: React.FC<SectionProps> = ({ config, onConfigChange, onStatusMessage, onBusy, mode, disabled, file }) => {
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
      onStatusMessage("Text extracted successfully");
    } catch (err: any) {
      onStatusMessage(err.message || "OCR failed");
    } finally { onBusy(false); }
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
    <div className="space-y-3">
      <BentoCard size="sm" hover={false}>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-2.5">Languages</p>
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
                  active
                    ? "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`} disabled={disabled}>
                {lang.label}
              </button>
            );
          })}
        </div>
      </BentoCard>

      <div className="grid grid-cols-2 gap-2">
        <PremiumButton variant="premium" size="sm" icon={<Search className="h-3.5 w-3.5" />} onClick={handleExtract} disabled={disabled || !file} loading={disabled && config.ocrText === undefined}>
          Extract
        </PremiumButton>
        <PremiumButton variant="primary" size="sm" icon={<Copy className="h-3.5 w-3.5" />} onClick={handleCopy} disabled={!config.ocrText}>
          Copy
        </PremiumButton>
      </div>

      <BentoCard size="sm" hover={false} accent={config.ocrText ? "success" : "default"}>
        {config.ocrText ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <FileText className="h-3 w-3" /> Extracted Text
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500">{config.ocrText.length} chars</span>
            </div>
            <textarea value={config.ocrText} onChange={(e) => onConfigChange("ocrText", e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-purple-500 font-mono" disabled={disabled} />
            <PremiumButton variant="primary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={handleDownload}>
              Download Text
            </PremiumButton>
          </div>
        ) : (
          <div className="text-center py-3">
            <FileText className="h-6 w-6 mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Select languages and click Extract</p>
          </div>
        )}
      </BentoCard>

      <HintCard>Multi-language OCR supports Hindi, Bengali, Tamil, Telugu, Kannada, and English. Select one or more languages.</HintCard>
    </div>
  );
};

export const ocrPlugin: EditorPlugin = {
  id: "ocr",
  name: "OCR Scan",
  sections: [
    { id: "ocr", label: "OCR Settings", description: "Extract text from images", icon: <Search className="h-4 w-4" />, component: OcrSection, defaultOpen: true },
  ],
  onSave: async (file) => file,
};
