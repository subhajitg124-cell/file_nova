import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Upload, Settings2, Package, CheckCircle2, XCircle, AlertTriangle, 
  Trash2, Download, ChevronRight, ChevronLeft, Info, Lock, User, 
  Sparkles, FileText, Image as ImageIcon, RefreshCw, ArrowLeft, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { useSubscription } from "@/hooks/useSubscription";

interface DocumentField {
  id: string;
  label: string;
  description: string;
  acceptedFormats: string[];
  maxSizeKb: number;
  width?: number;
  height?: number;
  required: boolean;
  sampleName: string;
}

export default function ScholarshipZIPMaker({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [, setLocation] = useLocation();
  const { premiumTier } = useSubscription();
  const [activeTab, setActiveTab] = useState<"upload" | "customize" | "preview">("upload");
  const [studentName, setStudentName] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [preset, setPreset] = useState<"nsp" | "state" | "custom">("nsp");
  const [namingFormat, setNamingFormat] = useState<"standard" | "simple" | "detailed">("standard");
  const [isPacking, setIsPacking] = useState(false);
  const [zipPassword, setZipPassword] = useState("");
  const [enablePassword, setEnablePassword] = useState(false);

  // Document Fields Configuration
  const [fields, setFields] = useState<DocumentField[]>([
    { id: "photo", label: "Passport Photo", description: "Casual selfie or formal photo", acceptedFormats: ["JPG", "PNG"], maxSizeKb: 50, width: 200, height: 230, required: true, sampleName: "photo.jpg" },
    { id: "signature", label: "Signature", description: "Clear scan or photo on white paper", acceptedFormats: ["JPG", "PNG"], maxSizeKb: 30, width: 140, height: 60, required: true, sampleName: "signature.jpg" },
    { id: "income", label: "Income Certificate", description: "Official income certificate PDF", acceptedFormats: ["PDF", "JPG", "PNG"], maxSizeKb: 200, required: true, sampleName: "income.pdf" },
    { id: "marksheet", label: "Previous Marksheet", description: "Latest academic marksheet", acceptedFormats: ["PDF", "JPG", "PNG"], maxSizeKb: 300, required: true, sampleName: "marksheet.pdf" },
    { id: "bank", label: "Bank Passbook", description: "Passbook front page containing account details", acceptedFormats: ["PDF", "JPG", "PNG"], maxSizeKb: 200, required: true, sampleName: "bank_passbook.pdf" },
  ]);

  // Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, {
    file: File;
    processedBlob: Blob;
    previewUrl: string;
    originalSize: number;
    processedSize: number;
    dimensions?: { width: number; height: number };
    status: "success" | "warning" | "error";
    message?: string;
  }>>({});

  // Update field limits based on selected preset
  useEffect(() => {
    if (preset === "nsp") {
      setFields([
        { id: "photo", label: "Passport Photo", description: "200x230 px, under 50KB JPG", acceptedFormats: ["JPG", "PNG"], maxSizeKb: 50, width: 200, height: 230, required: true, sampleName: "photo.jpg" },
        { id: "signature", label: "Signature", description: "140x60 px, under 30KB JPG", acceptedFormats: ["JPG", "PNG"], maxSizeKb: 30, width: 140, height: 60, required: true, sampleName: "signature.jpg" },
        { id: "income", label: "Income Certificate", description: "PDF format, under 200KB", acceptedFormats: ["PDF"], maxSizeKb: 200, required: true, sampleName: "income.pdf" },
        { id: "marksheet", label: "Previous Marksheet", description: "PDF format, under 300KB", acceptedFormats: ["PDF"], maxSizeKb: 300, required: true, sampleName: "marksheet.pdf" },
        { id: "bank", label: "Bank Passbook", description: "PDF format, under 200KB", acceptedFormats: ["PDF"], maxSizeKb: 200, required: true, sampleName: "bank_passbook.pdf" },
      ]);
    } else if (preset === "state") {
      setFields([
        { id: "photo", label: "Passport Photo", description: "under 100KB (Oasis/SVMCM/MahaDBT)", acceptedFormats: ["JPG", "PNG"], maxSizeKb: 100, width: 200, height: 230, required: true, sampleName: "photo.jpg" },
        { id: "signature", label: "Signature", description: "under 50KB", acceptedFormats: ["JPG", "PNG"], maxSizeKb: 50, width: 140, height: 60, required: true, sampleName: "signature.jpg" },
        { id: "income", label: "Income Certificate", description: "PDF or JPG, under 400KB", acceptedFormats: ["PDF", "JPG", "PNG"], maxSizeKb: 400, required: true, sampleName: "income.pdf" },
        { id: "marksheet", label: "Previous Marksheet", description: "PDF or JPG, under 500KB", acceptedFormats: ["PDF", "JPG", "PNG"], maxSizeKb: 500, required: true, sampleName: "marksheet.pdf" },
        { id: "bank", label: "Bank Passbook", description: "PDF or JPG, under 400KB", acceptedFormats: ["PDF", "JPG", "PNG"], maxSizeKb: 400, required: true, sampleName: "bank_passbook.pdf" },
      ]);
    }
  }, [preset]);

  // Handle custom limit updates
  const handleCustomLimitChange = (id: string, key: "maxSizeKb" | "width" | "height", value: number) => {
    setFields(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, [key]: value };
      }
      return f;
    }));
  };

  // Browser-based image resizing and compression
  const processImage = (
    file: File, 
    targetWidth: number | undefined, 
    targetHeight: number | undefined, 
    maxKb: number
  ): Promise<{ blob: Blob; dimensions?: { width: number; height: number }; status: "success" | "warning"; message?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Use target dimensions or original dimensions
          const w = targetWidth || img.width;
          const h = targetHeight || img.height;
          
          canvas.width = w;
          canvas.height = h;
          
          if (ctx) {
            // Draw image on canvas (auto resizing to target width & height)
            ctx.drawImage(img, 0, 0, w, h);
            
            // Loop compression quality to meet size limits
            let quality = 0.95;
            let dataUrl = canvas.toDataURL("image/jpeg", quality);
            let size = Math.round((dataUrl.length * 3) / 4) / 1024;
            
            while (size > maxKb && quality > 0.1) {
              quality -= 0.05;
              dataUrl = canvas.toDataURL("image/jpeg", quality);
              size = Math.round((dataUrl.length * 3) / 4) / 1024;
            }

            // Convert data URL to Blob
            fetch(dataUrl)
              .then(res => res.blob())
              .then(blob => {
                const finalSizeKb = blob.size / 1024;
                if (finalSizeKb <= maxKb) {
                  resolve({
                    blob,
                    dimensions: { width: w, height: h },
                    status: "success",
                    message: `Resized to ${w}x${h}px & compressed to ${finalSizeKb.toFixed(1)}KB (Quality: ${Math.round(quality * 100)}%)`
                  });
                } else {
                  resolve({
                    blob,
                    dimensions: { width: w, height: h },
                    status: "warning",
                    message: `File is ${finalSizeKb.toFixed(1)}KB. Exceeds limit of ${maxKb}KB even after maximum compression.`
                  });
                }
              });
          } else {
            resolve({ blob: file, status: "warning", message: "Failed to initialize canvas context" });
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file drop/upload
  const handleFileUpload = async (fieldId: string, file: File) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    // Check extension
    const ext = file.name.split(".").pop()?.toUpperCase() || "";
    const isAccepted = field.acceptedFormats.includes(ext) || (ext === "JPEG" && field.acceptedFormats.includes("JPG"));
    
    if (!isAccepted) {
      toast.error(`Invalid format! ${field.label} accepts only: ${field.acceptedFormats.join(", ")}`);
      return;
    }

    toast.loading(`Processing ${field.label}...`, { id: `upload-${fieldId}` });

    try {
      let processedBlob: Blob = file;
      let dimensions: { width: number; height: number } | undefined;
      let status: "success" | "warning" | "error" = "success";
      let message = "Uploaded successfully";

      if (file.type.startsWith("image/") && (field.width || field.height || file.size / 1024 > field.maxSizeKb)) {
        // Image resizing/compression
        const res = await processImage(file, field.width, field.height, field.maxSizeKb);
        processedBlob = res.blob;
        dimensions = res.dimensions;
        status = res.status;
        message = res.message || message;
      } else {
        // PDF or generic files
        const sizeKb = file.size / 1024;
        if (sizeKb > field.maxSizeKb) {
          status = "warning";
          message = `Exceeds recommended limit of ${field.maxSizeKb}KB. Current size: ${sizeKb.toFixed(1)}KB.`;
        } else {
          message = `Under limit! Size: ${sizeKb.toFixed(1)}KB.`;
        }
      }

      const previewUrl = file.type.startsWith("image/") 
        ? URL.createObjectURL(processedBlob) 
        : "";

      setUploadedFiles(prev => ({
        ...prev,
        [fieldId]: {
          file,
          processedBlob,
          previewUrl,
          originalSize: file.size,
          processedSize: processedBlob.size,
          dimensions,
          status,
          message
        }
      }));

      toast.success(`${field.label} uploaded!`, { id: `upload-${fieldId}` });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to process ${field.label}`, { id: `upload-${fieldId}` });
    }
  };

  const removeFile = (fieldId: string) => {
    setUploadedFiles(prev => {
      const copy = { ...prev };
      if (copy[fieldId]) {
        if (copy[fieldId].previewUrl) URL.revokeObjectURL(copy[fieldId].previewUrl);
        delete copy[fieldId];
      }
      return copy;
    });
  };

  // Generate customized file names
  const getFormattedName = (field: DocumentField) => {
    const ext = field.id === "photo" || field.id === "signature" ? "jpg" : "pdf";
    const cleanName = studentName.trim().replace(/[^a-zA-Z0-9]/g, "_") || "Student";
    
    if (namingFormat === "standard") {
      return `${cleanName}_${field.id}_${academicYear}.${ext}`;
    } else if (namingFormat === "simple") {
      return `${field.id}.${ext}`;
    } else {
      return `${academicYear}_Scholarship_${cleanName}_${field.label.replace(/\s+/g, "_")}.${ext}`;
    }
  };

  // Generate and download ZIP client-side
  const handlePackZip = async () => {
    // Validate required files
    const missing = fields.filter(f => f.required && !uploadedFiles[f.id]);
    if (missing.length > 0) {
      toast.error(`Missing required files: ${missing.map(m => m.label).join(", ")}`);
      return;
    }

    if (enablePassword && premiumTier === "free") {
      toast.error("Password protection is a Premium Suite feature! Please upgrade or proceed without a password.");
      setLocation("/pricing");
      return;
    }

    setIsPacking(true);
    toast.loading("Compiling submission-ready ZIP archive...", { id: "pack-zip" });

    try {
      const zip = new JSZip();
      
      // Add each file to the zip
      fields.forEach(field => {
        const uploaded = uploadedFiles[field.id];
        if (uploaded) {
          const fileName = getFormattedName(field);
          zip.file(fileName, uploaded.processedBlob);
        }
      });

      // Generate the zip file as a blob
      const content = await zip.generateAsync({ type: "blob" });
      
      // Create download URL
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${studentName.trim().replace(/[^a-zA-Z0-9]/g, "_") || "Student"}_Scholarship_Pack_${academicYear}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("ZIP package generated successfully! 🚀", { id: "pack-zip" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate ZIP archive.", { id: "pack-zip" });
    } finally {
      setIsPacking(false);
    }
  };

  return (
    <div className={isEmbedded ? "text-slate-100 font-sans pb-16" : "min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16"}>
      {/* Header Banner */}
      {!isEmbedded && (
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-950 border-b border-indigo-900/20 py-4 px-6 sticky top-0 z-30 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLocation("/")}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Scholarship ZIP Studio
                </h1>
                <p className="text-xs text-slate-400">Compile & compress portal-ready packs in 3 clicks</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                100% Offline
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-px mb-8">
          <div className="flex gap-4">
            {(["upload", "customize", "preview"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 pb-3.5 text-sm font-semibold border-b-2 transition-all capitalize ${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "upload" && <Upload className="h-4 w-4" />}
                {tab === "customize" && <Settings2 className="h-4 w-4" />}
                {tab === "preview" && <Package className="h-4 w-4" />}
                {tab}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400 hidden sm:block">
            {Object.keys(uploadedFiles).length} of {fields.length} uploaded
          </div>
        </div>

        {/* Tab 1: Upload Files */}
        {activeTab === "upload" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                Upload Required Documents
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Upload your files. Images will be automatically resized to scholarship dimensions and compressed to fit under KB limits.
              </p>

              <div className="space-y-4">
                {fields.map((field) => {
                  const uploaded = uploadedFiles[field.id];
                  return (
                    <div 
                      key={field.id}
                      className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                        uploaded 
                          ? uploaded.status === "success" 
                            ? "bg-slate-900 border-emerald-500/30" 
                            : "bg-slate-900 border-amber-500/30"
                          : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-lg shrink-0 ${
                          field.id === "photo" || field.id === "signature" 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {field.id === "photo" || field.id === "signature" 
                            ? <ImageIcon className="h-5 w-5" /> 
                            : <FileText className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{field.label}</span>
                            {field.required && (
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full font-bold uppercase">Required</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{field.description}</p>
                          {uploaded && (
                            <p className={`text-xs mt-1.5 font-medium flex items-center gap-1.5 ${
                              uploaded.status === "success" ? "text-emerald-400" : "text-amber-400"
                            }`}>
                              {uploaded.status === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                              {uploaded.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {uploaded ? (
                          <>
                            {uploaded.previewUrl && (
                              <div className="h-12 w-12 rounded-lg border border-slate-700 overflow-hidden bg-slate-800 relative group">
                                <img src={uploaded.previewUrl} alt="Preview" className="h-full w-full object-cover" />
                              </div>
                            )}
                            <button
                              onClick={() => removeFile(field.id)}
                              className="p-2.5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                              title="Delete file"
                              aria-label={`Delete ${field.label}`}
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </>
                        ) : (
                          <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors shadow-glow-indigo">
                            <Upload className="h-3.5 w-3.5" />
                            Upload File
                            <input
                              type="file"
                              className="hidden"
                              accept={field.acceptedFormats.map(f => `.${f.toLowerCase()}`).join(",")}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(field.id, file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setLocation("/")}
                className="px-5 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setActiveTab("customize")}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 font-semibold text-sm rounded-xl transition-all"
              >
                Customize Settings
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Customize Settings */}
        {activeTab === "customize" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Presets & Metadata */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Settings2 className="h-4.5 w-4.5 text-indigo-400" />
                    Target Portal Limits
                  </h3>
                  <p className="text-xs text-slate-400">Select standard portal guidelines or customize constraints manually.</p>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-slate-400">Preset Configuration</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["nsp", "state", "custom"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPreset(p)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition capitalize ${
                          preset === p
                            ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {p === "nsp" ? "NSP (National)" : p === "state" ? "State e-District" : "Custom"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="studentNameInput" className="text-xs font-semibold text-slate-400">Student Name</label>
                    <input
                      id="studentNameInput"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="academicYearInput" className="text-xs font-semibold text-slate-400">Academic Year</label>
                    <input
                      id="academicYearInput"
                      type="text"
                      placeholder="e.g. 2026"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Naming Pattern & Security */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Info className="h-4.5 w-4.5 text-indigo-400" />
                    File Naming Convention
                  </h3>
                  <p className="text-xs text-slate-400">How compiled files should be named inside the ZIP archive.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: "standard", label: "Student_Document_Year.ext", desc: `e.g. ${studentName || "Student"}_photo_${academicYear}.jpg` },
                    { key: "simple", label: "document.ext", desc: "e.g. photo.jpg" },
                    { key: "detailed", label: "Year_Scholarship_Student_DocumentName.ext", desc: `e.g. ${academicYear}_Scholarship_${studentName || "Student"}_Passport_Photo.jpg` }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setNamingFormat(option.key as any)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        namingFormat === option.key
                          ? "bg-indigo-500/10 border-indigo-500"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{option.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">{option.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Password Protection */}
                <div className="border-t border-slate-800 pt-6">
                  <div className="flex items-start gap-3">
                    <input
                      id="enablePasswordCheckbox"
                      type="checkbox"
                      checked={enablePassword}
                      onChange={(e) => setEnablePassword(e.target.checked)}
                      className="mt-1 rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                    />
                    <div className="flex-1">
                      <label htmlFor="enablePasswordCheckbox" className="font-bold text-sm text-white flex items-center gap-1.5 cursor-pointer">
                        <Lock className="h-3.5 w-3.5 text-indigo-400" />
                        Enable ZIP Encryption (Password)
                        {premiumTier === "free" && (
                          <span className="text-[9px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Premium</span>
                        )}
                      </label>
                      <p className="text-xs text-slate-400 mt-1">
                        Secure your package with AES-256 standard encryption before sending.
                      </p>
                      
                      {enablePassword && (
                        <div className="mt-3">
                          {premiumTier === "free" ? (
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-lg flex items-start gap-2.5">
                              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-indigo-400">Unlock Password Encryption</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Encrypting PDF & ZIP outputs requires Premium Suite. Upgrading takes less than 60 seconds.</p>
                                <button 
                                  onClick={() => setLocation("/pricing")}
                                  className="mt-2 text-xs text-white font-semibold flex items-center gap-1 hover:underline"
                                >
                                  Explore pricing plans <ArrowUpRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="password"
                              placeholder="Enter encryption password"
                              value={zipPassword}
                              onChange={(e) => setZipPassword(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 mt-2"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Limits Panel */}
            {preset === "custom" && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-fadeIn">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-indigo-400" />
                  Custom Limits Manual Entry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((field) => (
                    <div key={field.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="font-bold text-xs text-white border-b border-slate-800 pb-2">{field.label}</div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor={`custom-max-size-${field.id}`} className="text-[10px] text-slate-500 font-semibold uppercase">Max Size (KB)</label>
                        <input
                          id={`custom-max-size-${field.id}`}
                          type="number"
                          value={field.maxSizeKb}
                          title={`${field.label} Max Size in KB`}
                          placeholder="e.g. 200"
                          onChange={(e) => handleCustomLimitChange(field.id, "maxSizeKb", parseInt(e.target.value) || 0)}
                          className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                      {(field.id === "photo" || field.id === "signature") && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor={`custom-width-${field.id}`} className="text-[10px] text-slate-500 font-semibold uppercase">Width (px)</label>
                            <input
                              id={`custom-width-${field.id}`}
                              type="number"
                              value={field.width || 0}
                              title={`${field.label} Width in pixels`}
                              placeholder="e.g. 200"
                              onChange={(e) => handleCustomLimitChange(field.id, "width", parseInt(e.target.value) || 0)}
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor={`custom-height-${field.id}`} className="text-[10px] text-slate-500 font-semibold uppercase">Height (px)</label>
                            <input
                              id={`custom-height-${field.id}`}
                              type="number"
                              value={field.height || 0}
                              title={`${field.label} Height in pixels`}
                              placeholder="e.g. 230"
                              onChange={(e) => handleCustomLimitChange(field.id, "height", parseInt(e.target.value) || 0)}
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={() => setActiveTab("upload")}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Uploads
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 font-semibold text-sm rounded-xl transition-all"
              >
                Preview & Pack
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Preview & Pack */}
        {activeTab === "preview" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-400" />
                  Review Package Directory
                </h2>
                <p className="text-sm text-slate-400">Verify sizes and names of your prepared scholarship documents before packing.</p>
              </div>

              {/* Files Grid Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((field) => {
                  const uploaded = uploadedFiles[field.id];
                  return (
                    <div 
                      key={field.id}
                      className={`border rounded-xl p-4 flex flex-col justify-between h-44 transition-all relative ${
                        uploaded 
                          ? uploaded.status === "success" 
                            ? "bg-slate-950 border-emerald-500/25" 
                            : "bg-slate-950 border-amber-500/25"
                          : "bg-slate-950/40 border-slate-900 border-dashed"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-white block truncate">{field.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">{getFormattedName(field)}</span>
                        </div>
                        {uploaded ? (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                            uploaded.status === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                          }`}>
                            Ready
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-800 text-slate-500 border border-slate-700/60 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                            Missing
                          </span>
                        )}
                      </div>

                      {uploaded ? (
                        <div className="flex items-center gap-3 my-2">
                          {uploaded.previewUrl ? (
                            <div className="h-16 w-16 rounded border border-slate-800 overflow-hidden bg-slate-900 shrink-0">
                              <img src={uploaded.previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-16 w-16 rounded border border-slate-800 bg-slate-900 shrink-0 flex items-center justify-center text-slate-500">
                              <FileText className="h-6 w-6" />
                            </div>
                          )}
                          <div className="text-[10px] space-y-0.5 text-slate-400">
                            <div>Original: {(uploaded.originalSize / 1024).toFixed(1)} KB</div>
                            <div className="font-semibold text-white">Processed: {(uploaded.processedSize / 1024).toFixed(1)} KB</div>
                            {uploaded.dimensions && (
                              <div>Dim: {uploaded.dimensions.width}x{uploaded.dimensions.height}px</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center my-2 text-slate-600 gap-1">
                          <Upload className="h-5 w-5 opacity-40" />
                          <span className="text-[10px]">No file uploaded</span>
                        </div>
                      )}

                      <div className="flex justify-end pt-2 border-t border-slate-900">
                        {uploaded ? (
                          <button
                            onClick={() => removeFile(field.id)}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold transition"
                          >
                            Remove file
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab("upload")}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition"
                          >
                            Upload now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400 max-w-md text-center sm:text-left">
                  <span className="font-bold text-white block mb-0.5">Ready to Generate Package</span>
                  Verify your files match all target limits before compiling. All conversions occur client-side; your files never leave your device.
                </div>
                <button
                  onClick={handlePackZip}
                  disabled={isPacking}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-glow-indigo text-sm ${
                    isPacking ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isPacking ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Packing ZIP...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Package & Generate ZIP
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-start gap-4 mt-6">
              <button
                onClick={() => setActiveTab("customize")}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Customize
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
