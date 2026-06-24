import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import {
  Check, ChevronDown, ChevronUp, Circle, Download, Layers, RotateCcw, X, ZoomIn, ZoomOut,
  PanelRight, PanelRightClose, Maximize2, Minimize2, Smartphone,
} from "lucide-react";
import type { EditorPlugin, EditorFileType, Annotation, SectionProps } from "./types";

interface EditorFrameworkProps {
  file: File | null;
  fileType: EditorFileType;
  plugin: EditorPlugin;
  onClose: () => void;
  onDone: (result: Blob) => void;
  totalPages?: number;
}

const EditorFramework: React.FC<EditorFrameworkProps> = ({ file, fileType, plugin, onClose, onDone, totalPages: _totalPages }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);

  const [config, setConfig] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const [rightPanelContent, setRightPanelContent] = useState<React.ReactNode>(null);

  const onConfigChange = useCallback((key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    if (key === "annotations") { setAnnotations(value); }
    else if (key === "annotationMode") { setConfig((prev) => ({ ...prev, annotationMode: value })); }
    else if (key === "drawColor") { setConfig((prev) => ({ ...prev, drawColor: value })); }
    else if (key === "removeAnnotationIndex") {
      setAnnotations((prev) => { const next = prev.filter((_, i) => i !== value); setConfig((c) => ({ ...c, annotations: next })); return next; });
    }
  }, []);

  const sectionProps: SectionProps = useMemo(() => ({
    file, fileType, config, onConfigChange,
    onStatusMessage: setStatusMessage,
    onBusy: setBusy,
    disabled: busy,
  }), [file, fileType, config, onConfigChange, busy]);

  useEffect(() => {
    if (file && fileType === "pdf") {
      const url = URL.createObjectURL(file);
      pdfjsLib.getDocument(url).promise.then((doc) => {
        setPdfDoc(doc);
        renderPage(doc, 1);
      }).catch(() => setStatusMessage("Failed to load PDF"));
    }
  }, [file, fileType]);

  useEffect(() => {
    setAnnotations(config.annotations || []);
  }, [config.annotations]);

  useEffect(() => {
    if (pdfDoc) renderPage(pdfDoc, pdfPage);
  }, [pdfDoc, pdfPage, pdfZoom]);

  useEffect(() => {
    if (plugin.sections.length > 0 && !activeSection) {
      setActiveSection(plugin.sections[0].id);
    }
  }, [plugin.sections]);

  const renderPage = async (doc: any, pageNum: number) => {
    if (!canvasRef.current) return;
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: pdfZoom / 100 });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      setOverlaySize({ width: viewport.width, height: viewport.height });
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch { /* ignore render errors */ }
  };

  const getAnnotationPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const c = annotationCanvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    const sx = c.width / rect.width, sy = c.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0] || (e as React.TouchEvent).changedTouches[0];
      return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const handleAnnotationPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const mode = config.annotationMode;
    if (mode === "draw") {
      setIsDrawing(true);
      setCurrentPath([getAnnotationPoint(e)]);
    } else if (mode === "text") {
      const text = prompt("Enter text:");
      if (text?.trim()) {
        const pt = getAnnotationPoint(e);
        const newAnn: Annotation = { type: "text", color: config.drawColor || "#000000", text: text.trim(), x: pt.x, y: pt.y, fontSize: 16 };
        setAnnotations((prev) => { const next = [...prev, newAnn]; setConfig((c) => ({ ...c, annotations: next })); return next; });
      }
    }
  };

  const handleAnnotationPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pt = getAnnotationPoint(e);
    setCurrentPath((prev) => [...prev, pt]);
    const c = annotationCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const prev = currentPath[currentPath.length - 1];
    if (prev) {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = config.drawColor || "#000000";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  const handleAnnotationPointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      const newAnn: Annotation = { type: "path", color: config.drawColor || "#000000", width: 3, points: [...currentPath] };
      setAnnotations((prev) => { const next = [...prev, newAnn]; setConfig((c) => ({ ...c, annotations: next })); return next; });
    }
    setCurrentPath([]);
  };

  const redrawAnnotations = useCallback(() => {
    const c = annotationCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    for (const ann of annotations) {
      if (ann.type === "path" && ann.points) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) ctx.lineTo(ann.points[i].x, ann.points[i].y);
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.width || 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      } else if (ann.type === "text") {
        ctx.font = `${ann.fontSize || 16}px sans-serif`;
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.text || "", ann.x || 0, ann.y || 0);
      }
    }
  }, [annotations]);

  useEffect(() => { redrawAnnotations(); }, [redrawAnnotations]);

  const embedAnnotations = async (source: File): Promise<Blob> => {
    if (annotations.length === 0) return source;
    try {
      const { PDFDocument, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.load(await source.arrayBuffer());
      const pages = pdf.getPages();
      const pg = Math.min(pdfPage - 1, pages.length - 1);
      const page = pages[pg];
      const { width: pw, height: ph } = page.getSize();
      const cv = canvasRef.current;
      if (!cv) return source;
      const sx = pw / cv.width, sy = ph / cv.height;
      for (const ann of annotations) {
        if (ann.type === "path" && ann.points && ann.points.length > 1) {
          const c = rgb(parseInt(ann.color.slice(1, 3), 16) / 255, parseInt(ann.color.slice(3, 5), 16) / 255, parseInt(ann.color.slice(5, 7), 16) / 255);
          const pathStr = ann.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * sx} ${ph - p.y * sy}`).join(" ");
          page.drawSvgPath(pathStr, { color: c, borderColor: c, borderWidth: (ann.width || 3) * sx });
        } else if (ann.type === "text") {
          const c = rgb(parseInt(ann.color.slice(1, 3), 16) / 255, parseInt(ann.color.slice(3, 5), 16) / 255, parseInt(ann.color.slice(5, 7), 16) / 255);
          page.drawText(ann.text || "", { x: (ann.x || 0) * sx, y: ph - (ann.y || 0) * sy, size: (ann.fontSize || 16) * sx, color: c });
        }
      }
      const buf = await pdf.save();
      return new Blob([buf as unknown as Blob], { type: "application/pdf" });
    } catch { return source; }
  };

  const handleDone = async () => {
    setBusy(true);
    setStatusMessage("Saving...");
    try {
      let result: Blob;
      if (annotations.length > 0 && file) {
        result = await embedAnnotations(file);
      } else if (plugin.onSave && file) {
        result = await plugin.onSave(file, config, annotations, canvasRef);
      } else if (file) {
        result = file;
      } else {
        setStatusMessage("No file to save");
        setBusy(false);
        return;
      }
      onDone(result);
      setStatusMessage("Saved!");
    } catch (err: any) {
      setStatusMessage(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    setConfig({});
    setActiveSection(plugin.sections[0]?.id || null);
    setZoom(1);
    setPdfPage(1);
    setPdfZoom(100);
    setAnnotations([]);
    setCurrentPath([]);
    setStatusMessage("Reset complete");
    const oc = annotationCanvasRef.current;
    if (oc) oc.getContext("2d")?.clearRect(0, 0, oc.width, oc.height);
  };

  const toggleSection = (id: string) => {
    setActiveSection((prev) => (prev === id ? null : id));
  };

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (fullscreen) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, [fullscreen]);

  const RightPanel = plugin.rightPanel;
  const canAnnotate = fileType === "pdf" && config.annotationMode;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white font-sans">
      {/* ── Top Toolbar ── */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{plugin.name}</p>
            <p className="text-sm font-bold text-white truncate max-w-[200px]">{file?.name || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} aria-label="Zoom out" className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-bold text-slate-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} aria-label="Zoom in" className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          {plugin.rightPanel && (
            <button onClick={() => setShowRightPanel(!showRightPanel)} aria-label="Toggle properties panel" className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
              {showRightPanel ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRight className="h-3.5 w-3.5" />}
            </button>
          )}
          <button onClick={() => setFullscreen(!fullscreen)} aria-label="Toggle fullscreen" className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={handleReset} className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button onClick={handleDone} disabled={busy || !file}
            className="h-8 px-4 flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            <Check className="h-3.5 w-3.5" /> Done
          </button>
        </div>
      </header>

      {/* ── Mobile Bottom Sheet Trigger ── */}
      <button onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
        className="lg:hidden flex items-center justify-center gap-2 py-2 border-b border-slate-800 bg-slate-900/60 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer">
        <Smartphone className="h-3.5 w-3.5" />
        {mobileSheetOpen ? "Hide Controls" : "Show Controls"}
      </button>

      {/* ── Main Content ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Left Editing Panel (desktop) ── */}
        <aside className="hidden lg:flex w-[300px] shrink-0 flex-col border-r border-slate-800 bg-slate-900/40 overflow-y-auto">
          <div className="p-3 space-y-3">
            {plugin.sections.map((section) => {
              const isOpen = activeSection === section.id;
              const SectionComponent = section.component;
              return (
                <div key={section.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <button type="button" onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-800/40 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300">{section.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{section.label}</p>
                        {section.description && <p className="text-[9px] text-slate-500">{section.description}</p>}
                      </div>
                    </div>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-slate-500">
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4">
                          <SectionComponent {...sectionProps} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Center Live Preview ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            {fileType === "image" ? (
              <div className="relative max-w-full" style={{ transform: `scale(${zoom})` }}>
                <canvas ref={canvasRef} className="block max-w-full rounded-2xl shadow-2xl" />
              </div>
            ) : fileType === "pdf" && pdfDoc ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative max-w-full overflow-auto rounded-2xl bg-white shadow-2xl">
                  <canvas ref={canvasRef} className="block max-w-full h-auto" />
                  {canAnnotate && (
                    <canvas
                      ref={annotationCanvasRef}
                      width={overlaySize.width || 800}
                      height={overlaySize.height || 600}
                      onMouseDown={handleAnnotationPointerDown}
                      onMouseMove={handleAnnotationPointerMove}
                      onMouseUp={handleAnnotationPointerUp}
                      onTouchStart={handleAnnotationPointerDown}
                      onTouchMove={handleAnnotationPointerMove}
                      onTouchEnd={handleAnnotationPointerUp}
                      className="absolute inset-0 w-full h-full cursor-crosshair"
                      style={{ touchAction: "none" }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-800">
                  <button onClick={() => setPdfPage((p) => Math.max(1, p - 1))} disabled={pdfPage === 1}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold disabled:opacity-50 transition cursor-pointer">← Prev</button>
                  <span className="text-xs font-bold text-slate-300">Page {pdfPage} of {pdfDoc?.numPages || "—"}</span>
                  <button onClick={() => setPdfPage((p) => Math.min(pdfDoc?.numPages || 1, p + 1))} disabled={pdfPage === (pdfDoc?.numPages || 1)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold disabled:opacity-50 transition cursor-pointer">Next →</button>
                  <select value={pdfZoom} onChange={(e) => setPdfZoom(Number(e.target.value))}
                    className="bg-slate-800 text-white px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-700">
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={150}>150%</option>
                    <option value={200}>200%</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <Layers className="h-12 w-12 mb-3" />
                <p className="text-sm font-bold">No preview available</p>
                <p className="text-xs mt-1">Load a file to see the preview</p>
              </div>
            )}
          </div>
        </main>

        {/* ── Right Properties Panel ── */}
        {RightPanel && showRightPanel && (
          <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-l border-slate-800 bg-slate-900/40 overflow-y-auto p-3">
            <RightPanel {...sectionProps} />
          </aside>
        )}
      </div>

      {/* ── Bottom Status Bar ── */}
      <footer className="flex items-center justify-between border-t border-slate-800 bg-slate-900/80 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${busy ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
          <span className="text-[11px] text-slate-400 font-medium">{busy ? "Processing..." : statusMessage}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span>{file?.type || "No file"}</span>
          <span className="w-px h-3 bg-slate-700" />
          <span>{annotations.length > 0 ? `${annotations.length} annotations` : "No annotations"}</span>
          <span className="w-px h-3 bg-slate-700" />
          <span>{Math.round(zoom * 100)}%</span>
        </div>
      </footer>

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] bg-slate-900 border-t border-slate-800 rounded-t-2xl overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Controls</span>
              <button onClick={() => setMobileSheetOpen(false)} className="text-slate-500 hover:text-white transition cursor-pointer">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {plugin.sections.map((section) => {
                const SectionComponent = section.component;
                return (
                  <div key={section.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-slate-300">{section.icon}</span>
                      <p className="text-xs font-bold text-slate-200">{section.label}</p>
                    </div>
                    <SectionComponent {...sectionProps} />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditorFramework;
