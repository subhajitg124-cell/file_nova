import React, { useState } from 'react';

interface AadhaarSidebarProps {
  onMask: (fields: { first8: boolean; dob: boolean; address: boolean }, style: 'black' | 'blur' | 'pattern') => void;
  disabled?: boolean;
}

export const AadhaarSidebar: React.FC<AadhaarSidebarProps> = ({ onMask, disabled }) => {
  const [autoDetect, setAutoDetect] = useState(false);
  const [fields, setFields] = useState({ first8: true, dob: true, address: true });
  const [style, setStyle] = useState<'black' | 'blur' | 'pattern'>('black');

  const toggle = (key: 'first8' | 'dob' | 'address') => setFields((f) => ({ ...f, [key]: !f[key] }));

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Aadhaar masking</p>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={autoDetect} onChange={(e) => setAutoDetect(e.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-red-500" />
        <span className="text-xs text-slate-300 font-semibold">Auto-detect Aadhaar number</span>
      </label>
      <p className="text-[10px] text-slate-500">Masked as per UIDAI circular — last 4 digits visible.</p>
      <div className="space-y-2">
        {([
          { key: 'first8' as const, label: 'First 8 digits' },
          { key: 'dob' as const, label: 'Date of Birth' },
          { key: 'address' as const, label: 'Address' },
        ]).map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={fields[item.key]} onChange={() => toggle(item.key)} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-red-500" />
            <span className="text-xs text-slate-300 font-semibold">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-[10px] text-slate-500 font-bold uppercase">Mask style</p>
        <div className="grid grid-cols-3 gap-2">
          {(['black', 'blur', 'pattern'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStyle(s)} className={`rounded-xl border px-2 py-2 text-[11px] font-black transition cursor-pointer ${style === s ? 'border-red-500 bg-red-500/15 text-red-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
              {s === 'black' ? 'Black box' : s === 'blur' ? 'Blur' : 'Pattern'}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={() => onMask(fields, style)} disabled={disabled} className="w-full py-3 bg-red-600 text-white font-black rounded-xl disabled:opacity-50 cursor-pointer text-sm">Apply mask</button>
    </div>
  );
};
