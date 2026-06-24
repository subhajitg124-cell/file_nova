import React, { useEffect, useState, useRef } from 'react';
import { useFileStore } from '@/store/useFileStore';
import { apiClient, HAS_BACKEND } from '@/lib/api';
import { UploadZone } from '@/components/workspace/UploadZone';
import { PreviewCanvas } from '@/components/workspace/PreviewCanvas';
import { ToolGrid } from '@/components/workspace/ToolGrid';
import { OptionsPanel } from '@/components/workspace/OptionsPanel';
import { ProgressTracker, QueueTracker } from '@/components/workspace/ProgressTracker';
import { DownloadHub } from '@/components/workspace/DownloadHub';
import { SmartRecommendations } from '@/components/workspace/SmartRecommendations';
import { TrustIndicators, PrivacySection } from '@/components/workspace/TrustIndicators';
import { motion } from 'framer-motion';
import { BulkProcessor } from '@/components/BulkProcessor';
import { useLocation } from 'wouter';
import {
  Sun, Moon, ShieldCheck, Zap, AlertTriangle, FileText, Sparkles,
  Video, FileSpreadsheet, ArrowLeft, FolderOpen, Cpu, Lock
} from 'lucide-react';
import { BackHomeBar } from '@/components/BackHomeBar';

const SUITES = [
  {
    id: 'pdf' as const,
    title: 'PDF Suite',
    subtitle: 'Merge & Compress',
    description: 'Merge multiple PDFs, compress, split pages, or convert to DOCX, PPTX, and images.',
    icon: FileText,
    toolCount: 7,
    accentFrom: 'from-red-500',
    accentTo: 'to-rose-500',
    cardBg: 'bg-gradient-to-br from-red-500/8 to-rose-500/4',
    borderClass: 'border-red-500/15 hover:border-red-500/40',
    glowClass: 'hover:shadow-glow-red',
    iconBg: 'bg-gradient-to-br from-red-500/20 to-rose-500/10',
    iconColor: 'text-red-400',
    tools: ['Merge', 'Compress', 'Split', 'PDF→DOCX', 'PDF→PPTX', 'PDF→Images', 'Images→PDF'],
  },
  {
    id: 'image' as const,
    title: 'Image Lab',
    subtitle: 'Enhance & Convert',
    description: 'Compress, enhance, resize, convert formats, make ICO favicons, or convert SVG to PNG.',
    icon: Sparkles,
    toolCount: 7,
    accentFrom: 'from-blue-500',
    accentTo: 'to-cyan-500',
    cardBg: 'bg-gradient-to-br from-blue-500/8 to-cyan-500/4',
    borderClass: 'border-blue-500/15 hover:border-blue-500/40',
    glowClass: 'hover:shadow-glow-blue',
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
    iconColor: 'text-blue-400',
    tools: ['Compress', 'Enhance', 'Resize', 'Format Convert', 'To ICO', 'SVG→PNG', 'Images→PDF'],
  },
  {
    id: 'office' as const,
    title: 'Office Suite',
    subtitle: 'Convert & Clean',
    description: 'Convert DOCX, PPTX, XLSX — with full bi-directional PDF support and document cleanup.',
    icon: FileSpreadsheet,
    toolCount: 10,
    accentFrom: 'from-emerald-500',
    accentTo: 'to-teal-500',
    cardBg: 'bg-gradient-to-br from-emerald-500/8 to-teal-500/4',
    borderClass: 'border-emerald-500/15 hover:border-emerald-500/40',
    glowClass: 'hover:shadow-glow-green',
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
    tools: ['DOCX↔PDF', 'PPTX↔PDF', 'XLSX→CSV', 'CSV→XLSX', 'MD↔HTML', 'Compress', 'Clean'],
  },
  {
    id: 'video' as const,
    title: 'Video Studio',
    subtitle: 'Trim & Compress',
    description: 'Trim video clips, compress MP4, extract audio, convert to GIF, or compress audio files.',
    icon: Video,
    toolCount: 5,
    accentFrom: 'from-violet-500',
    accentTo: 'to-purple-500',
    cardBg: 'bg-gradient-to-br from-violet-500/8 to-purple-500/4',
    borderClass: 'border-violet-500/15 hover:border-violet-500/40',
    glowClass: 'hover:shadow-glow-purple',
    iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/10',
    iconColor: 'text-violet-400',
    tools: ['Trim & Cut', 'Compress', 'Extract Audio', 'Video→GIF', 'Compress Audio'],
  },
];

