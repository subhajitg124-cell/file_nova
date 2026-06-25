import { useState } from "react";
import { PPT_THEMES, THEME_CATEGORIES, type PPTTheme } from "../lib/themes";
import { Check } from "lucide-react";

export function ThemeSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [activeCategory, setActiveCategory] = useState("professional");
  const filtered = PPT_THEMES.filter((t) => t.category === activeCategory);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
          Choose a theme
        </label>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {THEME_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            title={`Show ${cat.label} themes`}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer
                        ${activeCategory === cat.id
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/30"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            selected={value === theme.id}
            onSelect={() => onChange(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeCard({ theme, selected, onSelect }: { theme: PPTTheme; selected: boolean; onSelect: () => void }) {
  const { palette } = theme.pptx;

  return (
    <button
      onClick={onSelect}
      title={`Apply theme: ${theme.label}. ${theme.description}`}
      className={`group relative flex flex-col rounded-xl overflow-hidden border-2 text-left transition-all duration-200 cursor-pointer
                  ${selected
                    ? "border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:scale-[1.01]"}`}
    >
      {/* Visual representation card */}
      <div
        className="w-full h-14 p-2 relative flex flex-col justify-between overflow-hidden"
        style={{ backgroundColor: `#${palette.background}` }}
      >
        {/* Decorative elements simulating a slide layout */}
        {theme.pptx.decoration === "side-bar" && (
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-current" style={{ color: `#${palette.primary}` }} />
        )}
        {theme.pptx.decoration === "corner-triangle" && (
          <div
            className="absolute top-0 right-0 w-4 h-4 bg-current opacity-20"
            style={{ color: `#${palette.primary}`, clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          />
        )}
        <div className="flex justify-between items-center z-10">
          <div className="w-8 h-1.5 rounded-sm" style={{ backgroundColor: `#${palette.primary}` }} />
          <div className="w-4 h-1.5 rounded-sm" style={{ backgroundColor: `#${palette.secondary}` }} />
        </div>
        <div className="space-y-1 z-10">
          <div className="w-12 h-1 rounded-sm" style={{ backgroundColor: `#${palette.textMuted}` }} />
          <div className="w-10 h-1 rounded-sm" style={{ backgroundColor: `#${palette.textMuted}` }} />
        </div>
      </div>

      <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 flex-1">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {theme.label}
        </h4>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
          {theme.description}
        </p>
      </div>

      {selected && (
        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white shadow-sm">
          <Check className="h-2.5 w-2.5" />
        </span>
      )}
    </button>
  );
}

export default ThemeSelector;
