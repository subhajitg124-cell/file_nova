import React, { useState } from 'react';
import { Camera, Sun, Contrast, MonitorSmartphone } from 'lucide-react';

interface PANSidebarProps {
  onApply: (preset: string, dpi: number, brightness: number, contrast: number) => void;
  disabled?: boolean;
}

export const PANSidebar: React.FC<PANSidebarProps> = ({ onApply, disabled }) => {
  const [preset, setPreset] = useState('NSDL 3.5x2.5cm');
  const [dpi, setDpi] = useState(300);
  const [brightness, setBrightness] = useState(0);
  const [contrastVal, setContrastVal] = useState(0);

  const presets = [
    { label: 'NSDL 3.5×2.5cm', w: 413, h: 295, desc: 'Photo standard' },
    { label: 'eKYC 200×130', w: 200, h: 130, desc: 'KYC format' },
    { label: 'Passport 3.5×4.5cm', w: 413, h: 531, desc: 'Passport size' },
    { label: 'Custom', w: 0, h: 0, desc: 'Manual entry' },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Camera className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">PAN / ID Resize</p>
          <p className="text-[10px] text-muted-foreground/80">Resize for official applications</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => {
          const isActive = preset === p.label;
          const Icon = p.label === 'Custom' ? MonitorSmartphone : Camera;
          return (
            <button key={p.label} type="button" onClick={() => setPreset(p.label)}
              className={`rounded-xl border px-3 py-2.5 text-[11px] font-bold transition cursor-pointer text-left ${
                isActive
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-400'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
              }`}>
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <div>
                  <div>{p.label}</div>
                  <div className="text-[9px] font-normal opacity-70">{p.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <MonitorSmartphone className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Resolution (DPI)</span>
        </div>
        <div className="flex gap-2">
          {[72, 96, 150, 300, 600].map((d) => (
            <button key={d} type="button" onClick={() => setDpi(d)}
              className={`flex-1 rounded-lg border py-1.5 text-[10px] font-bold transition cursor-pointer ${
                dpi === d
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-400'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
              }`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sun className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Brightness</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-bold">{brightness > 0 ? `+${brightness}` : brightness}</span>
        </div>
        <input type="range" min="-100" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-violet-500" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Contrast className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Contrast</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-bold">{contrastVal > 0 ? `+${contrastVal}` : contrastVal}</span>
        </div>
        <input type="range" min="-100" max="100" value={contrastVal} onChange={(e) => setContrastVal(Number(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-violet-500" />
      </div>

      <button type="button" onClick={() => onApply(preset, dpi, brightness, contrastVal)} disabled={disabled}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-40 cursor-pointer text-sm hover:opacity-90 transition">
        Apply Resize
      </button>
    </div>
  );
};
