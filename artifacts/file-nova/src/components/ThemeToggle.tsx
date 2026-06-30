import React from "react";
import { Sun, Moon, Contrast } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { tText } = useTranslation();
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "dark" as const,
      label: tText("Dark"),
      icon: Moon,
      activeShadow: "shadow-[0_0_12px_rgba(99,102,241,0.4)]",
    },
    {
      id: "light" as const,
      label: tText("Light"),
      icon: Sun,
      activeShadow: "shadow-[0_0_12px_rgba(79,70,229,0.3)]",
    },
    {
      id: "contrast" as const,
      label: tText("Contrast"),
      icon: Contrast,
      activeShadow: "shadow-[0_0_12px_rgba(255,255,0,0.55)]",
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={tText("Select theme")}
      className="flex flex-wrap items-center gap-1.5 w-full"
    >
      {themes.map(({ id, label, icon: Icon, activeShadow }) => {
        const isActive = theme === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked="false"
            {...(isActive ? { "aria-checked": "true" } as any : {})}
            tabIndex={0}
            onClick={() => setTheme(id)}
            className={`
              flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold
              transition-all duration-[250ms] ease-in-out cursor-pointer select-none
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none
              ${
                isActive
                  ? `bg-primary text-primary-foreground border-primary scale-[1.03] shadow-sm ${activeShadow}`
                  : "border border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:translate-y-[-1px] hover:shadow-sm"
              }
            `}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
