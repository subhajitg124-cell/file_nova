import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as pdfjsLib from 'pdfjs-dist';
// Set the worker source to CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

import {
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Copy,
  Download,
  ImageIcon,
  Layers,
  MousePointer2,
  Menu,
  Pencil,
  Pen,
  RotateCcw,
  RotateCw,
  Save,
  Scissors,
  Search,
  Sparkles,
  Share2,
  Shield,
  Type,
  Zap,
  X,
} from "lucide-react";
import { QuickShareButton } from "@/components/WhatsAppShare";
import { useImageEditor } from "@/hooks/useImageEditor";
import { useTranslation } from "@/lib/i18n";
import { BACKEND_URL } from "@/lib/api";
import { useFileStore } from "@/store/useFileStore";
import { CompressSidebar } from "@/sidebars/CompressSidebar";
import { MergeSidebar } from "@/sidebars/MergeSidebar";
import { SplitSidebar } from "@/sidebars/SplitSidebar";
import { RotateSidebar } from "@/sidebars/RotateSidebar";
import { ProtectSidebar } from "@/sidebars/ProtectSidebar";
import { UnlockSidebar } from "@/sidebars/UnlockSidebar";
import { AadhaarSidebar } from "@/sidebars/AadhaarSidebar";
import { PANSidebar } from "@/sidebars/PANSidebar";

interface EditingWindowProps {
  file: File | null;
  fileType: "image" | "pdf" | "document";
  onClose: () => void;
  onDone: (result: Blob) => void;
  toolType?: "compress" | "merge" | "split" | "rotate" | "protect" | "unlock" | "pan-resize" | "aadhaar-mask" | "default";
  totalPages?: number;
}

const passportPresets = [
  { label: "India Passport 3.5x3.5cm", width: 413, height: 413 },
  { label: "India Passport 5x5cm", width: 600, height: 600 },
  { label: "India Passport 3.5x4.5cm", width: 413, height: 531 },
  { label: "India Visa 600x600px", width: 600, height: 600 },
  { label: "WBJEE", width: 400, height: 240 },
  { label: "JEE Main", width: 512, height: 512 },
  { label: "NEET", width: 512, height: 512 },
  { label: "CUET", width: 520, height: 520 },
];

const pdfConvertOptions = [
  { value: "pdf_to_jpg", label: "PDF → JPG" },
  { value: "jpg_to_pdf", label: "JPG → PDF" },
  { value: "pdf_to_word", label: "PDF → Word" },
  { value: "word_to_pdf", label: "Word → PDF" },
];

const qrSizes = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const filterOptions = [
  { value: "none", label: "None" },
  { value: "grayscale", label: "Grayscale" },
  { value: "sepia", label: "Sepia" },
  { value: "high-contrast", label: "High Contrast" },
];

