import React, { useCallback, useState } from "react";
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

const THEME_COLORS: Record<string, { color: string; border: string; bg: string; activeBg: string }> = {
  violet: { color: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/5", activeBg: "bg-violet-500/10" },
  blue:   { color: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-500/5",   activeBg: "bg-blue-500/10" },
  emerald:{ color: "text-emerald-400",border: "border-emerald-500/30",bg: "bg-emerald-500/5",activeBg: "bg-emerald-500/10" },
  amber:  { color: "text-amber-400",  border: "border-amber-500/30",  bg: "bg-amber-500/5",  activeBg: "bg-amber-500/10" },
  red:    { color: "text-red-400",    border: "border-red-500/30",    bg: "bg-red-500/5",    activeBg: "bg-red-500/10" },
  pink:   { color: "text-pink-400",   border: "border-pink-500/30",   bg: "bg-pink-500/5",   activeBg: "bg-pink-500/10" },
  orange: { color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/5", activeBg: "bg-orange-500/10" },
  indigo: { color: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/5", activeBg: "bg-indigo-500/10" },
  lime:   { color: "text-lime-400",   border: "border-lime-500/30",   bg: "bg-lime-500/5",   activeBg: "bg-lime-500/10" },
  purple: { color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/5", activeBg: "bg-purple-500/10" },
  sky:    { color: "text-sky-400",    border: "border-sky-500/30",    bg: "bg-sky-500/5",    activeBg: "bg-sky-500/10" },
  cyan:   { color: "text-cyan-400",   border: "border-cyan-500/30",   bg: "bg-cyan-500/5",   activeBg: "bg-cyan-500/10" },
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

  // Premium UI & animation states
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [burstParticles, setBurstParticles] = useState<any[]>([]);

  // Render PDF thumbnails via standard hook
  const pdfMeta = usePdfThumbnails(rawFiles, 80);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        setIsDropping(true);
        setTimeout(() => setIsDropping(false), 200);
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 400);

        // Burst particles
        const newParticles = Array.from({ length: 12 }).map((_, i) => ({
          id: i,
          x: 0,
          y: 0,
          targetX: (Math.random() - 0.5) * 180,
          targetY: (Math.random() - 0.5) * 180,
          color: ["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-emerald-500"][Math.floor(Math.random() * 5)],
          size: Math.random() * 5 + 3,
        }));
        setBurstParticles(newParticles);
        setTimeout(() => setBurstParticles([]), 800);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((centerY - y) / centerY) * 4;
    const tiltY = ((x - centerX) / centerX) * 4;
    
    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

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
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors group"
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
                          className="p-1 rounded hover:bg-white/5 disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Move up"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderFile(index, "down")}
                          disabled={index === storeFiles.length - 1}
                          className="p-1 rounded hover:bg-white/5 disabled:opacity-25 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove file"
                      aria-label="Remove file"
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
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          animate={{
            rotateX,
            rotateY,
            scale: isDropping ? 0.96 : (isDragActive ? 1.03 : 1),
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: 800,
          }}
          className={`
            relative cursor-pointer rounded-2xl border transition-all duration-300 min-h-[140px] flex items-center justify-center text-center p-4 overflow-hidden group
            ${isDragActive
              ? `bg-card border-transparent shadow-glow`
              : `bg-card/45 border-dashed border-border/80 hover:bg-white/[0.03]`
            }
          `}
        >
          <input {...getInputProps()} />

          {/* Dynamic Light Sweep Highlight on Hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* Drop Flash */}
          <AnimatePresence>
            {flashActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white dark:bg-brand-primary pointer-events-none rounded-2xl z-20"
              />
            )}
          </AnimatePresence>

          {/* Drop Burst Particles */}
          {burstParticles.map(p => (
            <motion.div
              key={p.id}
              className={`absolute rounded-full ${p.color} pointer-events-none z-20`}
              style={{ width: p.size, height: p.size, top: "50%", left: "50%" }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: p.targetX, y: p.targetY, scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}

          {/* Rotating Gradient border active on drag / hover */}
          <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden p-[1.5px] pointer-events-none">
            <div className={`absolute inset-[-50%] bg-[conic-gradient(from_0deg,#6366f1,#a855f7,#ec4899,#6366f1)] animate-[spin_6s_linear_infinite] transition-opacity duration-300
              ${isDragActive ? 'opacity-90' : 'opacity-20 group-hover:opacity-50'}
            `} />
            <div className="w-full h-full rounded-[15px] bg-card" />
          </div>

          <div className="flex flex-col items-center gap-3 relative z-10">
            {/* Aurora glow background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-700 animate-pulse pointer-events-none" />

            <div className={`p-3 rounded-full bg-muted/60 border border-border ${theme.color} relative z-10`}>
              <Upload className="h-5 w-5 animate-pulse" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-foreground">
                {isDragActive ? "Drop files here!" : "Drag & Drop files"}
              </p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">
                or click to browse local files
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-muted/40 border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider relative z-10">
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
            className="w-full py-2 bg-card border border-dashed border-border hover:border-border rounded-xl text-xs font-bold text-foreground/80 flex items-center justify-center gap-1.5 transition-all hover:bg-card/60 cursor-pointer"
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
