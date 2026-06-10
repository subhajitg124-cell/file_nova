import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image as ImageIcon, Video, Trash2, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePdfThumbnails } from "@/hooks/usePdfThumbnails";

interface FileDropZoneProps {
  acceptedTypes?: string[];
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  accentColor: string;
  compact?: boolean;
}

const THEME_COLORS: Record<string, { color: string; border: string; bg: string; pulseBg: string }> = {
  violet: { color: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/5", pulseBg: "rgba(139, 92, 246, 0.1)" },
  blue:   { color: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-500/5",   pulseBg: "rgba(59, 130, 246, 0.1)" },
  emerald:{ color: "text-emerald-400",border: "border-emerald-500/30",bg: "bg-emerald-500/5",pulseBg: "rgba(16, 185, 129, 0.1)" },
  amber:  { color: "text-amber-400",  border: "border-amber-500/30",  bg: "bg-amber-500/5",  pulseBg: "rgba(245, 158, 11, 0.1)" },
  red:    { color: "text-red-400",    border: "border-red-500/30",    bg: "bg-red-500/5",    pulseBg: "rgba(239, 68, 68, 0.1)" },
  pink:   { color: "text-pink-400",   border: "border-pink-500/30",   bg: "bg-pink-500/5",   pulseBg: "rgba(236, 72, 153, 0.1)" },
  orange: { color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/5", pulseBg: "rgba(249, 115, 22, 0.1)" },
  indigo: { color: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/5", pulseBg: "rgba(99, 102, 241, 0.1)" },
  lime:   { color: "text-lime-400",   border: "border-lime-500/30",   bg: "bg-lime-500/5",   pulseBg: "rgba(132, 204, 22, 0.1)" },
  purple: { color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/5", pulseBg: "rgba(168, 85, 247, 0.1)" },
  sky:    { color: "text-sky-400",    border: "border-sky-500/30",    bg: "bg-sky-500/5",    pulseBg: "rgba(14, 165, 233, 0.1)" },
  cyan:   { color: "text-cyan-400",   border: "border-cyan-500/30",   bg: "bg-cyan-500/5",   pulseBg: "rgba(6, 182, 212, 0.1)" },
};

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  acceptedTypes = ["*"],
  maxFiles = 10,
  onFilesSelected,
  accentColor,
  compact = false,
}) => {
  const { rawFiles, files, removeFile } = useFileStore();
  const theme = THEME_COLORS[accentColor] || THEME_COLORS.violet;

  // Render PDF thumbnails via standard hook
  const pdfMeta = usePdfThumbnails(rawFiles, 80);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        onFilesSelected(accepted);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    if (isPdf) return <FileText className="h-5 w-5 text-red-400" />;
    if (file.type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-400" />;
    if (file.type.startsWith("video/")) return <Video className="h-5 w-5 text-violet-400" />;
    return <FileText className="h-5 w-5 text-slate-400" />;
  };

  const renderThumbnail = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    if (isPdf && pdfMeta[file.name]?.thumbnail) {
      return (
        <img
          src={pdfMeta[file.name].thumbnail!}
          alt="PDF thumb"
          className="h-full w-full object-cover rounded"
        />
      );
    }
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="Image thumb"
          className="h-full w-full object-cover rounded"
        />
      );
    }
    return <div className="h-full w-full flex items-center justify-center bg-slate-900 border border-white/5 rounded text-slate-400">{getFileIcon(file)}</div>;
  };

  const reorderFile = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= files.length) return;

    const newFiles = [...files];
    const newRaw = [...rawFiles];

    [newFiles[index], newFiles[nextIndex]] = [newFiles[nextIndex], newFiles[index]];
    [newRaw[index], newRaw[nextIndex]] = [newRaw[nextIndex], newRaw[index]];

    useFileStore.setState({ files: newFiles, rawFiles: newRaw });
  };

  // State mapping for files from zustand
  const storeFiles = files || [];

  return (
    <div className="space-y-4">
      {/* List of uploaded files */}
      {storeFiles.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {storeFiles.map((fileRecord, index) => {
              const rawFile = rawFiles.find((rf) => rf.name === fileRecord.name) || new File([], fileRecord.name, { type: fileRecord.type });
              return (
                <motion.div
                  key={fileRecord.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.05] bg-slate-900/60 hover:bg-slate-900 transition-colors group"
                >
                  <div className="h-10 w-10 shrink-0 bg-slate-950 border border-white/10 rounded flex items-center justify-center overflow-hidden">
                    {renderThumbnail(rawFile)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{fileRecord.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatSize(fileRecord.size)}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                    {maxFiles > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => reorderFile(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-white/5 disabled:opacity-25 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderFile(index, "down")}
                          disabled={index === storeFiles.length - 1}
                          className="p-1 rounded hover:bg-white/5 disabled:opacity-25 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(fileRecord.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Zone element (only show if space available or not compact and no files) */}
      {storeFiles.length < maxFiles && (!compact || storeFiles.length === 0) && (
        <div
          {...(getRootProps() as any)}
          className={`
            relative cursor-pointer rounded-2xl border-2 transition-all duration-300 min-h-[140px] flex items-center justify-center text-center p-4
            ${isDragActive
              ? `border-${accentColor}-500 bg-slate-900 border-march`
              : `border-dashed border-white/10 ${theme.bg} ${theme.border} hover:border-white/20 hover:bg-white/[0.02]`
            }
          `}
          style={{
            background: isDragActive ? theme.pulseBg : undefined,
          }}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-3">
            <div className={`p-3 rounded-full bg-slate-950/60 border border-white/10 ${theme.color}`}>
              <Upload className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                {isDragActive ? "Drop files here!" : "Drag & Drop files"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                or click to browse local files
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-950/40 border border-white/[0.05] text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Accepted: {acceptedTypes.join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* "Add More Files" Inline Button */}
      {storeFiles.length > 0 && storeFiles.length < maxFiles && compact && (
        <div {...(getRootProps() as any)} className="w-full">
          <input {...getInputProps()} />
          <button
            type="button"
            className="w-full py-2 bg-slate-900 border border-dashed border-white/10 hover:border-white/20 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all hover:bg-slate-900/60 cursor-pointer"
          >
            <Sparkles className={`h-3.5 w-3.5 ${theme.color}`} />
            Add More Files ({storeFiles.length}/{maxFiles})
          </button>
        </div>
      )}
    </div>
  );
};

// Access the store globally inside this helper
import { useFileStore } from "@/store/useFileStore";
export default FileDropZone;
