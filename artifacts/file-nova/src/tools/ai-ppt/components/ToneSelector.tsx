import { PPT_TONES } from "../lib/tones";

export function ToneSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 block">
        Writing tone
      </label>
      <div className="space-y-1.5">
        {PPT_TONES.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onChange(tone.id)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer
                        ${value === tone.id
                          ? "bg-primary/10 border border-primary text-foreground"
                          : "hover:bg-muted border border-border bg-card/40 text-muted-foreground"}`}
          >
            <span className="text-lg">{tone.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground/90">{tone.label}</p>
              <p className="text-[10px] text-muted-foreground/80">{tone.bestFor}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
export default ToneSelector;
