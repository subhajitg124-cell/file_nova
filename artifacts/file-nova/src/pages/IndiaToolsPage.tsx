import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Fingerprint, CreditCard, FileCheck2, UploadCloud, GraduationCap,
  ArrowRight, Shield, Lock, ChevronRight
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from '@/lib/i18n';

const indiaTools = [
  {
    id: 'aadhaar-mask-pdf',
    title: 'Aadhaar Mask PDF',
    description: 'Black out the first 8 digits of your Aadhaar number for safe sharing with landlords, banks, and employers.',
    icon: Fingerprint,
    href: '/aadhaar-mask-pdf',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badge: 'Popular',
    useCases: ['UIDAI compliance', 'Bank KYC', 'Rental agreements'],
  },
  {
    id: 'pan-card-resize',
    title: 'PAN Card Photo Resize',
    description: 'Resize your photo or signature to exact NSDL/UTIITSL dimensions — 3.5 x 2.5 cm, correct DPI, under 200KB.',
    icon: CreditCard,
    href: '/pan-card-resize',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    badge: 'India',
    useCases: ['NSDL PAN application', 'UTIITSL portal', 'Passport photo'],
  },
  {
    id: 'government-form-fill',
    title: 'Government Form Fill',
    description: 'Fill Aadhaar enrollment, PAN Form 49A, passport, and scholarship PDF forms online — no printing needed.',
    icon: FileCheck2,
    href: '/government-form-fill',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    badge: 'Free',
    useCases: ['Aadhaar correction', 'PAN application', 'NSP bonafide'],
  },
  {
    id: 'compress-pdf-for-upload',
    title: 'Compress for Upload',
    description: 'Shrink any PDF to exact portal limits — 100KB, 200KB, 500KB, or 1MB — for IRCTC, NSP, and government portals.',
    icon: UploadCloud,
    href: '/compress-pdf-for-upload',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badge: 'Portal-Ready',
    useCases: ['IRCTC upload', 'NSP documents', 'SVMCM portal'],
  },
  {
    id: 'scholarship-zip',
    title: 'Scholarship ZIP Maker',
    description: 'Bundle marksheets, income certificates, and passbook scans into a single ZIP file for SVMCM, OASIS, or NSP.',
    icon: GraduationCap,
    href: '/scholarship-zip',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    badge: 'Popular',
    useCases: ['SVMCM / Kanyashree', 'OASIS portal', 'NSP scholarship'],
  },
];

export default function IndiaToolsPage() {
  const { tText } = useTranslation();

  useSEO({
    title: 'Made for India – Aadhaar, PAN, Scholarship & Government PDF Tools | FileNova',
    description: 'Free online PDF tools built for Indian government portals. Mask Aadhaar, resize PAN photos, fill government forms, compress for IRCTC/NSP, and create scholarship ZIP files — all processed in your browser.',
    canonical: 'https://filenova.in/india-tools',
    keywords: 'aadhaar mask pdf, pan card photo resize, government form fill, compress pdf for upload, scholarship zip, india pdf tools, nsdl photo size, svmcm zip, oasis portal, irctc upload',
    isHomepage: false,
  });

  return (
    <div className="min-h-screen fn-aurora-bg text-foreground font-sans relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-70" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_65%)] pointer-events-none z-0" />

      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-slate-800 dark:text-slate-200">India Tools</span>
        </nav>

        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 fn-glass rounded-full px-4 py-2 border border-[var(--fn-accent-india)] text-xs font-bold text-[var(--fn-accent-india)] uppercase tracking-wider"
          >
            🇮🇳 Made for India
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight"
          >
            India-Specific Document Tools
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Every tool below is pre-configured for Indian government portals — NSDL, UTIITSL, IRCTC, NSP, SVMCM, OASIS, and UIDAI.
            Files are processed entirely in your browser. Zero uploads.
          </motion.p>
        </div>

        {/* Privacy Banner */}
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
            <h3 className="font-extrabold text-sm text-foreground">100% Private — Files Never Leave Your Device</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All Aadhaar masking, PAN resize, form filling, and ZIP creation happens inside your browser.
              No file is ever uploaded to any server. This means your Aadhaar, PAN, and scholarship documents stay completely private.
            </p>
          </div>
        </motion.div>

        {/* Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {indiaTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Link
                  href={tool.href}
                  className="group block fn-clay rounded-2xl p-6 transition-all duration-300 hover:shadow-[var(--fn-shadow-elevated)] hover:-translate-y-1 h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-[var(--fn-accent-india)]/10 text-[var(--fn-accent-india)] border border-[var(--fn-accent-india)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    {tool.badge && (
                      <span className="text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-base text-foreground mb-1.5 group-hover:text-brand-primary transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tool.useCases.map((uc, j) => (
                      <span key={j} className="text-[9px] bg-secondary border border-border px-2 py-0.5 rounded-md font-bold text-muted-foreground">
                        {uc}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-brand-primary font-bold opacity-0 group-hover:opacity-100 transition-all">
                    Open tool <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto">
              <Lock className="h-5 w-5 text-indigo-500" />
            </div>
            <h3 className="font-extrabold text-sm text-foreground">Zero Upload</h3>
            <p className="text-xs text-muted-foreground">Your documents never leave your browser. No server, no cloud, no third party.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto text-lg">⚡</div>
            <h3 className="font-extrabold text-sm text-foreground">Instant Results</h3>
            <p className="text-xs text-muted-foreground">No queues or wait times. Process documents in seconds, even on slow connections.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto text-lg">🇮🇳</div>
            <h3 className="font-extrabold text-sm text-foreground">Pre-Configured</h3>
            <p className="text-xs text-muted-foreground">Exact KB limits, pixel dimensions, and ZIP specs for every Indian government portal.</p>
          </div>
        </div>

        {/* Internal Links / Related */}
        <div className="border-t border-border pt-8 space-y-4">
          <h2 className="text-lg font-black text-foreground text-center">More Tools You Might Need</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Compress PDF', href: '/compress-pdf' },
              { label: 'Merge PDF', href: '/merge-pdf' },
              { label: 'OCR Scanner', href: '/ocr' },
              { label: 'AI Summarizer', href: '/ai-pdf-summary' },
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

        {/* SEO Content */}
        <div className="border-t border-border pt-8 space-y-4">
          <h2 className="text-lg font-black text-foreground">Why Use India-Specific PDF Tools?</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Indian government portals like NSDL, UTIITSL, IRCTC, NSP, and SVMCM have strict file size and dimension requirements.
              Generic PDF tools don't know these specs — FileNova does. Each tool is pre-configured with the exact limits required by Indian portals.
            </p>
            <p>
              Aadhaar masking hides your first 8 digits to comply with UIDAI guidelines. PAN card resize ensures your photo and signature
              match NSDL/UTIITSL pixel and DPI requirements. Scholarship ZIP bundles all required documents into a single upload-ready file
              for SVMCM, OASIS, Kanyashree, and NSP portals.
            </p>
            <p>
              All processing happens client-side in your browser using WebAssembly and Canvas APIs. No files are uploaded to any server,
              making FileNova the most private document tool available in India.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
