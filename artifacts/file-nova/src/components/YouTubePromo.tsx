import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Heart, ExternalLink } from 'lucide-react';

const PROMO_END = new Date('2026-06-21T23:59:59');
const CHANNEL_URL = 'https://www.youtube.com/@CoverDriveBangla';
const STORAGE_KEY = 'filenova-yt-promo-closed';

function isBeforeEnd(): boolean {
  return new Date() < PROMO_END;
}

function hasUserClosed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markClosed() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {}
}

export function YouTubePromo() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isBeforeEnd() || hasUserClosed()) return;
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    markClosed();
    setTimeout(() => setVisible(false), 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
        >
          <motion.div
            animate={dismissed ? { opacity: 0, x: 80 } : {}}
            className="relative bg-gradient-to-br from-slate-900 to-slate-950 border border-red-500/20 rounded-2xl p-5 shadow-2xl shadow-red-900/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.06),transparent_60%)] pointer-events-none" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Youtube className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-white mb-1 flex items-center gap-1.5">
                  We Need Your Support
                  <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This free tool is run by a small team. Please support us —
                  <span className="text-slate-300 font-bold"> subscribe to our YouTube channel</span>. It costs nothing and helps us keep building.
                </p>

                <motion.a
                  href={CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all border border-red-500/30 w-full justify-center"
                  onClick={() => markClosed()}
                >
                  <Youtube className="h-4 w-4" />
                  Subscribe @CoverDriveBangla
                  <ExternalLink className="h-3 w-3" />
                </motion.a>

                <p className="text-[10px] text-slate-600 text-center mt-2">
                  Offer ends June 21, 2026
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
