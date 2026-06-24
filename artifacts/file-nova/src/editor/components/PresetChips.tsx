import React from "react";

interface Chip {
  id: string;
  label: string;
  description?: string;
}

interface PresetChipsProps {
  chips: Chip[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export const PresetChips: React.FC<PresetChipsProps> = ({
  chips, value, onChange, className = "", disabled = false, size = "sm",
}) => {
  const sizeClass = size === "sm" ? "px-2.5 py-1.5 text-[10px]" : "px-3 py-2 text-[11px]";
  return (
    <div className={["flex flex-wrap gap-1.5", className].filter(Boolean).join(" ")}>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onChange(chip.id)}
          disabled={disabled}
          className={[
            sizeClass,
            "rounded-lg border font-bold transition-all cursor-pointer",
            value === chip.id
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10"
              : "border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200",
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].filter(Boolean).join(" ")}
        >
          {chip.label}
          {chip.description && (
            <span className="ml-1 text-[8px] opacity-60">({chip.description})</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default PresetChips;
