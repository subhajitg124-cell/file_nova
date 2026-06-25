import React from "react";

interface TopicInputPanelProps {
  value: string;
  onChange: (val: string) => void;
}

const SUGGESTIONS = [
  "Photosynthesis for Class 10",
  "Indian Freedom Struggle (1857-1947)",
  "Introduction to Python Programming",
  "E-Commerce Growth in India",
  "Renewable Energy for Sustainable Future",
  "Structure of Human Eye (Class 12 Biology)"
];

export const TopicInputPanel: React.FC<TopicInputPanelProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Presentation Topic
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Photosynthesis explanation for Class 10 CBSE, or Introduction to Blockchain..."
          rows={3}
          className="mt-1.5 w-full bg-card/80 border border-border rounded-2xl p-4 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 block">
          Suggestions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onChange(suggestion)}
              className="py-1.5 px-3 rounded-xl border border-border bg-muted/40 hover:bg-muted text-[10px] font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TopicInputPanel;
