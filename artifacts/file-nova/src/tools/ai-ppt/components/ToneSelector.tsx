import { PPT_TONES } from "../lib/tones";

export function ToneSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 block">
        Writing tone
      </label>
      <div className="space-y-1.5">
        {PPT_TONES.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onChange(tone.id)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer
                        ${value === tone.id
                          ? "bg-purple-500/10 border border-purple-500 text-white"
                          : "hover:bg-slate-900 border border-white/[0.04] bg-slate-950/40 text-slate-400"}`}
          >
            <span className="text-lg">{tone.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-200">{tone.label}</p>
              <p className="text-[10px] text-slate-500">{tone.bestFor}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
export default ToneSelector;
