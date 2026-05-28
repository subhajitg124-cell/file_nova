import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, AppLanguage } from "./document-automation";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
};

const KEY = "filenova-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      return stored === "bn" || stored === "hi" || stored === "en" ? (stored as AppLanguage) : "en";
    } catch (e) {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, language);
    } catch (e) {
      // ignore
    }
  }, [language]);

  const setLanguage = (lang: AppLanguage) => setLanguageState(lang);

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useTranslation() {
  const { language } = useLanguage();
  const map = translations[language] || translations.en;
  return map;
}

export default LanguageProvider;
