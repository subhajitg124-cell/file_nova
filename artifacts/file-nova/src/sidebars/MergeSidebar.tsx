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

  const sortFiles = (type: string) => {
    const next = [...files];
    if (type === 'name-asc') {
      next.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === 'name-desc') {
      next.sort((a, b) => b.name.localeCompare(a.name));
    } else if (type === 'size-asc') {
      next.sort((a, b) => a.size - b.size);
    } else if (type === 'size-desc') {
      next.sort((a, b) => b.size - a.size);
    } else if (type === 'reverse') {
      next.reverse();
    } else if (type === 'clear') {
      onFilesChange([]);
      return;
    }
    onFilesChange(next);
  };

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Files to merge ({files.length})</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/65 px-3 py-2.5 text-xs font-bold text-slate-400 hover:border-blue-500/40 hover:text-white cursor-pointer transition">
          <Plus className="h-3.5 w-3.5" /> Add PDFs
          <input type="file" accept=".pdf" multiple onChange={addFiles} className="hidden" />
        </label>
        
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              sortFiles(val);
              e.target.value = ""; // Reset dropdown
            }
          }}
          defaultValue=""
          className="bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-slate-400 font-bold focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-900 transition"
          title="Organise Files"
        >
          <option value="" disabled>⇅ Organise</option>
          <option value="name-asc">Sort Name: A → Z</option>
          <option value="name-desc">Sort Name: Z → A</option>
          <option value="size-asc">Sort Size: Smallest</option>
          <option value="size-desc">Sort Size: Largest</option>
          <option value="reverse">Reverse Order</option>
          <option value="clear">Clear All</option>
        </select>
      </div>

      <div className="space-y-2 max-h-[240px] overflow-y-auto">
        {files.map((f, idx) => (
          <div key={f.name + idx} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <span className="text-xs text-slate-300 truncate flex-1">{f.name}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} title="Move page up" aria-label="Move page up" className="text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === files.length - 1} title="Move page down" aria-label="Move page down" className="text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => remove(idx)} title="Remove file" aria-label="Remove file" className="text-slate-500 hover:text-red-400 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
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
