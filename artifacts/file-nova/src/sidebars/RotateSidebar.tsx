import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, RotateCcw, RefreshCw } from 'lucide-react';

interface RotateSidebarProps {
  onRotate: (angle: number) => void;
  disabled?: boolean;
}

export const RotateSidebar: React.FC<RotateSidebarProps> = ({ onRotate, disabled }) => {
  const [selectAll, setSelectAll] = useState(false);

  const rotations = [
    { a: -90, l: '90° ↺', icon: RotateCcw },
    { a: 90, l: '90° ↻', icon: RotateCw },
    { a: 180, l: '180°', icon: RefreshCw },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
          <RotateCw className="h-3.5 w-3.5 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Rotate Pages</p>
          <p className="text-[10px] text-muted-foreground/80">Choose rotation angle</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {rotations.map((opt) => {
          const Icon = opt.icon;
          return (
            <motion.button key={opt.a} type="button" whileTap={{ scale: 0.95 }} onClick={() => onRotate(opt.a)} disabled={disabled}
              className={`rounded-xl border px-2 py-3 text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                selectAll
                  ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                  : 'border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
              }`}>
              <Icon className="h-4 w-4" />
              {opt.l}
            </motion.button>
          );
        })}
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-muted text-primary focus:ring-primary/40" />
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition font-semibold">Apply to all pages</span>
      </label>

      <div className="fn-glass rounded-xl p-3">
        <p className="text-[10px] text-muted-foreground">Applied to all pages by default. Deselect to rotate individual pages in preview.</p>
      </div>
    </div>
  );
};
