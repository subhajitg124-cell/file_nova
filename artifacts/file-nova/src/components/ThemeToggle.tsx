import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Contrast } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { tText } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={toggleTheme}
      className="h-8 w-8 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-sm focus:outline-none shrink-0"
      title={theme === "dark" ? tText("Switch to Light Mode") : theme === "light" ? tText("Switch to High Contrast") : tText("Switch to Dark Mode")}
      aria-label={theme === "dark" ? tText("Switch to Light Mode") : theme === "light" ? tText("Switch to High Contrast") : tText("Switch to Dark Mode")}
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
        ) : theme === "high-contrast" ? (
          <Contrast className="h-4 w-4 text-white fill-white/20" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-500 fill-indigo-500/10" />
        )}
      </motion.div>
    </motion.button>
  );
}
