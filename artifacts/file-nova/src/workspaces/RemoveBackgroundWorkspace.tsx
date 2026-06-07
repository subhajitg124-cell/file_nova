import React, { useState } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { Eraser, Download, Image, Wand2 } from 'lucide-react';

export const RemoveBackgroundWorkspace: React.FC = () => {
  const { files, updateOptions, operationOptions } = useFileStore();
  const { tText } = useTranslation();
  const [previewMode, setPreviewMode] = useState<'original' | 'result'>('original');

  if (files.length === 0) return null;

  return (
    <div className="space-y-6">
      {files[0]?.previewUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-white dark:bg-slate-950 p-4 flex justify-center">
          <img
            src={previewMode === 'result' ? (useFileStore.getState().downloadUrl || files[0].previewUrl) : files[0].previewUrl}
            alt="Preview"
            className="max-h-64 object-contain rounded-lg"
          />
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-md">
            {previewMode === 'original' ? 'Original' : 'Result (transparent)'}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output Format</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'png', label: 'PNG (Transparent)' },
              { value: 'jpeg', label: 'JPEG (White BG)' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateOptions({ outputFormat: opt.value })}
                className={`px-3 py-2.5 rounded-xl border-2 transition-all text-xs font-bold ${
                  (operationOptions.outputFormat || 'png') === opt.value
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {operationOptions.outputFormat === 'jpeg' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={operationOptions.bgColor || '#ffffff'}
                onChange={(e) => updateOptions({ bgColor: e.target.value })}
                className="h-9 w-12 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                value={operationOptions.bgColor || '#ffffff'}
                onChange={(e) => updateOptions({ bgColor: e.target.value })}
                className="flex-1 p-2 bg-card border border-border rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
