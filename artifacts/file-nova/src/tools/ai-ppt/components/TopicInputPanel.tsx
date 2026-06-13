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
        <label className="text-xs font-black uppercase tracking-wider text-slate-400">
          Presentation Topic
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Photosynthesis explanation for Class 10 CBSE, or Introduction to Blockchain..."
          rows={3}
          className="mt-1.5 w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
          Suggestions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onChange(suggestion)}
              className="py-1.5 px-3 rounded-xl border border-white/[0.05] bg-slate-900/40 hover:bg-slate-900 text-[10px] font-bold text-slate-400 hover:text-white transition cursor-pointer"
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
