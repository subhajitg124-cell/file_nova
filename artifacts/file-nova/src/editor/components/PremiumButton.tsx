import React from "react";

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "premium" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variants = {
  primary:
    "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20",
  premium:
    "bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-lg shadow-purple-500/20 border-0",
  ghost:
    "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent",
  danger:
    "bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20",
};

const sizes = {
  sm: "h-7 px-3 text-[10px]",
  md: "h-8 px-4 text-xs",
  lg: "h-10 px-5 text-sm",
};

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children, onClick, type = "button", variant = "primary", size = "md",
  disabled = false, loading = false, icon, className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={[
      "flex items-center justify-center gap-2 rounded-xl font-bold transition-all cursor-pointer",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      "focus:outline-none focus:ring-2 focus:ring-primary/40",
      variants[variant],
      sizes[size],
      className,
    ].filter(Boolean).join(" ")}
  >
    {loading ? (
      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ) : icon ? (
      <span className="h-3.5 w-3.5 flex items-center justify-center">{icon}</span>
    ) : null}
    {children}
  </button>
);

export default PremiumButton;
