import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Maximize2, RotateCcw, RotateCw, Crop2, RotateCcwIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

export interface PanCardPreset {
  label: string;
  width: number;
  height: number;
  maxKB: number;
}

interface PanCardEditorProps {
  file: File;
  preset: PanCardPreset;
  onDone: (blob: Blob) => void;
  onCancel: () => void;
}

interface EditorState {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  brightness: number;
  contrast: number;
  cropMode: boolean;
  cropRect: { x: number; y: number; w: number; h: number } | null;
  outW: number;
  outH: number;
  lockAspect: boolean;
}

interface CropHandle {
  type: 'corner' | 'edge';
  position: 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r';
}

const HANDLE_SIZE = 8;
const CROP_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';
const CROP_BORDER_COLOR = '#ffffff';

export function PanCardEditor({ file, preset, onDone, onCancel }: PanCardEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageBitmapRef = useRef<ImageBitmap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const resizingHandleRef = useRef<CropHandle | null>(null);
  const cropStartRef = useRef({ x: 0, y: 0 });

  const [editorState, setEditorState] = useState<EditorState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    brightness: 0,
    contrast: 0,
    cropMode: false,
    cropRect: null,
    outW: preset.width,
    outH: preset.height,
    lockAspect: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null);

  // Load image as ImageBitmap
  useEffect(() => {
    const loadImage = async () => {
      const bitmap = await createImageBitmap(file);
      imageBitmapRef.current = bitmap;
      // Reset pan/zoom to fit
      if (canvasRef.current) {
        fitToWindow();
      }
    };
    loadImage().catch((err) => {
      console.error('Failed to load image:', err);
      toast.error('Failed to load image');
      onCancel();
    });
  }, [file]);

  // Render canvas whenever state changes
  useEffect(() => {
    if (imageBitmapRef.current && canvasRef.current) {
      renderCanvas(canvasRef.current, imageBitmapRef.current, editorState);
    }
  }, [editorState]);

  // Estimate output file size when dimensions or filters change
  useEffect(() => {
    if (imageBitmapRef.current && editorState.cropMode === false) {
      estimateOutputSize();
    }
  }, [editorState.outW, editorState.outH, editorState.brightness, editorState.contrast]);

  const renderCanvas = useCallback(
    (canvas: HTMLCanvasElement, bitmap: ImageBitmap, state: EditorState) => {
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Clear canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Translate to center, apply zoom and pan
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(state.zoom, state.zoom);
      ctx.translate(state.panX, state.panY);

      // Rotate
      ctx.rotate((state.rotation * Math.PI) / 180);

      // Draw image centered
      ctx.filter = `brightness(${100 + state.brightness}%) contrast(${100 + state.contrast}%)`;
      ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2, bitmap.width, bitmap.height);

      ctx.restore();

      // Draw crop UI if in crop mode
      if (state.cropMode && state.cropRect) {
        drawCropUI(canvas, ctx, state.cropRect, bitmap, state);
      }
    },
    []
  );

  const drawCropUI = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    cropRect: EditorState['cropRect'],
    bitmap: ImageBitmap,
    state: EditorState
  ) => {
    if (!cropRect) return;

    // Draw dark overlay outside crop area
    ctx.fillStyle = CROP_OVERLAY_COLOR;
    ctx.globalCompositeOperation = 'source-over';

    // Top overlay
    ctx.fillRect(0, 0, canvas.width, cropRect.y);
    // Bottom overlay
    ctx.fillRect(0, cropRect.y + cropRect.h, canvas.width, canvas.height - (cropRect.y + cropRect.h));
    // Left overlay
    ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.h);
    // Right overlay
    ctx.fillRect(cropRect.x + cropRect.w, cropRect.y, canvas.width - (cropRect.x + cropRect.w), cropRect.h);

    // Draw crop rect border
    ctx.strokeStyle = CROP_BORDER_COLOR;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
    ctx.setLineDash([]);

    // Draw resize handles
    const handles: Array<{ pos: [number, number]; type: string }> = [
      // Corners
      [[cropRect.x, cropRect.y], 'tl'],
      [[cropRect.x + cropRect.w, cropRect.y], 'tr'],
      [[cropRect.x, cropRect.y + cropRect.h], 'bl'],
      [[cropRect.x + cropRect.w, cropRect.y + cropRect.h], 'br'],
      // Edges
      [[cropRect.x + cropRect.w / 2, cropRect.y], 't'],
      [[cropRect.x + cropRect.w / 2, cropRect.y + cropRect.h], 'b'],
      [[cropRect.x, cropRect.y + cropRect.h / 2], 'l'],
      [[cropRect.x + cropRect.w, cropRect.y + cropRect.h / 2], 'r'],
    ];

    ctx.fillStyle = CROP_BORDER_COLOR;
    handles.forEach(([pos, _]) => {
      ctx.fillRect(pos[0] - HANDLE_SIZE / 2, pos[1] - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    });
  };

  const fitToWindow = () => {
    if (!canvasRef.current || !imageBitmapRef.current || !containerRef.current) return;

    const bitmap = imageBitmapRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const availWidth = container.clientWidth;
    const availHeight = container.clientHeight;

    const scaleW = availWidth / bitmap.width;
    const scaleH = availHeight / bitmap.height;
    const scale = Math.min(scaleW, scaleH, 1);

    setEditorState((prev) => ({
      ...prev,
      zoom: scale,
      panX: 0,
      panY: 0,
    }));
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (editorState.cropMode) {
        // Crop mode pointer handling
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cropRect = editorState.cropRect;
        if (cropRect) {
          const handle = getHandleAtPoint(x, y, cropRect);
          if (handle) {
            resizingHandleRef.current = handle;
            cropStartRef.current = { x, y };
            return;
          }

          if (
            x >= cropRect.x &&
            x <= cropRect.x + cropRect.w &&
            y >= cropRect.y &&
            y <= cropRect.y + cropRect.h
          ) {
            resizingHandleRef.current = { type: 'corner', position: 'tl' }; // Move mode
            cropStartRef.current = { x, y };
            return;
          }
        }

        // Start new crop rect
        cropStartRef.current = { x, y };
      } else {
        // Pan mode
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [editorState.cropMode, editorState.cropRect]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (editorState.cropMode) {
        // Update cursor
        const cropRect = editorState.cropRect;
        if (cropRect) {
          const handle = getHandleAtPoint(x, y, cropRect);
          canvas.style.cursor = handle ? getCursorForHandle(handle) : 'crosshair';
        } else {
          canvas.style.cursor = 'crosshair';
        }

        if (resizingHandleRef.current && cropStartRef.current) {
          const startX = cropStartRef.current.x;
          const startY = cropStartRef.current.y;
          const deltaX = x - startX;
          const deltaY = y - startY;

          const cropRect = editorState.cropRect;
          if (!cropRect) return;

          let newRect = { ...cropRect };

          if (resizingHandleRef.current.type === 'corner' && resizingHandleRef.current.position === 'tl') {
            // Move mode
            newRect.x = Math.max(0, cropRect.x + deltaX);
            newRect.y = Math.max(0, cropRect.y + deltaY);
          } else {
            // Resize mode
            const pos = resizingHandleRef.current.position;
            if (pos === 'tl') {
              newRect.x = Math.max(0, cropRect.x + deltaX);
              newRect.y = Math.max(0, cropRect.y + deltaY);
              newRect.w = cropRect.w - deltaX;
              newRect.h = cropRect.h - deltaY;
            } else if (pos === 'tr') {
              newRect.y = Math.max(0, cropRect.y + deltaY);
              newRect.w = cropRect.w + deltaX;
              newRect.h = cropRect.h - deltaY;
            } else if (pos === 'bl') {
              newRect.x = Math.max(0, cropRect.x + deltaX);
              newRect.w = cropRect.w - deltaX;
              newRect.h = cropRect.h + deltaY;
            } else if (pos === 'br') {
              newRect.w = cropRect.w + deltaX;
              newRect.h = cropRect.h + deltaY;
            } else if (pos === 't') {
              newRect.y = Math.max(0, cropRect.y + deltaY);
              newRect.h = cropRect.h - deltaY;
            } else if (pos === 'b') {
              newRect.h = cropRect.h + deltaY;
            } else if (pos === 'l') {
              newRect.x = Math.max(0, cropRect.x + deltaX);
              newRect.w = cropRect.w - deltaX;
            } else if (pos === 'r') {
              newRect.w = cropRect.w + deltaX;
            }
          }

          // Clamp to canvas bounds
          newRect.w = Math.max(20, Math.min(newRect.w, canvas.width - newRect.x));
          newRect.h = Math.max(20, Math.min(newRect.h, canvas.height - newRect.y));

          cropStartRef.current = { x, y };
          setEditorState((prev) => ({
            ...prev,
            cropRect: newRect,
          }));
        } else if (!resizingHandleRef.current && cropStartRef.current) {
          // Drawing new crop rect
          const startX = cropStartRef.current.x;
          const startY = cropStartRef.current.y;

          const newRect = {
            x: Math.min(startX, x),
            y: Math.min(startY, y),
            w: Math.abs(x - startX),
            h: Math.abs(y - startY),
          };

          setEditorState((prev) => ({
            ...prev,
            cropRect: newRect.w > 10 && newRect.h > 10 ? newRect : null,
          }));
        }
      } else if (isPanningRef.current) {
        // Pan
        canvas.style.cursor = 'grabbing';
        const deltaX = e.clientX - panStartRef.current.x;
        const deltaY = e.clientY - panStartRef.current.y;

        setEditorState((prev) => ({
          ...prev,
          panX: prev.panX + deltaX / prev.zoom,
          panY: prev.panY + deltaY / prev.zoom,
        }));

        panStartRef.current = { x: e.clientX, y: e.clientY };
      } else {
        canvas.style.cursor = 'grab';
      }
    },
    [editorState.cropMode, editorState.cropRect]
  );

  const handlePointerUp = () => {
    isPanningRef.current = false;
    resizingHandleRef.current = null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = editorState.cropMode ? 'crosshair' : 'grab';
    }
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const zoomFactor = 1 + e.deltaY * -0.001;
      const newZoom = Math.max(0.1, Math.min(10, editorState.zoom * zoomFactor));

      // Adjust pan so cursor stays fixed
      const zoomRatio = newZoom / editorState.zoom;
      const panAdjustX = (cursorX - canvas.width / 2) * (1 - 1 / zoomRatio) / newZoom;
      const panAdjustY = (cursorY - canvas.height / 2) * (1 - 1 / zoomRatio) / newZoom;

      setEditorState((prev) => ({
        ...prev,
        zoom: newZoom,
        panX: prev.panX + panAdjustX,
        panY: prev.panY + panAdjustY,
      }));
    },
    [editorState.zoom]
  );

  const getHandleAtPoint = (x: number, y: number, cropRect: EditorState['cropRect']): CropHandle | null => {
    if (!cropRect) return null;

    const handles: Array<[number, number, CropHandle]> = [
      [cropRect.x, cropRect.y, { type: 'corner', position: 'tl' }],
      [cropRect.x + cropRect.w, cropRect.y, { type: 'corner', position: 'tr' }],
      [cropRect.x, cropRect.y + cropRect.h, { type: 'corner', position: 'bl' }],
      [cropRect.x + cropRect.w, cropRect.y + cropRect.h, { type: 'corner', position: 'br' }],
      [cropRect.x + cropRect.w / 2, cropRect.y, { type: 'edge', position: 't' }],
      [cropRect.x + cropRect.w / 2, cropRect.y + cropRect.h, { type: 'edge', position: 'b' }],
      [cropRect.x, cropRect.y + cropRect.h / 2, { type: 'edge', position: 'l' }],
      [cropRect.x + cropRect.w, cropRect.y + cropRect.h / 2, { type: 'edge', position: 'r' }],
    ];

    for (const [hx, hy, handle] of handles) {
      if (Math.abs(x - hx) <= HANDLE_SIZE && Math.abs(y - hy) <= HANDLE_SIZE) {
        return handle;
      }
    }

    return null;
  };

  const getCursorForHandle = (handle: CropHandle): string => {
    const pos = handle.position;
    if (pos === 'tl' || pos === 'br') return 'nwse-resize';
    if (pos === 'tr' || pos === 'bl') return 'nesw-resize';
    if (pos === 't' || pos === 'b') return 'ns-resize';
    if (pos === 'l' || pos === 'r') return 'ew-resize';
    return 'default';
  };

  const estimateOutputSize = async () => {
    if (!imageBitmapRef.current) return;

    try {
      const offscreen = new OffscreenCanvas(editorState.outW, editorState.outH);
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, editorState.outW, editorState.outH);

      ctx.filter = `brightness(${100 + editorState.brightness}%) contrast(${100 + editorState.contrast}%)`;
      ctx.drawImage(
        imageBitmapRef.current,
        0,
        0,
        imageBitmapRef.current.width,
        imageBitmapRef.current.height,
        0,
        0,
        editorState.outW,
        editorState.outH
      );

      const blob = await offscreen.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
      const sizeKB = (blob.size / 1024).toFixed(1);
      setEstimatedSize(sizeKB);
    } catch (err) {
      console.error('Failed to estimate size:', err);
    }
  };

  const applyAndDownload = async () => {
    if (!imageBitmapRef.current) return;

    setIsProcessing(true);
    try {
      const bitmap = imageBitmapRef.current;
      const offscreen = new OffscreenCanvas(editorState.outW, editorState.outH);
      const ctx = offscreen.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, editorState.outW, editorState.outH);

      // Apply filters
      ctx.filter = `brightness(${100 + editorState.brightness}%) contrast(${100 + editorState.contrast}%)`;

      // Draw image (handle crop if set)
      if (editorState.cropRect && !editorState.cropMode) {
        const crop = editorState.cropRect;
        ctx.drawImage(
          bitmap,
          crop.x,
          crop.y,
          crop.w,
          crop.h,
          0,
          0,
          editorState.outW,
          editorState.outH
        );
      } else {
        ctx.drawImage(bitmap, 0, 0, editorState.outW, editorState.outH);
      }

      // Compression loop
      let quality = 0.92;
      let blob: Blob | null = null;
      const maxBytes = preset.maxKB * 1024;

      while (quality >= 0.1) {
        blob = await offscreen.convertToBlob({ type: 'image/jpeg', quality });
        if (blob.size <= maxBytes) break;
        quality -= 0.05;
      }

      if (!blob) throw new Error('Failed to compress image');

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pan-card-${editorState.outW}x${editorState.outH}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${(blob.size / 1024).toFixed(1)} KB`);
      onDone(blob);
    } catch (err) {
      console.error('Failed to apply and download:', err);
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetChange = (preset: PanCardPreset) => {
    const aspectRatio = editorState.outW / editorState.outH;
    setEditorState((prev) => ({
      ...prev,
      outW: preset.width,
      outH: prev.lockAspect ? preset.width / aspectRatio : preset.height,
    }));
  };

  const handleWidthChange = (newWidth: number) => {
    setEditorState((prev) => ({
      ...prev,
      outW: newWidth,
      outH: prev.lockAspect ? (newWidth * preset.height) / preset.width : prev.outH,
    }));
  };

  const handleHeightChange = (newHeight: number) => {
    setEditorState((prev) => ({
      ...prev,
      outH: newHeight,
      outW: prev.lockAspect ? (newHeight * preset.width) / preset.height : prev.outW,
    }));
  };

  const presets: PanCardPreset[] = [
    { label: 'NSDL Photo', width: 213, height: 213, maxKB: 20 },
    { label: 'NSDL Signature', width: 354, height: 157, maxKB: 10 },
    { label: 'UTI Photo', width: 213, height: 213, maxKB: 30 },
    { label: 'UTI Signature', width: 400, height: 200, maxKB: 20 },
    { label: 'Custom', width: 0, height: 0, maxKB: 0 },
  ];

  const zoomPercent = Math.round(editorState.zoom * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col lg:flex-row gap-4 h-full w-full"
    >
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Toolbar */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-3 flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setEditorState((p) => ({ ...p, zoom: Math.max(0.1, p.zoom - 0.1) }))}
            className="p-2 hover:bg-white/10 rounded transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <div className="px-3 py-1 bg-white/10 rounded text-xs font-mono">{zoomPercent}%</div>

          <button
            onClick={() => setEditorState((p) => ({ ...p, zoom: Math.min(10, p.zoom + 0.1) }))}
            className="p-2 hover:bg-white/10 rounded transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={fitToWindow}
            className="p-2 hover:bg-white/10 rounded transition-all"
            title="Fit to Window"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <div className="h-6 w-px bg-white/20" />

          <button
            onClick={() => setEditorState((p) => ({ ...p, cropMode: !p.cropMode }))}
            className={`p-2 rounded transition-all ${
              editorState.cropMode ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/10'
            }`}
            title="Crop"
          >
            <Crop2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setEditorState((p) => ({ ...p, rotation: (p.rotation + 270) % 360 }))}
            className="p-2 hover:bg-white/10 rounded transition-all"
            title="Rotate Left"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setEditorState((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))}
            className="p-2 hover:bg-white/10 rounded transition-all"
            title="Rotate Right"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <div className="h-6 w-px bg-white/20" />

          <button
            onClick={() =>
              setEditorState((p) => ({
                ...p,
                brightness: 0,
                contrast: 0,
                rotation: 0,
                zoom: 1,
                panX: 0,
                panY: 0,
              }))
            }
            className="p-2 hover:bg-white/10 rounded transition-all"
            title="Reset All"
          >
            <RotateCcwIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Brightness & Contrast */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide">Brightness</label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-10">-100</span>
              <Slider
                value={[editorState.brightness]}
                onValueChange={(v) => setEditorState((p) => ({ ...p, brightness: v[0] }))}
                min={-100}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-white/60 w-10 text-right">+100</span>
              <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded w-12 text-center">
                {editorState.brightness}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide">Contrast</label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-10">-100</span>
              <Slider
                value={[editorState.contrast]}
                onValueChange={(v) => setEditorState((p) => ({ ...p, contrast: v[0] }))}
                min={-100}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-white/60 w-10 text-right">+100</span>
              <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded w-12 text-center">
                {editorState.contrast}
              </span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-white/10 relative"
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* Crop Mode Buttons */}
          <AnimatePresence>
            {editorState.cropMode && editorState.cropRect && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              >
                <button
                  onClick={() =>
                    setEditorState((p) => ({
                      ...p,
                      cropMode: false,
                    }))
                  }
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-all"
                >
                  ✓ Confirm Crop
                </button>
                <button
                  onClick={() =>
                    setEditorState((p) => ({
                      ...p,
                      cropMode: false,
                      cropRect: null,
                    }))
                  }
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all"
                >
                  ✕ Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Output Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:w-72 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur space-y-4 flex flex-col"
      >
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-2">Preset</h3>
          <select
            value={preset.label}
            onChange={(e) => {
              const selected = presets.find((p) => p.label === e.target.value);
              if (selected && selected.label !== 'Custom') {
                handlePresetChange(selected);
              }
            }}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {presets.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1 block">Width</label>
            <input
              type="number"
              value={editorState.outW}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              min={1}
            />
            <span className="text-xs text-white/50 mt-1 block">pixels</span>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1 block">Height</label>
            <input
              type="number"
              value={editorState.outH}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              min={1}
            />
            <span className="text-xs text-white/50 mt-1 block">pixels</span>
          </div>

          <button
            onClick={() => setEditorState((p) => ({ ...p, lockAspect: !p.lockAspect }))}
            className="flex items-center gap-2 text-xs hover:text-indigo-400 transition-colors"
          >
            <span className="text-sm">{editorState.lockAspect ? '🔒' : '🔓'}</span>
            <span>Lock Aspect Ratio</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Max File Size</span>
            <span className="text-sm font-mono bg-white/10 px-2 py-1 rounded">{preset.maxKB} KB</span>
          </div>
          {estimatedSize && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Estimated Output</span>
              <span className="text-sm font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                {estimatedSize} KB {parseInt(estimatedSize) <= preset.maxKB ? '✅' : '⚠️'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            onCancel();
          }}
          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all text-sm"
        >
          ← Back
        </button>

        <button
          onClick={applyAndDownload}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all text-sm"
        >
          {isProcessing ? 'Processing…' : '⬇ Apply & Download'}
        </button>
      </motion.div>
    </motion.div>
  );
}
