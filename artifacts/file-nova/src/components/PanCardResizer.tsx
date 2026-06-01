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
                    isSelected={selectedPreset?.label === preset.label}
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
            <motion.button
              key={preset.id}
              onClick={() => {
                setActiveTab(preset.id);
                if (state.originalFile) {
                  processFile(
                    state.originalFile,
                    preset.width,
                    preset.height,
                    preset.maxKB
                  );
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === preset.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {preset.name}
            </motion.button>
          ))}
          <motion.button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'custom'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Custom
          </motion.button>
        </div>

        {/* Preset Info Card */}
        {currentPreset && (
          <motion.div
            key={currentPreset.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-indigo-300 mb-1">
                  {currentPreset.name} Specifications
                </h3>
                <p className="text-sm text-indigo-200">{currentPreset.specs}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Custom Settings */}
        {activeTab === 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-6 mb-6"
          >
            <h3 className="font-semibold text-violet-300 mb-4">Custom Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Unit</label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as 'px' | 'cm')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                >
                  <option value="px">Pixels (px)</option>
                  <option value="cm">Centimeters (cm @ 200 DPI)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Width</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                  min="10"
                  max="2000"
                />
                {unitType === 'cm' && (
                  <p className="text-xs text-slate-400 mt-1">
                    ≈ {cmToPx(customWidth)} px
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Height</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                  min="10"
                  max="2000"
                />
                {unitType === 'cm' && (
                  <p className="text-xs text-slate-400 mt-1">
                    ≈ {cmToPx(customHeight)} px
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Max File Size (KB)
              </label>
              <input
                type="number"
                value={customMaxKB}
                onChange={(e) => setCustomMaxKB(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                min="1"
                max="500"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Zone */}
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Upload</h3>
          <motion.div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center cursor-pointer transition-all hover:border-indigo-500/60 hover:bg-indigo-500/5"
            whileHover={{ scale: 1.02 }}
          >
            <FileUp className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
            <p className="text-slate-300 font-medium mb-2">
              Drag & drop your file here
            </p>
            <p className="text-sm text-slate-400">
              or click to select (JPG, PNG, WEBP, PDF - Max 10 MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </motion.div>

          {/* Error State */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{state.error}</p>
            </motion.div>
          )}

          {/* Original Preview */}
          {state.originalUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <p className="text-sm text-slate-400 mb-3">Original</p>
              <div className="bg-slate-800 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <img
                  src={state.originalUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Size: {formatFileSize(state.originalSize)}
              </p>
            </motion.div>
          )}
        </div>

        {/* Preview & Result */}
        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Preview</h3>

          {state.isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800 rounded-lg p-12 text-center flex flex-col items-center justify-center aspect-square"
            >
              <div className="h-12 w-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-300">Processing...</p>
            </motion.div>
          )}

          {!state.isProcessing && state.resultUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-slate-800 rounded-lg overflow-hidden aspect-square flex items-center justify-center mb-4">
                <img
                  src={state.resultUrl}
                  alt="Result"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* File Size Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-slate-400">
                    {formatFileSize(state.originalSize)} →{' '}
                    <span className="text-emerald-400 font-semibold">
                      {formatFileSize(state.resultSize)}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Quality: {state.quality}%
                  </p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </motion.div>

              {/* Download Button */}
              <motion.button
                onClick={handleDownload}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="h-5 w-5" />
                Download Result
              </motion.button>
            </motion.div>
          )}

          {!state.isProcessing && !state.resultUrl && state.originalFile && (
            <div className="bg-slate-800 rounded-lg p-12 text-center flex flex-col items-center justify-center aspect-square text-slate-400">
              <p className="text-sm">Select a preset above to process</p>
            </div>
          )}

          {!state.originalFile && (
            <div className="bg-slate-800 rounded-lg p-12 text-center flex flex-col items-center justify-center aspect-square text-slate-400">
              <Upload className="h-12 w-12 opacity-50 mb-3" />
              <p className="text-sm">Upload an image to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
