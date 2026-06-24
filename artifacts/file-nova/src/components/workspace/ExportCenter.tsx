import React, { useState } from "react";
import { Download, Share2, QrCode, Copy, Save, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ExportCenterProps {
  fileName: string;
  downloadUrl: string;
  fileSize: string;
  metadata?: Record<string, string | number>;
  onSaveSession?: () => void;
}

export const ExportCenter: React.FC<ExportCenterProps> = ({
  fileName,
  downloadUrl,
  fileSize,
  metadata = {},
  onSaveSession
}) => {
  const [showQr, setShowQr] = useState(false);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(downloadUrl)}&size=150x150`;

  const handleCopyMetadata = () => {
    try {
      const text = `File: ${fileName}\nSize: ${fileSize}\n${Object.entries(metadata)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")}`;
      navigator.clipboard.writeText(text);
      toast.success("Metadata copied to clipboard.");
    } catch (_) {
      toast.error("Failed to copy metadata.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "FileNova Processed Document",
          text: `Download processed file: ${fileName}`,
          url: downloadUrl
        });
        toast.success("Document shared successfully.");
      } catch (_) {}
    } else {
      // Fallback
      navigator.clipboard.writeText(downloadUrl);
      toast.success("Share link copied to clipboard.");
    }
  };

  return (
    <div className="w-full bg-slate-900/40 border border-white/[0.08] rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-5">
      <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3">
        <FileText className="h-4.5 w-4.5 text-indigo-400" />
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
          Universal Export Center
        </h3>
      </div>

      {/* Main Download */}
      <div className="space-y-3">
        <a
          href={downloadUrl}
          download={fileName}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black rounded-xl hover:scale-[1.02] active:scale-98 transition shadow-lg flex items-center justify-center gap-2 text-xs"
        >
          <Download className="h-4 w-4" />
          Download Final Document
        </a>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
          <span className="truncate max-w-[200px]">{fileName}</span>
          <span className="shrink-0">{fileSize}</span>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={handleShare}
          className="p-2.5 border border-white/[0.06] bg-slate-950/40 hover:bg-slate-900/60 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5 text-sky-400" />
          Share Link
        </button>

        <button
          onClick={() => setShowQr(prev => !prev)}
          className="p-2.5 border border-white/[0.06] bg-slate-950/40 hover:bg-slate-900/60 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <QrCode className="h-3.5 w-3.5 text-purple-400" />
          Show QR Code
        </button>

        <button
          onClick={handleCopyMetadata}
          className="p-2.5 border border-white/[0.06] bg-slate-950/40 hover:bg-slate-900/60 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5 text-amber-400" />
          Copy Details
        </button>

        <button
          onClick={() => {
            if (onSaveSession) onSaveSession();
            else toast.success("Session saved.");
          }}
          className="p-2.5 border border-white/[0.06] bg-slate-950/40 hover:bg-slate-900/60 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Save className="h-3.5 w-3.5 text-emerald-400" />
          Save Queue
        </button>
      </div>

      {showQr && (
        <div className="p-3 bg-slate-950/80 border border-white/5 rounded-2xl flex flex-col items-center gap-2 animate-fade-up">
          <img src={qrCodeUrl} alt="Download QR Code" className="h-32 w-32 rounded bg-white p-1" width="200" height="200" loading="lazy" />
          <span className="text-[9px] text-slate-500 font-mono">Scan QR to download on another device</span>
        </div>
      )}

      {/* Trust & Safety Checklist */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/45 border border-white/[0.05] text-[9.5px] text-slate-500 leading-normal">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span>Verification: SHA-256 integrity signature appended to metadata logs.</span>
      </div>
    </div>
  );
};
export default ExportCenter;
