import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  GitMerge, Scissors, FileArchive, RotateCw, Lock, Unlock,
  IdCard, Fingerprint, FileCheck2, FileUp, GraduationCap,
  ScanLine, Sparkles, BrainCircuit, FileText, FileImage, Image,
} from "lucide-react";

export interface Tool {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  gradient: string;
  glow: string;
  badge?: string;
}

export const TOOLS: Tool[] = [
  {
    label: "Merge PDF",
    description: "Combine multiple PDFs into one",
    icon: GitMerge,
    route: "/merge-pdf",
    gradient: "from-violet-500/20 to-purple-600/20",
    glow: "hover:shadow-violet-500/30",
  },
  {
    label: "Split PDF",
    description: "Extract specific pages",
    icon: Scissors,
    route: "/split-pdf",
    gradient: "from-blue-500/20 to-cyan-500/20",
    glow: "hover:shadow-blue-500/30",
  },
  {
    label: "Compress PDF",
    description: "Fit portal file limits",
    icon: FileArchive,
    route: "/compress-pdf",
    gradient: "from-emerald-500/20 to-teal-500/20",
    glow: "hover:shadow-emerald-500/30",
  },
  {
    label: "Rotate PDF",
    description: "Fix page orientation",
    icon: RotateCw,
    route: "/rotate-pdf",
    gradient: "from-amber-500/20 to-orange-500/20",
    glow: "hover:shadow-amber-500/30",
  },
  {
    label: "Protect PDF",
    description: "Password-lock your PDF",
    icon: Lock,
    route: "/protect-pdf",
    gradient: "from-red-500/20 to-rose-500/20",
    glow: "hover:shadow-red-500/30",
  },
  {
    label: "Unlock PDF",
    description: "Remove PDF password",
    icon: Unlock,
    route: "/unlock-pdf",
    gradient: "from-pink-500/20 to-fuchsia-500/20",
    glow: "hover:shadow-pink-500/30",
  },
  {
    label: "PAN Card Resize",
    description: "Exact gov-spec dimensions",
    icon: IdCard,
    route: "/pan-card-resize",
    gradient: "from-indigo-500/20 to-blue-600/20",
    glow: "hover:shadow-indigo-500/30",
    badge: "India",
  },
  {
    label: "Aadhaar Mask PDF",
    description: "Hide Aadhaar number safely",
    icon: Fingerprint,
    route: "/aadhaar-mask-pdf",
    gradient: "from-orange-500/20 to-amber-600/20",
    glow: "hover:shadow-orange-500/30",
    badge: "India",
  },
  {
    label: "Govt Form Fill",
    description: "Auto-fill common forms",
    icon: FileCheck2,
    route: "/government-form-fill",
    gradient: "from-teal-500/20 to-cyan-600/20",
    glow: "hover:shadow-teal-500/30",
    badge: "India",
  },
  {
    label: "Compress for Upload",
    description: "Fit portal upload limits",
    icon: FileUp,
    route: "/compress-pdf-for-upload",
    gradient: "from-sky-500/20 to-blue-500/20",
    glow: "hover:shadow-sky-500/30",
  },
  {
    label: "Scholarship ZIP",
    description: "Compile portal ZIPs fast",
    icon: GraduationCap,
    route: "/scholarship-zip",
    gradient: "from-lime-500/20 to-green-600/20",
    glow: "hover:shadow-lime-500/30",
    badge: "India",
  },
  {
    label: "OCR Scan-to-Text",
    description: "Extract text from scans",
    icon: ScanLine,
    route: "/ocr",
    gradient: "from-purple-500/20 to-pink-600/20",
    glow: "hover:shadow-purple-500/30",
  },
  {
    label: "AI BG Remover",
    description: "Remove photo backgrounds",
    icon: Sparkles,
    route: "/remove-background",
    gradient: "from-cyan-500/20 to-teal-600/20",
    glow: "hover:shadow-cyan-500/30",
    badge: "AI",
  },
  {
    label: "AI PDF Summarizer",
    description: "Get key points instantly",
    icon: BrainCircuit,
    route: "/ai-pdf-summary",
    gradient: "from-violet-600/20 to-indigo-600/20",
    glow: "hover:shadow-violet-500/30",
    badge: "AI",
  },
  {
    label: "PDF to Word",
    description: "Editable .docx output",
    icon: FileText,
    route: "/pdf-to-word",
    gradient: "from-blue-600/20 to-indigo-500/20",
    glow: "hover:shadow-blue-500/30",
  },
  {
    label: "PDF to JPG",
    description: "Convert pages to images",
    icon: FileImage,
    route: "/pdf-to-jpg",
    gradient: "from-rose-500/20 to-pink-500/20",
    glow: "hover:shadow-rose-500/30",
  },
  {
    label: "JPG to PDF",
    description: "Bundle images into PDF",
    icon: Image,
    route: "/jpg-to-pdf",
    gradient: "from-amber-500/20 to-yellow-500/20",
    glow: "hover:shadow-amber-500/30",
  },
  {
    label: "Word to PDF",
    description: "Preserve formatting perfectly",
    icon: FileText,
    route: "/word-to-pdf",
    gradient: "from-green-500/20 to-emerald-600/20",
    glow: "hover:shadow-green-500/30",
  },
  // AI PPT Maker card disabled — uncomment to re-enable
  /*
  {
    label: "AI Slide Maker",
    description: "Topic to PPT in seconds, with themes",
    icon: Presentation,
    route: "/ai-ppt-maker",
    gradient: "from-purple-500/20 to-indigo-600/20",
    glow: "hover:shadow-purple-500/30",
    badge: "AI",
  },
  */
];

interface ToolCardProps {
  tool: Tool;
  index: number;
}

function ToolCard({ tool, index }: ToolCardProps) {
  const Icon = tool.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={tool.route}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative overflow-hidden
        rounded-2xl p-4 text-left
        bg-card
        border border-border
        backdrop-blur-md
        shadow-lg ${tool.glow} hover:shadow-xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.02]
        cursor-pointer
        block
      `}
      style={{
        animationDelay: `${index * 40}ms`,
        animation: "fadeSlideIn 0.4s ease-out both",
      }}
    >
      {/* Gradient background wash */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Shimmer line on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative flex flex-col gap-2">
        <div className="flex items-start justify-between">
          {/* Icon bubble */}
          <div
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              bg-gradient-to-br ${tool.gradient}
              border border-border/20
              transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]
            `}
          >
            <Icon className="w-4.5 h-4.5 text-white/80" />
          </div>

          {/* Badge */}
          {tool.badge && (
            <span
              className={`
                text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full
                ${
                  tool.badge === "AI"
                    ? "bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-400/30"
                    : "bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-400/30"
                }
              `}
            >
              {tool.badge}
            </span>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-gray-100 leading-tight">
            {tool.label}
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-snug">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Corner arrow on hover */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-60 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-white">
          <path d="M2 2h8v8M2 10L10 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </Link>
  );
}

export function PopularToolsGrid() {
  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <section className="w-full px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-black text-foreground mb-4">
            Popular Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TOOLS.map((tool, i) => (
              <ToolCard key={tool.route} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default PopularToolsGrid;