export const EditingWindow: React.FC<EditingWindowProps> = ({ file, fileType, onClose, onDone, toolType = 'default', totalPages }) => {
  const { tText } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    ready,
    loadFile,
    applyBrightness,
    applyContrast,
    applyRotation,
    applyFlip,
    applyFilter,
    resetAll,
    exportAs,
  } = useImageEditor(canvasRef);
  const { operationOptions, updateOptions } = useFileStore();

  const [activeSection, setActiveSection] = useState<string>(() => {
    if (toolType === "aadhaar-mask") return "aadhaar";
    if (["compress", "merge", "split", "rotate", "protect", "unlock"].includes(toolType)) return "pdf";
    return "crop";
  });
  const [sidebarTab, setSidebarTab] = useState<"adjust" | "annotate" | "smart" | "export">(() => {
    if (toolType === "aadhaar-mask" || toolType === "pan-resize") return "smart";
    if (["compress", "merge", "split", "rotate", "protect", "unlock"].includes(toolType)) return "export";
    return "adjust";
  });
  const [zoomLevel, setZoomLevel] = useState(1);

  const [cropPreset, setCropPreset] = useState<string>("Free");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [sizeUnit, setSizeUnit] = useState<"px" | "cm" | "mm">("px");
  const [sizeSearch, setSizeSearch] = useState("");

  const [removeBackground, setRemoveBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundPreset, setBackgroundPreset] = useState<string>("White");
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);

  const [aadhaarAutoDetect, setAadhaarAutoDetect] = useState(false);
  const [aadhaarMaskFormat, setAadhaarMaskFormat] = useState("XXXX-XXXX-1234");
  const [aadhaarResult, setAadhaarResult] = useState<string>("");

  const [annotating, setAnnotating] = useState(false);
  const [activeMode, setActiveMode] = useState<'select' | 'draw' | 'text'>('select');
  const [drawColor, setDrawColor] = useState('#000000');
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<any[]>([]);
  const [annotationTextInput, setAnnotationTextInput] = useState('');
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const [annotationOverlaySize, setAnnotationOverlaySize] = useState({ width: 0, height: 0 });

  const [ocrLanguage, setOcrLanguage] = useState("English");
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  const [autofillFields, setAutofillFields] = useState<Record<string, string>>({
    Name: "",
    DOB: "",
    Address: "",
    Aadhaar: "",
  });
  const [autofillLoading, setAutofillLoading] = useState(false);

  const [pdfQuality, setPdfQuality] = useState("Medium");
  const [pdfConvertType, setPdfConvertType] = useState("pdf_to_jpg");
  const [pdfMergeFiles, setPdfMergeFiles] = useState<File[]>([]);
  const [pdfSplitRange, setPdfSplitRange] = useState("1-1");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState(40);
  const [watermarkPosition, setWatermarkPosition] = useState("center");

  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [sharpness, setSharpness] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [filterPreset, setFilterPreset] = useState("none");

  const [qrPayload, setQrPayload] = useState("");
  const [qrSize, setQrSize] = useState("medium");
  const [qrResult, setQrResult] = useState("");
  const [qrScanText, setQrScanText] = useState("");

  const [exportFormat, setExportFormat] = useState<"jpg" | "png" | "pdf" | "webp">("png");
  const [exportQuality, setExportQuality] = useState(85);
  const [shareLink, setShareLink] = useState<string>("");
  const [qrShareLink, setQrShareLink] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadFile(file);
  }, [file, loadFile]);

  useEffect(() => {
    applyBrightness(brightness);
  }, [brightness, applyBrightness]);

  useEffect(() => {
    applyContrast(contrast);
  }, [contrast, applyContrast]);

  useEffect(() => {
    applyFilter(filterPreset as any);
  }, [filterPreset, applyFilter]);

  useEffect(() => {
    if (file && fileType === 'pdf') {
      const fileUrl = URL.createObjectURL(file);
      pdfjsLib.getDocument(fileUrl).promise.then(doc => {
        setPdfDoc(doc);
        renderPage(doc, 1);
      }).catch(err => console.error('PDF load error:', err));
    }
  }, [file, fileType]);

  const renderPage = async (doc: any, pageNum: number) => {
    if (!canvasRef.current) return;
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: pdfZoom / 100 });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    } catch (err) {
      console.error('PDF render error:', err);
    }
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pdfPage);
    }
  }, [pdfDoc, pdfPage, pdfZoom]);

  const activeSectionLabel = useMemo(() => {
    switch (activeSection) {
      case "crop":
        return "Crop & Resize";
      case "background":
        return "Background";
      case "aadhaar":
        return "Aadhaar Masking";
      case "ocr":
        return "OCR & Text Extract";
      case "autofill":
        return "Form Autofill";
      case "pdf":
        return "PDF Tools";
      case "image":
        return "Image Adjustments";
      case "qr":
        return "QR Code";
      case "export":
        return "Export & Share";
      default:
        return "Crop & Resize";
    }
  }, [activeSection]);

  const toggleSection = (section: string) => {
    setActiveSection((current) => (current === section ? "" : section));
  };

  const handleApplyCrop = () => {
    setCropPreset("Custom");
    setStatusMessage(`Applied ${width}${sizeUnit} × ${height}${sizeUnit}`);
  };

  const handleBackgroundUpload = async (file: File | null) => {
    if (!file) return;
    setBackgroundImage(file);
    setStatusMessage(`Uploaded background image: ${file.name}`);
  };

  const callApi = async (path: string, body: BodyInit) => {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      body,
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
    return response.json();
  };

  const handleAutoDetectAadhaar = async () => {
    if (!file) return;
    setBusy(true);
    setStatusMessage("Detecting Aadhaar fields...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await callApi("/api/v1/premium/aadhaar/detect", formData);
      setAadhaarResult(result?.masked || "Detected and masked preview ready.");
      setStatusMessage("Aadhaar fields detected.");
    } catch (error: any) {
      setStatusMessage(error.message || "Aadhaar detection failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleApplyMasking = async () => {
    if (!file) return;
    setBusy(true);
    setStatusMessage("Applying Aadhaar masking...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("maskFormat", aadhaarMaskFormat);
      const result = await callApi("/api/v1/premium/aadhaar/mask", formData);
      setAadhaarResult(result?.masked || "Masked preview ready.");
      setStatusMessage("Mask applied successfully.");
    } catch (error: any) {
      setStatusMessage(error.message || "Masking failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleExtractText = async () => {
    if (!file) return;
    setBusy(true);
    setStatusMessage("Extracting text...");
    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", ocrLanguage.toLowerCase());
      const result = await callApi("/api/v1/premium/ocr/extract", formData);
      setOcrText(result?.text || "No text extracted.");
      setStatusMessage("Text extracted successfully.");
    } catch (error: any) {
      setStatusMessage(error.message || "OCR extraction failed.");
    } finally {
      setBusy(false);
      setOcrLoading(false);
    }
  };

  const handleDetectFields = async () => {
    if (!file) return;
    setBusy(true);
    setStatusMessage("Detecting form fields...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await callApi("/api/v1/premium/autofill/detect-fields", formData);
      const fields = result?.fields || {};
      setAutofillFields((prev) => ({
        Name: fields.Name || prev.Name,
        DOB: fields.DOB || prev.DOB,
        Address: fields.Address || prev.Address,
        Aadhaar: fields.Aadhaar || prev.Aadhaar,
      }));
      setStatusMessage("Form fields detected.");
    } catch (error: any) {
      setStatusMessage(error.message || "Field detection failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateQr = async () => {
    if (!qrPayload.trim()) {
      setStatusMessage("Enter text or URL to generate QR code.");
      return;
    }
    setBusy(true);
    setStatusMessage("Generating QR code...");
    try {
      const payload = { data: qrPayload, size: qrSize };
      const result = await callApi("/api/v1/premium/qr/generate", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      setQrResult(result?.qrUrl || "QR generated.");
      setStatusMessage("QR code ready.");
    } catch (error: any) {
      setStatusMessage(error.message || "QR generation failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleScanQr = async (scanFile: File | null) => {
    if (!scanFile) return;
    setBusy(true);
    setStatusMessage("Scanning QR code...");
    try {
      const formData = new FormData();
      formData.append("file", scanFile);
      const result = await callApi("/api/v1/premium/qr/scan", formData);
      setQrScanText(result?.decoded || "No QR result.");
      setStatusMessage("QR scan completed.");
    } catch (error: any) {
      setStatusMessage(error.message || "QR scan failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!file) return;
    setBusy(true);
    setStatusMessage("Creating WhatsApp share link...");
    try {
      const result = await callApi("/api/v1/premium/shares/whatsapp", new Blob([JSON.stringify({ documentName: file.name })], { type: "application/json" }));
      setShareLink(result?.shareUrl || "Link generated.");
      setStatusMessage("WhatsApp share link ready.");
    } catch (error: any) {
      setStatusMessage(error.message || "Share link creation failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateShareQr = () => {
    if (!shareLink) {
      setStatusMessage("Create a share link first.");
      return;
    }
    setQrShareLink(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareLink)}&size=220x220`);
    setStatusMessage("Share QR generated.");
  };

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(ocrText || "");
    setStatusMessage("Copied extracted text to clipboard.");
  };

  const handleDownloadText = () => {
    const blob = new Blob([ocrText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "extracted-text.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    const selected = event.target.files?.[0] ?? null;
    setter(selected);
  };

  const handleDone = async () => {
    if (annotations.length > 0 && file) {
      const blob = await embedAnnotationsInPdf(file);
      onDone(blob);
      return;
    }
    if (fileType !== "image" || !ready) {
      if (file) {
        onDone(file);
        return;
      }
    }
    const resultBlob = await exportAs(exportFormat);
    onDone(resultBlob);
  };

  const startAnnotation = () => {
    setAnnotating(true);
    if (pdfDoc) {
      const canvas = canvasRef.current;
      if (canvas) {
        setAnnotationOverlaySize({ width: canvas.width, height: canvas.height });
      }
    }
  };

  const stopAnnotation = () => {
    setAnnotating(false);
    setActiveMode('select');
    setIsDrawing(false);
    const oc = annotationCanvasRef.current;
    if (oc) {
      const ctx = oc.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, oc.width, oc.height);
    }
  };

  const getAnnotationCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0] || (e as React.TouchEvent).changedTouches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleAnnotationPointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeMode === 'select') return;
    const pt = getAnnotationCanvasPoint(e);
    if (activeMode === 'draw') {
      setIsDrawing(true);
      setCurrentPath([pt]);
    } else if (activeMode === 'text') {
      const text = prompt('Enter annotation text:');
      if (text && text.trim()) {
        const newAnnot: any = { type: 'text', color: drawColor, text: text.trim(), x: pt.x, y: pt.y, fontSize: 16 };
        setAnnotations((prev) => [...prev, newAnnot]);
        redrawAnnotationOverlay();
      }
    }
  };

  const handleAnnotationPointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeMode !== 'draw' || !isDrawing) return;
    const pt = getAnnotationCanvasPoint(e);
    setCurrentPath((prev) => [...prev, pt]);
    const oc = annotationCanvasRef.current;
    if (!oc) return;
    const ctx = oc.getContext('2d');
    if (!ctx) return;
    const prevPt = currentPath[currentPath.length - 1];
    if (prevPt) {
      ctx.beginPath();
      ctx.moveTo(prevPt.x, prevPt.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const handleAnnotationPointerUp = () => {
    if (activeMode !== 'draw' || !isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      const newAnnot: any = { type: 'path', color: drawColor, width: 3, points: [...currentPath] };
      setAnnotations((prev) => [...prev, newAnnot]);
    }
    setCurrentPath([]);
  };

  const redrawAnnotationOverlay = () => {
    const oc = annotationCanvasRef.current;
    if (!oc) return;
    const ctx = oc.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, oc.width, oc.height);
    for (const ann of annotations) {
      if (ann.type === 'path') {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      } else if (ann.type === 'text') {
        ctx.font = `${ann.fontSize || 16}px sans-serif`;
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.text, ann.x, ann.y);
      }
    }
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    setCurrentPath([]);
    const oc = annotationCanvasRef.current;
    if (oc) {
      const ctx = oc.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, oc.width, oc.height);
    }
  };

  const embedAnnotationsInPdf = async (sourceFile: File): Promise<Blob> => {
    if (annotations.length === 0) return sourceFile;
    try {
      const { PDFDocument, rgb } = await import('pdf-lib');
      const arrayBuffer = await sourceFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const targetPage = Math.min(pdfPage - 1, pages.length - 1);
      const page = pages[targetPage];
      const { width: pageWidth, height: pageHeight } = page.getSize();
      const canvas = canvasRef.current;
      if (!canvas) return sourceFile;
      const scaleX = pageWidth / canvas.width;
      const scaleY = pageHeight / canvas.height;
      for (const ann of annotations) {
        if (ann.type === 'path' && ann.points.length > 1) {
          const pdfPoints = ann.points.map((p: any) => ({
            x: p.x * scaleX,
            y: pageHeight - p.y * scaleY,
          }));
          const operators: any[] = [];
          operators.push({ cmd: 'm', args: [{ x: pdfPoints[0].x, y: pdfPoints[0].y }] });
          for (let i = 1; i < pdfPoints.length; i++) {
            operators.push({ cmd: 'l', args: [{ x: pdfPoints[i].x, y: pdfPoints[i].y }] });
          }
          const pathColor = rgb(
            parseInt(ann.color.slice(1, 3), 16) / 255,
            parseInt(ann.color.slice(3, 5), 16) / 255,
            parseInt(ann.color.slice(5, 7), 16) / 255,
          );
          page.drawSvgPath(
            pdfPoints.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
            { color: pathColor, borderColor: pathColor, borderWidth: ann.width * scaleX }
          );
        } else if (ann.type === 'text') {
          page.drawText(ann.text, {
            x: ann.x * scaleX,
            y: pageHeight - ann.y * scaleY,
            size: (ann.fontSize || 16) * scaleX,
            color: rgb(
              parseInt(ann.color.slice(1, 3), 16) / 255,
              parseInt(ann.color.slice(3, 5), 16) / 255,
              parseInt(ann.color.slice(5, 7), 16) / 255,
            ),
          });
        }
      }
      const pdfBytes = await pdfDoc.save();
      stopAnnotation();
      const pdfBuffer = pdfBytes.buffer.slice(0, pdfBytes.byteLength) as ArrayBuffer;
      return new Blob([pdfBuffer], { type: 'application/pdf' });
    } catch {
      return sourceFile;
    }
  };

  const activeHeading = (label: string, icon: React.ReactNode, sectionKey: string) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-800 px-4 py-3 text-left transition ${activeSection === sectionKey ? "bg-slate-850" : "bg-slate-950/80 hover:bg-slate-900"}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-slate-100">{icon}</span>
        <div>
          <p className="text-sm font-semibold">{tText(label)}</p>
          <p className="text-xs text-slate-400">{sectionKey === activeSection ? tText("Open") : tText("Closed")}</p>
        </div>
      </div>
      <motion.span animate={{ rotate: activeSection === sectionKey ? 180 : 0 }} className="text-slate-400">
        <ChevronDown className="h-5 w-5" />
      </motion.span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-slate-950/90 text-white backdrop-blur-xl overflow-y-auto lg:overflow-hidden font-sans">
      <aside className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-1000/60 backdrop-blur-lg overflow-y-auto pb-6 lg:pb-10 flex flex-col">
        <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 px-4 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{tText("Editing Window")}</p>
              <h2 className="text-lg font-black text-white">FileNova AI</h2>
            </div>
            <button onClick={onClose} title={tText("Close")} aria-label={tText("Close")} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-805 bg-slate-900/60 p-3 text-sm text-slate-400">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">{tText("Active tool")}</span>
              <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">{tText(activeSectionLabel)}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{tText("Use the sidebar to preview edits live, then save with Done.")}</p>
          </div>
        </div>

        <div className="flex border border-white/[0.06] bg-slate-950/40 p-1 mx-4 mt-4 rounded-2xl gap-1 backdrop-blur-md shadow-inner shrink-0">
          {[
            { id: "adjust", label: "Edit", icon: <Scissors className="h-3.5 w-3.5" /> },
            { id: "annotate", label: "Annotate", icon: <Pen className="h-3.5 w-3.5" /> },
            { id: "smart", label: "Smart Tools", icon: <Sparkles className="h-3.5 w-3.5" /> },
            { id: "export", label: "Export", icon: <Share2 className="h-3.5 w-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSidebarTab(tab.id as any);
                if (tab.id === "adjust") setActiveSection("crop");
                else if (tab.id === "annotate") { setActiveSection("crop"); startAnnotation(); }
                else if (tab.id === "smart") setActiveSection(toolType === "aadhaar-mask" ? "aadhaar" : "crop");
                else if (tab.id === "export") { setActiveSection("pdf"); stopAnnotation(); }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                sidebarTab === tab.id 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/10 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4 px-4 py-4 flex-1 overflow-y-auto">
          {sidebarTab === "adjust" && (
            <>
              {activeHeading("📐 Crop & Resize", <Scissors className="h-5 w-5" />, "crop")}
              <AnimatePresence initial={false}>
                {activeSection === "crop" ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {["Free", "1:1", "4:3", "16:9", "A4", "Passport (3.5x4.5cm)", "Passport (5x5cm)"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCropPreset(preset)}
                            className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition-all duration-200 hover:scale-[1.02] active:scale-98 cursor-pointer ${
                              cropPreset === preset 
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md shadow-emerald-500/5" 
                                : "border-white/[0.08] bg-slate-950/60 hover:bg-slate-900 text-slate-405"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold">Custom size</label>
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                          <input
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(Number(e.target.value))}
                            title="Width"
                            aria-label="Width"
                            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Width"
                          />
                          <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            title="Height"
                            aria-label="Height"
                            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Height"
                          />
                          <select
                            value={sizeUnit}
                            onChange={(e) => setSizeUnit(e.target.value as "px" | "cm" | "mm")}
                            title="Select size unit"
                            aria-label="Select size unit"
                            className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                          >
                            <option value="px">px</option>
                            <option value="cm">cm</option>
                            <option value="mm">mm</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold">Search preset</label>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <input
                            type="search"
                            value={sizeSearch}
                            onChange={(e) => setSizeSearch(e.target.value)}
                            title="Search sizes"
                            aria-label="Search sizes"
                            placeholder="Search standard dimensions..."
                            className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold block mb-1">Country passport sizes</label>
                        <div className="grid gap-2">
                          {passportPresets
                            .filter((preset) => preset.label.toLowerCase().includes(sizeSearch.toLowerCase()))
                            .map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  setWidth(preset.width);
                                  setHeight(preset.height);
                                  setCropPreset(preset.label);
                                }}
                                className={`rounded-xl border p-2.5 text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                                  cropPreset === preset.label
                                    ? "border-emerald-500 bg-emerald-500/10"
                                    : "border-white/[0.06] bg-slate-950 hover:border-white/15"
                                }`}
                              >
                                <div className="font-bold text-xs text-white">{preset.label}</div>
                                <div className="text-[9.5px] text-slate-500 mt-0.5 font-mono">{preset.width} × {preset.height} px</div>
                              </button>
                            ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyCrop}
                        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-slate-950 transition hover:bg-emerald-450 cursor-pointer shadow-md"
                      >
                        Apply Crop
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {activeHeading("🖼️ Image Adjustments", <Pencil className="h-5 w-5" />, "image")}
              <AnimatePresence initial={false}>
                {activeSection === "image" ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Brightness</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-mono">{brightness > 0 ? `+${brightness}` : brightness}%</span>
                            <button type="button" onClick={() => setBrightness(0)} className="text-[9.5px] text-slate-500 hover:text-emerald-400 transition cursor-pointer">Reset</button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={-100}
                          max={100}
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          title="Brightness"
                          aria-label="Brightness"
                          className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Contrast</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-mono">{contrast > 0 ? `+${contrast}` : contrast}%</span>
                            <button type="button" onClick={() => setContrast(0)} className="text-[9.5px] text-slate-500 hover:text-emerald-400 transition cursor-pointer">Reset</button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={-100}
                          max={100}
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          title="Contrast"
                          aria-label="Contrast"
                          className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Saturation</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-mono">{saturation > 0 ? `+${saturation}` : saturation}%</span>
                            <button type="button" onClick={() => setSaturation(0)} className="text-[9.5px] text-slate-500 hover:text-emerald-400 transition cursor-pointer">Reset</button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min={-100}
                          max={100}
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          title="Saturation"
                          aria-label="Saturation"
                          className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSharpness((active) => !active)}
                          className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                            sharpness 
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-350" 
                              : "border-white/10 bg-slate-950 hover:bg-slate-900 text-slate-400"
                          }`}
                        >
                          Sharpness
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRotation((value) => (value - 90 + 360) % 360);
                            applyRotation(-90);
                          }}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 transition-all cursor-pointer"
                        >
                          90° L
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRotation((value) => (value + 90) % 360);
                            applyRotation(90);
                          }}
                          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-900 transition-all cursor-pointer"
                        >
                          90° R
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFlipHorizontal((active) => !active);
                            applyFlip(true, false);
                          }}
                          className={`rounded-xl border py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                            flipHorizontal 
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-350" 
                              : "border-white/10 bg-slate-950 hover:bg-slate-900 text-slate-400"
                          }`}
                        >
                          Flip Horizontal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFlipVertical((active) => !active);
                            applyFlip(false, true);
                          }}
                          className={`rounded-xl border py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                            flipVertical 
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-350" 
                              : "border-white/10 bg-slate-950 hover:bg-slate-900 text-slate-400"
                          }`}
                        >
                          Flip Vertical
                        </button>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold">Filter presets</label>
                        <select
                          value={filterPreset}
                          onChange={(e) => setFilterPreset(e.target.value)}
                          title="Filter preset"
                          aria-label="Filter preset"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {activeHeading("🎨 Background", <ImageIcon className="h-5 w-5" />, "background")}
              <AnimatePresence initial={false}>
                {activeSection === "background" ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 cursor-pointer hover:bg-slate-900 transition">
                        <input
                          type="checkbox"
                          checked={removeBackground}
                          onChange={(e) => setRemoveBackground(e.target.checked)}
                          title="Remove Background"
                          aria-label="Remove Background"
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-200">Remove Background</span>
                      </label>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold">Background color</label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          title="Background color"
                          aria-label="Background color"
                          className="h-10 w-full cursor-pointer rounded-xl border border-white/10 bg-slate-950 px-3 py-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {["White", "Light Gray", "Blue (visa)", "Transparent", "Custom"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setBackgroundPreset(preset);
                              if (preset === "White") setBackgroundColor("#ffffff");
                              if (preset === "Light Gray") setBackgroundColor("#e5e7eb");
                              if (preset === "Blue (visa)") setBackgroundColor("#dbeafe");
                              if (preset === "Transparent") setBackgroundColor("#00000000");
                            }}
                            className={`rounded-xl border px-3 py-2 text-[11px] font-bold transition-all duration-200 hover:scale-[1.02] active:scale-98 cursor-pointer ${
                              backgroundPreset === preset
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md shadow-emerald-500/5"
                                : "border-white/[0.08] bg-slate-950/60 hover:bg-slate-900 text-slate-400"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold block mb-1">Background Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBackgroundUpload(e.target.files?.[0] ?? null)}
                          title="Upload background image"
                          placeholder="Upload background image"
                          aria-label="Upload background image"
                          className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:cursor-pointer"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>
          )}

          {sidebarTab === "annotate" && (
            <>
              <div className="space-y-4 px-4 py-4">
                <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Annotation Tools</span>
                    <span className="text-[9px] text-slate-500 font-mono">{annotations.length} placed</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { mode: 'select' as const, label: 'Select', icon: <MousePointer2 className="h-3.5 w-3.5" /> },
                      { mode: 'draw' as const, label: 'Draw', icon: <Pencil className="h-3.5 w-3.5" /> },
                      { mode: 'text' as const, label: 'Text', icon: <Type className="h-3.5 w-3.5" /> },
                    ].map(({ mode, label, icon }) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setActiveMode(mode)}
                        className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-[10px] font-bold transition-all cursor-pointer ${
                          activeMode === mode
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md"
                            : "border-white/[0.08] bg-slate-950/60 hover:bg-slate-900 text-slate-400"
                        }`}
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold">Color</label>
                    <div className="flex gap-2">
                      {['#000000', '#0000ff', '#ff0000'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDrawColor(color)}
                          className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${
                            drawColor === color ? 'border-emerald-500 scale-110' : 'border-white/20'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Annotation color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearAnnotations}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 py-2 text-[10px] font-bold text-slate-300 hover:bg-slate-900 transition cursor-pointer"
                  >
                    Clear All Annotations
                  </button>
                </div>
                {annotations.length > 0 && (
                  <div className="space-y-2 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Placed Annotations</span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {annotations.map((ann, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-slate-950/60 px-3 py-2 text-[10px] text-slate-300">
                          <span>{ann.type === 'path' ? `✏️ Signature (${ann.points.length} pts)` : `📝 "${ann.text?.slice(0, 20)}"`}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAnnotations((prev) => prev.filter((_, idx) => idx !== i));
                              setTimeout(redrawAnnotationOverlay, 0);
                            }}
                            className="text-slate-500 hover:text-red-400 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {sidebarTab === "smart" && (
            <>
              {activeHeading("🛡️ Aadhaar Masking", <Shield className="h-5 w-5" />, "aadhaar")}
              <AnimatePresence initial={false}>
                {activeSection === "aadhaar" ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${aadhaarAutoDetect ? "border-emerald-500 bg-emerald-500/10 text-emerald-350" : "border-white/10 bg-slate-950 hover:bg-slate-900"}`}
                          onClick={() => setAadhaarAutoDetect((value) => !value)}
                        >
                          {aadhaarAutoDetect ? "Auto-detect On" : "Auto-detect Off"}
                        </button>
                        <span className="text-[10px] uppercase tracking-wider text-slate-450 font-bold">Mask format</span>
                      </div>
                      <input
                        type="text"
                        value={aadhaarMaskFormat}
                        onChange={(e) => setAadhaarMaskFormat(e.target.value)}
                        title="Aadhaar mask format"
                        aria-label="Aadhaar mask format"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <div className="rounded-xl border border-white/[0.05] bg-slate-950 px-4 py-3 text-xs text-slate-200">
                        <p className="font-bold text-slate-100 mb-1">Masked preview</p>
                        <p className="text-slate-400 font-mono">{aadhaarResult || "No preview yet."}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyMasking}
                        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-slate-950 transition hover:bg-emerald-450 cursor-pointer shadow-md"
                      >
                        Apply Masking
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {activeHeading("🔍 OCR & Text Extract", <MousePointer2 className="h-5 w-5" />, "ocr")}
              <AnimatePresence initial={false}>
                {activeSection === "ocr" ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <button
                        type="button"
                        onClick={handleExtractText}
                        disabled={ocrLoading}
                        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-slate-950 transition hover:bg-emerald-450 disabled:opacity-60 cursor-pointer shadow-md"
                      >
                        {ocrLoading ? "Extracting..." : "Extract Text"}
                      </button>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold">Language</label>
                        <select
                          value={ocrLanguage}
                          onChange={(e) => setOcrLanguage(e.target.value)}
                          title="Select OCR language"
                          aria-label="Select OCR language"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option>English</option>
                          <option>Hindi</option>
                          <option>Bengali</option>
                          <option>Tamil</option>
                          <option>Telugu</option>
                          <option>Kannada</option>
                        </select>
                      </div>
                      <textarea
                        value={ocrText}
                        onChange={(e) => setOcrText(e.target.value)}
                        rows={6}
                        title="Extracted text"
                        aria-label="Extracted text"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-xs text-white outline-none focus:border-emerald-500"
                        placeholder="Extracted text appears here..."
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleCopyText}
                          className="rounded-xl border border-white/10 bg-slate-950 py-2 text-xs font-bold transition hover:bg-slate-900 cursor-pointer"
                        >
                          <Copy className="inline h-3.5 w-3.5 mr-1" /> Copy
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadText}
                          className="rounded-xl bg-slate-100 py-2 text-xs font-black text-slate-950 transition hover:bg-slate-200 cursor-pointer"
                        >
                          <Download className="inline h-3.5 w-3.5 mr-1" /> Download
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {activeHeading("📋 Form Autofill", <Layers className="h-5 w-5" />, "autofill")}
              <AnimatePresence initial={false}>
                {activeSection === "autofill" ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <button
                        type="button"
                        onClick={handleDetectFields}
                        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-slate-950 transition hover:bg-emerald-450 cursor-pointer shadow-md"
                      >
                        Detect Fields
                      </button>
                      <div className="space-y-3">
                        {Object.entries(autofillFields).map(([label, value]) => (
                          <div key={label} className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-450 font-bold">
                              <span>{label}</span>
                              <span className={value ? "text-emerald-400" : "text-slate-500"}>{value ? "Filled" : "Empty"}</span>
                            </div>
                            <input
                              value={value}
                              onChange={(e) => setAutofillFields((prev) => ({ ...prev, [label]: e.target.value }))}
                              title={label}
                              aria-label={label}
                              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setStatusMessage("Form filled from detected fields.")}
                        className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-black text-slate-950 transition hover:bg-slate-200 cursor-pointer"
                      >
                        Fill Form
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {activeHeading("📱 QR Code", <Sparkles className="h-5 w-5" />, "qr")}
              <AnimatePresence initial={false}>
                {activeSection === "qr" ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-450 font-bold">Text or URL</label>
                        <input
                          type="text"
                          value={qrPayload}
                          onChange={(e) => setQrPayload(e.target.value)}
                          title="QR code text or URL"
                          aria-label="QR code text or URL"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          placeholder="Enter text, link or share URL"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {qrSizes.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setQrSize(option.value)}
                            className={`rounded-xl border py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                              qrSize === option.value
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-350"
                                : "border-white/10 bg-slate-950 hover:bg-slate-900 text-slate-400"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleGenerateQr}
                          className="rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-slate-950 transition hover:bg-emerald-450 cursor-pointer shadow-md"
                        >
                          Generate QR
                        </button>
                        <label className="rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-[10px] text-slate-200 cursor-pointer flex flex-col justify-center">
                          <span className="font-bold text-slate-400 uppercase tracking-wider">Scan QR</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleScanQr(event.target.files?.[0] ?? null)}
                            title="Upload QR code image to scan"
                            aria-label="Upload QR code image to scan"
                            className="mt-1 block w-full text-[9px] text-slate-400 file:hidden"
                          />
                        </label>
                      </div>
                      <div className="rounded-xl border border-white/[0.05] bg-slate-950 px-4 py-3 text-xs text-slate-200">
                        <p className="font-bold text-slate-100 mb-1">Decoded result</p>
                        <p className="text-slate-400">{qrScanText || "Upload a QR image to scan."}</p>
                      </div>
                      {qrResult && (
                        <div className="rounded-xl border border-white/[0.05] bg-slate-950 px-4 py-3 text-xs text-slate-200">
                          <p className="font-bold text-slate-100 mb-1">Generated QR</p>
                          <p className="text-slate-455 break-all font-mono">{qrResult}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {toolType === 'aadhaar-mask' && <AadhaarSidebar onMask={() => {}} disabled={false} />}
              {toolType === 'pan-resize' && <PANSidebar onApply={() => {}} disabled={false} />}
            </>
          )}

          {sidebarTab === "export" && (
            <>
              {activeHeading("📄 PDF Tools", <Menu className="h-5 w-5" />, "pdf")}
              <AnimatePresence initial={false}>
                {activeSection === "pdf" ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-slate-455 font-bold">Compress PDF</p>
                        <div className="grid grid-cols-3 gap-2">
                          {["Low", "Medium", "High"].map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setPdfQuality(level)}
                              className={`rounded-xl border py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                                pdfQuality === level
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-350"
                                  : "border-white/10 bg-slate-950 hover:bg-slate-900 text-slate-400"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-slate-455 font-bold">Convert</p>
                        <select
                          value={pdfConvertType}
                          onChange={(e) => setPdfConvertType(e.target.value)}
                          title="Select PDF conversion format"
                          aria-label="Select PDF conversion format"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          {pdfConvertOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 rounded-xl border border-white/[0.05] bg-slate-950 p-3">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-455 font-bold mb-2">
                          <span>Merge PDFs</span>
                          <span className="text-emerald-450 font-mono">{pdfMergeFiles.length} files</span>
                        </div>
                        <input
                          type="file"
                          accept="application/pdf"
                          multiple
                          onChange={(event) => setPdfMergeFiles(Array.from(event.target.files || []))}
                          title="Select PDFs to merge"
                          aria-label="Select PDFs to merge"
                          className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:cursor-pointer"
                        />
                        <div className="space-y-2 mt-2 max-h-[120px] overflow-y-auto pr-1">
                          {pdfMergeFiles.map((item, index) => (
                            <div key={`${item.name}-${index}`} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
                              <span className="truncate max-w-[150px]">{item.name}</span>
                              <button
                                type="button"
                                onClick={() => setPdfMergeFiles((prev) => prev.filter((_, i) => i !== index))}
                                className="text-slate-400 hover:text-red-400 transition cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-455 font-bold">Split range</label>
                        <input
                          type="text"
                          value={pdfSplitRange}
                          onChange={(e) => setPdfSplitRange(e.target.value)}
                          placeholder="1-3,5"
                          title="Split range"
                          aria-label="Split range"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-455 font-bold">Add Watermark</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="Watermark text"
                          title="Watermark text"
                          aria-label="Watermark text"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={watermarkOpacity}
                            onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                            title="Watermark opacity"
                            aria-label="Watermark opacity"
                            className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                          />
                          <span className="text-xs text-slate-400 w-8 text-right">{watermarkOpacity}%</span>
                        </div>
                        <select
                          value={watermarkPosition}
                          onChange={(e) => setWatermarkPosition(e.target.value)}
                          title="Watermark position"
                          aria-label="Watermark position"
                          className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="center">Center</option>
                          <option value="top-left">Top Left</option>
                          <option value="top-right">Top Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {activeHeading("📤 Export & Share", <Share2 className="h-5 w-5" />, "export")}
              <AnimatePresence initial={false}>
                {activeSection === "export" ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-slate-900/40 p-4">
                      <div className="grid gap-3">
                        <div className="grid gap-2">
                          <label className="text-[10px] uppercase tracking-wider text-slate-455 font-bold">Export format</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(["jpg", "png", "webp", "pdf"] as const).map((format) => (
                              <button
                                key={format}
                                type="button"
                                onClick={() => setExportFormat(format)}
                                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                                  exportFormat === format
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-350 shadow-md shadow-emerald-500/5 font-black"
                                    : "border-white/[0.08] bg-slate-950/60 hover:bg-slate-900 text-slate-400"
                                }`}
                              >
                                <span className="text-[11px] uppercase font-bold tracking-wider">{format}</span>
                                <span className="text-[8.5px] text-slate-500 mt-0.5 font-mono">
                                  {format === "png" && "Lossless"}
                                  {format === "jpg" && "Compressed"}
                                  {format === "webp" && "Modern Web"}
                                  {format === "pdf" && "Document"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-slate-455 font-bold">
                            <span>Quality</span>
                            <span className="text-emerald-400 font-mono">{exportQuality}%</span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={exportQuality}
                            onChange={(e) => setExportQuality(Number(e.target.value))}
                            title="Export quality"
                            aria-label="Export quality"
                            className="h-1 w-full bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDone}
                        className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-black text-slate-950 transition hover:bg-slate-200 cursor-pointer shadow-md"
                      >
                        Save Result
                      </button>
                      <QuickShareButton documentId={file?.name || "file-preview"} documentName={file?.name || "file"} />
                      <button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 py-2 text-xs font-semibold text-white transition hover:bg-slate-900 cursor-pointer"
                      >
                        Copy share link
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateShareQr}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 py-2 text-xs font-semibold text-white transition hover:bg-slate-900 cursor-pointer"
                      >
                        QR share link
                      </button>
                      {shareLink && (
                        <div className="rounded-xl border border-white/[0.05] bg-slate-950 px-4 py-3 text-xs text-slate-300">
                          <span className="font-bold text-slate-100">Share link</span>
                          <p className="mt-1 break-all font-mono text-[10px]">{shareLink}</p>
                        </div>
                      )}
                      {qrShareLink && (
                        <div className="rounded-xl border border-white/[0.05] bg-slate-950 px-4 py-3 text-xs text-slate-300">
                          <span className="font-bold text-slate-100">Share QR</span>
                          <img src={qrShareLink} alt="Share QR" className="mt-2.5 w-full rounded-xl border border-white/10 bg-white p-1" width="200" height="200" loading="lazy" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {toolType === 'compress' && <CompressSidebar quality={operationOptions.quality ?? 0.82} onQualityChange={(q) => updateOptions({ quality: q })} grayscale={false} onGrayscaleChange={() => {}} onCompress={() => {}} disabled={false} estimate={null} formatSize={() => '0 B'} />}
              {toolType === 'merge' && (
                <MergeSidebar 
                  files={pdfMergeFiles} 
                  onFilesChange={setPdfMergeFiles} 
                  onMerge={async () => {
                    try {
                      setStatusMessage("Merging PDF documents...");
                      const { runClientSidePdfMerge } = await import("@/lib/processing/pdf/client-pdf");
                      const mergedBlob = await runClientSidePdfMerge(pdfMergeFiles);
                      onDone(mergedBlob);
                      setStatusMessage("Merge complete!");
                    } catch (err: any) {
                      setStatusMessage(`Merge failed: ${err.message}`);
                    }
                  }} 
                  disabled={pdfMergeFiles.length < 2} 
                />
              )}
              {toolType === 'split' && <SplitSidebar onSplit={() => {}} disabled={false} totalPages={totalPages || 1} />}
              {toolType === 'rotate' && <RotateSidebar onRotate={() => {}} disabled={false} />}
              {toolType === 'protect' && <ProtectSidebar onProtect={() => {}} disabled={false} />}
              {toolType === 'unlock' && <UnlockSidebar onUnlock={() => {}} disabled={false} />}
            </>
          )}
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-slate-950/40 text-slate-100 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{tText("Editing")}</p>
            <h1 className="text-lg font-black text-white truncate max-w-[200px] sm:max-w-xs">{file?.name || "Untitled file"}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomLevel((level) => Math.max(0.5, level - 0.1))}
              title={tText("Zoom out")}
              aria-label={tText("Zoom out")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-750 bg-slate-850 hover:bg-slate-800 hover:text-white transition text-slate-300 cursor-pointer text-sm font-bold"
            >
              -
            </button>
            <span className="text-xs font-bold text-slate-300 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((level) => Math.min(2, level + 0.1))}
              title={tText("Zoom in")}
              aria-label={tText("Zoom in")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-750 bg-slate-850 hover:bg-slate-800 hover:text-white transition text-slate-300 cursor-pointer text-sm font-bold"
            >
              +
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-750 bg-slate-850 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {tText("Reset")}
            </button>
            <button
              type="button"
              onClick={handleDone}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-emerald-500 px-5 py-2 text-xs font-black text-white transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
            >
              <Check className="h-3.5 w-3.5" /> {tText("Done")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-slate-100 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-slate-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> {tText("Close")}
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto lg:overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-slate-350">
              <Circle className="h-2.5 w-2.5 text-emerald-500 fill-emerald-500/30 animate-pulse" />
              {tText("Live preview")}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-[0.14em] text-slate-400">{tText(activeSectionLabel)}</div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-1 items-center justify-center overflow-auto rounded-3xl bg-slate-950 p-4 sm:p-6 shadow-inner border border-slate-900">
            {fileType === "image" ? (
              <div className="relative max-w-full overflow-hidden rounded-3xl bg-slate-900 shadow-inner" style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}>
                <canvas ref={canvasRef} className="block h-auto w-full max-w-[960px] rounded-3xl bg-slate-950" />
                {!ready && (
                  <div className="absolute inset-0 grid place-items-center bg-slate-950/90 text-slate-200 backdrop-blur-sm">
                    <div className="text-center">
                      <p className="font-black text-sm">{tText("Preparing preview…")}</p>
                      <p className="text-xs text-slate-500 mt-1">{tText("The canvas will render once the image loads.")}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : fileType === "pdf" && pdfDoc ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="relative max-w-full overflow-auto rounded-2xl bg-white shadow-2xl">
                  <canvas ref={canvasRef} className="block max-w-full h-auto" />
                  {annotating && (
                    <canvas
                      ref={annotationCanvasRef}
                      width={annotationOverlaySize.width || 800}
                      height={annotationOverlaySize.height || 600}
                      onMouseDown={handleAnnotationPointerDown}
                      onMouseMove={handleAnnotationPointerMove}
                      onMouseUp={handleAnnotationPointerUp}
                      onTouchStart={handleAnnotationPointerDown}
                      onTouchMove={handleAnnotationPointerMove}
                      onTouchEnd={handleAnnotationPointerUp}
                      className="absolute inset-0 w-full h-full cursor-crosshair"
                      style={{ touchAction: 'none' }}
                    />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-900/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                    disabled={pdfPage === 1}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold disabled:opacity-50 transition"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm font-bold text-slate-300">
                    Page {pdfPage} of {pdfDoc.numPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPdfPage(p => Math.min(pdfDoc.numPages, p + 1))}
                    disabled={pdfPage === pdfDoc.numPages}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold disabled:opacity-50 transition"
                  >
                    Next →
                  </button>
                  <select
                    value={pdfZoom}
                    onChange={(e) => setPdfZoom(Number(e.target.value))}
                    title="PDF zoom percentage"
                    className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-bold border border-slate-700"
                  >
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={150}>150%</option>
                    <option value={200}>200%</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex max-w-3xl flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 p-6 sm:p-10 text-center shadow-sm">
                <Layers className="mb-4 h-12 w-12 text-slate-600" />
                <p className="text-md font-bold text-slate-200">{tText("Preview unavailable")}</p>
                <p className="mt-2 text-xs text-slate-500 leading-5">
                  {tText("This editor currently renders live previews for images and PDFs.")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-xs text-slate-400 shadow-sm">
            <span>{statusMessage ? tText(statusMessage) : tText("Use the sidebar tools to edit your project.")}</span>
            <span className="font-bold text-slate-500">{file?.type || "None"}</span>
          </div>
        </div>
      </main>
    </div>
  );
};
