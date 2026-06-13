import { Sparkles, Loader2 } from "lucide-react";

export function GenerateButton({
  onClick, disabled, isGenerating, label = "Generate Outline",
}: { onClick: () => void; disabled: boolean; isGenerating: boolean; label?: string }) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={disabled || isGenerating}
        title={isGenerating ? "Generating PowerPoint presentation..." : label}
        className={`relative w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg overflow-hidden group
                    transition-all duration-300 transform active:scale-[0.98]
                    ${disabled || isGenerating
                      ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:shadow-purple-500/30 hover:scale-[1.01]"}`}
      >
        {/* shimmer backdrop shine */}
        {!disabled && !isGenerating && (
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        )}

        <span className="relative flex items-center justify-center gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {label}
            </>
          )}
        </span>
      </button>
    </>
  );
}
