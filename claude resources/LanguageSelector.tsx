// LanguageSelector.tsx
// FIX: Language dropdown was clipped — added max-h + overflow-y-auto so all options are visible

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

export const LANGUAGES = [
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
  { code: "ur", label: "Urdu", native: "اردو", flag: "🇮🇳" },
];

interface LanguageSelectorProps {
  currentLang?: string;
  onLanguageChange?: (code: string) => void;
}

export function LanguageSelector({
  currentLang = "en",
  onLanguageChange,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  // Close on outside click
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                   bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10
                   border border-white/20 dark:border-white/10
                   text-gray-700 dark:text-gray-200 transition-all duration-200"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-4 h-4 opacity-70" />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown — KEY FIX: max-h + overflow-y-auto prevents clipping */}
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-52 z-[9999]
                     bg-gray-900/95 dark:bg-gray-950/95 backdrop-blur-xl
                     border border-white/10 rounded-xl shadow-2xl
                     max-h-72 overflow-y-auto
                     scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          <div className="p-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 px-3 pt-1 pb-2">
              Select Language
            </p>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={lang.code === currentLang}
                onClick={() => {
                  onLanguageChange?.(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                            transition-all duration-150 text-left
                            ${
                              lang.code === currentLang
                                ? "bg-indigo-600/30 text-indigo-300"
                                : "text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span className="flex-1 font-medium">{lang.native}</span>
                <span className="text-xs text-gray-500">{lang.label}</span>
                {lang.code === currentLang && (
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
