import { useState, useCallback, useRef } from 'react';

export interface UseFileUploadReturn {
  file: File | null;
  fileName: string;
  fileSize: string;
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  clearFile: () => void;
  setFile: (f: File | null) => void;
}

export function useFileUpload(options?: { accept?: string; maxSizeMB?: number; onFileSelected?: (file: File) => void }): UseFileUploadReturn {
  const { accept = '.pdf', maxSizeMB = 25, onFileSelected } = options || {};
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fileSize = file ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : '';

  const validate = useCallback((f: File): boolean => {
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    if (accept === '.pdf' && f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF file');
      return false;
    }
    return true;
  }, [accept, maxSizeMB]);

  const handleFile = useCallback((f: File) => {
    if (!validate(f)) return;
    setFile(f);
    onFileSelected?.(f);
  }, [validate, onFileSelected]);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const clearFile = useCallback(() => setFile(null), []);

  return {
    file,
    fileName: file?.name || '',
    fileSize,
    isDragging,
    inputRef,
    openFilePicker,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
    setFile,
  };
}
