import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Loader2, FileText, Image, Video, FileSpreadsheet, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileStore } from '@/store/useFileStore';
import { useAuthStore, type UserProfile, type UserSubscription } from '@/store/useAuthStore';
import { useTranslation } from '@/lib/i18n';
import { useAdmin } from '@/lib/admin';
import { apiClient, apiMock } from '@/lib/api';
import { detectFileType, getWorkspaceCategory } from '@/lib/file-detection';
import { AutoDetectAnimation } from '@/components/shared/AutoDetectAnimation';
import { Button } from '@/components/ui/button';
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

type PlanName = 'free' | 'basic' | 'pro' | 'elite';

const FILE_SIZE_LIMITS_MB: Record<PlanName, number> = {
  free: 3,
  basic: 15,
  pro: 50,
  elite: 100,
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

export const UploadZone: React.FC<UploadZoneProps> = ({ allowedCategory = null }) => {
  const { isMockMode, jobId, setJobId, setError, error, setSelectedSection, openEditor, addRawFiles, addFiles } = useFileStore();
  const { user, subscription } = useAuthStore();
  const t = useTranslation();
  const admin = useAdmin();
  const [isUploading, setIsUploading] = useState(false);
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

    if (acceptedFiles.length > 1) {
      setIsUploading(true);
      try {
        const detections = await Promise.all(acceptedFiles.map(async (candidate) => ({
          file: candidate,
          detection: await detectFileType(candidate),
        })));
        const categories = detections.map(({ detection }) => getWorkspaceCategory(detection.mime, detection.extension));

        if (allowedCategory && categories.some((category) => category !== allowedCategory)) {
          setError(`Bulk upload for this workspace only accepts ${allowedCategory.toUpperCase()} files.`);
          return;
        }

        const targetCategory = allowedCategory || categories.find(Boolean) || null;
        if (targetCategory) setSelectedSection(targetCategory);

        const activeJobId = jobId || Math.random().toString(36).substring(2, 15);
        setJobId(activeJobId);
        addRawFiles(acceptedFiles);
        const uploaded = isMockMode
          ? await apiMock.uploadFiles(acceptedFiles, activeJobId)
          : await apiClient.uploadFiles(acceptedFiles, activeJobId);
        addFiles(uploaded);
      } catch (err: any) {
        setError(err.message || 'Bulk upload failed.');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    const detection = await detectFileType(file);
    const detectedCat = getWorkspaceCategory(detection.mime, detection.extension);
    if (allowedCategory) {
      if (detectedCat !== allowedCategory) { setMismatchError({ detected: detectedCat, fileName: file.name, file }); return; }
    } else {
      if (detectedCat) { setPendingRedirect({ file, category: detectedCat, mime: detection.mime }); return; }
    }
    setError(null);
    openEditor(file, resolveEditorType(file));
  }, [allowedCategory, setError, openEditor, user, subscription, setSelectedSection, jobId, setJobId, addRawFiles, addFiles, isMockMode]);

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

  const catMeta = allowedCategory ? CATEGORY_META[allowedCategory] : null;
  const CatIcon = catMeta?.icon || Sparkles;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <motion.div
        {...(getRootProps() as any)}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        className={`
          relative group cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden
          focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-background
          min-h-[160px] sm:min-h-[200px]
          ${isDragActive
            ? 'border-primary bg-primary/5 shadow-glow border-march'
            : 'border-dashed border-border hover:border-primary/50 bg-card hover:bg-muted/30'
          }
        `}
        role="button" tabIndex={0}
        aria-label={`File upload zone. ${getHeadline()}. ${getAcceptLabel()}`}
      >
        <input {...getInputProps()} />

        {/* Background glow layer on drag */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-border/40 rounded-tl-lg pointer-events-none transition-colors group-hover:border-primary/30" />
        <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-border/40 rounded-tr-lg pointer-events-none transition-colors group-hover:border-primary/30" />
        <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-border/40 rounded-bl-lg pointer-events-none transition-colors group-hover:border-primary/30" />
        <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-border/40 rounded-br-lg pointer-events-none transition-colors group-hover:border-primary/30" />

        <div className="relative flex flex-col items-center justify-center gap-4 sm:gap-5 p-5 sm:p-10 text-center">
          {isUploading ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-bold text-foreground">{t.uploadingFile}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.uploadingChecking}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-4 sm:gap-5"
            >
              {/* Icon */}
              <div className="relative">
                {/* Outer ring */}
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

              {/* Text */}
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

              {/* Accept label pill */}
              <div className="flex max-w-full items-center gap-1.5 px-3 py-1.5 rounded-xl sm:rounded-full bg-muted/60 border border-border text-[11px] sm:text-xs text-muted-foreground font-medium text-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                {getAcceptLabel()}
              </div>

              {/* Plan-aware size limit */}
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
            <Button onClick={() => { window.location.href = '/pricing'; }}>Upgrade Now</Button>
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
            <Button onClick={() => { window.location.href = '/pricing'; }}>Upgrade to Pro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-detect redirect */}
      {pendingRedirect && (
        <AutoDetectAnimation
          fileName={pendingRedirect.file.name}
          detectedType={pendingRedirect.mime.split('/').pop()?.toUpperCase() || pendingRedirect.category.toUpperCase()}
          targetWorkspace={pendingRedirect.category}
          onConfirm={() => handleRedirectWorkspace(pendingRedirect.category, pendingRedirect.file)}
          onCancel={() => setPendingRedirect(null)}
        />
      )}

      {/* Mismatch error */}
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

      {/* Upload error */}
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
