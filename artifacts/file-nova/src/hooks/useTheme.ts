import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "contrast";

const THEME_KEY = "filenova-theme";

let currentGlobalTheme: Theme = (() => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light" || saved === "contrast") return saved as Theme;
    if (saved === "high-contrast") return "contrast"; // Migrate legacy name
    const legacy = localStorage.getItem("theme");
    if (legacy === "dark" || legacy === "light") {
      localStorage.setItem(THEME_KEY, legacy);
      localStorage.removeItem("theme");
      return legacy as Theme;
    }
  } catch {}
  return "dark";
})();

const subscribers = new Set<(theme: Theme) => void>();

export function useTheme() {
  const [theme, setThemeVal] = useState<Theme>(currentGlobalTheme);

  useEffect(() => {
    const handleChange = (newTheme: Theme) => {
      setThemeVal(newTheme);
    };
    subscribers.add(handleChange);
    return () => {
      subscribers.delete(handleChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "high-contrast");
    // Map internal "contrast" state to external "high-contrast" stylesheet class
    const domClass = theme === "contrast" ? "high-contrast" : theme;
    root.classList.add(domClass);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== currentGlobalTheme) {
      currentGlobalTheme = newTheme;
      subscribers.forEach((cb) => cb(newTheme));
    }
  };

  return { theme, setTheme };
}

export default useTheme;