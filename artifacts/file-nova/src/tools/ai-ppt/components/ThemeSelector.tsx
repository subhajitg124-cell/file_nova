import { PPT_THEMES } from "../lib/themes";
import { Check } from "lucide-react";

export function ThemeSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 block">
        Choose a theme
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PPT_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={`relative p-3 rounded-xl border-2 text-left transition-all cursor-pointer
                        bg-gradient-to-br ${theme.preview.bgGradient}
                        ${value === theme.id ? "border-purple-500 shadow-md" : "border-white/5 bg-slate-900/40 hover:border-gray-300"}`}
          >
            <p className="text-xs font-semibold" style={{ color: theme.preview.accentColor }}>
              {theme.label}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{theme.description}</p>
            {value === theme.id && (
              <Check className="absolute top-2 right-2 w-3.5 h-3.5" style={{ color: theme.preview.accentColor }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
export default ThemeSelector;
