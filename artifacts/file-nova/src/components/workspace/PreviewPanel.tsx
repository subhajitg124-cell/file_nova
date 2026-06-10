import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertTriangle, FileText, Lock, ShieldAlert } from "lucide-react";

interface PreviewPanelProps {
  files: File[];
  slug: string; // e.g. "merge-pdf", "split-pdf", "compress-pdf", "rotate-pdf", "aadhaar-mask", etc.
  options?: Record<string, any>;
  onPreviewClick?: (pageIndex: number) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  files,
  slug,
  options = {},
  onPreviewClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]); // Data URLs of PDF page thumbnails
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const primaryFile = files[0];

  // Helper to load and render PDF pages via pdfjs-dist
  useEffect(() => {
    if (!primaryFile) return;
    const isPdf = primaryFile.type === "application/pdf" || primaryFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return;

    let active = true;
    setLoading(true);

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        
        const arrayBuffer = await primaryFile.arrayBuffer();
        if (!active) return;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (!active) return;
        setTotalPages(pdf.numPages);

        const renderedPages: string[] = [];
        // Render up to first 12 pages for preview grids/scrollbars
        const pagesToRender = Math.min(pdf.numPages, 12);
        
        for (let i = 1; i <= pagesToRender; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d")!;
          
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          await page.render({ canvasContext: context, viewport: viewport, canvas }).promise;
          renderedPages.push(canvas.toDataURL("image/jpeg", 0.8));
        }

        if (active) {
          setPdfPages(renderedPages);
          setLoading(false);
        }
      } catch (err) {
        console.error("PDF Preview generation failed", err);
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [primaryFile]);

  if (!primaryFile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl min-h-[150px] text-slate-500 text-xs">
        <FileText className="h-8 w-8 mb-2 stroke-[1.5]" />
        <span>No file loaded. Upload a document to see preview.</span>
      </div>
    );
  }

  const isPdf = primaryFile.type === "application/pdf" || primaryFile.name.toLowerCase().endsWith(".pdf");
  const isImage = primaryFile.type.startsWith("image/");
  const isVideo = primaryFile.type.startsWith("video/");

  // Render individual views
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-400">
        <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span>Loading preview content...</span>
      </div>
    );
  }

  /* ────────── PDF PREVIEWS ────────── */
  if (isPdf) {
    // PROTECT PREVIEW (Padlock + Watermark)
    if (slug === "protect-pdf") {
      return (
        <div className="relative max-w-sm mx-auto p-6 bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 text-center select-none overflow-hidden min-h-[240px]">
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-10">
            <Lock className="h-10 w-10 text-rose-500 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-200">CONFIDENTIAL & LOCKED</span>
            <span className="text-[10px] text-slate-400">Preview overlay watermark active</span>
          </div>
          {pdfPages.length > 0 && (
            <img src={pdfPages[0]} alt="pdf locked preview" className="opacity-20 max-h-[200px] object-contain" />
          )}
        </div>
      );
    }

    // ROTATE PREVIEW (Apply CSS Transform inline)
    if (slug === "rotate-pdf") {
      const rotationAngle = options.rotation || 0;
      return (
        <div className="flex flex-col items-center gap-4 py-4 max-w-md mx-auto">
          <div 
            className={`transition-transform duration-300 shadow-2xl bg-white rounded-lg overflow-hidden max-w-[200px] sm:max-w-[240px] ${
              rotationAngle === 90 ? "rotate-90" :
              rotationAngle === 180 ? "rotate-180" :
              rotationAngle === 270 || rotationAngle === -90 ? "rotate-270" :
              "rotate-0"
            }`}
          >
            {pdfPages.length > 0 ? (
              <img src={pdfPages[0]} alt="rotated preview" className="w-full object-contain" />
            ) : (
              <div className="p-10 text-slate-400 flex flex-col items-center"><FileText className="h-10 w-10" /></div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Current Rotation: {rotationAngle}°</span>
        </div>
      );
    }

    // SPLIT PREVIEW (Thumbnails Grid with Select Overlays)
    if (slug === "split-pdf") {
      const splitMode = options.split_mode || "all";
      const splitRange = options.split_range || "1-1";

      // Parse range input (e.g. 1-3, 5) into set of numbers
      const getSelectedPages = (): Set<number> => {
        const selected = new Set<number>();
        if (splitMode === "all") {
          for (let i = 1; i <= totalPages; i++) selected.add(i);
        } else if (splitMode === "extract" && splitRange) {
          const parts = splitRange.split(",");
          for (const p of parts) {
            const range = p.trim().split("-");
            if (range.length === 2) {
              const start = parseInt(range[0]);
              const end = parseInt(range[1]);
              if (!isNaN(start) && !isNaN(end)) {
                for (let k = start; k <= end; k++) selected.add(k);
              }
            } else {
              const val = parseInt(p.trim());
              if (!isNaN(val)) selected.add(val);
            }
          }
        }
        return selected;
      };

      const selectedPages = getSelectedPages();

      return (
        <div className="space-y-4">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider text-center">Click thumbnails to select pages for extraction</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isSelected = selectedPages.has(pageNum);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPreviewClick?.(pageNum)}
                  className={`relative aspect-[3/4] bg-slate-900 border rounded-xl overflow-hidden group hover:scale-[1.03] transition-all cursor-pointer ${
                    isSelected ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-white/10 brightness-75 hover:brightness-100"
                  }`}
                >
                  {pdfPages[i] ? (
                    <img src={pdfPages[i]} alt={`page ${pageNum}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-500">{pageNum}</div>
                  )}
                  {/* Selected Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-indigo-600/20 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`} />
                  {/* Page Indicator Tag */}
                  <span className={`absolute bottom-1 right-1 text-[9px] font-black px-1.5 py-0.5 rounded ${isSelected ? "bg-indigo-500 text-white" : "bg-slate-950/80 text-slate-400"}`}>
                    P. {pageNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // AADHAAR MASK PREVIEW
    if (slug === "aadhaar-mask-pdf") {
      const showLast4 = options.showLast4 !== false;
      const maskStyle = options.maskStyle || "black";

      return (
        <div className="space-y-4 max-w-lg mx-auto py-2">
          <div className="relative border border-white/10 rounded-2xl bg-white overflow-hidden p-2 flex justify-center shadow-xl">
            {pdfPages.length > 0 ? (
              <div className="relative">
                <img src={pdfPages[0]} alt="aadhaar mask preview" className="max-h-[300px] object-contain select-none" />
                
                {/* Mock Redacted Aadhaar Overlay (typically middle section of card) */}
                <div className="absolute top-[68%] left-[28%] right-[28%] h-[8%] flex items-center justify-center gap-2 pointer-events-none select-none">
                  {maskStyle === "black" && (
                    <div className="w-full h-full bg-black rounded" />
                  )}
                  {maskStyle === "blur" && (
                    <div className="w-full h-full bg-slate-400/40 backdrop-blur-md rounded border border-slate-500/20" />
                  )}
                  {maskStyle === "asterisks" && (
                    <div className="w-full h-full bg-white text-[11px] font-black tracking-widest text-slate-900 border border-slate-300 rounded flex items-center justify-center">
                      xxxx xxxx {showLast4 ? "1234" : "xxxx"}
                    </div>
                  )}
                </div>
                
                {/* Detected overlay borders (Pre-masking warning) */}
                <div className="absolute top-[68%] left-[28%] right-[28%] h-[8%] border border-red-500 border-dashed animate-pulse rounded pointer-events-none">
                  <span className="absolute -top-4 left-0 bg-red-500 text-white text-[7px] font-extrabold uppercase px-1 rounded">Aadhaar Found</span>
                </div>
              </div>
            ) : (
              <div className="p-10 text-slate-500"><FileText className="h-10 w-10 mx-auto" /></div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            Detected Aadhaar regions are highlighted. Middle 8 digits redacted.
          </p>
        </div>
      );
    }

    // STANDARD MULTI-PAGE PDF PREVIEW (Merge / Compress / Word to PDF)
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-white max-w-sm w-full p-2 flex justify-center shadow-xl">
          {pdfPages.length > 0 ? (
            <img src={pdfPages[currentPage - 1] || pdfPages[0]} alt="pdf page preview" className="max-h-[350px] object-contain" />
          ) : (
            <div className="py-20 text-slate-400 text-center"><FileText className="h-12 w-12 mx-auto mb-2 text-slate-500" /></div>
          )}
          
          {/* Zoom Overlay (Mock) */}
          <div className="absolute top-2 right-2 flex bg-slate-950/80 backdrop-blur border border-white/10 rounded-lg p-0.5">
            <button type="button" onClick={() => setZoom(z => Math.max(0.7, z - 0.1))} className="p-1 text-slate-400 hover:text-white cursor-pointer" title="Zoom out" aria-label="Zoom out"><ZoomOut className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1 text-slate-400 hover:text-white cursor-pointer" title="Zoom in" aria-label="Zoom in"><ZoomIn className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-25 transition-colors cursor-pointer"
              title="Previous page"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-25 transition-colors cursor-pointer"
              title="Next page"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ────────── IMAGE PREVIEWS ────────── */
  if (isImage) {
    const objectUrl = URL.createObjectURL(primaryFile);

    // BG REMOVE PREVIEW (Transparent checkerboard background)
    if (slug === "bg-remover") {
      return (
        <div className="relative max-w-md mx-auto p-4 border border-white/10 rounded-2xl bg-slate-900 overflow-hidden min-h-[250px] flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0px] opacity-25" />
          <img src={objectUrl} alt="transparent background" className="max-h-[300px] object-contain rounded-lg shadow-2xl relative z-10" />
        </div>
      );
    }

    // RESIZE / PHOTO PREVIEW (With Overlay Guideline rulers)
    const renderResizeGuidelines = () => {
      const resizeW = options.resizeWidth || options.width || "Auto";
      const resizeH = options.resizeHeight || options.height || "Auto";
      return (
        <div className="absolute inset-2 border-2 border-indigo-500/40 border-dashed rounded-lg flex items-center justify-center pointer-events-none select-none">
          <span className="bg-indigo-600/90 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded shadow border border-indigo-500/30">
            {resizeW} × {resizeH} px
          </span>
        </div>
      );
    };

    return (
      <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-slate-900/60 p-4 max-w-md mx-auto min-h-[220px] flex items-center justify-center">
        <img src={objectUrl} alt="uploaded preview" className="max-h-[300px] object-contain rounded-lg shadow-xl" />
        {(slug === "pan-card-resize" || slug === "resize-photo" || slug === "resize-image") && renderResizeGuidelines()}
      </div>
    );
  }

  /* ────────── VIDEO PREVIEWS ────────── */
  if (isVideo) {
    const objectUrl = URL.createObjectURL(primaryFile);
    return (
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-black max-w-lg mx-auto">
        <video src={objectUrl} controls className="w-full max-h-[300px] object-contain" />
      </div>
    );
  }

  /* ────────── FALLBACK PREVIEW CARD ────────── */
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-white/10 rounded-2xl max-w-sm mx-auto text-center gap-3">
      <FileText className="h-10 w-10 text-indigo-400 stroke-[1.5]" />
      <div>
        <p className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{primaryFile.name}</p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Size: {(primaryFile.size / 1024).toFixed(1)} KB</p>
      </div>
    </div>
  );
};
export default PreviewPanel;
