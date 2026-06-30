import React from 'react';
import { Link } from 'wouter';
import { TOOLS } from '@/components/workspace/ToolGrid';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ChevronRight, ArrowRight, Shield, Lock, FileText } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { ToolSEO } from '@/seo/ToolSEO';
import { ToolStructuredData } from '@/seo/ToolStructuredData';

const officeTools = TOOLS.filter(t => t.category === 'office');

export const DocumentToolsPage: React.FC = () => {
  const { tText } = useTranslation();

  return (
    <div className="min-h-screen fn-aurora-bg text-foreground font-sans relative overflow-hidden">
      <ToolSEO />
      <ToolStructuredData />

      {/* Background grid and radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-70" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_65%)] pointer-events-none z-0" />

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 relative z-10 space-y-12" id="main-content">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-slate-800 dark:text-slate-200">Document Suite</span>
        </nav>

        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 fn-glass rounded-full px-4 py-2 border border-emerald-500/25 text-xs font-bold text-emerald-500 uppercase tracking-wider"
          >
            <FileText className="h-3.5 w-3.5" /> Document Suite
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight"
          >
            Convert and Edit Office Documents
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Convert between Word, PowerPoint, Excel formats and PDF. Clean Word documents and manage spreadsheets easily.
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
            <h3 className="font-extrabold text-sm text-foreground">Secure Sandbox Conversions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We care about document security. All office operations and document parsing happen locally in your browser's execution sandbox.
              No file content is ever transmitted to remote networks.
            </p>
          </div>
        </motion.div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {officeTools.map((tool, i) => {
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
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
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
            <h3 className="font-extrabold text-sm text-foreground">Sandboxed Privacy</h3>
            <p className="text-xs text-muted-foreground">Office conversions are fully client-side. Zero server-side file storing protects your records.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto text-lg">⚡</div>
            <h3 className="font-extrabold text-sm text-foreground">Fast Processing</h3>
            <p className="text-xs text-muted-foreground">Files are processed instantly. No queuing or loading delays.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto text-lg">📋</div>
            <h3 className="font-extrabold text-sm text-foreground">High Precision</h3>
            <p className="text-xs text-muted-foreground">Preserves complex margins, formatting styles, tables, and typography after conversion.</p>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="border-t border-border pt-8 space-y-4">
          <h2 className="text-lg font-black text-foreground text-center">Looking for other suites?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'PDF Suite', href: '/pdf-tools' },
              { label: 'Image Lab', href: '/image-tools' },
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
          <h2 className="text-lg font-black text-foreground">Why Use FileNova Document Suite?</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Office formats such as Microsoft Word (.docx), Excel (.xlsx), and PowerPoint (.pptx) are central to business workflows.
              However, sharing them in their raw state can lead to layout issues or formatting breaks. Converting them to PDF formats solves this.
              FileNova delivers high-fidelity converters to keep document styles intact.
            </p>
            <p>
              Our DOCX to PDF converter renders fonts, tables, and alignments accurately. Excel to CSV allows easy table imports.
              All operations are computed directly inside your browser Sandbox using client-side libraries, providing maximum privacy.
            </p>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="border-t border-border pt-8 max-w-3xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-foreground text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I convert Word files to PDF?",
                a: "Open our Word to PDF tool, select or drop your Microsoft Word document (.docx or .doc), and FileNova will process the layout in your browser. Download the finished PDF in seconds."
              },
              {
                q: "Can I convert Excel files to CSV?",
                a: "Yes. Use our Excel to CSV tool. Drop the spreadsheet, select the sheets you want to convert, and download the split CSV files instantly."
              },
              {
                q: "Is my document data private?",
                a: "Absolutely. All processing occurs locally on your machine. Your documents are never uploaded to any server, preventing leaks."
              }
            ].map((faq, i) => (
              <details key={i} className="group rounded-xl border border-border bg-card/50 p-4 transition-colors hover:border-emerald-500/20">
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

export default DocumentToolsPage;