import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "heavy";
  border?: boolean;
}

const intensityMap = {
  light: "bg-white/5 dark:bg-white/5 backdrop-blur-md",
  medium: "bg-white/10 dark:bg-white/10 backdrop-blur-lg",
  heavy: "bg-white/15 dark:bg-white/15 backdrop-blur-xl",
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children, className = "", intensity = "medium", border = true,
}) => (
  <div
    className={[
      intensityMap[intensity],
      border ? "border border-white/10 dark:border-white/10" : "",
      "shadow-lg shadow-black/5",
      "rounded-2xl",
      className,
    ].filter(Boolean).join(" ")}
  >
    {children}
  </div>
);

export default GlassPanel;