const TRUST_BADGES = [
  { icon: Lock,       label: 'Zero server storage',    desc: 'Files never leave your device for client-side ops' },
  { icon: Zap,        label: 'Instant processing',     desc: 'Most operations complete in seconds' },
  { icon: ShieldCheck,label: 'GDPR compliant',         desc: 'Auto-expiry on all temporary files' },
];

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  defaultBorder?: string;
}

function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(99, 102, 241, 0.15)",
  borderColor = "rgba(255, 255, 255, 0.12)",
  defaultBorder = "rgba(255, 255, 255, 0.05)",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    const w = rect.width;
    const h = rect.height;
    const dx = x - w / 2;
    const dy = y - h / 2;
    const maxTilt = 4; // Subtle 3D skew
    setTilt({
      x: -(dy / (h / 2)) * maxTilt,
      y: (dx / (w / 2)) * maxTilt,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 bg-card/45 backdrop-blur-md perspective-1000 preserve-3d ${className}`}
      style={{
        borderColor: isHovered ? borderColor : defaultBorder,
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.015, 1.015, 1.015)`
          : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div 
        className="relative z-10 h-full w-full flex flex-col preserve-3d"
        style={{ transform: isHovered ? "translateZ(8px)" : "translateZ(0px)" }}
      >
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const {
    files, selectedOperation, isProcessing, downloadUrl, isMockMode, toggleMockMode,
    backendHealthy, backendCapabilities, setBackendStatus, selectedSection, setSelectedSection, clearStore,
    rawFiles
  } = useFileStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const fetchHealth = async () => {
      const res = await apiClient.checkHealth();
      setBackendStatus(res.healthy, res.capabilities);
      if (!res.healthy) useFileStore.setState({ isMockMode: true });
    };
    fetchHealth();
    if (!HAS_BACKEND) return;
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [setBackendStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sec = params.get('section');
    if (sec && ['pdf', 'image', 'video', 'office'].includes(sec)) {
      setSelectedSection(sec as any);
    } else {
      const last = localStorage.getItem('file-nova-last-workspace');
      if (last && ['pdf', 'image', 'video', 'office'].includes(last)) setSelectedSection(last as any);
    }
  }, [setSelectedSection]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const step = downloadUrl ? 3 : (files.length > 0 && selectedOperation) ? 2 : 1;

  const workspaceMeta: Record<string, { title: string; desc: string }> = {
    pdf:    { title: 'PDF Suite',               desc: 'Merge, compress, split, and convert PDF documents.' },
    image:  { title: 'Image Lab',               desc: 'Compress, enhance, resize, and convert images client-side.' },
    office: { title: 'Office & Text Suite',     desc: 'Convert documents, spreadsheets, presentations, and markup.' },
    video:  { title: 'Video Processing Studio', desc: 'Trim, compress, and convert video and audio files.' },
  };
  const ws = selectedSection ? workspaceMeta[selectedSection] : null;

  return (
    <div className="flex flex-col min-h-screen bg-background bg-mesh transition-colors duration-300">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-transparent py-3 px-3 sm:px-4 transition-all duration-300">
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-2 rounded-full border border-border/60 bg-background/70 backdrop-blur-xl shadow-premium relative overflow-hidden group/nav">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/10 to-brand-primary/0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <button
            onClick={() => { clearStore(); setLocation('/'); }}
            className="flex items-center gap-2.5 group focus:outline-none relative z-10"
            aria-label="Back to home"
          >
            <div className="h-8 w-8 rounded-xl overflow-hidden border border-border shadow-sm group-hover:scale-105 transition-transform duration-200">
              <img src="/logo.png" alt="FileNova - AI PDF and Image Tools" className="h-full w-full object-cover" width="32" height="32" />
            </div>
            <div className="leading-tight text-left">
              <span className="block text-sm font-extrabold tracking-tight text-foreground">FileNova</span>
              <span className="block text-[9px] text-muted-foreground font-medium uppercase tracking-widest">Workspace</span>
            </div>
          </button>

          <nav aria-label="Workspace navigation" className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => { clearStore(); setLocation('/'); }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground border border-border hover:border-primary/35 bg-card hover:bg-accent/50 py-1.5 px-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </button>
            {/* Standalone mode toggle */}
            <div className="hidden sm:flex items-center gap-2 bg-card/60 border border-border rounded-xl px-3 py-1.5 text-xs">
              <span className="text-muted-foreground font-medium">Standalone</span>
              <button
                type="button"
                onClick={() => toggleMockMode()}
                disabled={!HAS_BACKEND}
                title={isMockMode ? 'Disable standalone mode' : 'Enable standalone mode'}
                aria-label={isMockMode ? 'Disable standalone mode' : 'Enable standalone mode'}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${isMockMode ? 'bg-primary' : 'bg-secondary'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${isMockMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className="h-8 w-8 flex items-center justify-center rounded-xl bg-card/60 hover:bg-card border border-border text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </nav>
        </div>
      </header>

      {/* ── Banners ─────────────────────────────────────────────────────────── */}
      {!isMockMode && !backendHealthy && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          FastAPI backend is offline — running in Standalone Simulator mode.
        </div>
      )}
      {!isMockMode && backendHealthy && (!backendCapabilities.ffmpeg || !backendCapabilities.libreoffice) && (
        <div className="bg-violet-500/10 border-b border-violet-500/20 py-2 px-4 text-center text-xs text-violet-500 dark:text-violet-400 flex items-center justify-center gap-2 font-medium">
          <Cpu className="h-3.5 w-3.5 shrink-0" />
          {!backendCapabilities.libreoffice && 'LibreOffice unavailable. '}
          {!backendCapabilities.ffmpeg && 'FFmpeg unavailable.'}
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-10">

        {/* ── Wizard step indicator (when files loaded) ── */}
        {files.length > 0 && (
          <div className="w-full max-w-sm mx-auto flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2 -z-10" />
            <motion.div
              className="absolute top-1/2 left-0 h-px bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
              animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />
            {[{l:'Upload',n:1},{l:'Configure',n:2},{l:'Export',n:3}].map(({l,n}) => (
              <div key={n} className="flex flex-col items-center bg-background px-3 gap-1.5">
                <span className={`h-7 w-7 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${step >= n ? 'border-primary bg-primary text-primary-foreground shadow-glow' : 'border-border bg-card text-muted-foreground'}`}>
                  {n}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${step >= n ? 'text-primary' : 'text-muted-foreground'}`}>{l}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── DASHBOARD ───────────────────────────────────────────────────── */}
        {files.length === 0 && selectedSection === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            {/* Back Navigation */}
            <BackHomeBar />

            {/* Hero */}
            <div className="text-center space-y-5 max-w-2xl mx-auto pt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border bg-card/80 border-border text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                29+ tools · Client-side processing · Zero storage
              </motion.div>

              <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-balance">
                <span className="gradient-text">Secure, Instant</span>
                <br />
                <span className="text-foreground">File Processing</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                All work happens client-side or in sandboxed environments.
                Drop any file to auto-detect its type, or pick a workspace below.
              </p>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 flex-wrap pt-1">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Universal drop zone */}
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="text-center">
                <span className="text-[10px] uppercase font-extrabold text-primary tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  Universal Dropzone
                </span>
              </div>
              <UploadZone allowedCategory={null} />
            </div>

            {/* Workspace cards */}
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="text-center">
                <p className="text-xs uppercase font-extrabold text-muted-foreground tracking-widest">Or select a specialized workspace</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUITES.map((suite) => {
                  const isLarge = suite.id === 'pdf' || suite.id === 'video';
                  return (
                    <SpotlightCard
                      key={suite.id}
                      onClick={() => setSelectedSection(suite.id)}
                      spotlightColor={
                        suite.id === 'pdf' ? 'rgba(239, 68, 68, 0.15)' :
                        suite.id === 'image' ? 'rgba(59, 130, 246, 0.15)' :
                        suite.id === 'office' ? 'rgba(16, 185, 129, 0.15)' :
                        'rgba(139, 92, 246, 0.15)'
                      }
                      borderColor={
                        suite.id === 'pdf' ? 'rgba(239, 68, 68, 0.3)' :
                        suite.id === 'image' ? 'rgba(59, 130, 246, 0.3)' :
                        suite.id === 'office' ? 'rgba(16, 185, 129, 0.3)' :
                        'rgba(139, 92, 246, 0.3)'
                      }
                      className={`cursor-pointer p-6 flex flex-col justify-between ${
                        isLarge ? 'md:col-span-2' : 'md:col-span-1'
                      }`}
                    >
                      <div className="space-y-4 h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-2xl ${suite.iconBg} border border-white/5`}>
                            <suite.icon className={`h-6 w-6 ${suite.iconColor}`} />
                          </div>
                          <div className="text-right">
                            <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${suite.iconColor} opacity-70`}>{suite.subtitle}</span>
                            <span className={`block text-xl font-black ${suite.iconColor}`}>{suite.toolCount}</span>
                            <span className="block text-[9px] text-muted-foreground font-medium -mt-0.5">tools</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center py-4">
                          <h3 className="text-lg font-black text-foreground mb-1">{suite.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">{suite.description}</p>
                          
                          {/* Rich Visualizations inside Bento Cards */}
                          {suite.id === 'pdf' && (
                            <div className="mt-4 flex items-center gap-2.5 bg-red-500/5 border border-red-500/10 rounded-xl p-3 max-w-sm self-start overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <span className="h-6 w-9 rounded bg-rose-500/20 border border-rose-500/35 flex items-center justify-center text-[8px] font-bold font-mono text-rose-300">DOC.pdf</span>
                                <span className="text-xs text-muted-foreground/50">+</span>
                                <span className="h-6 w-9 rounded bg-rose-500/20 border border-rose-500/35 flex items-center justify-center text-[8px] font-bold font-mono text-rose-300">IMG.jpg</span>
                                <span className="text-xs text-muted-foreground/50">→</span>
                              </div>
                              <div className="h-6 w-12 rounded bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-[8px] font-extrabold text-white shadow-sm shadow-red-500/20 animate-pulse">MERGED.pdf</div>
                            </div>
                          )}

                          {suite.id === 'image' && (
                            <div className="mt-4 relative h-16 w-32 border border-dashed border-blue-500/30 rounded-lg flex items-center justify-center bg-blue-500/5 overflow-hidden">
                              <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                              <span className="text-[9px] font-bold text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-400/20">RESIZE_75%</span>
                            </div>
                          )}

                          {suite.id === 'office' && (
                            <div className="mt-4 flex items-center gap-2 max-w-[200px]">
                              <span className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[9px] font-bold text-emerald-400">DOCX</span>
                              <span className="text-xs text-muted-foreground">⇄</span>
                              <span className="h-7 w-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[9px] font-bold text-red-400">PDF</span>
                              <span className="text-xs text-muted-foreground">⇄</span>
                              <span className="h-7 w-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-[9px] font-bold text-green-400">XLSX</span>
                            </div>
                          )}

                          {suite.id === 'video' && (
                            <div className="mt-4 bg-violet-500/5 border border-violet-500/15 rounded-xl p-3 w-full max-w-md">
                              <div className="flex items-center justify-between text-[9px] font-mono text-violet-300/80 mb-1.5">
                                <span>00:00:12</span>
                                <span className="bg-violet-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">TRIMMING SCOPE</span>
                                <span>00:00:48</span>
                              </div>
                              <div className="h-3 bg-secondary rounded-full relative overflow-hidden">
                                <div className="absolute left-[20%] right-[30%] top-0 bottom-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-glow-purple flex items-center justify-between px-1">
                                  <div className="w-1 h-2.5 bg-white rounded-full opacity-60" />
                                  <div className="w-1 h-2.5 bg-white rounded-full opacity-60" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tool pills */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {suite.tools.slice(0, isLarge ? 6 : 3).map((t) => (
                            <span key={t} className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${suite.iconBg} ${suite.iconColor} border border-current/10`}>
                              {t}
                            </span>
                          ))}
                          {suite.tools.length > (isLarge ? 6 : 3) && (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                              +{suite.tools.length - (isLarge ? 6 : 3)} more
                            </span>
                          )}
                        </div>

                        <div className={`flex items-center justify-between text-xs font-bold border-t border-border/50 pt-3 ${suite.iconColor}`}>
                          <span className="opacity-60 text-muted-foreground font-semibold">Enter workspace</span>
                          <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── WORKSPACE TOOL SELECT (no files yet) ──────────────────────── */}
        {files.length === 0 && selectedSection !== null && ws && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 max-w-4xl mx-auto">
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedSection(null)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider transition-colors mb-2 cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Dashboard
                </button>
                <h2 className="text-2xl font-black text-foreground">{ws.title}</h2>
                <p className="text-xs text-muted-foreground">{ws.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                <span>Choose an operation or drop files below</span>
              </div>
            </div>
            <UploadZone allowedCategory={selectedSection} />
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-extrabold text-primary tracking-widest">Available Tools</h3>
                <span className="text-[10px] text-muted-foreground italic">Click a tool to upload and process directly</span>
              </div>
              <ToolGrid />
            </div>
          </motion.div>
        )}

        {/* ── WIZARD STEPS (files loaded) ───────────────────────────────── */}
        {files.length > 0 && (
          <div className="space-y-6">

            {/* Step 1: uploaded, pick tool */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between border-b border-border pb-4 max-w-4xl mx-auto">
                  <button onClick={() => clearStore()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider transition-colors cursor-pointer">
                    <ArrowLeft className="h-3 w-3" /> Reset Workspace
                  </button>
                  <span className="text-xs font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                    {files.length} {files.length === 1 ? 'file' : 'files'} ready
                  </span>
                </div>
                <PreviewCanvas />
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="text-center">
                    <p className="text-xs uppercase font-extrabold text-primary tracking-widest">Select an Operation</p>
                  </div>
                  <ToolGrid />
                </div>
              </motion.div>
            )}

            {/* Step 2: configure + process */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {rawFiles.length > 1 ? (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <button
                        onClick={() => useFileStore.setState({ selectedOperation: null })}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-3 w-3" /> Change Operation
                      </button>
                      <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-wider">
                        Ready to process
                      </span>
                    </div>
                    <BulkProcessor />
                    {useFileStore.getState().processingQueue && (
                      <QueueTracker
                        queuePosition={useFileStore.getState().processingQueue!.position}
                        totalInQueue={useFileStore.getState().processingQueue!.total}
                      />
                    )}
                  </div>
                ) : isProcessing ? (
                  <ProgressTracker />
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-4 max-w-4xl mx-auto">
                      <button
                        onClick={() => useFileStore.setState({ selectedOperation: null })}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="h-3 w-3" /> Change Operation
                      </button>
                      <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-wider">
                        Ready to process
                      </span>
                    </div>
                    <PreviewCanvas />
                    <OptionsPanel />
                    <SmartRecommendations />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: download */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <DownloadHub />
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/20 py-5 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>GDPR-Compliant · Zero persistent storage · Files auto-expire in 30 min</span>
            <TrustIndicators />
          </div>
          <div className="flex items-center gap-4">
            <span>WCAG 2.1 AA</span>
            <span>·</span>
            <span>v2.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
