import React from 'react';
import { Link } from 'wouter';
import { TOOLS } from '@/components/workspace/ToolGrid';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChevronRight, ArrowRight, Shield, Lock, Video } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const videoTools = TOOLS.filter(t => t.category === 'video');

export const VideoToolsPage: React.FC = () => {
  const { tText } = useTranslation();

  return (
    <div className="min-h-screen fn-aurora-bg text-foreground font-sans relative overflow-hidden">
      {/* Background grid and radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-70" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06),transparent_65%)] pointer-events-none z-0" />

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10 space-y-12" id="main-content">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-slate-800 dark:text-slate-200">Video Studio</span>
        </nav>

        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 fn-glass rounded-full px-4 py-2 border border-violet-500/25 text-xs font-bold text-violet-500 uppercase tracking-wider"
          >
            <Video className="h-3.5 w-3.5" /> Video Studio
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight"
          >
            Trim and Compress Video & Audio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Trim video clips, compress MP4 files, extract audio to high-quality MP3s, and convert videos to animated GIFs.
            Fast, secure, browser-based processing.
          </motion.p>
        </div>

        {/* Security Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-sm text-foreground">100% Secure Client-Side Editor</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We value your data privacy. All video and audio operations are executed locally in your browser sandbox.
              No video or audio content is ever uploaded to our servers, keeping your clips secure.
            </p>
          </div>
        </motion.div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.actionName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Link
                  href={`/${tool.actionName.replace(/_/g, '-')}`}
                  className="group block fn-clay rounded-2xl p-6 transition-all duration-300 hover:shadow-[var(--fn-shadow-elevated)] hover:-translate-y-1 h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="font-bold text-sm text-foreground mb-1.5 group-hover:text-brand-primary transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-brand-primary font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all pt-2 border-t border-border/30">
                    Open Tool <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto">
              <Lock className="h-5 w-5 text-indigo-500" />
            </div>
            <h3 className="font-extrabold text-sm text-foreground">Sandboxed Processing</h3>
            <p className="text-xs text-muted-foreground">Media assets are processed client-side. Zero server-side storage assures absolute privacy.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto text-lg">⚡</div>
            <h3 className="font-extrabold text-sm text-foreground">Instant Rendering</h3>
            <p className="text-xs text-muted-foreground">Quick, optimized media exports directly inside your browser Sandbox.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto text-lg">🎵</div>
            <h3 className="font-extrabold text-sm text-foreground">Audio Extraction</h3>
            <p className="text-xs text-muted-foreground">Isolate and extract crystal-clear MP3 files from video tracks instantly.</p>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="border-t border-border pt-8 space-y-4">
          <h2 className="text-lg font-black text-foreground text-center">Looking for other suites?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'PDF Suite', href: '/pdf-tools' },
              { label: 'Image Lab', href: '/image-tools' },
              { label: 'Document Suite', href: '/document-tools' },
              { label: 'India Presets', href: '/india-tools' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="text-center text-xs font-bold text-muted-foreground hover:text-foreground bg-card border border-border hover:border-primary/30 rounded-xl py-3 px-4 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* SEO Text Block */}
        <div className="border-t border-border pt-8 space-y-4">
          <h2 className="text-lg font-black text-foreground">Why Use FileNova Video Studio?</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Video and audio files are incredibly popular for presentations, social media, and academic projects.
              However, large video files can exceed email limits or slow down portal uploads. FileNova provides quick tools to trim, compress, and optimize media clips.
            </p>
            <p>
              Our Video Compressor shrinks MP4s using optimized presets without losing key details.
              You can extract audio tracks to MP3s or convert clip highlights into animated GIFs.
              Because all computations happen client-side using browser APIs, your media files remain completely private.
            </p>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="border-t border-border pt-8 max-w-3xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-foreground text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "What video formats are supported?",
                a: "The Video Studio supports MP4, WebM, and most other common video formats. Output encodes are standard H.264 formats for broad compatibility."
              },
              {
                q: "How do I extract audio from a video?",
                a: "Open our Extract Audio tool, upload your video file, and click 'Extract Audio'. The tool will separate the audio track and generate a download-ready MP3 file in seconds."
              },
              {
                q: "Will compressing a video reduce its quality significantly?",
                a: "Our smart compression preset reduces file size by optimizing visual redundancy, so you get the smallest possible file size with minimal visual degradation."
              }
            ].map((faq, i) => (
              <details key={i} className="group rounded-xl border border-border bg-card/50 p-4 transition-colors hover:border-violet-500/20">
                <summary className="text-sm font-bold text-foreground cursor-pointer focus:outline-none flex items-center justify-between select-none">
                  <span>{faq.q}</span>
                  <span className="text-xs transition-transform duration-200 group-open:rotate-90">▶</span>
                </summary>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed border-t border-border/20 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VideoToolsPage;