import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { PanCardEditor, type PanCardPreset } from './PanCardEditor';
import { toast } from 'sonner';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        toast.error('Please drop an image file');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="pan-file-input"
        disabled={isLoading}
      />
      <label htmlFor="pan-file-input" className="cursor-pointer block">
        <Upload className="h-12 w-12 mx-auto mb-4 text-indigo-400" />
        <p className="text-lg font-semibold mb-2">Drag image here or click to upload</p>
        <p className="text-sm text-white/60">PNG, JPG, WebP, GIF (max 10 MB)</p>
      </label>
    </div>
  );
}

interface PresetCardProps {
  preset: PanCardPreset;
  isSelected: boolean;
  onClick: () => void;
}

function PresetCard({ preset, isSelected, onClick }: PresetCardProps) {
  const getPresetEmoji = (label: string) => {
    if (label.includes('Photo')) return '📸';
    if (label.includes('Signature')) return '✍️';
    return '📋';
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{getPresetEmoji(preset.label)}</span>
        {isSelected && <CheckCircle2 className="h-5 w-5 text-indigo-400" />}
      </div>
      <p className="text-sm font-semibold">{preset.label}</p>
      <p className="text-xs text-white/60 mt-1">
        {preset.width} × {preset.height} px
      </p>
      <p className="text-xs text-white/50 mt-1">Max: {preset.maxKB} KB</p>
    </motion.button>
  );
}

export function PanCardResizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PanCardPreset | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const [processedFileName, setProcessedFileName] = useState('');

  const presets: PanCardPreset[] = [
    { label: 'NSDL Photo', width: 213, height: 213, maxKB: 20 },
    { label: 'NSDL Signature', width: 354, height: 157, maxKB: 10 },
    { label: 'UTI Photo', width: 213, height: 213, maxKB: 30 },
    { label: 'UTI Signature', width: 400, height: 200, maxKB: 20 },
  ];

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be smaller than 10 MB');
      return;
    }
    setSelectedFile(file);
    toast.success('Image loaded. Select a preset to edit.');
  };

  const handleEditorDone = (blob: Blob) => {
    const name = selectedFile?.name.split('.')[0] || 'image';
    setProcessedFileName(`${name}-edited.jpg`);
    setIsProcessed(true);
    setTimeout(() => {
      // Reset after showing success
      setSelectedFile(null);
      setSelectedPreset(null);
      setIsProcessed(false);
    }, 3000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedPreset(null);
    setIsProcessed(false);
  };

  // Show success state
  if (isProcessed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center py-12"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold">Success!</h3>
          <p className="text-white/60 mt-2">Your PAN card image has been processed and downloaded.</p>
          <p className="text-sm text-indigo-400 mt-1 font-mono">{processedFileName}</p>
        </div>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold transition-all"
        >
          ← Process Another Image
        </button>
      </motion.div>
    );
  }

  // Show editor if file and preset selected
  if (selectedFile && selectedPreset) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
        <PanCardEditor
          file={selectedFile}
          preset={selectedPreset}
          onDone={handleEditorDone}
          onCancel={() => {
            setSelectedFile(null);
            setSelectedPreset(null);
          }}
        />
      </motion.div>
    );
  }

  // Show file upload + preset selection
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Upload Zone */}
      {!selectedFile && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <UploadZone onFileSelect={handleFileSelect} />
        </motion.div>
      )}

      {/* File Selected - Show Preset Selection */}
      <AnimatePresence>
        {selectedFile && !selectedPreset && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select a Preset</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-white/10 rounded transition-all"
                  title="Change file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset) => (
                  <PresetCard
                    key={preset.label}
                    preset={preset}
                    isSelected={false}
                    onClick={() => setSelectedPreset(preset)}
                  />
                ))}
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div className="bg-white/5 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-indigo-400">NSDL Presets</h4>
                  <p className="text-xs text-white/60">
                    Photo: 213×213 px, max 20 KB. Signature: 354×157 px, max 10 KB.
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-blue-400">UTI Presets</h4>
                  <p className="text-xs text-white/60">
                    Photo: 213×213 px, max 30 KB. Signature: 400×200 px, max 20 KB.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
