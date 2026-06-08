import React, { useState } from 'react';

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

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Split mode</p>
      <div className="grid grid-cols-3 gap-2">
        {(['range', 'every', 'size'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition cursor-pointer ${mode === m ? 'border-pink-500 bg-pink-500/15 text-pink-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
            {m === 'range' ? 'By Range' : m === 'every' ? 'Every N' : 'By Size'}
          </button>
        ))}
      </div>
      {mode === 'range' && (
        <input type="text" value={range} onChange={(e) => setRange(e.target.value)} placeholder="e.g. 1-3, 5, 7-9" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600" />
      )}
      {mode === 'every' && (
        <input type="number" min="1" value={everyN} onChange={(e) => setEveryN(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white" />
      )}
      {mode === 'size' && (
        <input type="number" min="1" value={sizeMb} onChange={(e) => setSizeMb(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white" />
      )}
      <p className="text-[10px] text-slate-500">PDF has {totalPages} page{totalPages === 1 ? '' : 's'}. Hyphens for ranges, commas between pages.</p>
      <button type="button" onClick={onSplit} disabled={disabled} className="w-full py-3 bg-pink-600 text-white font-black rounded-xl disabled:opacity-50 cursor-pointer text-sm">Split PDF</button>
    </div>
  );
};
