import React, { useState, useRef } from 'react';
import { FileText, Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Upload } from 'lucide-react';

interface MergeSidebarProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onMerge: () => void;
  disabled?: boolean;
}

export const MergeSidebar: React.FC<MergeSidebarProps> = ({ files, onFilesChange, onMerge, disabled }) => {
  const [blankBetween, setBlankBetween] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (type === 'name-asc') next.sort((a, b) => a.name.localeCompare(b.name));
    else if (type === 'name-desc') next.sort((a, b) => b.name.localeCompare(a.name));
    else if (type === 'size-asc') next.sort((a, b) => a.size - b.size);
    else if (type === 'size-desc') next.sort((a, b) => b.size - a.size);
    else if (type === 'reverse') next.reverse();
    else if (type === 'clear') { onFilesChange([]); return; }
    onFilesChange(next);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <FileText className="h-3.5 w-3.5 text-red-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">File Order</p>
          <p className="text-[10px] text-muted-foreground/80">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => inputRef.current?.click()} disabled={disabled}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/40 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer">
          <Plus className="h-3.5 w-3.5" /> Add PDFs
        </button>
        <input ref={inputRef} type="file" accept=".pdf" multiple onChange={addFiles} className="hidden" />

        <select onChange={(e) => { const v = e.target.value; if (v) { sortFiles(v); e.target.value = ""; } }} defaultValue=""
          className="rounded-xl border border-border bg-muted/30 px-2.5 py-2.5 text-xs text-muted-foreground font-bold outline-none focus:border-primary/50 cursor-pointer hover:bg-muted/50 transition"
          title="Organise Files">
          <option value="" disabled>⇅ Organise</option>
          <option value="name-asc">Sort Name: A → Z</option>
          <option value="name-desc">Sort Name: Z → A</option>
          <option value="size-asc">Sort Size: Smallest</option>
          <option value="size-desc">Sort Size: Largest</option>
          <option value="reverse">Reverse Order</option>
          <option value="clear">Clear All</option>
        </select>
      </div>

      <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
        {files.map((f, idx) => (
          <div key={f.name + idx} className="fn-glass rounded-xl px-3 py-2 flex items-center gap-2">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-foreground truncate flex-1">{f.name}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up" aria-label="Move up" className="text-muted-foreground/60 hover:text-foreground disabled:opacity-30 cursor-pointer p-1"><ArrowUp className="h-3 w-3" /></button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === files.length - 1} title="Move down" aria-label="Move down" className="text-muted-foreground/60 hover:text-foreground disabled:opacity-30 cursor-pointer p-1"><ArrowDown className="h-3 w-3" /></button>
              <button type="button" onClick={() => remove(idx)} title="Remove" aria-label="Remove" className="text-muted-foreground/60 hover:text-destructive cursor-pointer p-1"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/60">
            <Upload className="h-6 w-6 mb-1" />
            <p className="text-xs">Add PDF files to merge</p>
          </div>
        )}
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" checked={blankBetween} onChange={(e) => setBlankBetween(e.target.checked)}
          className="h-4 w-4 rounded border-border bg-muted text-primary focus:ring-primary/40" />
        <span className="text-xs text-muted-foreground group-hover:text-foreground transition font-semibold">Add blank page between docs</span>
      </label>

      <button type="button" onClick={onMerge} disabled={disabled || files.length < 2}
        className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-40 cursor-pointer text-sm hover:opacity-90 transition">
        Merge PDFs
      </button>
    </div>
  );
};
