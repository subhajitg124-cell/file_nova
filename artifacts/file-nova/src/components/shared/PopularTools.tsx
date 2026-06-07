import React from 'react';
import { useLocation, Link } from 'wouter';
import { ChevronRight, Zap, FileText, Image, Video, Scissors, Lock, Unlock, RotateCw, Sparkles, Scan, Eraser, Crown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Tool {
  label: string;
  slug: string;
  icon: string;
}

interface PopularToolsProps {
  currentSlug?: string;
  maxItems?: number;
  category?: 'pdf' | 'image' | 'video' | 'all';
}

const iconMap: Record<string, React.ReactNode> = {
  'files': <FileText className="h-5 w-5" />,
  'scissors': <Scissors className="h-5 w-5" />,
  'file-zip': <Zap className="h-5 w-5" />,
  'file-word': <FileText className="h-5 w-5" />,
  'photo': <Image className="h-5 w-5" />,
  'file-text': <FileText className="h-5 w-5" />,
  'rotate': <RotateCw className="h-5 w-5" />,
  'lock-open': <Unlock className="h-5 w-5" />,
  'lock': <Lock className="h-5 w-5" />,
  'resize': <Zap className="h-5 w-5" />,
  'credit-card': <Zap className="h-5 w-5" />,
  'id-badge': <Sparkles className="h-5 w-5" />,
  'clipboard': <FileText className="h-5 w-5" />,
  'cloud-upload': <Zap className="h-5 w-5" />,
  'scan': <Scan className="h-5 w-5" />,
  'eraser': <Eraser className="h-5 w-5" />,
  'sparkles': <Sparkles className="h-5 w-5" />,
};

const popularTools: Tool[] = [
  { label: 'Merge PDF', slug: 'merge-pdf', icon: 'files' },
  { label: 'Compress PDF', slug: 'compress-pdf', icon: 'file-zip' },
  { label: 'PDF to Word', slug: 'pdf-to-word', icon: 'file-word' },
  { label: 'JPG to PDF', slug: 'jpg-to-pdf', icon: 'file-text' },
  { label: 'PDF to JPG', slug: 'pdf-to-jpg', icon: 'photo' },
  { label: 'Split PDF', slug: 'split-pdf', icon: 'scissors' },
  { label: 'OCR PDF', slug: 'ocr', icon: 'scan' },
  { label: 'Remove Background', slug: 'remove-background', icon: 'eraser' },
  { label: 'Rotate PDF', slug: 'rotate-pdf', icon: 'rotate' },
  { label: 'Unlock PDF', slug: 'unlock-pdf', icon: 'lock-open' },
  { label: 'Protect PDF', slug: 'protect-pdf', icon: 'lock' },
  { label: 'PAN Card Resize', slug: 'pan-card-resize', icon: 'credit-card' },
];

export const PopularTools: React.FC<PopularToolsProps> = ({ 
  currentSlug, 
  maxItems = 8,
  category = 'all'
}) => {
  const { tText } = useTranslation();

  const filtered = popularTools.filter(t => {
    if (t.slug === currentSlug) return false;
    if (category === 'pdf') return ['merge-pdf', 'compress-pdf', 'split-pdf', 'rotate-pdf', 'unlock-pdf', 'protect-pdf', 'resize-pdf'].includes(t.slug);
    if (category === 'image') return ['jpg-to-pdf', 'pdf-to-jpg', 'remove-background', 'pan-card-resize'].includes(t.slug);
    return true;
  }).slice(0, maxItems);

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-foreground flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        Popular Tools
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {filtered.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className="group flex items-center gap-2.5 p-3 bg-card/50 hover:bg-card border border-border/60 hover:border-primary/30 rounded-xl transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
              {iconMap[tool.icon] || <Zap className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {tool.label}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {tText('Free tool')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
