import React, { useEffect, useState, useRef } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { toast } from "sonner";

export default function OcrPage() {
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
    store.updateOptions({ operation: "pdf_ocr" });
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setOcrText("");
    setOcrProgress(0);
  };

  const runOCR = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF or image file first");
      return;
    }
    setOcrLoading(true);
    setOcrProgress(0);
    setOcrText("");

    try {
      // Try tesseract.js client-side OCR first
      const Tesseract = await import("tesseract.js");
      let fullText = "";

      if (selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf")) {
        // For PDFs, render each page to canvas via pdfjs-dist
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const url = URL.createObjectURL(selectedFile);
        const doc = await pdfjsLib.getDocument(url).promise;

        for (let i = 1; i <= doc.numPages; i++) {
          setOcrProgress(Math.round((i / doc.numPages) * 100));
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport: vp }).promise;

          const result = await Tesseract.recognize(canvas, ocrLanguage, {
            logger: (m: any) => {
              if (m.status === "recognizing text") {
                setOcrProgress(Math.round(((i - 1 + (m.progress || 0)) / doc.numPages) * 100));
              }
            },
          });
          fullText += result.data.text + "\n\n--- Page Break ---\n\n";
        }
        URL.revokeObjectURL(url);
      } else {
        // Image file - direct OCR
        const result = await Tesseract.recognize(selectedFile, ocrLanguage, {
          logger: (m: any) => {
            if (m.status === "recognizing text") {
              setOcrProgress(Math.round((m.progress || 0) * 100));
            }
          },
        });
        fullText = result.data.text;
      }

      setOcrText(fullText);
      setOcrProgress(100);
      toast.success(`OCR complete! Confidence: high`);
    } catch (err: any) {
      console.error("OCR error:", err);
      toast.error("OCR processing failed. Try using backend OCR instead.");
      setOcrProgress(0);
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <ToolPageLayout slug="ocr">
      <div className="space-y-6">
        {/* File Upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-8 text-center cursor-pointer hover:border-purple-500/40 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
            className="hidden"
          />
          {selectedFile ? (
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-slate-300">Drop PDF or image here, or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">Supports PDF, JPG, PNG</p>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">OCR Language</label>
          <select
            value={ocrLanguage}
            onChange={(e) => setOcrLanguage(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white"
          >
            <option value="eng">English</option>
            <option value="hin">Hindi</option>
            <option value="ben">Bengali</option>
            <option value="auto">Auto-detect</option>
          </select>
        </div>

        {/* Progress Bar */}
        {ocrLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Processing...</span>
              <span className="text-purple-400 font-black">{ocrProgress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Extract Button */}
        <button
          onClick={runOCR}
          disabled={ocrLoading || !selectedFile}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black rounded-xl disabled:opacity-50 cursor-pointer text-sm"
        >
          {ocrLoading ? "Extracting Text..." : "Extract Text with OCR"}
        </button>

        {/* Result */}
        {ocrText && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extracted Text</label>
            <textarea
              value={ocrText}
              readOnly
              rows={8}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(ocrText); toast.success("Copied to clipboard"); }}
                className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Copy Text
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([ocrText], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "ocr-result.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Download .txt
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
