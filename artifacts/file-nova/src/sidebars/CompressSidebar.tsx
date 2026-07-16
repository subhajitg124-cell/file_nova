import React, { useState } from 'react';
import { FileArchive, Gauge } from 'lucide-react';

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

  const qualityLabel = quality >= 90 ? 'Maximum' : quality >= 75 ? 'High' : quality >= 55 ? 'Medium' : 'Low';
  const qualityColor = quality >= 90 ? 'text-emerald-400' : quality >= 75 ? 'text-green-400' : quality >= 55 ? 'text-amber-400' : 'text-orange-400';

  const presets = [
    { key: 'low', label: 'Max Size', q: 92, desc: 'Best quality' },
    { key: 'medium', label: 'Balanced', q: 82, desc: 'Recommended' },
    { key: 'high', label: 'Min Size', q: 55, desc: 'Smallest file' },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <FileArchive className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Compression Settings</p>
          <p className="text-[10px] text-muted-foreground/80">Adjust quality vs file size</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {presets.map((p) => (
          <button key={p.key} type="button" onClick={() => { setPreset(p.key); onQualityChange(p.q); }}
            className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition cursor-pointer ${
              preset === p.key
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
            }`}>
            <div>{p.label}</div>
            <div className="text-[9px] font-normal opacity-70">{p.desc}</div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Quality</span>
          </div>
          <span className={`text-xs font-bold ${qualityColor}`}>{quality}% · {qualityLabel}</span>
        </div>
        <input type="range" min="10" max="100" value={quality} onChange={(e) => onQualityChange(Number(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary" />
        <div className="flex justify-between text-[9px] text-muted-foreground/60">
          <span>Small file</span>
          <span>Best quality</span>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" checked={grayscale} onChange={(e) => onGrayscaleChange(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-muted text-primary focus:ring-primary/40" />
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition font-semibold">Grayscale (smaller file)</span>
      </label>

      {estimate && (
        <div className="fn-glass rounded-xl p-3 space-y-2">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Estimated Output</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{formatSize(estimate.originalSize)}</span>
            <span className="text-emerald-400 font-bold">~{estimate.reductionPercent}% smaller</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(5, 100 - estimate.reductionPercent)}%` }} />
          </div>
        </div>
      )}

      <button type="button" onClick={onCompress} disabled={disabled}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-40 cursor-pointer text-sm hover:opacity-90 transition">
        Compress PDF
      </button>
    </div>
  );
};
