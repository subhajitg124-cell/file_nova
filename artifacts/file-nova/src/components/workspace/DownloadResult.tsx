import React, { useState } from "react";
import { Download, Share2, Copy, Check, Star, RefreshCw, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DownloadResultProps {
  fileName: string;
  fileSize: string; // Already formatted string, e.g. "1.2 MB"
  downloadUrl: string;
  savings?: string; // e.g. "62% smaller" or similar
  onReset: () => void;
  accentColor: string;
}

const THEME_BUTTONS: Record<string, string> = {
  violet: "from-violet-500 to-purple-600 shadow-violet-500/20 hover:shadow-violet-500/35",
  blue:   "from-blue-500 to-cyan-500 shadow-blue-500/20 hover:shadow-blue-500/35",
  emerald:"from-emerald-500 to-teal-500 shadow-emerald-500/20 hover:shadow-emerald-500/35",
  amber:  "from-amber-500 to-orange-500 shadow-amber-500/20 hover:shadow-amber-500/35",
  red:    "from-red-500 to-rose-600 shadow-red-500/20 hover:shadow-red-500/35",
  pink:   "from-pink-500 to-fuchsia-500 shadow-pink-500/20 hover:shadow-pink-500/35",
  orange: "from-orange-500 to-amber-600 shadow-orange-500/20 hover:shadow-orange-500/35",
  indigo: "from-indigo-500 to-blue-600 shadow-indigo-500/20 hover:shadow-indigo-500/35",
  lime:   "from-lime-500 to-green-600 shadow-lime-500/20 hover:shadow-lime-500/35",
  purple: "from-purple-500 to-pink-600 shadow-purple-500/20 hover:shadow-purple-500/35",
  sky:    "from-sky-500 to-blue-500 shadow-sky-500/20 hover:shadow-sky-500/35",
  cyan:   "from-cyan-500 to-teal-600 shadow-cyan-500/20 hover:shadow-cyan-500/35",
};

export const DownloadResult: React.FC<DownloadResultProps> = ({
  fileName,
  fileSize,
  downloadUrl,
  savings,
  onReset,
  accentColor,
}) => {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [copiedState, setCopiedState] = useState(false);

  const btnGradient = THEME_BUTTONS[accentColor] || THEME_BUTTONS.violet;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + downloadUrl);
    setCopiedState(true);
    toast.success("Download link copied to clipboard!");
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `I processed my file "${fileName}" on FileNova! Try it out!`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + window.location.origin + downloadUrl)}`;
    window.open(shareUrl, "_blank");
  };

  const handleRate = (stars: number) => {
    setRating(stars);
    toast.success("Thank you for your rating!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-2xl"
    >
      {/* Accent glowing boundary */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${btnGradient} opacity-60`} />

      <div className="text-center space-y-4">
        {/* Success badge */}
        <motion.div
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-2xl text-emerald-400"
          >
            ✓
          </motion.span>
        </motion.div>

        <div>
          <h2 className="text-lg sm:text-xl font-black text-foreground">Your File is Ready!</h2>
          <p className="text-xs text-muted-foreground mt-1">Processing completed successfully</p>
        </div>

        {/* File information panel */}
        <div className="bg-muted/60 border border-border rounded-2xl p-4 max-w-md mx-auto flex flex-col gap-2.5 font-medium">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Filename:</span>
            <span className="text-foreground font-bold truncate max-w-[200px]" title={fileName}>
              {fileName}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">File Size:</span>
            <span className="text-foreground font-bold">{fileSize}</span>
          </div>

          {savings && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
              <span className="text-muted-foreground">Estimated Reduction:</span>
              <span className="text-emerald-400 font-black uppercase tracking-wide">
                {savings}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 max-w-sm mx-auto pt-2">
          {/* Download link */}
          <a
            href={downloadUrl}
            download={fileName}
            className={`w-full py-3.5 bg-gradient-to-r ${btnGradient} text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all shadow-lg select-none`}
          >
            <Download className="h-4.5 w-4.5 animate-bounce" />
            Download File
          </a>

          {/* Social shares */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              WhatsApp Share
            </button>

<button
               onClick={handleCopyLink}
               className="py-2.5 bg-muted hover:bg-muted border border-border text-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
             >
               {copiedState ? (
                 <>
                   <Check className="h-3.5 w-3.5 text-emerald-400" />
                   Copied!
                 </>
               ) : (
                 <>
                   <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                   Copy Link
                 </>
               )}
             </button>
          </div>
        </div>

        {/* Micro Rating Feedback widget */}
        <div className="pt-6 border-t border-border max-w-md mx-auto">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-2">Did this tool help you? Rate your experience:</p>
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                title={`Rate ${star} Star${star > 1 ? "s" : ""}`}
                aria-label={`Rate ${star} Star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= (hoverRating ?? rating ?? 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Start over button */}
        <div className="pt-4">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Process another file
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default DownloadResult;
