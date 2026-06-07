import React, { useState, useCallback } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { X, GripVertical, FileText, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MergePDFWorkspace: React.FC = () => {
  const { files, rawFiles, removeFile } = useFileStore();
  const { tText } = useTranslation();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...files];
    const updatedRaw = [...rawFiles];
    const [moved] = updated.splice(dragIndex, 1);
    const [movedRaw] = updatedRaw.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);
    updatedRaw.splice(dropIndex, 0, movedRaw);
    useFileStore.setState({ files: updated, rawFiles: updatedRaw });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleRemoveFile = (id: string) => {
    removeFile(id);
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Files to Merge ({files.length})
        </h3>
        <span className="text-[11px] text-muted-foreground">
          Total: {formatSize(rawFiles.reduce((s, f) => s + f.size, 0))}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              onDragStart={(e: any) => handleDragStart(e, index)}
              onDragOver={(e: any) => handleDragOver(e, index)}
              onDrop={(e: any) => handleDrop(e, index)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                dragOverIndex === index && dragIndex !== index
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (index > 0) {
                      const updated = [...files];
                      const updatedRaw = [...rawFiles];
                      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
                      [updatedRaw[index], updatedRaw[index - 1]] = [updatedRaw[index - 1], updatedRaw[index]];
                      useFileStore.setState({ files: updated, rawFiles: updatedRaw });
                    }
                  }}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  title="Move up"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground rotate-180" />
                </button>
                <button
                  onClick={() => {
                    if (index < files.length - 1) {
                      const updated = [...files];
                      const updatedRaw = [...rawFiles];
                      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                      [updatedRaw[index], updatedRaw[index + 1]] = [updatedRaw[index + 1], updatedRaw[index]];
                      useFileStore.setState({ files: updated, rawFiles: updatedRaw });
                    }
                  }}
                  disabled={index === files.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  title="Move down"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  title="Remove file"
                >
                  <X className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
