import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders, RefreshCw, Settings2, Play, Loader2, Sparkles, Video, FileText,
  Scissors, Music, FileArchive, Image, ArrowLeftRight, FileCode, Maximize2,
  MonitorSmartphone, Globe, Lock, Unlock
} from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';
import { apiClient, apiMock } from '@/lib/api';
import {
  runClientSidePdfMerge, runClientSidePdfCompress,
  runClientSidePdfSplit, runClientSideImagesToPdf
} from '@/lib/processing/pdf/client-pdf';
import {
  compressImage, resizeImage, convertToIco, convertSvgToPng,
  convertImageFormat, getImageDimensions
} from '@/lib/processing/image/client-image';

// ── Shared sub-components ──────────────────────────────────────────────────

const InfoBox: React.FC<{ icon: React.ReactNode; text: string; color?: string }> = ({ icon, text, color = 'bg-muted/40 border-border' }) => (
  <div className={`p-4 rounded-xl border text-sm text-muted-foreground flex items-start gap-3 ${color}`}>
    <span className="shrink-0 mt-0.5">{icon}</span>
    <span className="leading-relaxed">{text}</span>
  </div>
);

const Slider: React.FC<{
  id: string; label: string; value: number; min: number; max: number;
  unit: string; hint?: string; step?: number; onChange: (v: number) => void;
}> = ({ id, label, value, min, max, unit, hint, step = 1, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm font-bold text-primary tabular-nums">{value}{unit}</span>
      </div>
      <div className="relative">
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-150" style={{ width: `${pct}%` }} />
        </div>
        <input id={id} type="range" min={min} max={max} value={value} step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5 top-0" style={{ WebkitAppearance: 'slider-horizontal' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white border-2 border-primary shadow-md pointer-events-none transition-all duration-150"
          style={{ left: `${pct}%` }}
        />
      </div>
      {hint && <p className="text-[10px] text-muted-foreground leading-relaxed">{hint}</p>}
    </div>
  );
};

