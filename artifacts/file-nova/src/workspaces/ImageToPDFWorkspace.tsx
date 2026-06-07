import React, { useState, useCallback } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { apiClient, apiMock } from '@/lib/api';
import { toast } from 'sonner';
import { FileText, Image, Download, Sparkles, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ImageToPDFWorkspace: React.FC = () => {
  const { files, rawFiles, updateOptions, operationOptions } = useFileStore();
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleProcess = async () => {
    if (rawFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsProcessingLocal(true);
    const { setProcessing, setJobId, setError, setDownloadUrl } = useFileStore.getState();

    setProcessing(true);
    setError(null);
    const activeJobId = Math.random().toString(36).substring(2, 15);
    setJobId(activeJobId);

    try {
      const isMock = useFileStore.getState().isMockMode;
      if (isMock) {
        await apiMock.simulateProcessing(
          activeJobId, 'image_to_pdf', files,
          (p) => useFileStore.getState().setProgress(p),
          (downloadUrl) => setDownloadUrl(downloadUrl),
          (err) => setError(err),
          'application/pdf'
        );
      } else {
        await apiClient.startProcessing(activeJobId, 'image_to_pdf', operationOptions);
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
      toast.success('Images converted to PDF!');
    } catch (err: any) {
      setError(err.message || 'Conversion failed');
      toast.error(err.message || 'Conversion failed');
    } finally {
      setProcessing(false);
      setIsProcessingLocal(false);
    }
  };

  if (rawFiles.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            Images ({rawFiles.length})
          </h3>
          <span className="text-[11px] text-muted-foreground">Drag to reorder</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence>
            {rawFiles.map((file, index) => (
              <motion.div
                key={file.name + index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group aspect-square rounded-xl border-2 border-border bg-white dark:bg-slate-950 overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-contain p-1"
                />
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                  {index + 1}
                </div>
                <button
                  onClick={() => {
                    const newRaw = rawFiles.filter((_, i) => i !== index);
                    const newFiles = files.filter((_, i) => i !== index);
                    useFileStore.setState({ rawFiles: newRaw, files: newFiles });
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if (index > 0) {
                        const newRaw = [...rawFiles];
                        const newFiles = [...files];
                        [newRaw[index], newRaw[index - 1]] = [newRaw[index - 1], newRaw[index]];
                        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
                        useFileStore.setState({ rawFiles: newRaw, files: newFiles });
                      }
                    }}
                    disabled={index === 0}
                    className="flex-1 py-1 rounded-lg bg-black/50 text-white text-[10px] font-bold hover:bg-black/70 disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="h-3 w-3 mx-auto" />
                  </button>
                  <button
                    onClick={() => {
                      if (index < rawFiles.length - 1) {
                        const newRaw = [...rawFiles];
                        const newFiles = [...files];
                        [newRaw[index], newRaw[index + 1]] = [newRaw[index + 1], newRaw[index]];
                        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
                        useFileStore.setState({ rawFiles: newRaw, files: newFiles });
                      }
                    }}
                    disabled={index === rawFiles.length - 1}
                    className="flex-1 py-1 rounded-lg bg-black/50 text-white text-[10px] font-bold hover:bg-black/70 disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="h-3 w-3 mx-auto" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20">
            <Plus className="h-8 w-8 text-muted-foreground mb-1" />
            <span className="text-[10px] text-muted-foreground font-semibold">Add More</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files || []);
                if (newFiles.length > 0) {
                  useFileStore.getState().addRawFiles(newFiles);
                  toast.success(`Added ${newFiles.length} image(s)`);
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page Size</label>
        <select
          value={operationOptions.pageSize || 'A4'}
          onChange={(e) => updateOptions({ pageSize: e.target.value })}
          className="w-full p-3 bg-card border border-border rounded-xl text-sm"
        >
          <option value="A4">A4 (210 × 297 mm)</option>
          <option value="Letter">Letter (8.5 × 11 in)</option>
          <option value="Legal">Legal (8.5 × 14 in)</option>
          <option value="A3">A3 (297 × 420 mm)</option>
          <option value="auto">Auto-fit to Image</option>
        </select>
      </div>

      <button
        onClick={handleProcess}
        disabled={isProcessingLocal}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-xl hover:opacity-90 transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {isProcessingLocal ? (
          <>
            <Sparkles className="h-5 w-5 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <FileText className="h-5 w-5" />
            Convert to PDF
          </>
        )}
      </button>
    </div>
  );
};
