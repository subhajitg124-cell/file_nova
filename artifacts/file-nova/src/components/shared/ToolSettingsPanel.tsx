import React, { useState, useEffect, useMemo } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { useTranslation } from '@/lib/i18n';
import { apiClient, apiMock } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Sliders, RotateCw, Lock, Unlock, Scissors, FileText, Sparkles, Eraser
} from 'lucide-react';
import { EstimatedOutputSize } from './EstimatedOutputSize';

interface ToolSettingsPanelProps {
  slug: string;
}

type PresetKey = 'low' | 'medium' | 'high' | 'custom';

export const ToolSettingsPanel: React.FC<ToolSettingsPanelProps> = ({ slug }) => {
  const { files, rawFiles, updateOptions, operationOptions, isProcessing } = useFileStore();
  const { tText } = useTranslation();
  const [activePreset, setActivePreset] = useState<PresetKey>(
    ['compress-pdf', 'compress-image'].includes(slug) ? 'medium' : 'custom'
  );
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);

  useEffect(() => {
    if (slug === 'resize-image' && rawFiles && rawFiles[0]) {
      const img = new Image();
      img.src = URL.createObjectURL(rawFiles[0]);
      img.onload = () => {
        setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        const store = useFileStore.getState();
        const opts = store.operationOptions;
        if (!opts.cropWidth) {
          store.updateOptions({
            cropX: 0,
            cropY: 0,
            cropWidth: img.naturalWidth,
            cropHeight: img.naturalHeight,
            resizeWidth: img.naturalWidth,
            resizeHeight: img.naturalHeight,
            cropEnabled: false,
            rotation: 0,
            flipH: false,
            flipV: false,
            quality: 92,
            targetFormat: 'png'
          });
        }
        URL.revokeObjectURL(img.src);
      };
    }
  }, [rawFiles, slug]);

  const handlePresetChange = (preset: PresetKey) => {
    setActivePreset(preset);
    if (preset === 'low') {
      updateOptions({ quality: 0.92, compress_preset: 'low' });
    } else if (preset === 'medium') {
      updateOptions({ quality: 0.82, compress_preset: 'balanced' });
    } else if (preset === 'high') {
      updateOptions({ quality: 0.55, compress_preset: 'high' });
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Please upload a file first');
      return;
    }

    setIsProcessingLocal(true);
    const { setProcessing, setJobId, setError, setDownloadUrl, setSavings, setSelectedSection } = useFileStore.getState();

    setSelectedSection(getToolCategory(slug));
    setProcessing(true);
    setError(null);

    const activeJobId = Math.random().toString(36).substring(2, 15);
    setJobId(activeJobId);

    try {
      const isMock = useFileStore.getState().isMockMode;
      let result;

      if (isMock) {
        result = await apiMock.simulateProcessing(
          activeJobId,
          operationOptions.operation || slug.replace('-pdf', '').replace('-image', ''),
          files,
          (p) => useFileStore.getState().setProgress(p),
          (downloadUrl, savings) => {
            setDownloadUrl(downloadUrl);
            if (savings) setSavings(savings);
          },
          (err) => setError(err),
          getOutputMime(slug)
        );
      } else {
        await apiClient.startProcessing(activeJobId, operationOptions.operation || slug, operationOptions);
        let attempts = 0;
        const maxAttempts = 60;
        while (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 2000));
          const status = await apiClient.pollStatus(activeJobId);
          if (status.status === 'completed') {
            const downloadUrl = apiClient.getDownloadUrl(activeJobId);
            setDownloadUrl(downloadUrl);
            break;
          } else if (status.status === 'failed') {
            throw new Error(status.error || 'Processing failed');
          }
          attempts++;
        }
      }

      toast.success('Processing complete! Your file is ready.');
    } catch (err: any) {
      setError(err.message || 'Processing failed. Please try again.');
      toast.error(err.message || 'Processing failed');
    } finally {
      setProcessing(false);
      setIsProcessingLocal(false);
    }
  };

  if (files.length === 0) return null;

  if (slug === 'compress-pdf') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-foreground">Choose Compression Level</h3>
          <p className="text-sm text-muted-foreground">Select the balance between quality and file size</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'low', label: 'Low (Best Quality)', desc: 'Small reduction, highest quality' },
            { key: 'medium', label: 'Medium (Balanced)', desc: 'Recommended for most uses' },
            { key: 'high', label: 'High (Smallest Size)', desc: 'Max compression, lower quality' },
          ].map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePresetChange(preset.key as PresetKey)}
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                activePreset === preset.key
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                  : 'border-border bg-card hover:border-purple-500/50'
              }`}
            >
              <p className="font-bold text-sm text-foreground">{preset.label}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{preset.desc}</p>
            </button>
          ))}
        </div>

        <EstimatedOutputSize />

        <button
          onClick={handleProcess}
          disabled={isProcessing || isProcessingLocal || files.length === 0}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-lg rounded-2xl hover:opacity-90 transition shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessingLocal || isProcessing ? 'Processing...' : "Start Now — It's Free"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-black text-foreground">Tool Settings</h3>
        </div>
        {renderSettings(slug, operationOptions, updateOptions, activePreset, setActivePreset, naturalDimensions, aspectRatioLocked, setAspectRatioLocked)}
      </div>

      {/* Estimated Output */}
      <EstimatedOutputSize />

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={isProcessing || isProcessingLocal || files.length === 0}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-xl hover:opacity-90 transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {(isProcessing || isProcessingLocal) ? (
          <>
            <Sparkles className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            {getButtonLabel(slug)}
          </>
        )}
      </button>
    </div>
  );
};

function getToolCategory(slug: string): 'pdf' | 'image' | 'video' | 'office' | null {
  const map: Record<string, string> = {
    'merge-pdf': 'pdf', 'split-pdf': 'pdf', 'compress-pdf': 'pdf',
    'pdf-to-word': 'office', 'pdf-to-jpg': 'image', 'jpg-to-pdf': 'image',
    'rotate-pdf': 'pdf', 'unlock-pdf': 'pdf', 'protect-pdf': 'pdf',
    'resize-pdf': 'pdf', 'ocr': 'pdf', 'remove-background': 'image',
    'pan-card-resize': 'image', 'aadhaar-mask-pdf': 'pdf',
    'government-form-fill': 'pdf', 'compress-pdf-for-upload': 'pdf',
    'ai-pdf-summary': 'pdf', 'scholarship-zip': 'pdf',
    'resize-image': 'image', 'word-to-pdf': 'office', 'compress-image': 'image',
  };
  return (map[slug] as any) || null;
}

function getOutputMime(slug: string): string | undefined {
  const map: Record<string, string> = {
    'pdf-to-jpg': 'image/jpeg', 'jpg-to-pdf': 'application/pdf',
    'pdf-to-word': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'word-to-pdf': 'application/pdf',
    'remove-background': 'image/png',
    'resize-image': 'image/jpeg',
    'compress-image': 'image/jpeg',
  };
  return map[slug];
}

function getButtonLabel(slug: string): string {
  const labels: Record<string, string> = {
    'merge-pdf': 'Merge PDF', 'split-pdf': 'Split PDF',
    'compress-pdf': 'Compress PDF', 'compress-pdf-for-upload': 'Compress for Upload',
    'pdf-to-word': 'Convert to Word', 'pdf-to-jpg': 'Convert to JPG',
    'jpg-to-pdf': 'Convert to PDF', 'rotate-pdf': 'Rotate PDF',
    'unlock-pdf': 'Unlock PDF', 'protect-pdf': 'Protect PDF',
    'resize-pdf': 'Resize PDF', 'ocr': 'Extract Text',
    'remove-background': 'Remove Background', 'pan-card-resize': 'Resize Photo',
    'aadhaar-mask-pdf': 'Mask Aadhaar', 'government-form-fill': 'Fill Form',
    'ai-pdf-summary': 'Summarize PDF', 'scholarship-zip': 'Create ZIP',
    'resize-image': 'Resize Image', 'word-to-pdf': 'Convert to PDF',
    'compress-image': 'Compress Image',
  };
  return labels[slug] || 'Process';
}

function renderSettings(
  slug: string,
  options: Record<string, any>,
  update: (o: Record<string, any>) => void,
  preset: PresetKey,
  setPreset: (p: PresetKey) => void,
  naturalDimensions: { width: number; height: number } | null,
  aspectRatioLocked: boolean,
  setAspectRatioLocked: (v: boolean) => void
): React.ReactNode {
  if (slug === 'compress-pdf' || slug === 'compress-pdf-for-upload') return renderCompressSettings(options, update, preset, setPreset, slug);
  if (slug === 'compress-image') return renderCompressImageSettings(options, update, preset, setPreset);
  if (slug === 'merge-pdf') return renderMergeSettings(options, update);
  if (slug === 'split-pdf') return renderSplitSettings(options, update);
  if (slug === 'rotate-pdf') return renderRotateSettings(options, update);
  if (slug === 'protect-pdf') return renderProtectSettings(options, update);
  if (slug === 'unlock-pdf') return renderUnlockSettings(options, update);
  if (slug === 'ocr') return renderOcrSettings(options, update);
  if (slug === 'resize-image') return renderResizeImageSettings(options, update, naturalDimensions, aspectRatioLocked, setAspectRatioLocked);
  if (['jpg-to-pdf', 'pdf-to-jpg', 'remove-background', 'pan-card-resize', 'word-to-pdf'].includes(slug)) return renderImageSettings(slug, options, update);
  return <p className="text-xs text-muted-foreground">Upload a file to see options.</p>;
}

function renderCompressSettings(options: Record<string, any>, update: (o: Record<string, any>) => void, preset: PresetKey, setPreset: (p: PresetKey) => void, slug: string): React.ReactNode {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compression Level</label>
        <div className="flex gap-2 flex-wrap">
          {(['low', 'medium', 'high'] as PresetKey[]).map((p) => (
            <button key={p} onClick={() => { setPreset(p); if (p === 'low') update({ quality: 0.92, compress_preset: 'low' }); else if (p === 'medium') update({ quality: 0.82, compress_preset: 'balanced' }); else if (p === 'high') update({ quality: 0.55, compress_preset: 'high' }); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${preset === p ? 'bg-primary text-primary-foreground border-primary shadow-glow' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
              {p === 'low' ? 'Low (Best)' : p === 'medium' ? 'Medium' : 'High (Small)'}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality</label>
          <span className="text-xs font-bold text-primary">{Math.round((options.quality || 0.82) * 100)}%</span>
        </div>
        <input type="range" min="10" max="100" value={(options.quality || 0.82) * 100} onChange={(e) => { setPreset('custom'); update({ quality: parseInt(e.target.value) / 100 }); }} title="Quality" className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
      </div>
      {slug === 'compress-pdf-for-upload' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Size (KB)</label>
          <input type="number" value={options.targetSizeKb || 200} onChange={(e) => update({ targetSizeKb: parseInt(e.target.value) || 200 })} className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono" placeholder="e.g. 200" />
          <p className="text-[10px] text-muted-foreground">Common: 100KB (IRCTC), 200KB (scholarships), 500KB, 1MB (DigiLocker)</p>
        </div>
      )}
    </div>
  );
}

function renderMergeSettings(options: Record<string, any>, update: (o: Record<string, any>) => void): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs text-blue-700 dark:text-blue-300"><strong>Tip:</strong> Drag file cards above to reorder. The merged PDF follows your arrangement.</p>
      </div>
    </div>
  );
}

function renderSplitSettings(options: Record<string, any>, update: (o: Record<string, any>) => void): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Split Mode</label>
        <select value={options.split_mode || 'all'} onChange={(e) => update({ split_mode: e.target.value })} title="Split Mode" className="w-full p-2.5 bg-card border border-border rounded-xl text-sm">
          <option value="all">Every page as separate file</option>
          <option value="range">By page range</option>
          <option value="extract">Extract specific pages</option>
        </select>
      </div>
      {options.split_mode === 'range' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Split every N pages</label>
          <input type="number" min="1" value={options.split_every || 1} onChange={(e) => update({ split_every: parseInt(e.target.value) || 1 })} title="Split every N pages" placeholder="1" className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono" />
        </div>
      )}
      {options.split_mode === 'extract' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page numbers (comma separated)</label>
          <input type="text" value={options.split_range || '1-1'} onChange={(e) => update({ split_range: e.target.value })} className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono" placeholder="e.g. 1-3, 5, 7-9" />
        </div>
      )}
    </div>
  );
}

function renderRotateSettings(options: Record<string, any>, update: (o: Record<string, any>) => void): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rotation</label>
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 90, l: '90° CW' }, { v: 180, l: '180°' }, { v: 270, l: '270° CW' }, { v: -90, l: '90° CCW' }].map((opt) => (
            <button key={opt.v} onClick={() => update({ rotation: opt.v })} className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${options.rotation === opt.v ? 'bg-primary text-primary-foreground border-primary shadow-glow' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
              <RotateCw className="h-3.5 w-3.5 inline mr-1" />{opt.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderProtectSettings(options: Record<string, any>, update: (o: Record<string, any>) => void): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open Password</label>
        <input type="text" value={options.openPassword || ''} onChange={(e) => update({ openPassword: e.target.value })} className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono" placeholder="Enter password" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions Password (optional)</label>
        <input type="text" value={options.permissionsPassword || ''} onChange={(e) => update({ permissionsPassword: e.target.value })} className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono" placeholder="Restrict printing/editing" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {[{ k: 'allowPrint', l: 'Allow Print' }, { k: 'allowCopy', l: 'Allow Copy' }, { k: 'allowEdit', l: 'Allow Edit' }].map((opt) => (
          <button key={opt.k} onClick={() => update({ [opt.k]: !options[opt.k] })} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${options[opt.k] !== false ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}>
            {opt.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function renderUnlockSettings(options: Record<string, any>, update: (o: Record<string, any>) => void): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PDF Password</label>
        <input type="text" value={options.password || ''} onChange={(e) => update({ password: e.target.value })} className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono" placeholder="Enter the correct password" />
        <p className="text-[10px] text-muted-foreground">FileNova does not crack passwords. You must know the correct password.</p>
      </div>
    </div>
  );
}

function renderOcrSettings(options: Record<string, any>, update: (o: Record<string, any>) => void): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</label>
        <select value={options.ocrLanguage || 'eng'} onChange={(e) => update({ ocrLanguage: e.target.value })} title="Select OCR Language" className="w-full p-2.5 bg-card border border-border rounded-xl text-sm">
          <option value="eng">English</option>
          <option value="hin">Hindi (हिन्दी)</option>
          <option value="ben">Bengali (বাংলা)</option>
          <option value="tam">Tamil (தமிழ்)</option>
          <option value="tel">Telugu (తెలుగు)</option>
          <option value="mar">Marathi (मराठी)</option>
          <option value="guj">Gujarati (ગુજરાતી)</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Range</label>
        <input type="text" value={options.pageRange || 'all'} onChange={(e) => update({ pageRange: e.target.value })} className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono" placeholder="all or 1-5, 8" />
      </div>
    </div>
  );
}

function renderImageSettings(slug: string, options: Record<string, any>, update: (o: Record<string, any>) => void): React.ReactNode {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output Format</label>
        <select value={options.targetFormat || options.imageFormat || 'jpeg'} onChange={(e) => update({ targetFormat: e.target.value, imageFormat: e.target.value })} title="Select Output Format" className="w-full p-2.5 bg-card border border-border rounded-xl text-sm">
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality</label>
          <span className="text-xs font-bold text-primary">{options.quality || 82}%</span>
        </div>
        <input type="range" min="10" max="100" value={options.quality || 82} onChange={(e) => update({ quality: parseInt(e.target.value) })} title="Quality" className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
      </div>
      {slug !== 'remove-background' && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dimensions (px)</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Width</label>
              <input type="number" value={options.resizeWidth || options.resize_width || ''} onChange={(e) => update({ resizeWidth: parseInt(e.target.value) || undefined, resize_width: parseInt(e.target.value) || undefined })} className="w-full p-2 bg-card border border-border rounded-lg text-sm font-mono" placeholder="Auto" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Height</label>
              <input type="number" value={options.resizeHeight || options.resize_height || ''} onChange={(e) => update({ resizeHeight: parseInt(e.target.value) || undefined, resize_height: parseInt(e.target.value) || undefined })} className="w-full p-2 bg-card border border-border rounded-lg text-sm font-mono" placeholder="Auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderCompressImageSettings(options: Record<string, any>, update: (o: Record<string, any>) => void, preset: PresetKey, setPreset: (p: PresetKey) => void): React.ReactNode {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compression Level</label>
        <div className="flex gap-2 flex-wrap">
          {(['low', 'medium', 'high'] as PresetKey[]).map((p) => (
            <button key={p} type="button" onClick={() => {
              setPreset(p);
              if (p === 'low') update({ quality: 92, compress_preset: 'low' });
              else if (p === 'medium') update({ quality: 82, compress_preset: 'balanced' });
              else if (p === 'high') update({ quality: 55, compress_preset: 'high' });
            }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${preset === p ? 'bg-primary text-primary-foreground border-primary shadow-glow' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
              {p === 'low' ? 'Low (Best Quality)' : p === 'medium' ? 'Medium (Balanced)' : 'High (Smallest Size)'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality</label>
          <span className="text-xs font-bold text-primary">{options.quality || 82}%</span>
        </div>
        <input type="range" min="10" max="100" value={options.quality || 82} onChange={(e) => {
          setPreset('custom');
          update({ quality: parseInt(e.target.value) });
        }} title="Quality" className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output Format</label>
        <select value={options.targetFormat || options.imageFormat || 'jpeg'} onChange={(e) => update({ targetFormat: e.target.value, imageFormat: e.target.value })} title="Select Output Format" className="w-full p-2.5 bg-card border border-border rounded-xl text-sm">
          <option value="jpeg">JPEG (Best compression)</option>
          <option value="png">PNG (Lossless/Transparent)</option>
          <option value="webp">WebP (Modern high-efficiency)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resize Dimensions (Optional)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Max Width (px)</label>
            <input type="number" value={options.resizeWidth || options.resize_width || ''} onChange={(e) => update({ resizeWidth: parseInt(e.target.value) || undefined, resize_width: parseInt(e.target.value) || undefined })} className="w-full p-2 bg-card border border-border rounded-lg text-sm font-mono" placeholder="Original" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Max Height (px)</label>
            <input type="number" value={options.resizeHeight || options.resize_height || ''} onChange={(e) => update({ resizeHeight: parseInt(e.target.value) || undefined, resize_height: parseInt(e.target.value) || undefined })} className="w-full p-2 bg-card border border-border rounded-lg text-sm font-mono" placeholder="Original" />
          </div>
        </div>
      </div>
    </div>
  );
}

function renderResizeImageSettings(
  options: Record<string, any>,
  update: (o: Record<string, any>) => void,
  naturalDimensions: { width: number; height: number } | null,
  aspectRatioLocked: boolean,
  setAspectRatioLocked: (v: boolean) => void
): React.ReactNode {
  const aspect = naturalDimensions ? naturalDimensions.width / naturalDimensions.height : 1;

  const handleWidthChange = (w: number) => {
    if (aspectRatioLocked) {
      update({ resizeWidth: w, resizeHeight: Math.round(w / aspect) });
    } else {
      update({ resizeWidth: w });
    }
  };

  const handleHeightChange = (h: number) => {
    if (aspectRatioLocked) {
      update({ resizeWidth: Math.round(h * aspect), resizeHeight: h });
    } else {
      update({ resizeHeight: h });
    }
  };

  const handleRotate = (deg: number) => {
    const currentRot = options.rotation || 0;
    const nextRot = (currentRot + deg + 360) % 360;
    update({ rotation: nextRot });
  };

  return (
    <div className="space-y-6">
      {naturalDimensions && (
        <div className="p-3 bg-secondary/50 rounded-xl flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-bold">Original Image Size:</span>
          <span className="font-mono text-primary font-bold">{naturalDimensions.width} × {naturalDimensions.height} px</span>
        </div>
      )}

      {/* Resize Options */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">1. Resize Dimensions (px)</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold">Width</label>
            <input
              type="number"
              value={options.resizeWidth || ''}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
              placeholder="Width"
              title="Resize Width"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground font-bold">Height</label>
            <input
              type="number"
              value={options.resizeHeight || ''}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
              placeholder="Height"
              title="Resize Height"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Keep Aspect Ratio Lock</span>
          <button
            type="button"
            onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
            className={`p-1.5 rounded-lg border flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
              aspectRatioLocked ? 'bg-primary/10 text-primary border-primary/30' : 'bg-card border-border text-muted-foreground'
            }`}
          >
            {aspectRatioLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            {aspectRatioLocked ? 'Locked' : 'Unlocked'}
          </button>
        </div>
      </div>

      {/* Rotate & Flip Options */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">2. Rotate & Mirror</label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleRotate(90)}
            className="flex-1 py-2 px-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            +90° CW
          </button>
          <button
            type="button"
            onClick={() => handleRotate(-90)}
            className="flex-1 py-2 px-3 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5 transform -scale-x-100" />
            -90° CCW
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ flipH: !options.flipH })}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              options.flipH ? 'bg-primary/10 text-primary border-primary/30' : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            ↔️ Flip Horizontal
          </button>
          <button
            type="button"
            onClick={() => update({ flipV: !options.flipV })}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
              options.flipV ? 'bg-primary/10 text-primary border-primary/30' : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            ↕️ Flip Vertical
          </button>
        </div>
        {options.rotation > 0 && (
          <div className="text-[11px] text-primary/85 font-bold text-center mt-1">
            Active rotation: <span className="font-mono">{options.rotation}°</span>
          </div>
        )}
      </div>

      {/* Crop Options */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Scissors className="h-3.5 w-3.5" />
            3. Crop Tool
          </label>
          <button
            type="button"
            onClick={() => update({ cropEnabled: !options.cropEnabled })}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
              options.cropEnabled ? 'bg-emerald-550/10 text-emerald-500 border border-emerald-500/30' : 'bg-muted text-muted-foreground border border-border'
            }`}
          >
            {options.cropEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {options.cropEnabled && (
          <div className="space-y-3 p-3 bg-card/50 rounded-2xl border border-border/60 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-bold">X Offset (Left)</label>
                <input
                  type="number"
                  min="0"
                  max={naturalDimensions ? naturalDimensions.width : undefined}
                  value={options.cropX ?? 0}
                  onChange={(e) => update({ cropX: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full p-2 bg-card border border-border rounded-lg text-xs font-mono focus:outline-none"
                  placeholder="0"
                  title="Crop X Offset"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-bold">Y Offset (Top)</label>
                <input
                  type="number"
                  min="0"
                  max={naturalDimensions ? naturalDimensions.height : undefined}
                  value={options.cropY ?? 0}
                  onChange={(e) => update({ cropY: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full p-2 bg-card border border-border rounded-lg text-xs font-mono focus:outline-none"
                  placeholder="0"
                  title="Crop Y Offset"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-bold">Crop Width</label>
                <input
                  type="number"
                  min="1"
                  max={naturalDimensions ? naturalDimensions.width : undefined}
                  value={options.cropWidth ?? (naturalDimensions ? naturalDimensions.width : 500)}
                  onChange={(e) => update({ cropWidth: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full p-2 bg-card border border-border rounded-lg text-xs font-mono focus:outline-none"
                  placeholder="Width"
                  title="Crop Width"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-bold">Crop Height</label>
                <input
                  type="number"
                  min="1"
                  max={naturalDimensions ? naturalDimensions.height : undefined}
                  value={options.cropHeight ?? (naturalDimensions ? naturalDimensions.height : 500)}
                  onChange={(e) => update({ cropHeight: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full p-2 bg-card border border-border rounded-lg text-xs font-mono focus:outline-none"
                  placeholder="Height"
                  title="Crop Height"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Format & Quality Settings */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">4. Format & Quality</label>
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground font-bold">Output Format</label>
          <select
            value={options.targetFormat || options.imageFormat || 'png'}
            onChange={(e) => update({ targetFormat: e.target.value, imageFormat: e.target.value })}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-xs"
            title="Output Format"
          >
            <option value="jpeg">JPEG (Best compression)</option>
            <option value="png">PNG (Lossless / Transparent)</option>
            <option value="webp">WebP (High efficiency)</option>
          </select>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-muted-foreground font-bold">Quality</span>
            <span className="text-[10px] text-primary font-bold">{options.quality || 92}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={options.quality || 92}
            onChange={(e) => update({ quality: parseInt(e.target.value) })}
            className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
            title="Quality Slider"
          />
        </div>
      </div>
    </div>
  );
}

