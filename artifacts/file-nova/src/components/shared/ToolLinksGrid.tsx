import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Link } from 'wouter';
import {
  GitMerge,
  Scissors,
  Archive,
  RotateCw,
  Shield,
  LockOpen,
  CreditCard,
  EyeOff,
  FileText,
  ScanLine,
  Sparkles,
  Image,
} from 'lucide-react';

interface ToolItem {
  label: string;
  slug: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const tools: ToolItem[] = [
  { label: 'Merge PDF', slug: 'merge-pdf', Icon: GitMerge, color: 'text-indigo-400' },
  { label: 'Split PDF', slug: 'split-pdf', Icon: Scissors, color: 'text-rose-400' },
  { label: 'Compress PDF', slug: 'compress-pdf', Icon: Archive, color: 'text-amber-400' },
  { label: 'Rotate PDF', slug: 'rotate-pdf', Icon: RotateCw, color: 'text-cyan-400' },
  { label: 'Protect PDF', slug: 'protect-pdf', Icon: Shield, color: 'text-emerald-400' },
  { label: 'Unlock PDF', slug: 'unlock-pdf', Icon: LockOpen, color: 'text-blue-400' },
  { label: 'PAN Card Resize', slug: 'pan-card-resize', Icon: CreditCard, color: 'text-violet-400' },
  { label: 'Aadhaar Mask', slug: 'aadhaar-mask-pdf', Icon: EyeOff, color: 'text-pink-400' },
  { label: 'PDF to Word', slug: 'pdf-to-word', Icon: FileText, color: 'text-sky-400' },
  { label: 'OCR Scan', slug: 'ocr', Icon: ScanLine, color: 'text-teal-400' },
  { label: 'AI Summarizer', slug: 'ai-pdf-summary', Icon: Sparkles, color: 'text-purple-400' },
  { label: 'JPG to PDF', slug: 'jpg-to-pdf', Icon: Image, color: 'text-orange-400' },
];

export function ToolLinksGrid() {
  const { tText } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-foreground">{tText('All Free Tools')}</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {tools.map((tool, i) => {
          const IconComp = tool.Icon;
          return (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl
                bg-white/5 backdrop-blur-sm border border-white/10
                hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]
                transition-all duration-200 cursor-pointer"
              style={{
                animation: 'fadeSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
                animationDelay: `${i * 50}ms`,
              }}
            >
              <IconComp
                className={`h-6 w-6 ${tool.color} transition-all duration-200
                  group-hover:brightness-125 group-hover:drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]`}
              />
              <span className="text-[11px] font-medium text-slate-300 text-center leading-tight group-hover:text-white transition-colors line-clamp-1">
                {tText(tool.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
