import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "light" | "medium" | "heavy";
  border?: boolean;
}

const intensityMap = {
  light: "bg-card/5 dark:bg-card/5 backdrop-blur-md",
  medium: "bg-card/10 dark:bg-card/10 backdrop-blur-lg",
  heavy: "bg-card/15 dark:bg-card/15 backdrop-blur-xl",
};

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children, className = "", intensity = "medium", border = true,
}) => (
  <div
    className={[
      intensityMap[intensity],
      border ? "border border-white/10 dark:border-border" : "",
      "shadow-lg shadow-black/5",
      "rounded-2xl",
      className,
    ].filter(Boolean).join(" ")}
  >
    {children}
  </div>
);

export default GlassPanel;
