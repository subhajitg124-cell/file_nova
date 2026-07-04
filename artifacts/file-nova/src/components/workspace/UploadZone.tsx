import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, AlertCircle, Loader2, FileText, Image, Video, 
  FileSpreadsheet, Sparkles, Camera, CheckCircle2, Trash2, 
  RefreshCw, FileQuestion, FolderGit 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileStore } from '@/store/useFileStore';
import { useAuthStore, type UserProfile, type UserSubscription } from '@/store/useAuthStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useTranslation } from '@/lib/i18n';
import { useAdmin } from '@/lib/admin';
import { apiClient, apiMock } from '@/lib/api';
import { detectFileType, getWorkspaceCategory } from '@/lib/file-detection';
import { AutoDetectAnimation } from '@/components/shared/AutoDetectAnimation';
import { CloudImportHub } from '@/components/workspace/CloudImportHub';
import { Button } from '@/components/ui/button';
import { usePdfThumbnails } from '@/hooks/usePdfThumbnails';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UploadZoneProps {
  allowedCategory?: 'pdf' | 'image' | 'video' | 'office' | null;
}

const CATEGORY_META = {
  pdf:    { icon: FileText,       label: 'PDF Suite',     color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30' },
  image:  { icon: Image,          label: 'Image Lab',     color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
  video:  { icon: Video,          label: 'Video Studio',  color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/30' },
  office: { icon: FileSpreadsheet,label: 'Office Suite',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

type PlanName = 'free' | 'basic' | 'pro' | 'elite' | 'pass_24hr' | 'pass_weekly';

const FILE_SIZE_LIMITS_MB: Record<PlanName, number> = {
  free: 3,
  basic: 15,
  pro: 50,
  elite: 100,
  pass_24hr: 50,
  pass_weekly: 50,
};

const formatFileSizeMb = (bytes: number) => {
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? Math.round(mb).toString() : mb.toFixed(1);
};

const getUploadPlan = (user: UserProfile | null, subscription: UserSubscription | null): PlanName => {
  if (subscription?.status === 'active' && subscription.plan) return subscription.plan;
  return user?.premiumTier || 'free';
};

const getPlanLabel = (plan: PlanName) => plan === 'free' ? 'Free' : plan.charAt(0).toUpperCase() + plan.slice(1);

const floatingParticles = [
  { id: 1, size: 8, color: "bg-indigo-500/10 dark:bg-indigo-500/5", top: "15%", left: "10%", duration: 8, delay: 0 },
  { id: 2, size: 12, color: "bg-purple-500/10 dark:bg-purple-500/5", top: "75%", left: "15%", duration: 12, delay: 1 },
  { id: 3, size: 6, color: "bg-pink-500/10 dark:bg-pink-500/5", top: "25%", left: "80%", duration: 10, delay: 2 },
  { id: 4, size: 10, color: "bg-blue-500/10 dark:bg-blue-500/5", top: "80%", left: "75%", duration: 9, delay: 0.5 },
  { id: 5, size: 14, color: "bg-violet-500/10 dark:bg-violet-500/5", top: "45%", left: "88%", duration: 14, delay: 3 },
  { id: 6, size: 8, color: "bg-emerald-500/10 dark:bg-emerald-500/5", top: "60%", left: "5%", duration: 11, delay: 1.5 },
];

export const UploadZone: React.FC<UploadZoneProps> = ({ allowedCategory = null }) => {
  const { isMockMode, jobId, setJobId, setError, error, setSelectedSection, openEditor, addRawFiles, addFiles } = useFileStore();
  const { user, subscription } = useAuthStore();
  const t = useTranslation();
  const admin = useAdmin();

  // Premium UI & Upload Progress States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('0 MB/s');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  const [isDropping, setIsDropping] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [burstParticles, setBurstParticles] = useState<any[]>([]);
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);
  
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const inputRefFiles = useRef<HTMLInputElement>(null);
  const inputRefCamera = useRef<HTMLInputElement>(null);
  const inputRefGallery = useRef<HTMLInputElement>(null);

  // Hook to pre-render PDF page previews in real time after drop
  const pdfMeta = usePdfThumbnails(uploadingFiles, 80);

  const [sizeLimitModal, setSizeLimitModal] = useState<{
    fileName: string;
    fileSizeMb: string;
    plan: PlanName;
    limitMb: number;
  } | null>(null);
  const [bulkUpgradeOpen, setBulkUpgradeOpen] = useState(false);
  const [mismatchError, setMismatchError] = useState<{
    detected: 'pdf' | 'image' | 'video' | 'office' | null;
    fileName: string;
    file: File;
  } | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<{
    file: File;
    category: 'pdf' | 'image' | 'video' | 'office';
    mime: string;
  } | null>(null);

  const resolveEditorType = (file: File): 'image' | 'pdf' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return 'document';
  };

  const handleRedirectWorkspace = (targetCat: 'pdf' | 'image' | 'video' | 'office' | null, file: File) => {
    if (!targetCat) return;
    setSelectedSection(targetCat);
    setMismatchError(null);
    setError(null);
    openEditor(file, resolveEditorType(file));
  };

  const triggerInput = (type: 'files' | 'camera' | 'gallery') => {
    setMobileDrawerOpen(false);
    if (type === 'files') inputRefFiles.current?.click();
    if (type === 'camera') inputRefCamera.current?.click();
    if (type === 'gallery') inputRefGallery.current?.click();
  };

  const triggerCloudImport = (providerId: string) => {
    const expandBtn = document.querySelector('[class*="Hide import sources"], [class*="Import from cloud"]') as HTMLButtonElement | null;
    if (expandBtn && expandBtn.textContent?.includes('Import from cloud')) {
      expandBtn.click();
    }
    setTimeout(() => {
      const btn = document.getElementById(`btn-cloud-${providerId}`) as HTMLButtonElement | null;
      if (btn) btn.click();
    }, 250);
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      onDrop(Array.from(selected));
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setError(null); setMismatchError(null); setPendingRedirect(null);
    const activePlan = getUploadPlan(user, subscription);
    const isPro = activePlan === 'pro';
    const isElite = activePlan === 'elite';
    const bulkAllowed = isPro || isElite;

    if (acceptedFiles.length > 1 && !bulkAllowed) {
      setBulkUpgradeOpen(true);
      return;
    }

    if (isPro && acceptedFiles.length > 5) {
      setError('Pro plan allows up to 5 files for bulk processing. Upgrade to Elite for up to 20 files.');
      return;
    }

    if (isElite && acceptedFiles.length > 20) {
      setError('Elite plan allows up to 20 files for bulk processing.');
      return;
    }

    const file = acceptedFiles[0];
    const plan = activePlan;
    const limitMb = FILE_SIZE_LIMITS_MB[plan];
    const limitBytes = limitMb * 1024 * 1024;

    const oversizedFile = acceptedFiles.find((candidate) => candidate.size > limitBytes);
    if (oversizedFile) {
      setSizeLimitModal({
        fileName: oversizedFile.name,
        fileSizeMb: formatFileSizeMb(oversizedFile.size),
        plan,
        limitMb,
      });
      return;
    }

    // Trigger visual drop feedback animations
    setIsDropping(true);
    setTimeout(() => setIsDropping(false), 200);
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 400);

    // Burst particles
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: 0,
      y: 0,
      targetX: (Math.random() - 0.5) * 220,
      targetY: (Math.random() - 0.5) * 220,
      color: ["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-emerald-500"][Math.floor(Math.random() * 5)],
      size: Math.random() * 6 + 4,
    }));
    setBurstParticles(newParticles);
    setTimeout(() => setBurstParticles([]), 800);

    // Start progress panel
    setUploadingFiles(acceptedFiles);
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload speed
    const speedBase = 1.8 + Math.random() * 1.5; // 1.8 - 3.3 MB/s
    setUploadSpeed(`${speedBase.toFixed(1)} MB/s`);

    // 1. Multiple Files (API Upload path)
    if (acceptedFiles.length > 1) {
      try {
        const detections = await Promise.all(acceptedFiles.map(async (candidate) => ({
          file: candidate,
          detection: await detectFileType(candidate),
        })));
        const categories = detections.map(({ detection }) => getWorkspaceCategory(detection.mime, detection.extension));

        if (allowedCategory && categories.some((category) => category !== allowedCategory)) {
          setError(`Bulk upload for this workspace only accepts ${allowedCategory.toUpperCase()} files.`);
          setIsUploading(false);
          setUploadStatus('idle');
          return;
        }

        const targetCategory = allowedCategory || categories.find(Boolean) || null;
        if (targetCategory) setSelectedSection(targetCategory);

        const activeJobId = jobId || Math.random().toString(36).substring(2, 15);
        setJobId(activeJobId);
        addRawFiles(acceptedFiles);

        // Run actual upload in background and track progress simulation
        const uploadPromise = isMockMode
          ? apiMock.uploadFiles(acceptedFiles, activeJobId)
          : apiClient.uploadFiles(acceptedFiles, activeJobId);

        // Smooth simulated progress update
        let simulatedPct = 0;
        const startTime = Date.now();
        const duration = 2000 + Math.random() * 1000;

        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          simulatedPct = Math.min(95, (elapsed / duration) * 100);
          setUploadProgress(Math.round(simulatedPct));

          const speed = (speedBase + (Math.random() - 0.5) * 0.4).toFixed(1);
          setUploadSpeed(`${speed} MB/s`);

          const remainingSec = Math.max(1, Math.round(((100 - simulatedPct) / 100) * (duration / 1000)));
          setTimeRemaining(`${remainingSec}s remaining`);
        }, 100);

        const uploaded = await uploadPromise;
        clearInterval(progressInterval);

        setUploadProgress(100);
        setUploadStatus('success');
        setTimeRemaining('Complete');

        // Trigger confetti
        const confettiArray = Array.from({ length: 24 }).map((_, i) => ({
          id: i,
          x: (Math.random() - 0.5) * 300,
          y: -100 - Math.random() * 200,
          r: Math.random() * 360,
          color: ["bg-red-400", "bg-yellow-400", "bg-green-400", "bg-blue-400", "bg-pink-400", "bg-purple-400"][Math.floor(Math.random() * 6)],
          size: Math.random() * 8 + 4,
        }));
        setConfettiParticles(confettiArray);
        setTimeout(() => setConfettiParticles([]), 2000);

        setTimeout(() => {
          addFiles(uploaded);
          setIsUploading(false);
          setUploadStatus('idle');
          setUploadingFiles([]);
        }, 1200);

      } catch (err: any) {
        setUploadStatus('error');
        setError(err.message || 'Bulk upload failed.');
      }
      return;
    }

    // 2. Single File (Local editor path or redirect path)
    try {
      const detection = await detectFileType(file);
      const detectedCat = getWorkspaceCategory(detection.mime, detection.extension);
      if (allowedCategory) {
        if (detectedCat !== allowedCategory) {
          setMismatchError({ detected: detectedCat, fileName: file.name, file });
          setIsUploading(false);
          setUploadStatus('idle');
          return;
        }
      } else {
        if (detectedCat) {
          setPendingRedirect({ file, category: detectedCat, mime: detection.mime });
          setIsUploading(false);
          setUploadStatus('idle');
          return;
        }
      }

      // Local file loading progress animation
      let simulatedPct = 0;
      const progressDuration = 1000;
      const startTime = Date.now();

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        simulatedPct = Math.min(99, (elapsed / progressDuration) * 100);
        setUploadProgress(Math.round(simulatedPct));

        const speed = (speedBase + (Math.random() - 0.5) * 0.4).toFixed(1);
        setUploadSpeed(`${speed} MB/s`);

        const remainingSec = Math.max(1, Math.round(((100 - simulatedPct) / 100) * (progressDuration / 1000)));
        setTimeRemaining(`${remainingSec}s remaining`);
      }, 50);

      await new Promise((resolve) => setTimeout(resolve, progressDuration));
      clearInterval(progressInterval);

      setUploadProgress(100);
      setUploadStatus('success');
      setTimeRemaining('Complete');

      // Trigger confetti
      const confettiArray = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        y: -100 - Math.random() * 200,
        r: Math.random() * 360,
        color: ["bg-red-400", "bg-yellow-400", "bg-green-400", "bg-blue-400", "bg-pink-400", "bg-purple-400"][Math.floor(Math.random() * 6)],
        size: Math.random() * 8 + 4,
      }));
      setConfettiParticles(confettiArray);
      setTimeout(() => setConfettiParticles([]), 2000);

      setTimeout(() => {
        setError(null);
        openEditor(file, resolveEditorType(file));
        setIsUploading(false);
        setUploadStatus('idle');
        setUploadingFiles([]);
      }, 1200);

    } catch (err: any) {
      setUploadStatus('error');
      setError(err.message || 'File loading failed.');
    }
  }, [allowedCategory, setError, openEditor, user, subscription, setSelectedSection, jobId, setJobId, addRawFiles, addFiles, isMockMode]);

  const handleCloudFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const plan = getUploadPlan(user, subscription);
    const limitMb = FILE_SIZE_LIMITS_MB[plan];
    const limitBytes = limitMb * 1024 * 1024;
    const oversized = files.find((f) => f.size > limitBytes);
    if (oversized) {
      setSizeLimitModal({
        fileName: oversized.name,
        fileSizeMb: formatFileSizeMb(oversized.size),
        plan,
        limitMb,
      });
      return;
    }
    await onDrop(files);
  }, [user, subscription, onDrop]);

  const plan = getUploadPlan(user, subscription);
  const isPro = plan === 'pro';
  const isElite = plan === 'elite';
  const fileSizeLimitMb = FILE_SIZE_LIMITS_MB[plan];
  const planLabel = getPlanLabel(plan);
  const bulkAllowed = isPro || isElite;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: FILE_SIZE_LIMITS_MB.elite * 1024 * 1024,
    maxFiles: 20,
    multiple: true,
    disabled: !admin.settings.editingEnabled,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isUploading) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth 3D tilt effect
    const tiltX = ((centerY - y) / centerY) * 5;
    const tiltY = ((x - centerX) / centerX) * 5;
    
    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const getAcceptLabel = () => {
    if (allowedCategory === 'pdf')    return t.acceptLabelPdf;
    if (allowedCategory === 'image')  return t.acceptLabelImage;
    if (allowedCategory === 'video')  return t.acceptLabelVideo;
    if (allowedCategory === 'office') return t.acceptLabelOffice;
    return t.acceptLabelDefault;
  };

  const getHeadline = () => {
    if (isDragActive) return t.releaseToUpload;
    if (allowedCategory === 'pdf')    return t.dropPdfHere;
    if (allowedCategory === 'image')  return t.dropImageHere;
    if (allowedCategory === 'video')  return t.dropVideoHere;
    if (allowedCategory === 'office') return t.dropDocHere;
    return t.dropAnyFile;
  };

  const getFileProgress = (index: number) => {
    if (uploadingFiles.length === 1) return uploadProgress;
    const fileWeight = 100 / uploadingFiles.length;
    const currentIdx = Math.floor((uploadProgress / 100) * uploadingFiles.length);
    if (index < currentIdx) return 100;
    if (index === currentIdx) {
      const filePct = (uploadProgress % fileWeight) / fileWeight;
      return Math.min(99, Math.round(filePct * 100));
    }
    return 0;
  };

  const getFileDetails = (file: File) => {
    const name = file.name;
    const sizeStr = formatFileSizeMb(file.size) + ' MB';
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
    const isVideo = file.type.startsWith('video/');
    const isExcel = file.type.includes('spreadsheet') || file.type.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv');
    const isDoc = file.type.includes('word') || file.type.includes('officedocument.word') || name.endsWith('.docx') || name.endsWith('.doc');
    const isPpt = file.type.includes('presentation') || file.type.includes('powerpoint') || name.endsWith('.pptx') || name.endsWith('.ppt');
    const isZip = file.type.includes('zip') || file.type.includes('compressed') || name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z');
    const isAudio = file.type.startsWith('audio/');

    let Icon = FileQuestion;
    let color = 'text-muted-foreground';
    let bg = 'bg-muted/10';

    if (isPdf) {
      Icon = FileText; color = 'text-red-400'; bg = 'bg-red-500/10';
    } else if (isImage) {
      Icon = Image; color = 'text-blue-400'; bg = 'bg-blue-500/10';
    } else if (isVideo) {
      Icon = Video; color = 'text-violet-400'; bg = 'bg-violet-500/10';
    } else if (isExcel) {
      Icon = FileSpreadsheet; color = 'text-emerald-400'; bg = 'bg-emerald-500/10';
    } else if (isDoc) {
      Icon = FileText; color = 'text-blue-500'; bg = 'bg-blue-600/10';
    } else if (isPpt) {
      Icon = FileText; color = 'text-orange-400'; bg = 'bg-orange-500/10';
    } else if (isZip) {
      Icon = FolderGit; color = 'text-amber-400'; bg = 'bg-amber-500/10';
    } else if (isAudio) {
      Icon = Video; color = 'text-pink-400'; bg = 'bg-pink-500/10';
    }

    return { name, sizeStr, isImage, isPdf, Icon, color, bg };
  };

  const catMeta = allowedCategory ? CATEGORY_META[allowedCategory] : null;
  const CatIcon = catMeta?.icon || Sparkles;

  // Shake transition for error feedback
  const shakeTransition = uploadStatus === 'error' ? {
    x: [-8, 8, -6, 6, -4, 4, 0],
    transition: { duration: 0.5 }
  } : undefined;

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-3 ${isDragActive ? "relative z-50" : ""}`}>
      {/* Hidden Mobile inputs */}
      <input 
        type="file" 
        ref={inputRefFiles} 
        className="hidden" 
        multiple 
        onChange={handleNativeChange} 
        title="Upload local files input"
        aria-label="Upload local files input"
      />
      <input 
        type="file" 
        ref={inputRefCamera} 
        className="hidden" 
        capture="environment" 
        accept="image/*" 
        onChange={handleNativeChange} 
        title="Camera capture input"
        aria-label="Camera capture input"
      />
      <input 
        type="file" 
        ref={inputRefGallery} 
        className="hidden" 
        accept="image/*" 
        onChange={handleNativeChange} 
        title="Photo library select input"
        aria-label="Photo library select input"
      />

      {/* Screen Backdrop Darken & Blur on Drag */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-md z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.div
        {...(getRootProps({
          onClick: (e: any) => {
            if (window.innerWidth < 768 && !isUploading) {
              e.preventDefault();
              e.stopPropagation();
              setMobileDrawerOpen(true);
            }
          }
        }) as any)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX,
          rotateY,
          scale: isDropping ? 0.94 : (isDragActive ? 1.03 : 1),
          y: isDragActive ? -8 : 0,
          ...shakeTransition
        }}
        whileHover={!isUploading ? { scale: 1.008 } : undefined}
        whileTap={!isUploading ? { scale: 0.996 } : undefined}
        style={{
          transformStyle: "preserve-3d",
          perspective: 1000,
        }}
        className={`
          relative group cursor-pointer rounded-2xl border transition-all duration-350 overflow-hidden
          focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-background
          min-h-[160px] sm:min-h-[200px] shadow-premium bg-card/35 backdrop-blur-xl border-white/10 dark:border-white/5
          ${isDragActive
            ? 'bg-brand-primary/5 shadow-glow border-transparent'
            : uploadStatus === 'error'
              ? 'border-red-500/30 shadow-red-500/10 bg-red-500/5'
              : 'hover:bg-brand-primary/[0.015]'
          }
        `}
        role="button" tabIndex={0}
        aria-label={`File upload zone. ${getHeadline()}. ${getAcceptLabel()}`}
      >
        <input {...getInputProps()} />

        {/* Slow Breathing Background Particles */}
        {!isUploading && floatingParticles.map(p => (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${p.color} pointer-events-none`}
            style={{ width: p.size, height: p.size, top: p.top, left: p.left }}
            animate={{ y: [0, -14, 0], x: [0, 6, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Dynamic Light Sweep Highlight on Hover */}
        {!isUploading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        )}

        {/* Drop Flash */}
        <AnimatePresence>
          {flashActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
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

        {/* Confetti Particles on Success */}
        {confettiParticles.map(p => (
          <motion.div
            key={p.id}
            className={`absolute rounded-sm ${p.color} pointer-events-none z-20`}
            style={{ width: p.size, height: p.size, top: "95%", left: "50%" }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: p.x, y: p.y, rotate: p.r, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ))}

        {/* Rotating Gradient border active on drag / hover */}
        <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden p-[1.5px] pointer-events-none">
          <div className={`absolute inset-[-50%] bg-[conic-gradient(from_0deg,#6366f1,#a855f7,#ec4899,#6366f1)] animate-[spin_5s_linear_infinite] transition-opacity duration-300
            ${isDragActive ? 'opacity-90' : 'opacity-25 group-hover:opacity-60'}
          `} />
          <div className="w-full h-full rounded-[15px] bg-card" />
        </div>

        <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-border/40 rounded-tl-lg pointer-events-none transition-colors group-hover:border-brand-primary/30" />
        <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-border/40 rounded-tr-lg pointer-events-none transition-colors group-hover:border-brand-primary/30" />
        <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-border/40 rounded-bl-lg pointer-events-none transition-colors group-hover:border-brand-primary/30" />
        <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-border/40 rounded-br-lg pointer-events-none transition-colors group-hover:border-brand-primary/30" />

        <div className="relative flex flex-col items-center justify-center p-5 sm:p-9 text-center z-10">
          {isUploading ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="w-full flex flex-col gap-4 text-left"
            >
              {/* Progress status header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  {uploadStatus === 'uploading' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                  {uploadStatus === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-bounce" />}
                  {uploadStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
                  <span className="font-display font-extrabold text-sm sm:text-base text-foreground">
                    {uploadStatus === 'uploading' && `Processing your file${uploadingFiles.length > 1 ? 's' : ''}...`}
                    {uploadStatus === 'success' && 'Upload Complete!'}
                    {uploadStatus === 'error' && 'Process Failed'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {uploadProgress}%
                </span>
              </div>

              {/* Files preview list */}
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {uploadingFiles.map((fileItem, idx) => {
                  const details = getFileDetails(fileItem);
                  const filePct = getFileProgress(idx);
                  const FileIcon = details.Icon;
                  
                  const pdfThumb = pdfMeta[fileItem.name]?.thumbnail;
                  const isImage = details.isImage;
                  
                  return (
                    <motion.div
                      key={fileItem.name + idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="flex items-center gap-3 bg-muted/40 border border-border/40 rounded-xl p-2.5 hover:bg-muted/60 transition-all group/file"
                    >
                      {/* Left thumbnail or icon */}
                      <div className="h-11 w-11 shrink-0 bg-card border border-border rounded-lg flex items-center justify-center overflow-hidden shadow-sm relative">
                        {details.isPdf && pdfThumb ? (
                          <img src={pdfThumb} alt="PDF thumb" className="h-full w-full object-cover" />
                        ) : isImage ? (
                          <img src={URL.createObjectURL(fileItem)} alt="Image thumb" className="h-full w-full object-cover" />
                        ) : (
                          <div className={`h-full w-full flex items-center justify-center ${details.bg}`}>
                            <FileIcon className={`h-4 w-4 ${details.color}`} />
                          </div>
                        )}
                      </div>

                      {/* File Info & progress bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <p className="text-xs font-bold text-foreground truncate group-hover/file:text-primary transition-colors">
                            {fileItem.name}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                            {details.sizeStr}
                          </span>
                        </div>
                        
                        {/* Wavy liquid progress bar */}
                        <div className="h-2 w-full bg-muted border border-border/40 rounded-full overflow-hidden relative">
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${uploadStatus === 'error' ? 'from-red-500 to-rose-600' : 'from-brand-primary to-brand-accent'} rounded-full relative`}
                            animate={{ width: `${filePct}%` }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Checkmark */}
                      {filePct === 100 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Speed / details line */}
              {uploadStatus === 'uploading' && (
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono bg-muted/40 p-2 rounded-lg border border-border/30">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    <span>Speed: {uploadSpeed}</span>
                  </div>
                  <span>{timeRemaining}</span>
                </div>
              )}

              {/* Error Actions */}
              {uploadStatus === 'error' && (
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDrop(uploadingFiles); }}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-black text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Upload
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUploading(false);
                      setUploadStatus('idle');
                      setUploadingFiles([]);
                    }}
                    className="py-2 px-4 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-xl transition-colors border border-border cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-4 sm:gap-5"
            >
              <div className="relative">
                {/* Aurora glow background */}
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse pointer-events-none" />

                <motion.div
                  animate={isDragActive ? { scale: 1.3, opacity: 0 } : { scale: 1.2, opacity: 0.4 }}
                  transition={{ duration: 0.8, repeat: isDragActive ? 0 : Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className={`absolute inset-0 rounded-2xl ${catMeta ? catMeta.bg : 'bg-primary/8'} pointer-events-none`}
                />
                <motion.div
                  animate={isDragActive ? { y: -4 } : { y: [0, -4, 0] }}
                  transition={isDragActive ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border flex items-center justify-center shadow-premium
                    ${isDragActive
                      ? 'bg-primary/15 border-primary/40'
                      : catMeta
                        ? `${catMeta.bg} ${catMeta.border}`
                        : 'bg-primary/8 border-primary/20 group-hover:bg-primary/12'
                    }
                  `}
                >
                  {isDragActive
                    ? <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    : <CatIcon className={`h-6 w-6 sm:h-7 sm:w-7 ${catMeta?.color || 'text-primary'}`} />
                  }
                </motion.div>
              </div>

              <div className="space-y-1.5">
                <p className={`text-base sm:text-lg font-bold transition-colors ${isDragActive ? 'text-primary' : 'text-foreground'}`}>
                  {getHeadline()}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  or{' '}
                  <span className="text-primary font-semibold underline-offset-2 group-hover:underline transition-all">
                    {t.clickToBrowse}
                  </span>{' '}
                  your files
                </p>
              </div>

              <div className="flex max-w-full items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full bg-muted/60 border border-border text-[11px] sm:text-xs text-muted-foreground font-medium text-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                {getAcceptLabel()}
              </div>

              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Max file size: {fileSizeLimitMb}MB ({planLabel})
                {plan === 'free' ? ' · Upgrade for larger files' : ''}
              </p>

              <div className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${bulkAllowed ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-muted/40 text-muted-foreground'}`}>
                {isElite ? 'Elite Feature: Upload up to 20 files at once' : isPro ? 'Pro Feature: Upload up to 5 files at once' : 'Single file upload on Free/Basic'}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Cloud imports panel */}
      <CloudImportHub onFilesSelected={handleCloudFiles} allowedCategory={allowedCategory} disabled={!admin.settings.editingEnabled} />

      {/* Mobile Bottom Sheet Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100] md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-3xl p-6 pb-8 z-[101] md:hidden flex flex-col gap-4 shadow-xl"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-2" />
              <h3 className="font-display font-extrabold text-lg text-foreground text-center">Upload Document</h3>
              <p className="text-xs text-muted-foreground text-center -mt-2">Select a source to upload your files</p>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                {(!allowedCategory || allowedCategory === 'image') && (
                  <>
                    <button
                      onClick={() => triggerInput("camera")}
                      className="flex flex-col items-center justify-center p-4 bg-muted/40 hover:bg-muted/80 rounded-2xl border border-border text-center gap-2 cursor-pointer"
                    >
                      <Camera className="h-6 w-6 text-brand-primary" />
                      <span className="text-xs font-bold">Camera Scanner</span>
                    </button>
                    <button
                      onClick={() => triggerInput("gallery")}
                      className="flex flex-col items-center justify-center p-4 bg-muted/40 hover:bg-muted/80 rounded-2xl border border-border text-center gap-2 cursor-pointer"
                    >
                      <Image className="h-6 w-6 text-blue-400" />
                      <span className="text-xs font-bold">Photo Library</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => triggerInput("files")}
                  className={`flex flex-col items-center justify-center p-4 bg-muted/40 hover:bg-muted/80 rounded-2xl border border-border text-center gap-2 cursor-pointer
                    ${allowedCategory && allowedCategory !== 'image' ? 'col-span-2' : 'col-span-2'}
                  `}
                >
                  <FileText className="h-6 w-6 text-emerald-400" />
                  <span className="text-xs font-bold">Browse Local Files</span>
                </button>
              </div>
              
              <div className="border-t border-border my-2" />
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setMobileDrawerOpen(false); triggerCloudImport("google-drive"); }}
                  className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/60 rounded-xl border border-border cursor-pointer"
                >
                  <span className="text-lg">🤖</span>
                  <span className="text-xs font-bold text-foreground">Import from Google Drive</span>
                </button>
                <button
                  onClick={() => { setMobileDrawerOpen(false); triggerCloudImport("dropbox"); }}
                  className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/60 rounded-xl border border-border cursor-pointer"
                >
                  <span className="text-lg">📦</span>
                  <span className="text-xs font-bold text-foreground">Import from Dropbox</span>
                </button>
              </div>
              
              <Button variant="outline" className="mt-4 rounded-xl font-bold py-5" onClick={() => setMobileDrawerOpen(false)}>
                Cancel
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog open={Boolean(sizeLimitModal)} onOpenChange={(open) => !open && setSizeLimitModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File size limit reached</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {sizeLimitModal && (
                <>
                  <span className="font-medium text-foreground">{sizeLimitModal.fileName}</span>
                  <br />
                  {sizeLimitModal.plan === 'free' ? (
                    <>File is {sizeLimitModal.fileSizeMb}MB. Free plan allows 3MB max. Upgrade to Basic for 15MB → ₹49/month</>
                  ) : sizeLimitModal.plan === 'basic' ? (
                    <>File is {sizeLimitModal.fileSizeMb}MB. Basic plan allows 15MB max. Upgrade to Pro for 50MB → ₹99/month</>
                  ) : sizeLimitModal.plan === 'pro' ? (
                    <>File is {sizeLimitModal.fileSizeMb}MB. Pro plan allows 50MB max. Upgrade to Elite for 100MB → ₹199/month</>
                  ) : (
                    <>File is {sizeLimitModal.fileSizeMb}MB. Elite plan allows 100MB max.</>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSizeLimitModal(null)}>Cancel</Button>
            <Button onClick={() => {
              const target = sizeLimitModal?.plan === 'free' ? 'basic' : sizeLimitModal?.plan === 'basic' ? 'pro' : 'elite';
              setSizeLimitModal(null);
              useCheckoutStore.getState().openCheckout(target);
            }}>Upgrade Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkUpgradeOpen} onOpenChange={setBulkUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk processing is a Pro feature</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Bulk processing is a Pro feature (₹99/month). Process up to 10 files simultaneously.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUpgradeOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setBulkUpgradeOpen(false);
              useCheckoutStore.getState().openCheckout('pro');
            }}>Upgrade to Pro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pendingRedirect && (
        <AutoDetectAnimation
          fileName={pendingRedirect.file.name}
          detectedType={pendingRedirect.mime.split('/').pop()?.toUpperCase() || pendingRedirect.category.toUpperCase()}
          targetWorkspace={pendingRedirect.category}
          onConfirm={() => handleRedirectWorkspace(pendingRedirect.category, pendingRedirect.file)}
          onCancel={() => setPendingRedirect(null)}
        />
      )}

      <AnimatePresence>
        {mismatchError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-3 bg-amber-500/8 border border-amber-500/25 p-4 rounded-xl text-sm">
            <div className="flex items-start gap-2.5 text-amber-500">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-foreground text-sm">{t.wrongFileTitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  <span className="font-mono bg-muted px-1 py-0.5 rounded text-foreground text-[11px]">{mismatchError.fileName}</span> is a{' '}
                  <span className="font-bold uppercase text-amber-500">{mismatchError.detected || 'unknown'}</span> file.
                  This workspace only accepts <span className="font-bold uppercase text-amber-500">{allowedCategory}</span> files.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-6">
              <button
                onClick={() => handleRedirectWorkspace(mismatchError.detected, mismatchError.file)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all shadow-sm"
              >
                {t.openIn} {mismatchError.detected === 'pdf' ? 'PDF Suite' : mismatchError.detected === 'image' ? 'Image Lab' : mismatchError.detected === 'video' ? 'Video Studio' : 'Office Suite'}
              </button>
              <button onClick={() => setMismatchError(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {t.dismiss}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 bg-red-500/8 text-red-400 p-3 rounded-xl text-sm font-medium border border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadZone;
