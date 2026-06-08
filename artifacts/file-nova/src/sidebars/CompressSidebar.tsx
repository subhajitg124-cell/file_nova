import React, { useState } from 'react';

interface CompressSidebarProps {
  quality: number;
  onQualityChange: (q: number) => void;
  grayscale: boolean;
  onGrayscaleChange: (v: boolean) => void;
  onCompress: () => void;
  disabled?: boolean;
  estimate?: { originalSize: number; estimatedSize: number; reductionPercent: number } | null;
  formatSize: (b: number) => string;
}

export const CompressSidebar: React.FC<CompressSidebarProps> = ({
  quality, onQualityChange, grayscale, onGrayscaleChange,
  onCompress, disabled, estimate, formatSize,
}) => {
  const [preset, setPreset] = useState('medium');
  const labels = quality >= 90 ? 'Screen (72 DPI)' : quality >= 75 ? 'Web (96 DPI)' : quality >= 55 ? 'Print (150 DPI)' : 'High (300 DPI)';

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Compression</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'low', label: 'Low (Best)' },
          { key: 'medium', label: 'Medium' },
          { key: 'high', label: 'High (Small)' },
        ].map((p) => (
          <button key={p.key} type="button" onClick={() => {
            setPreset(p.key);
            if (p.key === 'low') onQualityChange(92);
            else if (p.key === 'medium') onQualityChange(82);
            else onQualityChange(55);
          }} className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition cursor-pointer ${preset === p.key ? 'border-orange-500 bg-orange-500/15 text-orange-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Quality</span>
          <span className="text-xs font-black text-orange-400">{quality}% · {labels}</span>
        </div>
        <input type="range" min="10" max="100" value={quality} onChange={(e) => onQualityChange(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={grayscale} onChange={(e) => onGrayscaleChange(e.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500" />
        <span className="text-xs text-slate-300 font-semibold">Grayscale (smaller file)</span>
      </label>
      {estimate && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated output</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{formatSize(estimate.originalSize)}</span>
            <span className="text-emerald-400 font-black">~{estimate.reductionPercent}% smaller</span>
          </div>
        </div>
      )}
      <button type="button" onClick={onCompress} disabled={disabled} className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black rounded-xl disabled:opacity-50 cursor-pointer text-sm">Compress PDF</button>
    </div>
  );
};
