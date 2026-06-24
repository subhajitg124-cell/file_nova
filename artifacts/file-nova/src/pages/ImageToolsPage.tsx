import React from 'react';
import { Link } from 'wouter';
import { TOOLS } from '@/components/workspace/ToolGrid';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChevronRight, ArrowRight, Shield, Lock, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { ToolSEO } from '@/seo/ToolSEO';
import { ToolStructuredData } from '@/seo/ToolStructuredData';

const imageTools = TOOLS.filter(t => t.category === 'image');

export const ImageToolsPage: React.FC = () => {
  const { tText } = useTranslation();

  return (
    <div className="min-h-screen fn-aurora-bg text-foreground font-sans relative overflow-hidden">
      <ToolSEO />
      <ToolStructuredData />

      {/* Background grid and radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-70" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_65%)] pointer-events-none z-0" />

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10 space-y-12" id="main-content">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-slate-800 dark:text-slate-200">Image Lab</span>
        </nav>

        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 fn-glass rounded-full px-4 py-2 border border-blue-500/25 text-xs font-bold text-blue-500 uppercase tracking-wider"
          >
            <ImageIcon className="h-3.5 w-3.5" /> Image Lab Suite
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight"
          >
            Optimize and Edit Images Online
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Compress images under 50KB/20KB, resize to target dimensions, and clean backgrounds using AI models.
            All processing happens locally in your browser.
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
            <h3 className="font-extrabold text-sm text-foreground">100% Secure Local Sandbox</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your photos are private. FileNova utilizes browser canvas APIs and WebAssembly to process images right on your device.
              No file is ever sent to any remote server.
            </p>
          </div>
        </motion.div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageTools.map((tool, i) => {
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
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground mb-1.5 group-hover:text-brand-primary transition-colors">
                      {tool.title}
                    </h3>
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
            <h3 className="font-extrabold text-sm text-foreground">Zero Cloud Storage</h3>
            <p className="text-xs text-muted-foreground">Photos are processed in-browser. Zero server-side uploads assure perfect privacy.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto text-lg">⚡</div>
            <h3 className="font-extrabold text-sm text-foreground">Fast Processing</h3>
            <p className="text-xs text-muted-foreground">Get results in milliseconds with browser hardware acceleration.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto text-lg">🖼️</div>
            <h3 className="font-extrabold text-sm text-foreground">Multiple Formats</h3>
            <p className="text-xs text-muted-foreground">Supports converting between WebP, JPG, PNG, and vector SVGs seamlessly.</p>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="border-t border-border pt-8 space-y-4">
          <h2 className="text-lg font-black text-foreground text-center">Looking for other suites?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'PDF Suite', href: '/pdf-tools' },
              { label: 'Document Suite', href: '/document-tools' },
              { label: 'Video Studio', href: '/video-tools' },
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
          <h2 className="text-lg font-black text-foreground">Why Use FileNova Image Lab Suite?</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Images and photographs play a crucial role in today's digital workflow — whether you are updating profile photos, optimizing images for faster page loads, or preparing application scans.
              However, large image file sizes can cause form submission errors. FileNova provides a suite of tools to compress, resize, and edit images instantly.
            </p>
            <p>
              Our Image Compressor can shrink JPEGs and PNGs under 50KB or 20KB while preserving clarity.
              The AI Background Remover uses advanced segmentation models to clean up photo backgrounds.
              Because all calculations are made client-side using browser-native APIs, your images remain completely private.
            </p>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="border-t border-border pt-8 max-w-3xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-foreground text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I compress image files?",
                a: "Go to our Compress Image tool, upload your file, select a target size preset (e.g. 50KB or 20KB) or use the custom quality slider, and click Compress. Download your optimized image instantly."
              },
              {
                q: "Can I remove background from images?",
                a: "Yes! Use our Remove Background tool. Our AI will automatically isolate the subject and remove the background, generating a transparent PNG in seconds."
              },
              {
                q: "Does FileNova support bulk image conversion?",
                a: "Yes. Premium users can batch process multiple images at once, optimizing workflows for catalog updates or large-scale document sets."
              }
            ].map((faq, i) => (
              <details key={i} className="group rounded-xl border border-border bg-card/50 p-4 transition-colors hover:border-blue-500/20">
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

export default ImageToolsPage;