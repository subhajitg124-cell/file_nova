import { useState, useEffect } from "react";

type Theme = "dark" | "light";

let currentGlobalTheme: Theme = (() => {
  try {
    const saved = localStorage.getItem("filenova-theme") as Theme | null;
    if (saved === "dark" || saved === "light") return saved;
    const legacy = localStorage.getItem("theme") as Theme | null;
    if (legacy === "dark" || legacy === "light") {
      localStorage.setItem("filenova-theme", legacy);
      localStorage.removeItem("theme");
      return legacy;
    }
  } catch {}
  return "dark";
})();

const subscribers = new Set<(theme: Theme) => void>();

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
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("filenova-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    currentGlobalTheme = next;
    subscribers.forEach((cb) => cb(next));
  };

  return { theme, toggleTheme };
}

export default useTheme;