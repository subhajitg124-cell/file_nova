import React, { useState } from 'react';

interface PANSidebarProps {
  onApply: (preset: string, dpi: number, brightness: number, contrast: number) => void;
  disabled?: boolean;
}

export const PANSidebar: React.FC<PANSidebarProps> = ({ onApply, disabled }) => {
  const [preset, setPreset] = useState('NSDL 3.5x2.5cm');
  const [dpi, setDpi] = useState(300);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">PAN / ID resize</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'NSDL 3.5×2.5cm', w: 413, h: 295 },
          { label: 'eKYC 200×130', w: 200, h: 130 },
          { label: 'Passport 3.5×4.5cm', w: 413, h: 531 },
          { label: 'Custom', w: 0, h: 0 },
        ].map((p) => (
          <button key={p.label} type="button" onClick={() => setPreset(p.label)} className={`rounded-xl border px-2 py-2 text-[11px] font-black transition cursor-pointer ${preset === p.label ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] text-slate-500 font-bold uppercase">DPI</label>
        <select value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white">
          <option value={72}>72</option>
          <option value={96}>96</option>
          <option value={150}>150</option>
          <option value={300}>300</option>
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Brightness</span>
          <span className="text-[11px] text-slate-300 font-black">{brightness}</span>
        </div>
        <input type="range" min="-100" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-violet-500" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Contrast</span>
          <span className="text-[11px] text-slate-300 font-black">{contrast}</span>
        </div>
        <input type="range" min="-100" max="100" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-violet-500" />
      </div>
      <button type="button" onClick={() => onApply(preset, dpi, brightness, contrast)} disabled={disabled} className="w-full py-3 bg-violet-600 text-white font-black rounded-xl disabled:opacity-50 cursor-pointer text-sm">Apply resize</button>
    </div>
  );
};
