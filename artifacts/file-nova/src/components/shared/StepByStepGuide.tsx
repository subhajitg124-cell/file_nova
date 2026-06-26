import React from 'react';
import { CheckCircle2, BookOpen, ArrowRight, Upload, Settings2, Download } from 'lucide-react';
import { Link } from 'wouter';
import { useTranslation } from '@/lib/i18n';

interface StepByStepGuideProps {
  title: string;
  steps: { title: string; description: string; icon?: string }[];
  toolSlug: string;
}

const iconMap: Record<string, React.ReactNode> = {
  '1': <Upload className="h-5 w-5" />,
  '2': <Settings2 className="h-5 w-5" />,
  '3': <ArrowRight className="h-5 w-5" />,
  '4': <Download className="h-5 w-5" />,
  'upload': <Upload className="h-5 w-5" />,
  'configure': <Settings2 className="h-5 w-5" />,
  'process': <ArrowRight className="h-5 w-5" />,
  'download': <Download className="h-5 w-5" />,
};

export const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ title, steps, toolSlug }) => {
  const handleStartNow = (e: React.MouseEvent) => {
    e.preventDefault();
    const workspace = document.getElementById('workspace-area');
    if (workspace) {
      workspace.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const fileInput = workspace.querySelector('input[type="file"]');
      if (fileInput) {
        (fileInput as HTMLInputElement).click();
      }
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-lg mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-foreground">
          {title}
        </h2>
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-5 sm:left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 to-primary/20 hidden md:block" />

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4 sm:gap-6 relative">
              {/* Step number */}
              <div className="relative z-10">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white shadow-lg shrink-0">
                  {iconMap[step.icon || String(index)] || (
                    <span className="text-sm font-black">{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white/50 dark:bg-slate-950/50 border border-border rounded-2xl p-4 sm:p-5 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-black text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-1 hidden sm:block" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground mb-4">
          Ready to get started? Upload your file below to begin.
        </p>
        <button 
          onClick={handleStartNow}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 transition shadow-glow text-sm cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          Start Now — It's Free
        </button>
      </div>
    </div>
  );
};
