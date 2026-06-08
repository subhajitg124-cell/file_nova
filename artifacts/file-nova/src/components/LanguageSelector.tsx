import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Check, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import type { AppLanguage } from '@/lib/document-automation';

const LANGUAGES: { code: AppLanguage; label: string; local: string }[] = [
  { code: 'en', label: 'English', local: 'English' },
  { code: 'hi', label: 'Hindi', local: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', local: 'বাংলা' },
  { code: 'te', label: 'Telugu', local: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', local: 'मराठी' },
  { code: 'ta', label: 'Tamil', local: 'தமிழ்' },
  { code: 'gu', label: 'Gujarati', local: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', local: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', local: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', local: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', local: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', local: 'অসমীয়া' },
  { code: 'ur', label: 'Urdu', local: 'اردو' },
  { code: 'ne', label: 'Nepali', local: 'नेपाली' },
  { code: 'sat', label: 'Santali', local: 'ᱥᱟᱱᱛᱟᱲᱤ' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrolling(scrollRef.current.scrollTop > 0);
    }
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-black text-white transition-all cursor-pointer shadow-[0_0_0_rgba(99,102,241,0)] hover:border-indigo-500/50 hover:shadow-[0_0_24px_rgba(99,102,241,0.35)] active:shadow-[0_0_10px_rgba(99,102,241,0.2)]"
        title="Select language"
      >
        <Globe className="h-4 w-4 text-indigo-400 shrink-0 transition-transform group-hover:rotate-12 duration-300" />
        <span className="hidden sm:inline max-w-[90px] truncate tracking-wide font-extrabold text-[11px]">{current.local}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="text-indigo-400"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.94 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 top-full mt-2.5 z-50 w-56 bg-[#0f0f1a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-indigo-900/30 overflow-hidden"
            style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}
          >
            <div className="px-4 pt-3 pb-2 border-b border-white/5">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Select Language</span>
            </div>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="grid grid-cols-2 gap-1 p-2 max-h-[320px] overflow-y-auto scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {LANGUAGES.map((lang, index) => {
                const active = language === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 30, duration: 0.25, ease: "easeOut" }}
                    whileHover={{ scale: 1.03, backgroundColor: "rgba(99,102,241,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setLanguage(lang.code); setOpen(false); }}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                      active
                        ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]'
                        : 'bg-white/[0.03] border border-transparent hover:border-white/10'
                    }`}
                  >
                    <span className="text-base shrink-0">{lang.code === 'en' ? '🇬🇧' : lang.code === 'hi' ? '🇮🇳' : lang.code === 'bn' ? '🇧🇩' : lang.code === 'te' ? '🇹🇨' : lang.code === 'ta' ? '🇮🇳' : lang.code === 'ur' ? '🇵🇰' : lang.code === 'ne' ? '🇳🇵' : '🇮🇳'}</span>
                    <div className="min-w-0 flex-1">
                      <span className={`block font-extrabold truncate leading-tight ${active ? 'text-indigo-300' : 'text-slate-200'}`}>{lang.local}</span>
                      <span className={`block text-[9px] font-medium truncate leading-tight ${active ? 'text-indigo-400/80' : 'text-slate-500'}`}>{lang.label}</span>
                    </div>
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="shrink-0"
                      >
                        <Check className="h-3.5 w-3.5 text-indigo-400" />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {scrolling && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0f0f1a]/90 to-transparent pointer-events-none" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
