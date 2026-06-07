import React, { useState, useMemo } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { useTranslation } from '@/lib/i18n';
import { Maximize, Minimize, Info, Sparkles } from 'lucide-react';

export const ResizeImageWorkspace: React.FC = () => {
  const { files, updateOptions, operationOptions } = useFileStore();
  const { tText } = useTranslation();
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const estimate = useMemo(() => {
    if (files.length === 0) return null;
    const totalOriginal = files.reduce((s, f) => s + f.size, 0);
    const quality = operationOptions.quality || 0.82;
    const estimatedSize = totalOriginal * quality;
    return {
      originalSize: totalOriginal,
      estimatedSize,
      reductionPercent: Math.round(((totalOriginal - estimatedSize) / totalOriginal) * 100),
      qualityLoss: Math.round(100 - (quality * 100)),
    };
  }, [files, operationOptions]);

  if (files.length === 0) return null;

  return (
    <div className="space-y-6">
      {files[0]?.previewUrl && (
        <div className="rounded-2xl overflow-hidden border border-border bg-muted/10 p-4 flex justify-center">
          <img
            src={files[0].previewUrl}
            alt="Preview"
            className="max-h-64 object-contain rounded-lg"
            style={{
              width: operationOptions.resizeWidth ? `${Math.min(operationOptions.resizeWidth, 400)}px` : 'auto',
              height: operationOptions.resizeHeight ? `${Math.min(operationOptions.resizeHeight, 400)}px` : 'auto',
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dimensions (pixels)</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground">Width</label>
            <input
              type="number"
              value={operationOptions.resizeWidth || operationOptions.resize_width || ''}
              onChange={(e) => {
                const w = parseInt(e.target.value) || undefined;
                updateOptions({ resizeWidth: w, resize_width: w });
                if (w && lockAspect && aspectRatio) {
                  updateOptions({ resizeHeight: Math.round(w / aspectRatio), resize_height: Math.round(w / aspectRatio) });
                }
              }}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono"
              placeholder="Auto"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground">Height</label>
            <input
              type="number"
              value={operationOptions.resizeHeight || operationOptions.resize_height || ''}
              onChange={(e) => {
                const h = parseInt(e.target.value) || undefined;
                updateOptions({ resizeHeight: h, resize_height: h });
                if (h && lockAspect && aspectRatio) {
                  updateOptions({ resizeWidth: Math.round(h * aspectRatio), resize_width: Math.round(h * aspectRatio) });
                }
              }}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono"
              placeholder="Auto"
            />
          </div>
        </div>
        <button
          onClick={() => setLockAspect(!lockAspect)}
          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
            lockAspect ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'
          }`}
        >
          {lockAspect ? '🔒 Aspect Locked' : '🔓 Free Ratio'}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output Format</label>
        <select
          value={operationOptions.targetFormat || operationOptions.imageFormat || 'jpeg'}
          onChange={(e) => updateOptions({ targetFormat: e.target.value, imageFormat: e.target.value })}
          className="w-full p-2.5 bg-card border border-border rounded-xl text-sm"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality</label>
          <span className="text-xs font-bold text-primary">{operationOptions.quality || 82}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={operationOptions.quality || 82}
          onChange={(e) => updateOptions({ quality: parseInt(e.target.value) })}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
        />
      </div>

      {estimate && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Info className="h-3.5 w-3.5" />
            Estimated Output
          </h4>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Original: <span className="font-mono font-bold">{formatSize(estimate.originalSize)}</span></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{formatSize(estimate.estimatedSize)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
