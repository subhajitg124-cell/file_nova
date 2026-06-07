import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Link } from 'wouter';
import { Zap, FileText, Image, Video, Scissors, Lock, Unlock, RotateCw, Sparkles, Scan, Eraser } from 'lucide-react';

const tools = [
  { label: 'Merge PDF', slug: 'merge-pdf', icon: 'files' },
  { label: 'Compress PDF', slug: 'compress-pdf', icon: 'file-zip' },
  { label: 'Split PDF', slug: 'split-pdf', icon: 'scissors' },
  { label: 'PDF to Word', slug: 'pdf-to-word', icon: 'file-word' },
  { label: 'PDF to JPG', slug: 'pdf-to-jpg', icon: 'photo' },
  { label: 'JPG to PDF', slug: 'jpg-to-pdf', icon: 'file-text' },
  { label: 'Rotate PDF', slug: 'rotate-pdf', icon: 'rotate' },
  { label: 'Unlock PDF', slug: 'unlock-pdf', icon: 'lock-open' },
  { label: 'Protect PDF', slug: 'protect-pdf', icon: 'lock' },
  { label: 'OCR PDF', slug: 'ocr', icon: 'scan' },
  { label: 'Remove Background', slug: 'remove-background', icon: 'eraser' },
  { label: 'PAN Card Resize', slug: 'pan-card-resize', icon: 'credit-card' },
  { label: 'Aadhaar Mask PDF', slug: 'aadhaar-mask-pdf', icon: 'id-badge' },
  { label: 'AI PDF Summary', slug: 'ai-pdf-summary', icon: 'sparkles' },
];

const iconMap: Record<string, React.ReactNode> = {
  'files': <FileText className="h-4 w-4" />,
  'file-zip': <Zap className="h-4 w-4" />,
  'scissors': <Scissors className="h-4 w-4" />,
  'file-word': <FileText className="h-4 w-4" />,
  'photo': <Image className="h-4 w-4" />,
  'file-text': <FileText className="h-4 w-4" />,
  'rotate': <RotateCw className="h-4 w-4" />,
  'lock-open': <Unlock className="h-4 w-4" />,
  'lock': <Lock className="h-4 w-4" />,
  'scan': <Scan className="h-4 w-4" />,
  'eraser': <Eraser className="h-4 w-4" />,
  'credit-card': <Zap className="h-4 w-4" />,
  'id-badge': <Sparkles className="h-4 w-4" />,
  'sparkles': <Sparkles className="h-4 w-4" />,
};

export function ToolLinksGrid() {
  const { tText } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-foreground">All Free Tools</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className="group flex items-center gap-2 p-2.5 rounded-xl hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
              {iconMap[tool.icon] || <Zap className="h-4 w-4" />}
            </div>
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {tool.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
