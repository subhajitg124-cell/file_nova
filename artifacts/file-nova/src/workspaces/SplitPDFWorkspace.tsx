import React, { useState, useMemo } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { Scissors, FileText, Info, Sparkles } from 'lucide-react';

export const SplitPDFWorkspace: React.FC = () => {
  const { files, updateOptions, operationOptions } = useFileStore();
  const { tText } = useTranslation();
  const [splitMode, setSplitMode] = useState(operationOptions.split_mode || 'all');

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleModeChange = (mode: string) => {
    setSplitMode(mode);
    updateOptions({ split_mode: mode });
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Split Mode</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { value: 'all', label: 'Every Page', desc: 'Each page becomes a separate PDF' },
            { value: 'range', label: 'By Range', desc: 'Split every N pages' },
            { value: 'extract', label: 'Extract Pages', desc: 'Get specific pages only' },
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                splitMode === mode.value
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="text-sm font-black text-foreground flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                {mode.label}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {splitMode === 'range' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Split Every N Pages</label>
          <input
            type="number"
            min="1"
            value={operationOptions.split_every || 1}
            onChange={(e) => updateOptions({ split_every: parseInt(e.target.value) || 1 })}
            className="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono"
          />
        </div>
      )}

      {splitMode === 'extract' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Numbers</label>
          <input
            type="text"
            value={operationOptions.split_range || '1-1'}
            onChange={(e) => updateOptions({ split_range: e.target.value })}
            className="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono"
            placeholder="e.g. 1-3, 5, 7-9"
          />
          <p className="text-[10px] text-muted-foreground">Use commas and hyphens: 1-3 = pages 1,2,3</p>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
          <FileText className="h-4 w-4" />
          <span>{files[0]?.name} — {formatSize(files[0]?.size)}</span>
        </div>
      </div>
    </div>
  );
};
