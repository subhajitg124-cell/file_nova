import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "high-contrast";

const THEME_KEY = "filenova-theme";

let currentGlobalTheme: Theme = (() => {
  try {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved === "dark" || saved === "light" || saved === "high-contrast") return saved;
    const legacy = localStorage.getItem("theme") as Theme | null;
    if (legacy === "dark" || legacy === "light") {
      localStorage.setItem(THEME_KEY, legacy);
      localStorage.removeItem("theme");
      return legacy;
    }
  } catch {}
  return "dark";
})();

const subscribers = new Set<(theme: Theme) => void>();

const THEME_ORDER: Theme[] = ["dark", "light", "high-contrast"];

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentGlobalTheme);

  useEffect(() => {
    const handleChange = (newTheme: Theme) => {
      setTheme(newTheme);
    };
    subscribers.add(handleChange);
    return () => {
      subscribers.delete(handleChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "high-contrast");
    root.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    const idx = THEME_ORDER.indexOf(theme);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    currentGlobalTheme = next;
    subscribers.forEach((cb) => cb(next));
  };

  return { theme, toggleTheme };
}

export default useTheme;