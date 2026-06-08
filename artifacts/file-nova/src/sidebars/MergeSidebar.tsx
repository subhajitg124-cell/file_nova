import React, { useState } from 'react';
import { FileText, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface MergeSidebarProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onMerge: () => void;
  disabled?: boolean;
}

export const MergeSidebar: React.FC<MergeSidebarProps> = ({ files, onFilesChange, onMerge, disabled }) => {
  const [blankBetween, setBlankBetween] = useState(false);

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    onFilesChange([...files, ...list]);
  };

  const remove = (idx: number) => onFilesChange(files.filter((_, i) => i !== idx));
  const move = (idx: number, dir: number) => {
    const next = [...files];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onFilesChange(next);
  };

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Files to merge ({files.length})</p>
      <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-400 hover:border-blue-500/40 cursor-pointer">
        <FileText className="h-4 w-4" /> + Add PDFs
        <input type="file" accept=".pdf" multiple onChange={addFiles} className="hidden" />
      </label>
      <div className="space-y-2 max-h-[240px] overflow-y-auto">
        {files.map((f, idx) => (
          <div key={f.name + idx} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <span className="text-xs text-slate-300 truncate flex-1">{f.name}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === files.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => remove(idx)} className="text-slate-500 hover:text-red-400 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={blankBetween} onChange={(e) => setBlankBetween(e.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500" />
        <span className="text-xs text-slate-300 font-semibold">Add blank page between docs</span>
      </label>
      <button type="button" onClick={onMerge} disabled={disabled || files.length < 2} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl disabled:opacity-50 cursor-pointer text-sm">Merge PDFs</button>
    </div>
  );
};