const PresetRow: React.FC<{
  label: string;
  options: { value: string | number; label: string; hint?: string }[];
  value: string | number;
  onChange: (v: string | number) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="space-y-2">
    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.hint}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
            value === opt.value
              ? 'bg-primary text-primary-foreground border-primary shadow-glow'
              : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const Select: React.FC<{
  id: string; label: string; value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string) => void;
}> = ({ id, label, value, options, onChange }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium text-foreground block">{label}</label>
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full p-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────

export const OptionsPanel: React.FC = () => {
  const {
    files, rawFiles, selectedOperation, operationOptions, updateOptions,
    isMockMode, jobId, setProcessing, setProgress, setDownloadUrl, setSavings,
    setError, isProcessing,
  } = useFileStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [naturalDims, setNaturalDims] = useState<{ width: number; height: number } | null>(null);

  const firstFile = files[0];
  const fileType  = firstFile?.type || '';
  const actionName = operationOptions.operation || selectedOperation;
  const isImage   = fileType.startsWith('image/') || fileType === 'image/svg+xml';
  const isPdf     = fileType === 'application/pdf';
  const isVideo   = fileType.startsWith('video/');
  const isAudio   = fileType.startsWith('audio/');

  if (files.length === 0 || !selectedOperation) return null;

  // Load natural image dimensions for resize tool
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (selectedOperation === 'resize' && rawFiles[0] && isImage) {
      getImageDimensions(rawFiles[0]).then((d) => {
        setNaturalDims(d);
        if (!operationOptions.resize_width) {
          updateOptions({ resize_width: d.width, resize_height: d.height });
        }
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOperation, rawFiles[0]?.name]);

  // ── Compress presets ─────────────────────────────────────────────────────
  const COMPRESS_PRESETS: Record<string, { quality: number; resize_pct: number }> = {
    small:    { quality: 55, resize_pct: 0.75 },
    balanced: { quality: 82, resize_pct: 1.0 },
    high:     { quality: 92, resize_pct: 1.0 },
    lossless: { quality: 100, resize_pct: 1.0 },
  };

  const applyCompressPreset = (preset: string) => {
    if (preset === 'custom') { updateOptions({ compress_preset: 'custom' }); return; }
    const p = COMPRESS_PRESETS[preset];
    updateOptions({ compress_preset: preset, quality: p.quality, resize_pct: p.resize_pct });
  };

  // ── Enhance presets ──────────────────────────────────────────────────────
  const ENHANCE_PRESETS: Record<string, { brightness: number; contrast: number; sharpness: number; denoise: boolean }> = {
    natural: { brightness: 1.05, contrast: 1.05, sharpness: 1.1, denoise: false },
    vivid:   { brightness: 1.1,  contrast: 1.25, sharpness: 1.3, denoise: false },
    sharp:   { brightness: 1.0,  contrast: 1.1,  sharpness: 1.8, denoise: false },
    clean:   { brightness: 1.0,  contrast: 1.0,  sharpness: 1.0, denoise: true  },
    custom:  { brightness: operationOptions.brightness || 1.0, contrast: operationOptions.contrast || 1.0, sharpness: operationOptions.sharpness || 1.0, denoise: false },
  };

  const applyEnhancePreset = (preset: string) => {
    const p = ENHANCE_PRESETS[preset];
    if (p) updateOptions({ enhance_preset: preset, ...p });
  };

  // ── Resize aspect-lock helper ────────────────────────────────────────────
  const handleResizeWidth = (w: number) => {
    if (operationOptions.resize_lock_aspect && naturalDims) {
      const ratio = naturalDims.height / naturalDims.width;
      updateOptions({ resize_width: w, resize_height: Math.round(w * ratio) });
    } else {
      updateOptions({ resize_width: w });
    }
  };
  const handleResizeHeight = (h: number) => {
    if (operationOptions.resize_lock_aspect && naturalDims) {
      const ratio = naturalDims.width / naturalDims.height;
      updateOptions({ resize_width: Math.round(h * ratio), resize_height: h });
    } else {
      updateOptions({ resize_height: h });
    }
  };

  // ── Process handler ──────────────────────────────────────────────────────
  const doSimulate = (outputMime?: string) => {
    apiMock.simulateProcessing(
      jobId!, selectedOperation, files,
      (p) => setProgress(p),
      (url, savings) => { setDownloadUrl(url); setSavings(savings); setProcessing(false); },
      (err) => { setError(err); setProcessing(false); },
      outputMime
    );
  };

  const handleStartProcess = async () => {
    if (!jobId) return;
    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // ── Live backend ─────────────────────────────────────────────────────
      if (!isMockMode) {
        await apiClient.startProcessing(jobId, selectedOperation, operationOptions);
        const poll = async () => {
          try {
            const data = await apiClient.pollStatus(jobId);
            setProgress(data.progress);
            if (data.status === 'done') {
              setDownloadUrl(apiClient.getDownloadUrl(jobId));
              if (data.metadata) setSavings({ originalSize: data.metadata.input_size_bytes || 0, newSize: data.metadata.output_size_bytes || 0, percent: data.metadata.savings_percent || 0 });
              setProcessing(false);
            } else if (data.status === 'failed') {
              setError(data.error || 'Backend processing failed.');
              setProcessing(false);
            } else setTimeout(poll, 1500);
          } catch (e: any) { setError(e.message); setProcessing(false); }
        };
        setTimeout(poll, 1000);
        return;
      }

      // ── CLIENT-SIDE: PDF merge ───────────────────────────────────────────
      if (isPdf && selectedOperation === 'merge') {
        setProgress(20);
        const blob = await runClientSidePdfMerge(rawFiles);
        const orig = rawFiles.reduce((a, f) => a + f.size, 0);
        setProgress(90);
        setTimeout(() => { setProgress(100); setDownloadUrl(URL.createObjectURL(blob)); setSavings({ originalSize: orig, newSize: blob.size, percent: Math.max(0, Math.round(((orig - blob.size) / orig) * 100)) }); setProcessing(false); }, 300);
        return;
      }

      // ── CLIENT-SIDE: PDF compress ────────────────────────────────────────
      if (isPdf && selectedOperation === 'compress') {
        setProgress(30);
        const blob = await runClientSidePdfCompress(rawFiles[0], operationOptions.quality || 80);
        const orig = rawFiles[0].size;
        setProgress(90);
        setTimeout(() => { setProgress(100); setDownloadUrl(URL.createObjectURL(blob)); setSavings({ originalSize: orig, newSize: blob.size, percent: Math.max(0, Math.round(((orig - blob.size) / orig) * 100)) }); setProcessing(false); }, 300);
        return;
      }

      // ── CLIENT-SIDE: PDF split ───────────────────────────────────────────
      if (isPdf && selectedOperation === 'split') {
        setProgress(20);
        const blobs = await runClientSidePdfSplit(rawFiles[0], operationOptions.split_mode || 'all', operationOptions.split_every || 1, operationOptions.split_range || '1-1');
        setProgress(90);
        const url = URL.createObjectURL(blobs[0]);
        setTimeout(() => { setProgress(100); setDownloadUrl(url); setSavings(null); setProcessing(false); }, 300);
        return;
      }

      // ── CLIENT-SIDE: Images → PDF ────────────────────────────────────────
      if (actionName === 'images_to_pdf') {
        setProgress(20);
        const blob = await runClientSideImagesToPdf(rawFiles.length > 0 ? rawFiles : []);
        const orig = rawFiles.reduce((a, f) => a + f.size, 0);
        setProgress(90);
        setTimeout(() => { setProgress(100); setDownloadUrl(URL.createObjectURL(blob)); setSavings({ originalSize: orig, newSize: blob.size, percent: 0 }); setProcessing(false); }, 300);
        return;
      }

      // ── CLIENT-SIDE: Image compress ──────────────────────────────────────
      if (isImage && selectedOperation === 'compress') {
        setProgress(20);
        const q = (operationOptions.quality || 82) / 100;
        const scalePct = operationOptions.resize_pct || 1.0;
        const raw = rawFiles[0];
        const dims = naturalDims || await getImageDimensions(raw);
        const maxW = Math.round(dims.width * scalePct);
        const maxH = Math.round(dims.height * scalePct);
        const blob = await compressImage(raw, q, maxW, maxH);
        const orig = raw.size;
        setProgress(90);
        setTimeout(() => { setProgress(100); setDownloadUrl(URL.createObjectURL(blob)); setSavings({ originalSize: orig, newSize: blob.size, percent: Math.max(0, Math.round(((orig - blob.size) / orig) * 100)) }); setProcessing(false); }, 250);
        return;
      }

      // ── CLIENT-SIDE: Image resize ────────────────────────────────────────
      if (isImage && selectedOperation === 'resize') {
        setProgress(20);
        const w = operationOptions.resize_width || 800;
        const h = operationOptions.resize_height || 600;
        const fmt = (operationOptions.resize_format || 'png') as 'png' | 'jpeg' | 'webp';
        const blob = await resizeImage(rawFiles[0], w, h, fmt, 0.92);
        const orig = rawFiles[0].size;
        setProgress(90);
        setTimeout(() => { setProgress(100); setDownloadUrl(URL.createObjectURL(blob)); setSavings({ originalSize: orig, newSize: blob.size, percent: 0 }); setProcessing(false); }, 250);
        return;
      }

      // ── CLIENT-SIDE: Image format convert ────────────────────────────────
      if (isImage && actionName === 'convert_format') {
        setProgress(20);
        const fmt = (operationOptions.target_format || 'webp') as 'png' | 'jpeg' | 'webp';
        const blob = await convertImageFormat(rawFiles[0], fmt, (operationOptions.quality || 92) / 100);
        const orig = rawFiles[0].size;
        setProgress(90);
        setTimeout(() => { setProgress(100); setDownloadUrl(URL.createObjectURL(blob)); setSavings({ originalSize: orig, newSize: blob.size, percent: Math.max(0, Math.round(((orig - blob.size) / orig) * 100)) }); setProcessing(false); }, 250);
        return;
      }

      // ── CLIENT-SIDE: Image → ICO ─────────────────────────────────────────
      if (actionName === 'to_ico') {
        setProgress(20);
        const selectedSizes: number[] = operationOptions.ico_sizes || [16, 32, 48, 64];
        const blob = await convertToIco(rawFiles[0], selectedSizes);
        const orig = rawFiles[0].size;
        setProgress(90);
        setTimeout(() => { setProgress(100); setDownloadUrl(URL.createObjectURL(blob)); setSavings({ originalSize: orig, newSize: blob.size, percent: 0 }); setProcessing(false); }, 250);
        return;
      }

      // ── CLIENT-SIDE: SVG → PNG ───────────────────────────────────────────
      if (actionName === 'svg_to_png') {
        setProgress(20);
        const w = operationOptions.svg_width || 512;
        const h = operationOptions.svg_height || 512;
        const blob = await convertSvgToPng(rawFiles[0], w, h);
        const orig = rawFiles[0].size;
        setProgress(90);
        setTimeout(() => { setProgress(100); setDownloadUrl(URL.createObjectURL(blob)); setSavings({ originalSize: orig, newSize: blob.size, percent: 0 }); setProcessing(false); }, 250);
        return;
      }

      // ── Mock simulations for backend-dependent ops ───────────────────────
      const outputMimeMap: Record<string, string> = {
        pdf_to_docx:   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        pdf_to_pptx:   'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        pdf_to_images: 'image/png',
        docx_to_pdf:   'application/pdf',
        pptx_to_pdf:   'application/pdf',
        xlsx_to_csv:   'text/csv',
        csv_to_xlsx:   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        md_to_html:    'text/html',
        html_to_md:    'text/markdown',
        video_to_audio:'audio/mpeg',
        video_to_gif:  'image/gif',
        compress_audio:'audio/mpeg',
      };
      doSimulate(outputMimeMap[actionName]);

    } catch (e: any) {
      setError(e.message || 'Processing failed.');
      setProcessing(false);
    }
  };

  // ── Option renderers ──────────────────────────────────────────────────────

  const renderCompressOptions = () => {
    // ── Image compress ────────────────────────────────────────────────────
    if (isImage) return (
      <div className="space-y-6">
        <PresetRow
          label="Quality preset"
          value={operationOptions.compress_preset || 'balanced'}
          onChange={(v) => applyCompressPreset(v as string)}
          options={[
            { value: 'small',    label: 'Small',     hint: `55% quality, 75% scale — smallest file` },
            { value: 'balanced', label: 'Balanced',  hint: `82% quality, full scale — recommended` },
            { value: 'high',     label: 'High',      hint: `92% quality, full scale — near lossless` },
            { value: 'lossless', label: 'Lossless',  hint: `100% quality — no compression, PNG only` },
            { value: 'custom',   label: 'Custom',    hint: `Set quality & scale manually` },
          ]}
        />
        <div className="space-y-4">
          <Slider
            id="quality-slider" label="Output Quality" unit="%"
            value={operationOptions.quality || 82} min={10} max={100}
            onChange={(v) => updateOptions({ quality: v, compress_preset: 'custom' })}
            hint="Higher = better quality, larger file. JPEG/WEBP only; PNG is always lossless."
          />
          <Slider
            id="scale-slider" label="Resize Scale" unit="%"
            value={Math.round((operationOptions.resize_pct || 1.0) * 100)} min={10} max={100}
            onChange={(v) => updateOptions({ resize_pct: v / 100, compress_preset: 'custom' })}
            hint="Scale down dimensions before compressing for extra size savings."
          />
        </div>
        <InfoBox
          icon={<FileArchive className="h-4 w-4 text-primary" />}
          text="Runs entirely in your browser — no upload required. Supports PNG, JPEG, WEBP, BMP, and TIFF."
          color="bg-primary/5 border-primary/15"
        />
      </div>
    );

    // ── Video compress ────────────────────────────────────────────────────
    if (isVideo && actionName !== 'compress_audio') return (
      <div className="space-y-5">
        <PresetRow
          label="Quality preset"
          value={operationOptions.crf <= 20 ? 'high' : operationOptions.crf <= 26 ? 'balanced' : operationOptions.crf <= 32 ? 'small' : 'custom'}
          onChange={(v) => {
            const map: Record<string, number> = { high: 20, balanced: 26, small: 32 };
            if (map[v as string]) updateOptions({ crf: map[v as string] });
          }}
          options={[
            { value: 'high',     label: 'High quality',  hint: 'CRF 20 — minimal loss' },
            { value: 'balanced', label: 'Balanced',       hint: 'CRF 26 — good quality vs size' },
            { value: 'small',    label: 'Compact',        hint: 'CRF 32 — smallest file' },
            { value: 'custom',   label: 'Custom CRF',     hint: 'Set CRF manually below' },
          ]}
        />
        <Slider
          id="crf-slider" label="CRF (Constant Rate Factor)" unit=""
          value={operationOptions.crf || 28} min={18} max={35}
          onChange={(v) => updateOptions({ crf: v })}
          hint="Lower CRF = higher quality, larger file. Range 18 (near-lossless) to 35 (highly compressed)."
        />
        {showAdvanced && (
          <Select id="speed-select" label="Encoder Speed" value={operationOptions.preset || 'medium'}
            options={[
              { value: 'ultrafast', label: 'Ultrafast — minimal compression, fastest' },
              { value: 'fast',      label: 'Fast — medium-low compression' },
              { value: 'medium',    label: 'Medium — balanced (default)' },
              { value: 'slow',      label: 'Slow — higher compression' },
            ]}
            onChange={(v) => updateOptions({ preset: v })}
          />
        )}
      </div>
    );

    // ── Audio compress ────────────────────────────────────────────────────
    if (isAudio || actionName === 'compress_audio') return (
      <div className="space-y-5">
        <PresetRow
          label="Quality preset"
          value={operationOptions.audio_bitrate <= 96 ? 'low' : operationOptions.audio_bitrate <= 128 ? 'balanced' : 'high'}
          onChange={(v) => {
            const map: Record<string, number> = { low: 64, balanced: 128, high: 192 };
            if (map[v as string]) updateOptions({ audio_bitrate: map[v as string] });
          }}
          options={[
            { value: 'low',      label: 'Low',      hint: '64–96 kbps — smallest file' },
            { value: 'balanced', label: 'Balanced', hint: '128 kbps — recommended' },
            { value: 'high',     label: 'High',     hint: '192+ kbps — best quality' },
          ]}
        />
        <Select id="bitrate-select" label="Target Bitrate" value={operationOptions.audio_bitrate || 128}
          options={[
            { value: 64,  label: '64 kbps — Smallest (low quality)' },
            { value: 96,  label: '96 kbps — Compact (voice, podcast)' },
            { value: 128, label: '128 kbps — Balanced (recommended)' },
            { value: 192, label: '192 kbps — High quality' },
            { value: 320, label: '320 kbps — Near lossless' },
          ]}
          onChange={(v) => updateOptions({ audio_bitrate: parseInt(v) })}
        />
        <Select id="audio-fmt" label="Output Format" value={operationOptions.audio_format || 'mp3'}
          options={[
            { value: 'mp3', label: 'MP3 — Universal compatibility' },
            { value: 'aac', label: 'AAC — Smaller, modern devices' },
            { value: 'ogg', label: 'OGG — Open-source, web-friendly' },
          ]}
          onChange={(v) => updateOptions({ audio_format: v })}
        />
      </div>
    );

    // ── Office compress ───────────────────────────────────────────────────
    if (fileType.includes('officedocument') || fileType.includes('word') || fileType.includes('sheet') || fileType.includes('presentation')) return (
      <div className="space-y-4">
        <PresetRow
          label="Compression level"
          value={operationOptions.office_compress_level || 'standard'}
          onChange={(v) => updateOptions({ office_compress_level: v })}
          options={[
            { value: 'light',      label: 'Light',      hint: 'Remove unused styles & hidden data' },
            { value: 'standard',   label: 'Standard',   hint: 'Strip thumbnails & metadata' },
            { value: 'aggressive', label: 'Aggressive', hint: 'Compress all embedded media' },
          ]}
        />
        <InfoBox icon={<FileArchive className="h-4 w-4 text-primary" />} text="Office files are ZIP containers — higher levels strip more embedded content like preview images and editing history." />
      </div>
    );

    // ── PDF compress ──────────────────────────────────────────────────────
    return (
      <InfoBox icon={<FileArchive className="h-4 w-4 text-primary" />}
        text="PDF streams, fonts, and embedded objects will be re-compressed to shrink the physical file size. No visual quality loss."
        color="bg-primary/5 border-primary/15"
      />
    );
  };

  const renderResizeOptions = () => (
    <div className="space-y-5">
      {naturalDims && (
        <div className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 flex items-center justify-between">
          <span>Original: <strong className="text-foreground">{naturalDims.width} × {naturalDims.height} px</strong></span>
          <span className="text-muted-foreground/60">
            {(rawFiles[0]?.size / 1024).toFixed(0)} KB
          </span>
        </div>
      )}

      {/* Resize dimension presets */}
      <PresetRow
        label="Common sizes"
        value=""
        onChange={(v) => {
          const [w, h] = (v as string).split('x').map(Number);
          updateOptions({ resize_width: w, resize_height: h, resize_lock_aspect: false });
        }}
        options={[
          { value: '1920x1080', label: '1080p',   hint: '1920 × 1080' },
          { value: '1280x720',  label: '720p',    hint: '1280 × 720' },
          { value: '800x600',   label: '800×600', hint: 'Standard web' },
          { value: '512x512',   label: '512²',    hint: 'Square icon' },
          { value: '256x256',   label: '256²',    hint: 'Small icon' },
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Width (px)</label>
          <input
            type="number" min={1} max={8000}
            value={operationOptions.resize_width || 800}
            onChange={(e) => handleResizeWidth(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Height (px)</label>
          <input
            type="number" min={1} max={8000}
            value={operationOptions.resize_height || 600}
            onChange={(e) => handleResizeHeight(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <button
        onClick={() => updateOptions({ resize_lock_aspect: !operationOptions.resize_lock_aspect })}
        className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
          operationOptions.resize_lock_aspect
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-card border-border text-muted-foreground hover:border-primary/30'
        }`}
      >
        {operationOptions.resize_lock_aspect ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        {operationOptions.resize_lock_aspect ? 'Aspect ratio locked' : 'Lock aspect ratio'}
      </button>

      <Select id="resize-fmt" label="Output Format" value={operationOptions.resize_format || 'png'}
        options={[
          { value: 'png',  label: 'PNG — Lossless, supports transparency' },
          { value: 'jpeg', label: 'JPEG — Smaller, no transparency' },
          { value: 'webp', label: 'WEBP — Modern, highly compressed' },
        ]}
        onChange={(v) => updateOptions({ resize_format: v })}
      />
      <InfoBox icon={<Maximize2 className="h-4 w-4 text-primary" />}
        text="Runs entirely in your browser using Canvas API — no upload required."
        color="bg-primary/5 border-primary/15"
      />
    </div>
  );

  const renderEnhanceOptions = () => {
    if (isImage) return (
      <div className="space-y-5">
        <PresetRow
          label="Enhancement preset"
          value={operationOptions.enhance_preset || 'custom'}
          onChange={(v) => applyEnhancePreset(v as string)}
          options={[
            { value: 'natural', label: 'Natural',  hint: 'Subtle boost — slight warmth + sharpness' },
            { value: 'vivid',   label: 'Vivid',    hint: 'Bold contrast and vibrance' },
            { value: 'sharp',   label: 'Ultra Sharp', hint: 'Maximum sharpness boost' },
            { value: 'clean',   label: 'Denoise',  hint: 'Smooth noise without sharpening' },
            { value: 'custom',  label: 'Custom',   hint: 'Adjust each slider manually' },
          ]}
        />
        <div className="grid grid-cols-1 gap-5">
          <Slider id="brightness-s" label="Brightness" unit="x"
            value={operationOptions.brightness || 1.0} min={0.5} max={2.0} step={0.05}
            onChange={(v) => updateOptions({ brightness: v, enhance_preset: 'custom' })}
          />
          <Slider id="contrast-s" label="Contrast" unit="x"
            value={operationOptions.contrast || 1.0} min={0.5} max={2.0} step={0.05}
            onChange={(v) => updateOptions({ contrast: v, enhance_preset: 'custom' })}
          />
          <Slider id="sharpness-s" label="Sharpness" unit="x"
            value={operationOptions.sharpness || 1.2} min={0.5} max={3.0} step={0.1}
            onChange={(v) => updateOptions({ sharpness: v, enhance_preset: 'custom' })}
          />
        </div>
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => updateOptions({ denoise: !operationOptions.denoise, enhance_preset: 'custom' })}
        >
          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${operationOptions.denoise ? 'bg-primary border-primary' : 'border-border bg-card'}`}>
            {operationOptions.denoise && <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span className="text-sm font-medium text-foreground">Apply denoising filter</span>
        </div>
      </div>
    );
    return <InfoBox icon={<Sparkles className="h-4 w-4 text-primary" />} text="Document enhancement normalizes formatting, resets padding, and standardizes font weights." />;
  };

  const renderSplitOptions = () => (
    <div className="space-y-5">
      <PresetRow
        label="Split mode"
        value={operationOptions.split_mode || 'all'}
        onChange={(v) => updateOptions({ split_mode: v })}
        options={[
          { value: 'all',   label: 'Every page',    hint: 'One PDF per page' },
          { value: 'every', label: 'Every N pages', hint: 'Split into N-page chunks' },
          { value: 'range', label: 'Page range',    hint: 'Extract specific pages/ranges' },
        ]}
      />
      {operationOptions.split_mode === 'every' && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pages per chunk</label>
          <input type="number" min={1} value={operationOptions.split_every || 1}
            onChange={(e) => updateOptions({ split_every: Math.max(1, parseInt(e.target.value)) })}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      )}
      {operationOptions.split_mode === 'range' && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page ranges</label>
          <input type="text" placeholder="e.g. 1-3, 5, 7-10"
            value={operationOptions.split_range || ''}
            onChange={(e) => updateOptions({ split_range: e.target.value })}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p className="text-[10px] text-muted-foreground">Comma-separated pages or ranges</p>
        </div>
      )}
      <InfoBox icon={<Scissors className="h-4 w-4 text-primary" />}
        text="PDF splitting runs entirely in your browser — no upload required."
        color="bg-primary/5 border-primary/15"
      />
    </div>
  );

  const renderConvertOptions = () => {
    // Images → PDF (client-side)
    if (actionName === 'images_to_pdf') return (
      <InfoBox icon={<Image className="h-4 w-4 text-primary" />}
        text={`${files.length} image${files.length !== 1 ? 's' : ''} will be packed into a single PDF in upload order.`}
        color="bg-primary/5 border-primary/15"
      />
    );

    // Image → ICO
    if (actionName === 'to_ico') {
      const selectedSizes: number[] = operationOptions.ico_sizes || [16, 32, 48, 64];
      const toggleSize = (s: number) => {
        const cur = operationOptions.ico_sizes || [16, 32, 48, 64];
        const next = cur.includes(s) ? cur.filter((x: number) => x !== s) : [...cur, s].sort((a, b) => a - b);
        if (next.length > 0) updateOptions({ ico_sizes: next });
      };
      return (
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Include sizes</span>
            <div className="flex gap-2 flex-wrap">
              {[16, 24, 32, 48, 64, 128, 256].map((s) => (
                <button key={s} onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedSizes.includes(s)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">Selected: {selectedSizes.join(', ')} px. All sizes embedded in a single .ico file.</p>
          </div>
          <InfoBox icon={<MonitorSmartphone className="h-4 w-4 text-primary" />}
            text="ICO files contain multiple resolutions — browsers pick the best match automatically. Runs client-side."
            color="bg-primary/5 border-primary/15"
          />
        </div>
      );
    }

    // SVG → PNG
    if (actionName === 'svg_to_png') return (
      <div className="space-y-5">
        <PresetRow
          label="Output resolution"
          value={`${operationOptions.svg_width || 512}x${operationOptions.svg_height || 512}`}
          onChange={(v) => {
            const [w, h] = (v as string).split('x').map(Number);
            updateOptions({ svg_width: w, svg_height: h });
          }}
          options={[
            { value: '256x256',   label: '256²',   hint: 'Small icon' },
            { value: '512x512',   label: '512²',   hint: 'Standard' },
            { value: '1024x1024', label: '1024²',  hint: 'High-res icon' },
            { value: '1920x1080', label: '1080p',  hint: 'Full HD' },
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Width (px)</label>
            <input type="number" min={1} max={4096} value={operationOptions.svg_width || 512}
              onChange={(e) => updateOptions({ svg_width: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Height (px)</label>
            <input type="number" min={1} max={4096} value={operationOptions.svg_height || 512}
              onChange={(e) => updateOptions({ svg_height: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <InfoBox icon={<Globe className="h-4 w-4 text-primary" />}
          text="SVG is rendered to a canvas and exported as PNG. Runs entirely client-side."
          color="bg-primary/5 border-primary/15"
        />
      </div>
    );

    // Image format convert
    if (isImage && (actionName === 'convert_format' || actionName === 'convert')) return (
      <div className="space-y-5">
        <PresetRow
          label="Target format"
          value={operationOptions.target_format || 'webp'}
          onChange={(v) => updateOptions({ target_format: v })}
          options={[
            { value: 'webp',  label: 'WEBP',  hint: 'Modern, highly compressed' },
            { value: 'png',   label: 'PNG',   hint: 'Lossless, supports transparency' },
            { value: 'jpeg',  label: 'JPEG',  hint: 'Universal, great for photos' },
          ]}
        />
        <Slider id="fmt-quality" label="Output Quality" unit="%"
          value={operationOptions.quality || 92} min={10} max={100}
          onChange={(v) => updateOptions({ quality: v })}
          hint="Only applies to JPEG and WEBP. PNG is always lossless."
        />
        <InfoBox icon={<RefreshCw className="h-4 w-4 text-primary" />}
          text="Conversion runs client-side — no upload required. Supports PNG, JPEG, WEBP, BMP, GIF input."
          color="bg-primary/5 border-primary/15"
        />
      </div>
    );

    // PDF conversions
    if (actionName === 'pdf_to_docx') return <InfoBox icon={<ArrowLeftRight className="h-4 w-4 text-primary" />} text="PDF will be parsed into an editable DOCX with preserved paragraph structure and fonts." />;
    if (actionName === 'pdf_to_pptx') return <InfoBox icon={<ArrowLeftRight className="h-4 w-4 text-primary" />} text="Each PDF page becomes a slide in the exported PPTX presentation." />;
    if (actionName === 'pdf_to_images') return (
      <div className="space-y-4">
        <Select id="dpi-sel" label="Output Resolution" value={operationOptions.dpi || 150}
          options={[
            { value: 72,  label: '72 DPI — Screen / web preview' },
            { value: 150, label: '150 DPI — Standard quality' },
            { value: 300, label: '300 DPI — Print quality' },
          ]}
          onChange={(v) => updateOptions({ dpi: parseInt(v) })}
        />
        <Select id="img-fmt" label="Image Format" value={operationOptions.img_format || 'png'}
          options={[
            { value: 'png',  label: 'PNG — Lossless, sharp text' },
            { value: 'jpeg', label: 'JPEG — Smaller, photos' },
            { value: 'webp', label: 'WEBP — Highly optimized' },
          ]}
          onChange={(v) => updateOptions({ img_format: v })}
        />
      </div>
    );

    // Office conversions
    const officeMessages: Record<string, string> = {
      docx_to_pdf: 'Word document will be rendered into a high-quality paginated PDF.',
      pptx_to_pdf: 'Each PowerPoint slide becomes a page in the exported PDF.',
      xlsx_to_csv: 'All active spreadsheet cells will be exported as comma-separated rows.',
      csv_to_xlsx: 'CSV data imported into a formatted Excel workbook with auto-width columns.',
      md_to_html:  'Markdown compiled into a styled HTML page with headings, links, and code blocks.',
      html_to_md:  'HTML structure converted into clean, readable Markdown syntax.',
    };
    if (officeMessages[actionName]) return <InfoBox icon={<ArrowLeftRight className="h-4 w-4 text-primary" />} text={officeMessages[actionName]} />;

    // Video conversions
    if (actionName === 'video_to_audio') return (
      <div className="space-y-4">
        <Select id="audio-fmt-ex" label="Audio Format" value={operationOptions.audio_format || 'mp3'}
          options={[
            { value: 'mp3', label: 'MP3 — Universal compatibility' },
            { value: 'aac', label: 'AAC — Higher quality, modern devices' },
            { value: 'wav', label: 'WAV — Lossless, large file' },
            { value: 'ogg', label: 'OGG — Open-source, web-friendly' },
          ]}
          onChange={(v) => updateOptions({ audio_format: v })}
        />
        <InfoBox icon={<Music className="h-4 w-4 text-primary" />} text="Audio track will be extracted and saved without re-encoding for best quality." />
      </div>
    );
    if (actionName === 'video_to_gif') return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Start (seconds)</label>
            <input type="number" min={0} value={operationOptions.start_time || 0}
              onChange={(e) => updateOptions({ start_time: Math.max(0, parseInt(e.target.value)) })}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">End (seconds)</label>
            <input type="number" min={1} value={operationOptions.end_time || 5}
              onChange={(e) => updateOptions({ end_time: Math.max(1, parseInt(e.target.value)) })}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <Slider id="gif-fps" label="Frame Rate (FPS)" unit=" fps"
          value={operationOptions.gif_fps || 10} min={5} max={30}
          onChange={(v) => updateOptions({ gif_fps: v })}
          hint="Higher FPS = smoother animation but larger file size."
        />
      </div>
    );

    return <InfoBox icon={<RefreshCw className="h-4 w-4 text-primary" />} text="Convert file to the selected destination format." />;
  };

  const renderEditOptions = () => {
    if (isVideo) return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Start (seconds)</label>
            <input type="number" min={0} value={operationOptions.start_time || 0}
              onChange={(e) => updateOptions({ start_time: Math.max(0, parseInt(e.target.value)) })}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">End (seconds)</label>
            <input type="number" min={1} value={operationOptions.end_time || 10}
              onChange={(e) => updateOptions({ end_time: Math.max(1, parseInt(e.target.value)) })}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <InfoBox icon={<Video className="h-4 w-4 text-violet-400" />} text="Enter start and end timestamps in seconds to extract your desired clip." />
      </div>
    );
    if (actionName === 'docx_cleanup') return (
      <InfoBox icon={<Sliders className="h-4 w-4 text-primary" />}
        text="Clears duplicate blank paragraphs, aligns margins to 1 inch, and normalizes font weights to standard layouts."
      />
    );
    return null;
  };

  const renderOptions = () => {
    switch (selectedOperation) {
      case 'compress': return renderCompressOptions();
      case 'enhance':  return renderEnhanceOptions();
      case 'convert':  return renderConvertOptions();
      case 'edit':     return renderEditOptions();
      case 'split':    return renderSplitOptions();
      case 'resize':   return renderResizeOptions();
      case 'merge':
        return <InfoBox icon={<FileText className="h-4 w-4 text-primary" />}
          text="Files will be merged in the order shown in the queue above. Upload order determines page sequence."
          color="bg-primary/5 border-primary/15"
        />;
      default: return null;
    }
  };

  const operationLabels: Record<string, string> = {
    compress: 'Compress', enhance: 'Enhance', convert: 'Convert',
    edit: 'Edit', split: 'Split PDF', resize: 'Resize Image',
    merge: 'Merge PDFs',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-premium">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sliders className="h-4.5 w-4.5 text-primary h-[18px] w-[18px]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{operationLabels[selectedOperation] || 'Operation'} Settings</h2>
              <p className="text-[11px] text-muted-foreground">Configure processing parameters</p>
            </div>
          </div>
          {selectedOperation === 'compress' && isVideo && (
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary border border-border text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-muted transition-all"
            >
              <Settings2 className="h-3 w-3" />
              {showAdvanced ? 'Simple' : 'Advanced'}
            </button>
          )}
        </div>

        {/* Options */}
        <div className="px-6 py-5">
          {renderOptions()}
        </div>

        {/* Process button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleStartProcess}
            disabled={isProcessing}
            className="w-full relative overflow-hidden flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
          >
            {/* Shimmer */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /><span>Processing…</span></>
            ) : (
              <><Play className="h-4 w-4 fill-current" /><span>Process {files.length > 1 ? `${files.length} files` : 'file'}</span></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OptionsPanel;
