import React from 'react';
import { FileText, GitMerge, Scissors, ArrowLeftRight, Lock, BrainCircuit, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { TOOLS } from '@/components/workspace/ToolGrid';
import { motion } from 'framer-motion';

const pdfTools = TOOLS.filter(t => t.category === 'pdf');

export const PdfToolsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-black text-foreground">PDF Tools</h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            All-in-one PDF toolkit. Merge, compress, split, convert, secure, and enhance your PDF documents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdfTools.map((tool, i) => (
            <motion.div
              key={tool.actionName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/${tool.actionName.replace(/_/g, '-')}`}>
                <a className="group block p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-muted/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                      <tool.icon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </a>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-6 pt-8 border-t border-border">
          <h2 className="text-lg font-bold text-foreground text-center">FAQs</h2>
          <div className="space-y-4">
            <details className="rounded-lg border border-border bg-card p-4">
              <summary className="text-sm font-semibold text-foreground cursor-pointer">
                How do I merge PDF files?
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Upload multiple PDF files, select Merge PDFs tool, and download the combined output.
              </p>
            </details>
            <details className="rounded-lg border border-border bg-card p-4">
              <summary className="text-sm font-semibold text-foreground cursor-pointer">
                Are my files secure during processing?
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Yes. All processing happens client-side in your browser. Files are never uploaded to servers.
              </p>
            </details>
            <details className="rounded-lg border border-border bg-card p-4">
              <summary className="text-sm font-semibold text-foreground cursor-pointer">
                What's the maximum file size?
              </summary>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Free plan: 3MB, Basic: 15MB, Pro: 50MB, Elite: 100MB.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfToolsPage;