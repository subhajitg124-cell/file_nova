import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { AppLanguage } from "@/lib/document-automation";

export const LANGUAGES: { code: AppLanguage; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "as", label: "Assamese", native: "অসমীয়া", flag: "🇮🇳" },
  { code: "ur", label: "Urdu", native: "اردو", flag: "🇮🇳" },
  { code: "ne", label: "Nepali", native: "नेपाली", flag: "🇳🇵" },
  { code: "sat", label: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳" },
];

interface LanguageSelectorProps {
  currentLang?: string;
  onLanguageChange?: (code: string) => void;
}

export function LanguageSelector({
  currentLang,
  onLanguageChange,
}: LanguageSelectorProps) {
  const { language: globalLang, setLanguage: globalSetLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeLang = currentLang ?? globalLang ?? "en";
  const activeChange = onLanguageChange ?? globalSetLang;

  const current = LANGUAGES.find((l) => l.code === activeLang) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2 bg-indigo-50/50 dark:bg-white/[0.06] backdrop-blur-md border border-indigo-200/50 dark:border-white/10 rounded-2xl px-3.5 py-2.5 text-xs font-black text-slate-800 dark:text-white transition-all cursor-pointer shadow-[0_0_0_rgba(99,102,241,0)] hover:border-indigo-500/50 hover:shadow-[0_0_24px_rgba(99,102,241,0.35)] active:shadow-[0_0_10px_rgba(99,102,241,0.2)]"
        title="Select language"
        {...{
          "aria-haspopup": "listbox",
          "aria-expanded": open,
        }}
      >
        <Globe className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0 transition-transform group-hover:rotate-12 duration-300" />
        <span className="hidden sm:inline max-w-[90px] truncate tracking-wide font-extrabold text-[11px] text-indigo-950 dark:text-white">
          {current.flag} {current.native}
        </span>
        <span className="sm:hidden text-indigo-950 dark:text-white">{current.flag}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="text-indigo-400 shrink-0"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      {/* Dropdown container */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.94 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
            role="listbox"
            className="absolute right-0 top-full mt-2.5 z-50 w-56 fn-glass rounded-xl shadow-[var(--fn-shadow-elevated)] overflow-hidden text-[var(--fn-text-primary)]"
            style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}
          >
            <div className="px-4 pt-3 pb-2 border-b border-border/50">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Select Language
              </span>
            </div>

            {/* Scrollable list container - KEY FIX: max-h-72 overflow-y-auto prevents clipping */}
            <div className="p-1.5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent space-y-1">
              {LANGUAGES.map((lang, index) => {
                const active = activeLang === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.2, ease: "easeOut" }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(99,102,241,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      activeChange?.(lang.code);
                      setOpen(false);
                    }}
                    className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                      active
                        ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]"
                        : "bg-muted/30 border border-transparent hover:border-border"
                    }`}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="text-base shrink-0 leading-none">{lang.flag}</span>
                    <div className="min-w-0 flex-1">
                      <span className={`block font-extrabold truncate leading-tight ${active ? "text-[var(--fn-accent-primary)]" : "text-[var(--fn-text-primary)]"}`}>
                        {lang.native}
                      </span>
                      <span className={`block text-[9px] font-medium truncate leading-tight ${active ? "text-[var(--fn-accent-primary)]/80" : "text-[var(--fn-text-secondary)]"}`}>
                        {lang.label}
                      </span>
                    </div>
                    {active && (
                      <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSelector;
