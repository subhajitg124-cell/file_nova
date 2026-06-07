import React, { useState, useRef, useCallback } from 'react';
import { X, Move, Maximize, Minimize } from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';

interface BeforeAfterComparisonProps {
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  beforeLabel = 'Original',
  afterLabel = 'Compressed'
}) => {
  const { files, downloadUrl, savings } = useFileStore();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeUrl = files.length > 0 ? files[0].previewUrl : null;

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);

  if (!downloadUrl && !savings) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Move className="h-4 w-4 text-primary" />
          Before & After Comparison
        </h3>
        <div className="flex items-center gap-3 text-xs">
          {savings && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {savings.percent}% smaller
            </span>
          )}
          <button 
            onClick={() => {
              setSliderPosition(50);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Reset comparison"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>

      {beforeUrl && (
        <div
          ref={containerRef}
          className={`relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden cursor-ew-resize select-none border border-border shadow-lg ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          {/* Before image (full) */}
          <img
            src={beforeUrl}
            alt="Before"
            className="absolute inset-0 w-full h-full object-contain bg-white dark:bg-slate-950"
            draggable={false}
          />

          {/* After image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <img
              src={downloadUrl || beforeUrl}
              alt="After"
              className="absolute inset-0 w-full h-full object-contain bg-white dark:bg-slate-950"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              draggable={false}
            />
          </div>

          {/* Slider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Move className="h-4 w-4 text-indigo-600" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md z-20 pointer-events-none">
            {beforeLabel}
          </div>
          <div className="absolute top-3 right-3 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-md z-20 pointer-events-none">
            {afterLabel}
          </div>
        </div>
      )}

      {!beforeUrl && (
        <div className="w-full h-64 rounded-2xl bg-muted/20 border border-border flex items-center justify-center">
          <div className="text-center space-y-2">
            <Maximize className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">Upload a file to see comparison</p>
          </div>
        </div>
      )}

      {savings && (
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Minimize className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Original:</span>
            <span className="font-mono font-bold text-foreground">{(savings.originalSize / 1024).toFixed(1)} KB</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <Maximize className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-muted-foreground">Output:</span>
            <span className="font-mono font-bold text-foreground">{(savings.newSize / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      )}
    </div>
  );
};
