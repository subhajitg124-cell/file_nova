import React, { useState } from 'react';
import { Scissors, Layers, FileDown } from 'lucide-react';

interface SplitSidebarProps {
  onSplit: () => void;
  disabled?: boolean;
  totalPages?: number;
}

export const SplitSidebar: React.FC<SplitSidebarProps> = ({ onSplit, disabled, totalPages = 1 }) => {
  const [mode, setMode] = useState<'range' | 'every' | 'size'>('range');
  const [range, setRange] = useState('1-3, 5, 7-9');
  const [everyN, setEveryN] = useState('1');
  const [sizeMb, setSizeMb] = useState('5');

  const modeIcon = mode === 'range' ? Scissors : mode === 'every' ? Layers : FileDown;
  const ModeIcon = modeIcon;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
          <Scissors className="h-3.5 w-3.5 text-pink-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Split Mode</p>
          <p className="text-[10px] text-muted-foreground/80">Choose how to split your PDF</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['range', 'every', 'size'] as const).map((m) => {
          const Icon = m === 'range' ? Scissors : m === 'every' ? Layers : FileDown;
          const label = m === 'range' ? 'By Range' : m === 'every' ? 'Every N' : 'By Size';
          return (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                mode === m
                  ? 'border-pink-500/40 bg-pink-500/10 text-pink-400'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
              }`}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="fn-glass rounded-xl p-3 flex items-center gap-2">
        <ModeIcon className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs font-semibold text-foreground">
            {mode === 'range' ? 'Extract specific pages' : mode === 'every' ? 'Split every N pages' : 'Split by file size'}
          </p>
          <p className="text-[10px] text-muted-foreground/80">PDF has {totalPages} page{totalPages === 1 ? '' : 's'}</p>
        </div>
      </div>

      {mode === 'range' && (
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Page Range</label>
          <input type="text" value={range} onChange={(e) => setRange(e.target.value)}
            placeholder="e.g. 1-3, 5, 7-9"
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition" />
          <p className="text-[10px] text-muted-foreground/70">Hyphens for ranges, commas between pages</p>
        </div>
      )}
      {mode === 'every' && (
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Pages Per Split</label>
          <input type="number" min="1" value={everyN} onChange={(e) => setEveryN(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition" />
          <p className="text-[10px] text-muted-foreground/70">~{Math.ceil(totalPages / Math.max(1, Number(everyN) || 1))} output files</p>
        </div>
      )}
      {mode === 'size' && (
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Max File Size (MB)</label>
          <input type="number" min="1" value={sizeMb} onChange={(e) => setSizeMb(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition" />
        </div>
      )}

      <button type="button" onClick={onSplit} disabled={disabled}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-40 cursor-pointer text-sm hover:opacity-90 transition">
        Split PDF
      </button>
    </div>
  );
};
