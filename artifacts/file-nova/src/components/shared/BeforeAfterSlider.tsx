import React, { useState, useRef, useCallback } from "react";
import { Eye, Move, RefreshCw, Layers } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeTitle?: string;
  afterTitle?: string;
  beforeContent?: React.ReactNode;
  afterContent?: React.ReactNode;
  beforeImage?: string;
  afterImage?: string;
  mode?: "slider" | "side-by-side" | "diff";
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeTitle = "Original File",
  afterTitle = "Processed Result",
  beforeContent,
  afterContent,
  beforeImage,
  afterImage,
  mode = "slider"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [currentMode, setCurrentMode] = useState<"slider" | "side-by-side">(
    (beforeImage && afterImage && mode === "slider") ? "slider" : "side-by-side"
  );
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full bg-slate-900/40 border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-indigo-400" />
          Live Comparison & Verification
        </h3>
        
        {beforeImage && afterImage && (
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/[0.05]">
            <button
              onClick={() => setCurrentMode("slider")}
              className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                currentMode === "slider"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Slider
            </button>
            <button
              onClick={() => setCurrentMode("side-by-side")}
              className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                currentMode === "side-by-side"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Side-by-Side
            </button>
          </div>
        )}
      </div>

      {currentMode === "slider" && beforeImage && afterImage ? (
        /* Image Slider Comparison */
        <div
          ref={containerRef}
          className={`relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10 ${
            isDragging ? "cursor-grabbing" : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          <img
            src={beforeImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain bg-slate-950"
            draggable={false}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <img
              src={afterImage}
              alt="Processed"
              className="absolute inset-0 w-full h-full object-contain bg-slate-950"
              draggable={false}
            />
          </div>

          {/* Sliding Divider Bar */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white z-10 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
              <Move className="h-4 w-4 text-indigo-600" />
            </div>
          </div>

          <div className="absolute top-3 left-3 bg-black/75 backdrop-blur text-white text-[9px] font-black uppercase px-2 py-1 rounded border border-white/10 z-20 pointer-events-none">
            {beforeTitle}
          </div>
          <div className="absolute top-3 right-3 bg-indigo-650 backdrop-blur text-white text-[9px] font-black uppercase px-2 py-1 rounded border border-white/10 z-20 pointer-events-none">
            {afterTitle}
          </div>
        </div>
      ) : (
        /* Side-by-Side Content Preview (e.g. Text OCR, original vs redacted, metadata comparison) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{beforeTitle}</span>
              <span className="text-[9px] font-mono text-slate-500">Source</span>
            </div>
            <div className="border border-white/5 bg-slate-950/60 rounded-2xl p-3 h-64 overflow-y-auto flex items-center justify-center text-xs text-slate-400">
              {beforeContent ? beforeContent : beforeImage ? (
                <img src={beforeImage} alt="Original" className="max-h-full max-w-full object-contain" />
              ) : (
                <span>No source data loaded</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">{afterTitle}</span>
              <span className="text-[9px] font-mono text-indigo-400 flex items-center gap-1">
                <Layers className="h-3 w-3" /> Redesigned
              </span>
            </div>
            <div className="border border-indigo-500/15 bg-slate-950/80 rounded-2xl p-3 h-64 overflow-y-auto flex items-center justify-center text-xs text-slate-350">
              {afterContent ? afterContent : afterImage ? (
                <img src={afterImage} alt="Processed" className="max-h-full max-w-full object-contain" />
              ) : (
                <span>No output data ready</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BeforeAfterSlider;
