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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer"
        title="Select language"
      >
        <Globe className="h-3.5 w-3.5 text-indigo-500" />
        <span className="hidden sm:inline">{current.local}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 z-50 w-48 bg-card border border-border rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden"
          >
            <div className="py-1 max-h-72 overflow-y-auto">
              {LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      active
                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                        : 'bg-muted/40 text-muted-foreground border border-border'
                    }`}>
                      {lang.code.toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block leading-tight">{lang.local}</span>
                      <span className="block text-[10px] text-muted-foreground/70 leading-tight">{lang.label}</span>
                    </div>
                    {active && <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
