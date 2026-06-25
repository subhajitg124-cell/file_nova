import React from "react";
import { estimateSlideCount } from "../lib/outlineParser";

interface PastedContentPanelProps {
  value: string;
  onChange: (val: string) => void;
}

export const PastedContentPanel: React.FC<PastedContentPanelProps> = ({ value, onChange }) => {
  const count = value.trim() ? estimateSlideCount(value) : 0;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Paste Raw Notes / Outline
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste bullet lists, paragraphs, or a messy draft here. We will structure it into beautiful slides..."
          rows={6}
          className="mt-1.5 w-full bg-card/80 border border-border rounded-2xl p-4 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
        />
      </div>

      {value.trim().length > 0 && (
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[10.5px] font-bold text-indigo-400 animate-fade-up">
          💡 Detected content structure. Estimated output size: ~{count} slides.
        </div>
      )}
    </div>
  );
};
export default PastedContentPanel;
