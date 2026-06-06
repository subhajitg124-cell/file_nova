import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, Copy, Check, RotateCcw, AlertTriangle, FileText, FileType, Pencil, Eye, Share2, X } from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';
import { PdfResultPreview } from './PdfResultPreview';
import { QuickShareButton } from '@/components/WhatsAppShare';
import { ShareButton } from '@/components/ShareButton';
import { createUpiLink } from '@/lib/upi';
import { UpiSupportModal } from '@/components/UpiSupportModal';
import { SuccessScreen } from '@/components/SuccessScreen';

const getDefaultFilename = (operation: string, format?: string): string => {
  switch (operation) {
    case 'merge_docs':  return format === 'pdf' ? 'merged.pdf' : 'merged.docx';
    case 'merge':       return 'merged.pdf';
    case 'compress':    return 'compressed.pdf';
    case 'split':       return 'split.pdf';
    case 'convert':     return 'converted.' + (format || 'pdf');
    case 'pdf_rotate':  return 'rotated.pdf';
    case 'pdf_delete':  return 'edited.pdf';
    case 'pdf_watermark': return 'watermarked.pdf';
    case 'pdf_page_numbers': return 'numbered.pdf';
    case 'pdf_reorder': return 'reordered.pdf';
    case 'pdf_annotate': return 'annotated.pdf';
    case 'pdf_redact':  return 'redacted.pdf';
    case 'pdf_sign':    return 'signed.pdf';
    case 'pdf_unlock':  return 'unlocked.pdf';
    case 'pdf_protect': return 'protected.pdf';
    case 'pdf_crop':    return 'cropped.pdf';
    case 'pdf_insert_link':  return 'linked.pdf';
    case 'pdf_insert_image': return 'with-images.pdf';
    case 'pdf_insert_shape': return 'with-shapes.pdf';
    case 'pdf_ocr':     return 'ocr.pdf';
    case 'pdf_compare': return 'compare.pdf';
    case 'scan_to_pdf': return 'scan.pdf';
    case 'images_to_pdf': return 'images.pdf';
    case 'remove_bg':   return 'no-background.png';
    case 'image_crop':  return 'cropped.png';
    case 'image_rotate': return 'rotated.png';
    case 'image_watermark': return 'watermarked.png';
    case 'live_image_editor': return 'edited-image.' + (format || 'png');
    case 'live_video_editor': return 'edited-video.webm';
    case 'trim':        return 'trimmed-video.webm';
    case 'video_to_gif': return 'clip.gif';
    case 'video_to_audio': return 'audio.mp3';
    case 'compress_audio': return 'compressed-audio.mp3';
    case 'resize':      return 'resized.' + (format || 'png');
    case 'enhance':     return 'enhanced.' + (format || 'jpg');
    case 'to_ico':      return 'icon.ico';
    case 'svg_to_png':  return 'converted.png';
    case 'html_to_zip': return 'website.zip';
    default:            return 'output.' + (format || 'file');
  }
};

export const DownloadHub: React.FC = () => {
  const { downloadUrl, savings, clearStore, ttlRemaining, setTtlRemaining, operationOptions } = useFileStore();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [customFilename, setCustomFilename] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showChaiModal, setShowChaiModal] = useState(false);
  const [upiOpen, setUpiOpen] = useState(false);
  const [upiAmount, setUpiAmount] = useState(10);
  const [upiNote, setUpiNote] = useState("Chai for FileNova");

  const triggerUpi = (e: React.MouseEvent, amount: number, note: string) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
      setUpiAmount(amount);
      setUpiNote(note);
      setUpiOpen(true);
      setShowChaiModal(false);
    }
  };

  useEffect(() => {
    if (downloadUrl) {
      try {
        const lastShownStr = localStorage.getItem("filenova-chai-modal-last-shown");
        const now = Date.now();
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        if (!lastShownStr || now - parseInt(lastShownStr, 10) > oneWeekMs) {
          setShowChaiModal(true);
          localStorage.setItem("filenova-chai-modal-last-shown", String(now));
        }
      } catch (_) {}
    }
  }, [downloadUrl]);

  const operation = operationOptions?.operation || '';
  const format = operationOptions?.merge_docs_format || operationOptions?.target_format || operationOptions?.resize_format || '';

  useEffect(() => {
    if (downloadUrl) {
      setCustomFilename(getDefaultFilename(operation, format));
    }
  }, [downloadUrl, operation, format]);

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
    a.download = customFilename.trim() || getDefaultFilename(operation, format);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTtlRemaining(300);
    setCountdown(300);
  };

  const handleCopyLink = () => {
    const fullUrl = downloadUrl.startsWith('blob:') ? downloadUrl : `${window.location.origin}${downloadUrl}`;
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

  const isMergeDocs = operation === 'merge_docs';
  const mergeDocsFormat = operationOptions?.merge_docs_format || 'docx';

  return (
    <div className="w-full max-w-md mx-auto">
      {linkExpired ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-premium p-8 text-center space-y-4">
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
        <SuccessScreen
          downloadUrl={downloadUrl}
          fileName={customFilename.trim() || getDefaultFilename(operation, format)}
          originalSize={savings?.originalSize}
          newSize={savings?.newSize}
          percentSaved={savings?.percent}
          onReset={clearStore}
        />
      )}

      {/* Once-a-week Chai Donation Modal */}
      {showChaiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-primary/20 bg-card p-6 shadow-premium relative overflow-hidden text-center">
            <button
              onClick={() => setShowChaiModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="mx-auto h-16 w-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/20 mb-4">
              <span className="text-3xl leading-none">☕</span>
            </div>

            <h3 className="text-xl font-black text-foreground">Support FileNova</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              FileNova has processed your files securely and quickly! If we saved you time, consider buying us a cup of chai (₹10) to support server costs.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href={createUpiLink(10, "Chai for FileNova")}
                onClick={(e) => {
                  triggerUpi(e, 10, "Chai for FileNova");
                  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    setShowChaiModal(false);
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 text-sm font-black shadow-glow cursor-pointer transition"
              >
                <span>☕ Buy Chai (₹10)</span>
              </a>
              <button
                onClick={() => setShowChaiModal(false)}
                className="w-full py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-bold transition cursor-pointer"
              >
                Maybe next time
              </button>
            </div>
          </div>
        </div>
      )}

      <UpiSupportModal
        isOpen={upiOpen}
        onClose={() => setUpiOpen(false)}
        amount={upiAmount}
        note={upiNote}
      />
    </div>
  );
}

export default DownloadHub;
