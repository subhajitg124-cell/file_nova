import React from "react";
import { Shield, Smartphone, Zap } from "lucide-react";

interface ProcessingBadgeProps {
  /** Processing time in seconds (e.g., 1.2) */
  durationSeconds: number;
  /** Whether the tool is fully client-side (offlineReady) */
  isLocalOnly: boolean;
  /** Optional tool name for accessibility */
  toolName?: string;
}

export function ProcessingBadge({ durationSeconds, isLocalOnly, toolName }: ProcessingBadgeProps) {
  const formattedTime = durationSeconds.toFixed(1);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
      role="status"
      aria-live="polite"
      aria-label={`Processing completed in ${formattedTime} seconds${isLocalOnly ? ', 100% on your device' : ''}`}
    >
      <span className="flex items-center gap-1">
        <Zap className="h-3 w-3" aria-hidden="true" />
        <span>Processed in {formattedTime}s</span>
      </span>
      {isLocalOnly && (
        <>
          <span className="w-px h-4 bg-emerald-500/30" aria-hidden="true" />
          <span className="flex items-center gap-1 gap-1">
            <Shield className="h-3 w-3" aria-hidden="true" />
            <span>100% on your device</span>
          </span>
        </>
      )}
    </div>
  );
}

export function ProcessingBadgeSkeleton() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-white/10 animate-pulse">
      <div className="h-3 w-16 bg-slate-800 rounded" />
      <div className="w-px h-4 bg-white/10" />
      <div className="h-3 w-20 bg-slate-800 rounded" />
    </div>
  );
}