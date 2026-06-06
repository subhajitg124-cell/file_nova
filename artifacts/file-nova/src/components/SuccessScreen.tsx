import React, { useState } from "react";
import { Download, Check, Copy, Share2, RotateCcw, HelpCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface SuccessScreenProps {
  downloadUrl: string;
  fileName: string;
  originalSize?: number;
  newSize?: number;
  percentSaved?: number;
  onReset: () => void;
}

export function SuccessScreen({
  downloadUrl,
  fileName,
  originalSize,
  newSize,
  percentSaved,
  onReset
}: SuccessScreenProps) {
  const { tText } = useTranslation();
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatSize = (bytes?: number): string => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const blobToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerateLink = async (): Promise<string | null> => {
    if (shareUrl) return shareUrl;
    setIsGenerating(true);
    try {
      let base64Data = "";
      if (downloadUrl.startsWith("blob:")) {
        base64Data = await blobToBase64(downloadUrl);
      } else {
        // If it's already an absolute or relative path, fetch it first
        const res = await fetch(downloadUrl);
        const blob = await res.blob();
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      let mimeType = "application/octet-stream";
      if (fileName.endsWith(".pdf")) mimeType = "application/pdf";
      else if (fileName.endsWith(".png")) mimeType = "image/png";
      else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mimeType = "image/jpeg";
      else if (fileName.endsWith(".zip")) mimeType = "application/zip";

      const token = localStorage.getItem("filenova_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/api/share-file`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fileData: base64Data,
          fileName,
          mimeType
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "LIMIT_EXCEEDED") {
          toast.error("Sharing limit reached! Free users can share up to 3 files daily. Upgrade to Pro for unlimited sharing.");
          return null;
        }
        throw new Error(data.message || "Failed to generate link");
      }

      const data = await response.json();
      setShareUrl(data.shortUrl);
      return data.shortUrl;
    } catch (err) {
      console.error("Link generation error:", err);
      toast.error("Failed to generate shareable link. Please download the file directly.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    const url = await handleGenerateLink();
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Shortened share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = async () => {
    const url = await handleGenerateLink();
    if (url) {
      const message = encodeURIComponent(`Here is the processed document: ${url} (via FileNova)`);
      window.open(`https://wa.me/?text=${message}`, "_blank");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl space-y-6 shadow-xl text-center">
      {/* File Ready Stats */}
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
          <Check className="h-6 w-6 stroke-[3]" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white">
          {tText("File Processed successfully!")}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {fileName}
        </p>
      </div>

      {/* Stats Table */}
      {originalSize && newSize && percentSaved && percentSaved > 0 ? (
        <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs">
          <div>
            <span className="text-gray-400 block uppercase font-bold tracking-wider text-[9px] mb-0.5">Original</span>
            <span className="font-extrabold text-gray-850 dark:text-gray-200">{formatSize(originalSize)}</span>
          </div>
          <div className="border-x border-gray-100 dark:border-gray-800">
            <span className="text-gray-400 block uppercase font-bold tracking-wider text-[9px] mb-0.5">Processed</span>
            <span className="font-extrabold text-gray-850 dark:text-gray-200">{formatSize(newSize)}</span>
          </div>
          <div>
            <span className="text-gray-400 block uppercase font-bold tracking-wider text-[9px] mb-0.5">Reduction</span>
            <span className="font-extrabold text-emerald-500">-{percentSaved}%</span>
          </div>
        </div>
      ) : null}

      {/* Buttons CTAs */}
      <div className="space-y-3">
        <a
          href={downloadUrl}
          download={fileName}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition duration-200 cursor-pointer shadow-glow-indigo active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          {tText("Download File")}
        </a>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyLink}
            disabled={isGenerating}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 border border-gray-250 dark:border-gray-750 rounded-xl font-bold text-xs transition duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? tText("Copied!") : tText("Copy Link")}
          </button>

          <button
            onClick={handleWhatsAppShare}
            disabled={isGenerating}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            <Share2 className="h-3.5 w-3.5" />
            {tText("WhatsApp")}
          </button>
        </div>

        {isGenerating && (
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold animate-pulse">
            Generating secure sharing link...
          </p>
        )}
      </div>

      <div className="border-t border-gray-150 dark:border-gray-750 pt-4">
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl transition duration-200 text-xs cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {tText("Process another file")}
        </button>
      </div>
    </div>
  );
}
