/**
 * Skeleton loader components — replace plain spinners for perceived performance.
 * Uses the CSS `.skeleton` utility from index.css (animated shimmer).
 */

import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Base skeleton block — use className to control size & shape */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Single-line text skeleton */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3 rounded"
          style={{ width: i === lines - 1 ? "65%" : "100%" }}
        />
      ))}
    </div>
  );
}

/** Card-shaped skeleton matching the tool cards */
export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-5 flex flex-col gap-4"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
      </div>
      <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-10 rounded" />
      </div>
    </div>
  );
}

/** 3-column grid of skeleton cards */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading tools...">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Inline spinner fallback for small areas */
export function SkeletonSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="skeleton rounded-full"
      aria-hidden="true"
    />
  );
}

export default Skeleton;
