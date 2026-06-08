import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface RotateSidebarProps {
  onRotate: (angle: number) => void;
  disabled?: boolean;
}

export const RotateSidebar: React.FC<RotateSidebarProps> = ({ onRotate, disabled }) => {
  const [selectAll, setSelectAll] = useState(false);
  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rotation</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { a: -90, l: '90° ↺' },
          { a: 90, l: '90° ↻' },
          { a: 180, l: '180°' },
        ].map((opt) => (
          <motion.button key={opt.a} type="button" whileTap={{ scale: 0.95 }} onClick={() => onRotate(opt.a)} disabled={disabled} className={`rounded-xl border px-2 py-3 text-xs font-black transition cursor-pointer ${selectAll ? 'border-yellow-500 bg-yellow-500/15 text-yellow-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
            {opt.l}
          </motion.button>
        ))}
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-yellow-500" />
        <span className="text-xs text-slate-300 font-semibold">Apply to all pages</span>
      </label>
      <p className="text-[10px] text-slate-500">Applied to all pages by default.</p>
    </div>
  );
};
