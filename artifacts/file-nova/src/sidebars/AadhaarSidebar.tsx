import React, { useState } from 'react';
import { Eye, EyeOff, MapPin, CalendarDays, Hash, ShieldCheck } from 'lucide-react';

interface AadhaarSidebarProps {
  onMask: (fields: { first8: boolean; dob: boolean; address: boolean }, style: 'black' | 'blur' | 'pattern') => void;
  disabled?: boolean;
}

export const AadhaarSidebar: React.FC<AadhaarSidebarProps> = ({ onMask, disabled }) => {
  const [autoDetect, setAutoDetect] = useState(false);
  const [fields, setFields] = useState({ first8: true, dob: true, address: true });
  const [style, setStyle] = useState<'black' | 'blur' | 'pattern'>('black');

  const toggle = (key: 'first8' | 'dob' | 'address') => setFields((f) => ({ ...f, [key]: !f[key] }));

  const fieldItems = [
    { key: 'first8' as const, label: 'First 8 digits', icon: Hash, desc: 'Last 4 digits visible' },
    { key: 'dob' as const, label: 'Date of Birth', icon: CalendarDays, desc: 'Mask DOB field' },
    { key: 'address' as const, label: 'Address', icon: MapPin, desc: 'Mask address field' },
  ];

  const styleOptions = [
    { key: 'black' as const, label: 'Black box', desc: 'Solid black overlay' },
    { key: 'blur' as const, label: 'Blur', desc: 'Gaussian blur effect' },
    { key: 'pattern' as const, label: 'Pattern', desc: 'XXX-XXXX pattern' },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Aadhaar Masking</p>
          <p className="text-[10px] text-muted-foreground/80">Protect sensitive Aadhaar data</p>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" checked={autoDetect} onChange={(e) => setAutoDetect(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-muted text-primary focus:ring-primary/40" />
        <div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition font-semibold">Auto-detect Aadhaar number</span>
          <p className="text-[9px] text-muted-foreground/60">Automatically find and mask Aadhaar numbers</p>
        </div>
      </label>

      <div className="fn-glass rounded-xl p-3 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="h-3 w-3 text-amber-400" />
          <p className="text-[10px] text-amber-400 font-bold">UIDAI Compliance</p>
        </div>
        <p className="text-[10px] text-muted-foreground">Last 4 digits remain visible as per UIDAI guidelines. Masking protects your Aadhaar privacy.</p>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Fields to Mask</span>
        {fieldItems.map(({ key, label, icon: Icon, desc }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={fields[key]} onChange={() => toggle(key)}
              className="h-4 w-4 rounded border-border bg-muted text-primary focus:ring-primary/40" />
            <div className="flex items-center gap-2">
              <Icon className="h-3 w-3 text-muted-foreground/60" />
              <div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition font-semibold">{label}</span>
                <p className="text-[9px] text-muted-foreground/60">{desc}</p>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Mask Style</span>
        <div className="grid grid-cols-3 gap-2">
          {styleOptions.map(({ key, label, desc }) => (
            <button key={key} type="button" onClick={() => setStyle(key)}
              className={`rounded-xl border px-2 py-2 text-[11px] font-bold transition cursor-pointer ${
                style === key
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
              }`}>
              <div>{label}</div>
              <div className="text-[8px] font-normal opacity-70">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={() => onMask(fields, style)} disabled={disabled}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-40 cursor-pointer text-sm hover:opacity-90 transition">
        Apply Mask
      </button>
    </div>
  );
};
