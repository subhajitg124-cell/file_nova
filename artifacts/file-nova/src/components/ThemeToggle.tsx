import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function ThemeToggle() {
  const { tText } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"));
    setTheme(isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={toggleTheme}
      className="h-8 w-8 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-sm focus:outline-none shrink-0"
      title={theme === "dark" ? tText("Switch to Light Mode") : tText("Switch to Dark Mode")}
      aria-label={theme === "dark" ? tText("Switch to Light Mode") : tText("Switch to Dark Mode")}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-amber-400 fill-amber-400/10" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-500 fill-indigo-500/10" />
        )}
      </motion.div>
    </motion.button>
  );
}
