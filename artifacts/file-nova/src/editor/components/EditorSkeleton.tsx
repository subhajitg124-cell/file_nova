import React from "react";

interface EditorSkeletonProps {
  sectionCount?: number;
}

export const EditorSkeleton: React.FC<EditorSkeletonProps> = ({ sectionCount = 3 }) => {
  return (
    <div className="p-3 space-y-2.5 animate-pulse" aria-busy="true" aria-label="Loading editor controls">
      {Array.from({ length: sectionCount }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-2 w-16 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-8 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-8 w-3/4 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
};
