import React from 'react';
import { FileText, FileSpreadsheet, Globe, RefreshCw, GitMerge } from 'lucide-react';
import { Link } from 'wouter';
import { TOOLS } from '@/components/workspace/ToolGrid';
import { motion } from 'framer-motion';

const officeTools = TOOLS.filter(t => t.category === 'office');

export const DocumentToolsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-black text-foreground">Document Tools</h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Convert, merge, and optimize documents. Work with DOCX, PPTX, XLSX, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {officeTools.map((tool, i) => (
            <motion.div
              key={tool.actionName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/${tool.actionName.replace(/_/g, '-')}`}>
                <a className="group block p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-muted/40 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <tool.icon className="h-5 w-5 text-emerald-400" />
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
          <details className="rounded-lg border border-border bg-card p-4">
            <summary className="text-sm font-semibold text-foreground cursor-pointer">
              How do I convert Word to PDF?
            </summary>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Use the DOCX → PDF tool. Upload your document and download the converted PDF instantly.
            </p>
          </details>
          <details className="rounded-lg border border-border bg-card p-4">
            <summary className="text-sm font-semibold text-foreground cursor-pointer">
              Can I merge Word documents?
            </summary>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Yes! Use the Merge Documents tool to combine multiple DOCX files. You can also merge PDFs and DOCX together.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DocumentToolsPage;