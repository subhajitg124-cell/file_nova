/**
 * Aadhaar Masking Component
 * Detects and masks first 8 digits of Aadhaar numbers before export
 */

import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Loader,
  AlertTriangle,
  CheckCircle2,
  IdCard,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

interface DetectResult {
  success: boolean;
  found: boolean;
  aadhaar: string;
  confidence: number;
}

type MaskTab = "file" | "text";

export function AadhaarMasking() {
  const [activeTab, setActiveTab] = useState<MaskTab>("file");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [originalNumber, setOriginalNumber] = useState("");
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const extractAadhaar = (text: string): string | null => {
    const match = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
    return match ? match[0] : null;
  };

  const handleDetectAndMask = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter text or an Aadhaar number");
      return;
    }

    const raw = extractAadhaar(inputText);
    if (raw) setOriginalNumber(raw);

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/premium/aadhaar/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) throw new Error("Aadhaar detection failed");

      const data: DetectResult = await response.json();
      setResult(data);

      if (!raw && data.aadhaar) {
        // Extract original from the masked version for display
        setOriginalNumber(
          inputText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)?.[0] || "1234 5678 9012"
        );
      }

      if (data.found) {
        toast.success("Aadhaar detected and masked successfully");
      } else {
        toast.info("No Aadhaar number found in the text");
      }
    } catch (error) {
      toast.error("Failed to detect Aadhaar number");
    } finally {
      setLoading(false);
    }
  };

  const copyMasked = async () => {
    if (!result?.aadhaar) return;
    try {
      await navigator.clipboard.writeText(result.aadhaar);
      toast.success("Masked Aadhaar copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileMask = async () => {
    if (!file) return;
    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/premium/aadhaar/mask`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Aadhaar file masking failed");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `masked-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success("Aadhaar file masked and downloaded successfully!");
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to mask Aadhaar file. Please try again.");
    } finally {
      setFileUploading(false);
    }
  };

  const confidenceColor =
    (result?.confidence ?? 0) > 0.9
      ? "text-emerald-500"
      : (result?.confidence ?? 0) > 0.7
        ? "text-amber-500"
        : "text-destructive";

  const confidenceBg =
    (result?.confidence ?? 0) > 0.9
      ? "bg-emerald-500/10 border-emerald-500/30"
      : (result?.confidence ?? 0) > 0.7
        ? "bg-amber-500/10 border-amber-500/30"
        : "bg-destructive/10 border-destructive/30";

  return (
    <div className="space-y-4">
      {/* Title block */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
          <IdCard className="h-5 w-5 text-rose-500" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Privacy tool
          </p>
          <h3 className="text-base font-black text-foreground">Aadhaar Masking</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-border/60 bg-muted/40 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("file")}
          className={`flex-grow py-2 text-xs font-bold rounded-lg transition cursor-pointer ${activeTab === "file" ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
        >
          Upload PDF/Image
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`flex-grow py-2 text-xs font-bold rounded-lg transition cursor-pointer ${activeTab === "text" ? "bg-card text-foreground shadow-sm border border-border/40" : "text-muted-foreground hover:text-foreground"}`}
        >
          Paste Text
        </button>
      </div>

      {/* File Upload Tab */}
      {activeTab === "file" && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-premium space-y-4">
          <p className="text-xs text-muted-foreground">
            Upload Aadhaar PDF or image (JPEG/PNG). Our AI model automatically detects, masks the first 8 digits of the Aadhaar number, and returns a secured PDF for download.
          </p>

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border hover:border-primary/50 transition rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 bg-background/30 cursor-pointer relative"
            >
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Drag & drop your Aadhaar here</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, JPEG, or PNG up to 15MB</p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-2 border border-border rounded-xl text-xs font-bold text-foreground hover:bg-muted"
              >
                Browse File
              </button>
            </div>
          ) : (
            <div className="border border-border rounded-xl p-4 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate max-w-[200px]" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {parseFloat((file.size / 1024 / 1024).toFixed(2))} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="h-7 w-7 rounded-lg border border-border hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {file && (
            <button
              onClick={handleFileMask}
              disabled={fileUploading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-black py-3.5 text-sm transition disabled:opacity-50 shadow-glow"
            >
              {fileUploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Masking Aadhaar file…
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Mask & Download Secured PDF
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Text Detection Tab */}
      {activeTab === "text" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-premium">
            <p className="text-xs text-muted-foreground mb-3">
              Paste raw text containing an Aadhaar number. The first 8 digits will be masked (XXXX XXXX ####) in-line for safe sharing.
            </p>

            <textarea
              id="aadhaar-input"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setResult(null);
              }}
              placeholder="Enter Aadhaar number or paste text containing one…
e.g. 1234 5678 9012 or full OCR text"
              className="w-full h-28 rounded-xl border border-border bg-background/60 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
            />

            <button
              id="aadhaar-detect-btn"
              onClick={handleDetectAndMask}
              disabled={loading || !inputText.trim()}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-black py-3 text-sm transition disabled:opacity-50 shadow-glow-sm"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Detecting…
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Detect & Mask Aadhaar
                </>
              )}
            </button>
          </div>

          {/* Results: Before / After */}
          {result?.found && (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Before */}
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-black text-destructive">Before (Exposed)</p>
                </div>
                <div className="rounded-xl border border-destructive/20 bg-card p-4 text-center">
                  <p className="font-mono text-2xl font-black tracking-wider">
                    <span className="text-destructive bg-destructive/10 rounded px-1">
                      {originalNumber.replace(/\s/g, "").slice(0, 4)}
                    </span>{" "}
                    <span className="text-destructive bg-destructive/10 rounded px-1">
                      {originalNumber.replace(/\s/g, "").slice(4, 8)}
                    </span>{" "}
                    <span className="text-foreground">
                      {originalNumber.replace(/\s/g, "").slice(8, 12)}
                    </span>
                  </p>
                  <p className="text-[11px] text-destructive mt-2 font-bold">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    First 8 digits are visible — not safe to share
                  </p>
                </div>
              </div>

              {/* After */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <EyeOff className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    After (Masked)
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-card p-4 text-center">
                  <p className="font-mono text-2xl font-black tracking-wider">
                    <span className="text-muted-foreground">XXXX</span>{" "}
                    <span className="text-muted-foreground">XXXX</span>{" "}
                    <span className="text-foreground">
                      {result.aadhaar.replace(/[Xx\s]/g, "").slice(-4)}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold">
                    <ShieldCheck className="h-3 w-3 inline mr-1" />
                    Safe to share on WhatsApp, portals & forms
                  </p>
                </div>

                <button
                  id="aadhaar-copy-btn"
                  onClick={copyMasked}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold py-2.5 text-sm transition hover:bg-emerald-500/20"
                >
                  <Copy className="h-4 w-4" />
                  Copy Masked Number
                </button>
              </div>
            </div>
          )}

          {/* Confidence */}
          {result?.found && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-bold text-foreground">Detection result</span>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black ${confidenceBg} ${confidenceColor}`}
              >
                {Math.round((result.confidence ?? 0) * 100)}% confidence
              </span>
            </div>
          )}

          {/* Not found */}
          {result && !result.found && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">No Aadhaar number found</p>
                <p className="text-xs text-muted-foreground">
                  Make sure the text contains a 12-digit Aadhaar number (XXXX XXXX XXXX).
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
