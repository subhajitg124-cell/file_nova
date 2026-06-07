import React, { useMemo } from 'react';
import { 
  FileText, Image, Video, Music, FileSpreadsheet, 
  Scan, Sparkles, Clipboard, Lock, Unlock, Scissors, FileArchive, RotateCw
} from 'lucide-react';

interface ToolPreviewProps {
  slug: string;
}

export const ToolPreview: React.FC<ToolPreviewProps> = ({ slug }) => {
  const preview = useMemo(() => {
    const previews: Record<string, { title: string; description: string; tips: string[]; accent: string }> = {
      'merge-pdf': {
        title: 'Merge multiple PDFs into one',
        description: 'Combine multiple PDF documents into a single file. Perfect for assembling reports, chapters, or application documents.',
        tips: ['Drag to reorder files', 'Preview each page before merging', 'Supports unlimited PDFs (Pro)'],
        accent: 'from-red-500 to-orange-500'
      },
      'compress-pdf': {
        title: 'Reduce PDF file size',
        description: 'Shrink large PDFs for email, WhatsApp, or government portals without losing significant quality.',
        tips: ['Low: Best quality', 'Medium: Balanced', 'High: Smallest size'],
        accent: 'from-blue-500 to-cyan-500'
      },
      'split-pdf': {
        title: 'Split PDF into multiple files',
        description: 'Extract pages or divide large PDFs into separate documents.',
        tips: ['Split every page', 'Split by range', 'Download as ZIP'],
        accent: 'from-purple-500 to-pink-500'
      },
      'pdf-to-word': {
        title: 'Convert PDF to editable Word',
        description: 'Transform PDFs into DOCX format with preserved formatting.',
        tips: ['Preserves tables & images', 'Supports scanned PDFs with OCR', 'Works with Hindi & regional languages'],
        accent: 'from-indigo-500 to-blue-500'
      },
      'pdf-to-jpg': {
        title: 'Convert PDF pages to images',
        description: 'Extract every page as a high-quality JPG or PNG image.',
        tips: ['72 DPI for web', '300 DPI for print', 'Download as ZIP'],
        accent: 'from-green-500 to-emerald-500'
      },
      'jpg-to-pdf': {
        title: 'Convert images to PDF',
        description: 'Combine JPG, PNG, WebP, or BMP images into a single PDF document.',
        tips: ['Reorder images before conversion', 'Choose page size: A4, Letter', 'Auto-fit to image dimensions'],
        accent: 'from-orange-500 to-amber-500'
      },
      'rotate-pdf': {
        title: 'Rotate PDF pages',
        description: 'Fix upside-down or sideways pages in your PDF documents.',
        tips: ['Rotate all pages at once', 'Or select specific pages', '90°, 180°, 270° directions'],
        accent: 'from-cyan-500 to-teal-500'
      },
      'unlock-pdf': {
        title: 'Remove PDF password',
        description: 'Unlock password-protected PDFs once you provide the correct password.',
        tips: ['No brute-force cracking', 'Same encryption standard', 'Download unlocked PDF'],
        accent: 'from-slate-500 to-zinc-500'
      },
      'protect-pdf': {
        title: 'Add password to PDF',
        description: 'Secure your PDF with a password. Restrict opening, printing, or editing.',
        tips: ['Open password', 'Permissions password', 'AES 128-bit encryption'],
        accent: 'from-red-600 to-rose-600'
      },
      'resize-pdf': {
        title: 'Change PDF page size',
        description: 'Resize PDF pages to A4, A3, Letter, or custom dimensions.',
        tips: ['Scale proportionally', 'Maintain original size', 'Common page sizes'],
        accent: 'from-violet-500 to-purple-500'
      },
      'ocr': {
        title: 'Extract text from scanned PDFs',
        description: 'Make scanned documents searchable and editable using OCR technology.',
        tips: ['Supports English & Hindi', 'Searchable output PDF', 'Copy-paste friendly'],
        accent: 'from-blue-600 to-indigo-600'
      },
      'remove-background': {
        title: 'Remove image backgrounds',
        description: 'AI-powered background removal for photos, portraits, and product images.',
        tips: ['Transparent PNG output', 'White background option', 'Batch processing'],
        accent: 'from-pink-500 to-rose-500'
      },
    };

    return previews[slug] || {
      title: 'Upload your file to get started',
      description: 'Drop your file below to start processing.',
      tips: ['Fast processing', 'Secure & private', 'No signup required'],
      accent: 'from-indigo-500 to-violet-500'
    };
  }, [slug]);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${preview.accent} flex items-center justify-center text-white shadow-lg shrink-0`}>
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-black text-foreground">{preview.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{preview.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {preview.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 bg-white/50 dark:bg-slate-950/50 rounded-lg p-2.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-black text-primary">{i + 1}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
