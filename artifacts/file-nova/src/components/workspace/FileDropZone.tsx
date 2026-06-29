import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image as ImageIcon, Video, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePdfThumbnails } from "@/hooks/usePdfThumbnails";
import { useFileStore } from "@/store/useFileStore";

interface FileDropZoneProps {
  acceptedTypes?: string[];
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  accentColor: string;
  compact?: boolean;
}

const THEME_COLORS: Record<string, { color: string; glow: string }> = {
  violet: { color: "text-violet-400", glow: "shadow-violet-500/30" },
  blue:   { color: "text-blue-400",   glow: "shadow-blue-500/30" },
  emerald:{ color: "text-emerald-400",glow: "shadow-emerald-500/30" },
  amber:  { color: "text-amber-400",  glow: "shadow-amber-500/30" },
  red:    { color: "text-red-400",    glow: "shadow-red-500/30" },
  pink:   { color: "text-pink-400",   glow: "shadow-pink-500/30" },
  orange: { color: "text-orange-400", glow: "shadow-orange-500/30" },
  indigo: { color: "text-indigo-400", glow: "shadow-indigo-500/30" },
  lime:   { color: "text-lime-400",   glow: "shadow-lime-500/30" },
  purple: { color: "text-purple-400", glow: "shadow-purple-500/30" },
  sky:    { color: "text-sky-400",    glow: "shadow-sky-500/30" },
  cyan:   { color: "text-cyan-400",   glow: "shadow-cyan-500/30" },
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

  const [isDropping, setIsDropping] = useState(false);

  const pdfMeta = usePdfThumbnails(rawFiles, 80);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        setIsDropping(true);
        onFilesSelected(accepted);
        setTimeout(() => setIsDropping(false), 600);
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
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  const renderThumbnail = (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    if (isPdf && pdfMeta[file.name]?.thumbnail) {
      return (
        <img
          src={pdfMeta[file.name].thumbnail!}
          alt="PDF thumb"
          className="h-full w-full object-cover rounded"
          loading="lazy"
        />
      );
    }
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="Image thumb"
          className="h-full w-full object-cover rounded"
          loading="lazy"
        />
      );
    }
    return <div className="h-full w-full flex items-center justify-center bg-card border border-border rounded text-muted-foreground">{getFileIcon(file)}</div>;
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

  const storeFiles = files || [];

  return (
    <div className="space-y-4">
      {/* Screen Backdrop Darken & Blur on Drag */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* List of uploaded files */}
      {storeFiles.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {storeFiles.map((fileRecord, index) => {
              const rawFile = rawFiles.find((rf) => rf.name === fileRecord.name) || new File([], fileRecord.name, { type: fileRecord.type });
              return (
                <motion.div
                  key={fileRecord.id}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors group"
                >
                  <div className="h-10 w-10 shrink-0 bg-muted border border-border rounded flex items-center justify-center overflow-hidden">
                    {renderThumbnail(rawFile)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{fileRecord.name}</p>
                    <p className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">{formatSize(fileRecord.size)}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                    {maxFiles > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => reorderFile(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Move up"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderFile(index, "down")}
                          disabled={index === storeFiles.length - 1}
                          className="p-1 rounded hover:bg-muted disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Move down"
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(fileRecord.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      title="Remove file"
                      aria-label={`Remove ${fileRecord.name}`}
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
        <motion.div
          {...(getRootProps() as any)}
          animate={isDropping ? "dropping" : isDragActive ? "dragging" : "idle"}
          className="relative cursor-pointer rounded-2xl min-h-[140px] flex items-center justify-center text-center p-4 overflow-hidden"
        >
          <input {...getInputProps()} />

          {/* Premium Animated Border - ONLY the border animates */}
          <div className={`absolute inset-0 rounded-2xl drop-zone-border-glow ${isDragActive ? 'drop-zone-dragging' : ''} ${isDropping ? 'drop-zone-success-glow' : ''}`}>
            {/* Corner highlights that appear on drag */}
            <div className="absolute inset-0 rounded-2xl drop-zone-corners pointer-events-none">
              <div /><div /><div /><div />
            </div>
          </div>

          <motion.div
            className="w-full h-full rounded-2xl border border-dashed bg-card absolute inset-0"
            initial={{ borderColor: "var(--border)" }}
            animate={{
              borderColor: isDragActive ? "var(--primary)" : "var(--border)",
              boxShadow: isDragActive
                ? "0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent), 0 0 20px 4px color-mix(in srgb, var(--primary) 15%, transparent)"
                : "0 0 0 1px color-mix(in srgb, var(--border) 5%, transparent)",
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="flex flex-col items-center gap-3 relative z-10">
            <motion.div
              className={`p-3 rounded-full bg-muted/60 border border-border ${theme.color}`}
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Upload className="h-5 w-5" />
            </motion.div>
            <div>
              <motion.p
                className="text-xs font-bold text-foreground"
                animate={{ opacity: isDragActive ? 1 : 0.9 }}
              >
                {isDragActive ? "Drop files here" : "Drag & Drop files"}
              </motion.p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">
                or click to browse local files
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-muted/40 border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              Accepted: {acceptedTypes.join(", ")}
            </div>
          </div>
        </motion.div>
      )}

      {/* "Add More Files" Inline Button */}
      {storeFiles.length > 0 && storeFiles.length < maxFiles && compact && (
        <div {...(getRootProps() as any)} className="w-full">
          <input {...getInputProps()} />
          <button
            type="button"
            className="w-full py-2 bg-card border border-dashed border-border hover:border-primary/40 rounded-xl text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all hover:bg-card/80 cursor-pointer"
          >
            Add More Files ({storeFiles.length}/{maxFiles})
          </button>
        </div>
      )}
    </div>
  );
};

export default FileDropZone;