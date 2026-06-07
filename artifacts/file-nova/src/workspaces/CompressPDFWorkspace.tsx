import React, { useState, useMemo } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { apiClient, apiMock } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Info, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';

export const CompressPDFWorkspace: React.FC = () => {
  const { files, rawFiles, updateOptions, operationOptions } = useFileStore();
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const estimate = useMemo(() => {
    if (files.length === 0) return null;
    const totalOriginal = rawFiles.reduce((s, f) => s + f.size, 0);
    const quality = operationOptions.quality ?? 0.82;
    const preset = operationOptions.compress_preset || 'balanced';
    
    let qualityFactor = 0.7;
    if (preset === 'low' || quality >= 0.9) qualityFactor = 0.85;
    else if (preset === 'high' || quality <= 0.6) qualityFactor = 0.4;
    else qualityFactor = 0.65;

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

  const handlePresetChange = (preset: string) => {
    if (preset === 'low') updateOptions({ quality: 0.92, compress_preset: 'low' });
    else if (preset === 'medium') updateOptions({ quality: 0.82, compress_preset: 'balanced' });
    else if (preset === 'high') updateOptions({ quality: 0.55, compress_preset: 'high' });
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsProcessingLocal(true);
    const { setProcessing, setJobId, setError, setDownloadUrl, setSavings } = useFileStore.getState();

    setProcessing(true);
    setError(null);
    const activeJobId = Math.random().toString(36).substring(2, 15);
    setJobId(activeJobId);

    try {
      const isMock = useFileStore.getState().isMockMode;
      if (isMock) {
        await apiMock.simulateProcessing(
          activeJobId, 'compress', files,
          (p) => useFileStore.getState().setProgress(p),
          (downloadUrl, savings) => {
            setDownloadUrl(downloadUrl);
            if (savings) setSavings(savings);
          },
          (err) => setError(err),
          'application/pdf'
        );
      } else {
        await apiClient.startProcessing(activeJobId, 'compress', operationOptions);
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const status = await apiClient.pollStatus(activeJobId);
          if (status.status === 'completed') {
            setDownloadUrl(apiClient.getDownloadUrl(activeJobId));
            break;
          } else if (status.status === 'failed') {
            throw new Error(status.error || 'Processing failed');
          }
        }
      }
      toast.success('PDF compressed successfully!');
    } catch (err: any) {
      setError(err.message || 'Compression failed');
      toast.error(err.message || 'Compression failed');
    } finally {
      setProcessing(false);
      setIsProcessingLocal(false);
    }
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compression Level</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'low', label: 'Low', desc: 'Best quality' },
            { key: 'medium', label: 'Medium', desc: 'Balanced' },
            { key: 'high', label: 'High', desc: 'Smallest size' },
          ].map((preset) => (
            <button
              key={preset.key}
              onClick={() => handlePresetChange(preset.key)}
              className="p-4 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all text-left"
            >
              <div className="text-sm font-black text-foreground">{preset.label}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality</label>
          <span className="text-sm font-black text-primary">{Math.round((operationOptions.quality || 0.82) * 100)}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={(operationOptions.quality || 0.82) * 100}
          onChange={(e) => updateOptions({ quality: parseInt(e.target.value) / 100 })}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
        />
      </div>

      {estimate && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-border rounded-2xl p-5 space-y-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Estimated Output
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase">Original</p>
              <p className="text-base font-black text-foreground font-mono">{formatSize(estimate.originalSize)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase">Estimated</p>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatSize(estimate.estimatedSize)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase">Reduction</p>
              <p className="text-base font-black text-primary font-mono">~{estimate.reductionPercent}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
            <span>Quality loss: ~{estimate.qualityLoss}%</span>
            <span className="italic">* Estimate based on current settings</span>
          </div>
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={isProcessingLocal}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-xl hover:opacity-90 transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {isProcessingLocal ? (
          <>
            <Sparkles className="h-5 w-5 animate-spin" />
            Compressing...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Compress PDF
          </>
        )}
      </button>
    </div>
  );
};
