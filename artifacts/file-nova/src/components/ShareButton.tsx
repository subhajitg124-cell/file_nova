import React from "react";
import { MessageCircle, Copy, Twitter, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
  message?: string;
  filename?: string;
}

export function ShareButton({ url, message, filename }: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const defaultMessage = "I just processed my document using FileNova (Free PDF tools) - https://filenova.in";

  const handleNativeShare = async () => {
    const shareText = message || defaultMessage;
    const shareUrl = url || "https://filenova.in";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FileNova - Free PDF Tools",
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled or native share failed
      }
    }
  };

  const handleWhatsAppShare = () => {
    const shareText = encodeURIComponent(message || defaultMessage);
    const shareUrl = encodeURIComponent(url || "https://filenova.in");
    window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    const textToCopy = url || "https://filenova.in";
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const shareText = encodeURIComponent(message || defaultMessage);
    const shareUrl = encodeURIComponent(url || "https://filenova.in");
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, "_blank", "noopener,noreferrer");
  };

  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="flex items-center gap-2">
      {isMobile && "share" in navigator ? (
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition font-bold text-sm"
          aria-label="Share"
        >
          <MessageCircle className="h-4 w-4" />
          Share
        </button>
      ) : (
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition font-bold text-sm"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </button>
      )}
      
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted transition font-semibold text-sm"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        Copy
      </button>
      
      <button
        onClick={handleTwitterShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card text-foreground hover:bg-muted transition font-semibold text-sm"
        aria-label="Share on Twitter/X"
      >
        <Twitter className="h-4 w-4" />
        X
      </button>
    </div>
  );
}

export default ShareButton;