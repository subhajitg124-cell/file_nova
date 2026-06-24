import React from "react";

interface SegmentedOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  disabled?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options, value, onChange, className = "", disabled = false,
}) => (
  <div className={["flex rounded-xl border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 p-0.5 gap-0.5", className].filter(Boolean).join(" ")}>
    {options.map((opt) => (
      <button
        key={opt.id}
        type="button"
        onClick={() => onChange(opt.id)}
        disabled={disabled}
        className={[
          "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
          value === opt.id
            ? "bg-white/15 dark:bg-white/15 text-slate-800 dark:text-white shadow-sm"
            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].filter(Boolean).join(" ")}
      >
        {opt.icon}
        {opt.label}
      </button>
    ))}
  </div>
);

export default SegmentedControl;
