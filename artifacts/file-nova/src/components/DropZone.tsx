import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';

interface DropZoneProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelected?: (file: File) => void;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  accept = '.pdf',
  maxSizeMB = 25,
  onFileSelected,
  className = '',
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const validate = (f: File): boolean => {
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    if (accept === '.pdf' && f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF file');
      return false;
    }
    return true;
  };

  const handleFile = (f: File) => {
    if (!validate(f)) return;
    setFile(f);
    onFileSelected?.(f);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="hidden"
      />

      {!file ? (
        <motion.div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
            min-h-[180px] flex flex-col items-center justify-center gap-4 p-6 text-center
            ${isDragging
              ? 'border-purple-400 bg-purple-500/10 shadow-[0_0_30px_rgba(139,92,246,0.25)]'
              : 'border-slate-700 bg-slate-900/50 hover:border-purple-500/40 hover:bg-purple-500/5'
            }
          `}
        >
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-purple-500/20 scale-110' : 'bg-purple-500/10'}`}>
            <Upload className={`h-8 w-8 transition-all duration-300 ${isDragging ? 'text-purple-400' : 'text-purple-500/60'}`} />
          </div>
          <div>
            <p className={`text-sm font-bold transition-colors ${isDragging ? 'text-purple-300' : 'text-slate-300'}`}>
              {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
            </p>
            <p className="text-xs text-slate-500 mt-1">or click to browse · Max {maxSizeMB}MB</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{formatSize(file.size)} · PDF Document</p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="shrink-0 h-8 w-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
            title="Remove file"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
