import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import {
  Check, ChevronDown, X, ZoomIn, ZoomOut, PanelRight, PanelRightClose,
  Maximize2, Minimize2, Smartphone, RotateCcw, FileText, Wand2,
} from "lucide-react";
import type { EditorPlugin, EditorFileType, Annotation, SectionProps } from "./types";
import { PremiumButton } from "./components/PremiumButton";
import { BentoCard } from "./components/BentoCard";

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
  const containerRef = useRef<HTMLDivElement>(null);

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
  const [mode, setMode] = useState<"beginner" | "advanced">(plugin.defaultMode || "beginner");
  const [showPresets, setShowPresets] = useState(false);

  const onConfigChange = useCallback((key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    if (key === "annotations") setAnnotations(value);
    else if (key === "annotationMode") setConfig((prev) => ({ ...prev, annotationMode: value }));
    else if (key === "drawColor") setConfig((prev) => ({ ...prev, drawColor: value }));
    else if (key === "removeAnnotationIndex") {
      setAnnotations((prev) => { const next = prev.filter((_, i) => i !== value); setConfig((c) => ({ ...c, annotations: next })); return next; });
    }
  }, []);

  const sectionProps: SectionProps = useMemo(() => ({
    file, fileType, config, onConfigChange,
    onStatusMessage: setStatusMessage,
    onBusy: setBusy,
    disabled: busy,
    mode,
  }), [file, fileType, config, onConfigChange, busy, mode]);

  useEffect(() => {
    if (file && fileType === "pdf") {
      const url = URL.createObjectURL(file);
      pdfjsLib.getDocument(url).promise.then((doc) => {
        setPdfDoc(doc);
        renderPage(doc, 1);
      }).catch(() => setStatusMessage("Failed to load PDF"));
    }
  }, [file, fileType]);

  useEffect(() => { setAnnotations(config.annotations || []); }, [config.annotations]);
  useEffect(() => { if (pdfDoc) renderPage(pdfDoc, pdfPage); }, [pdfDoc, pdfPage, pdfZoom]);

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
    const annotationMode = config.annotationMode;
    if (annotationMode === "draw") {
      setIsDrawing(true);
      setCurrentPath([getAnnotationPoint(e)]);
    } else if (annotationMode === "text") {
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
    } finally { setBusy(false); }
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

  const toggleSection = (id: string) => setActiveSection((prev) => (prev === id ? null : id));
  const canAnnotate = fileType === "pdf" && config.annotationMode;
  const RightPanel = plugin.rightPanel;

  const applyPreset = (presetConfig: Record<string, any>) => {
    setConfig((prev) => ({ ...prev, ...presetConfig }));
    setShowPresets(false);
    setStatusMessage("Preset applied");
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (fullscreen) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, [fullscreen]);

  const visibleSections = mode === "beginner" ? plugin.sections.filter((s) => !s.advanced) : plugin.sections;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-sans overflow-hidden">
      {/* ── Top Toolbar ── */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-2.5 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onClose} aria-label="Close editor"
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">{plugin.name}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{file?.name || "Untitled"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plugin.presets && plugin.presets.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowPresets(!showPresets)}
                className="h-8 px-3 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold transition cursor-pointer">
                <Wand2 className="h-3.5 w-3.5" /> Presets
              </button>
              <AnimatePresence>
                {showPresets && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full right-0 mt-1 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-black/10 overflow-hidden z-30">
                    <div className="p-2 space-y-1">
                      {plugin.presets.map((p) => (
                        <button key={p.id} type="button" onClick={() => applyPreset(p.config)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition cursor-pointer">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">{p.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{p.label}</p>
                            {p.description && <p className="text-[9px] text-slate-400">{p.description}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button onClick={() => setMode(mode === "beginner" ? "advanced" : "beginner")}
            className={[
              "h-8 px-3 flex items-center gap-1.5 rounded-xl border text-xs font-bold transition cursor-pointer",
              mode === "advanced"
                ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300"
            ].join(" ")}>
            {mode === "advanced" ? "Advanced" : "Beginner"}
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5" />
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} aria-label="Zoom out"
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition cursor-pointer">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} aria-label="Zoom in"
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition cursor-pointer">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5" />
          {plugin.rightPanel && (
            <button onClick={() => setShowRightPanel(!showRightPanel)} aria-label="Toggle properties panel"
              className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition cursor-pointer">
              {showRightPanel ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRight className="h-3.5 w-3.5" />}
            </button>
          )}
          <button onClick={() => setFullscreen(!fullscreen)} aria-label="Toggle fullscreen"
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition cursor-pointer">
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={handleReset}
            className="h-8 px-3 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold transition cursor-pointer">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <PremiumButton variant="premium" size="sm" icon={<Check className="h-3.5 w-3.5" />} onClick={handleDone} disabled={busy || !file} loading={busy}>
            Done
          </PremiumButton>
        </div>
      </header>

      {/* ── Mobile Bottom Sheet Trigger ── */}
      <button onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
        className="lg:hidden flex items-center justify-center gap-2 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white transition cursor-pointer">
        <Smartphone className="h-3.5 w-3.5" />
        {mobileSheetOpen ? "Hide Controls" : `Show Controls (${visibleSections.length} sections)`}
      </button>

      {/* ── Main Content ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Left Editing Panel (desktop) ── */}
        <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 overflow-y-auto">
          <div className="p-3 space-y-2.5">
            {visibleSections.map((section) => {
              const isOpen = activeSection === section.id;
              const SectionComponent = section.component;
              return (
                <motion.div
                  key={section.id}
                  layout="position"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 backdrop-blur-sm shadow-sm"
                >
                  <button type="button" onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">{section.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{section.label}</p>
                        {section.description && <p className="text-[9px] text-slate-400 dark:text-slate-500">{section.description}</p>}
                      </div>
                    </div>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-slate-400 dark:text-slate-500">
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <SectionComponent {...sectionProps} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </aside>

        {/* ── Center Live Preview ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-100/50 dark:bg-slate-950">
          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            {fileType === "image" ? (
              <div className="relative max-w-full" style={{ transform: `scale(${zoom})` }}>
                <canvas ref={canvasRef} className="block max-w-full rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20" />
              </div>
            ) : fileType === "pdf" && pdfDoc ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative max-w-full overflow-auto rounded-2xl bg-white shadow-xl dark:shadow-2xl dark:shadow-black/20">
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
                <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <button onClick={() => setPdfPage((p) => Math.max(1, p - 1))} disabled={pdfPage === 1}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-500 dark:text-slate-300 disabled:opacity-40 transition cursor-pointer border border-slate-200 dark:border-slate-700">← Prev</button>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Page {pdfPage} of {pdfDoc?.numPages || "—"}</span>
                  <button onClick={() => setPdfPage((p) => Math.min(pdfDoc?.numPages || 1, p + 1))} disabled={pdfPage === (pdfDoc?.numPages || 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-500 dark:text-slate-300 disabled:opacity-40 transition cursor-pointer border border-slate-200 dark:border-slate-700">Next →</button>
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
                  <select value={pdfZoom} onChange={(e) => setPdfZoom(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white px-2 py-1.5 text-xs font-bold outline-none">
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={150}>150%</option>
                    <option value={200}>200%</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <FileText className="h-8 w-8" />
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No preview available</p>
                <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Load a file to see the preview</p>
              </div>
            )}
          </div>
        </main>

        {/* ── Right Properties Panel ── */}
        {RightPanel && showRightPanel && (
          <aside className="hidden lg:flex w-[240px] shrink-0 flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 overflow-y-auto p-3">
            <RightPanel {...sectionProps} />
          </aside>
        )}
      </div>

      {/* ── Bottom Status Bar ── */}
      <footer className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${busy ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{busy ? "Processing..." : statusMessage}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> {file?.type || "No file"}</span>
          <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <span>{annotations.length > 0 ? `${annotations.length} annotation${annotations.length > 1 ? "s" : ""}` : "No annotations"}</span>
          <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <span>{Math.round(zoom * 100)}%</span>
          {mode === "advanced" && <span className="w-px h-3 bg-slate-200 dark:bg-slate-700" />}
          {mode === "advanced" && <span className="text-purple-500 dark:text-purple-400 font-bold">Advanced</span>}
        </div>
      </footer>

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[65vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-2xl overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {mode === "advanced" && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">ADV</span>}
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{plugin.name} Controls</span>
              </div>
              <button onClick={() => setMobileSheetOpen(false)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition cursor-pointer">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {visibleSections.map((section) => {
                const SectionComponent = section.component;
                return (
                  <BentoCard key={section.id} size="sm">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">{section.icon}</span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{section.label}</p>
                      {section.advanced && <span className="text-[8px] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold">ADV</span>}
                    </div>
                    <SectionComponent {...sectionProps} />
                  </BentoCard>
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
