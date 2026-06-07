import React, { useMemo } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { useTranslation } from '@/lib/i18n';
import { Info, TrendingDown, TrendingUp } from 'lucide-react';

export const EstimatedOutputSize: React.FC = () => {
  const { files, rawFiles, operationOptions } = useFileStore();

  const estimate = useMemo(() => {
    if (files.length === 0) return null;

    const totalOriginal = rawFiles.reduce((sum, f) => sum + f.size, 0);
    const quality = operationOptions.quality ?? 0.82;
    const preset = operationOptions.compress_preset || 'balanced';
    
    let qualityFactor = 0.7;
    if (preset === 'low' || quality >= 0.9) qualityFactor = 0.85;
    else if (preset === 'high' || quality <= 0.6) qualityFactor = 0.4;
    else if (preset === 'balanced' || quality >= 0.7 && quality <= 0.9) qualityFactor = 0.65;

    const estimatedSize = totalOriginal * qualityFactor;
    const reductionPercent = ((totalOriginal - estimatedSize) / totalOriginal) * 100;
    const qualityLoss = 100 - (quality * 100);

    return {
      originalSize: totalOriginal,
      estimatedSize,
      reductionPercent: Math.round(reductionPercent),
      qualityLoss: Math.round(qualityLoss),
    };
  }, [files, rawFiles, operationOptions]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!estimate || files.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-border rounded-2xl p-5 space-y-4">
      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" />
        Estimated Output
      </h4>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Original Size</p>
          <p className="text-lg font-black text-foreground font-mono">{formatSize(estimate.originalSize)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Est. Output</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatSize(estimate.estimatedSize)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Reduction</p>
          <p className="text-lg font-black text-primary font-mono flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            ~{estimate.reductionPercent}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {estimate.qualityLoss > 15 ? (
            <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
          )}
          <span>Quality loss: ~{estimate.qualityLoss}%</span>
        </div>
        <span className="text-[10px] text-muted-foreground italic">
          * Estimate based on current settings
        </span>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-violet-400 rounded-full transition-all duration-500"
          style={{ width: `${100 - estimate.reductionPercent}%` }}
        />
        <div 
          className="absolute top-0 h-full w-0.5 bg-white shadow z-10"
          style={{ left: `${100 - estimate.reductionPercent}%` }}
        />
      </div>
    </div>
  );
};
