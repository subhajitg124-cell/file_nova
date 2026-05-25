import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, Copy, Check, RotateCcw, AlertTriangle, FileText, FileType } from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';

export const DownloadHub: React.FC = () => {
  const { downloadUrl, savings, clearStore, ttlRemaining, setTtlRemaining, operationOptions } = useFileStore();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (ttlRemaining !== null) setCountdown(Math.round(ttlRemaining));
  }, [ttlRemaining]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev > 1) return prev - 1;
        clearInterval(interval);
        setTtlRemaining(0);
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, setTtlRemaining]);

  if (!downloadUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTtlRemaining(300);
    setCountdown(300);
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${downloadUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const linkExpired = countdown !== null && countdown <= 0;

  const isMergeDocs = operationOptions?.operation === 'merge_docs';
  const mergeDocsFormat = operationOptions?.merge_docs_format || 'docx';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-premium">

        {linkExpired ? (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto h-14 w-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Link expired</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Temporary files are permanently deleted after expiration for your privacy.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">File ready!</h2>
                <p className="text-xs text-muted-foreground">Processing complete — your file is ready to save</p>
              </div>
            </div>

            {isMergeDocs && (
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                {mergeDocsFormat === 'pdf'
                  ? <FileText className="h-4 w-4 text-red-400 shrink-0" />
                  : <FileType className="h-4 w-4 text-emerald-400 shrink-0" />}
                <span className="text-sm font-semibold text-foreground">
                  Merged as {mergeDocsFormat === 'pdf' ? 'PDF document' : 'Word document (.docx)'}
                </span>
              </div>
            )}

            {savings && savings.percent > 0 && (
              <div className="grid grid-cols-3 gap-2 p-3.5 bg-muted/40 border border-border rounded-xl text-sm">
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Before</span>
                  <span className="font-bold text-foreground">{formatSize(savings.originalSize)}</span>
                </div>
                <div className="text-center space-y-0.5 border-x border-border">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">After</span>
                  <span className="font-bold text-foreground">{formatSize(savings.newSize)}</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Saved</span>
                  <span className="font-bold text-emerald-500">-{savings.percent}%</span>
                </div>
              </div>
            )}

            {countdown !== null && (
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>Link expires in {formatTime(countdown)}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
              >
                <Download className="h-4 w-4" />
                Download file
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm border border-border hover:bg-muted transition-all"
                aria-label="Copy download link"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Link copied!' : 'Copy shareable link'}
              </button>
            </div>
          </div>
        )}

        <div className="px-6 pb-5 border-t border-border pt-4">
          <button
            onClick={clearStore}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground font-semibold rounded-xl transition-colors text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Process another file
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadHub;
