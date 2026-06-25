import React, { useState, useEffect } from "react";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileArchive, CheckCircle, AlertTriangle, Upload, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface DocSlot {
  id: string;
  label: string;
  accept: string;
  maxSizeKb: number;
  required: boolean;
  file: File | null;
}

const INITIAL_SLOTS: DocSlot[] = [
  { id: "photo", label: "Student Photograph", accept: "image/jpeg,image/jpg", maxSizeKb: 50, required: true, file: null },
  { id: "signature", label: "Signature", accept: "image/jpeg,image/jpg", maxSizeKb: 30, required: true, file: null },
  { id: "caste", label: "Caste Certificate", accept: "application/pdf", maxSizeKb: 200, required: false, file: null },
  { id: "income", label: "Income Certificate", accept: "application/pdf", maxSizeKb: 200, required: false, file: null },
  { id: "marksheet", label: "Marksheet", accept: "application/pdf", maxSizeKb: 200, required: true, file: null },
  { id: "aadhaar", label: "Aadhaar Card", accept: "application/pdf,image/jpeg,image/jpg", maxSizeKb: 200, required: true, file: null },
  { id: "passbook", label: "Bank Passbook", accept: "application/pdf", maxSizeKb: 200, required: false, file: null },
];

export const ScholarshipZIPWorkspace: React.FC = () => {
  const {
    isProcessing,
    progress,
    result,
    error,
    handleReset: resetProcessor,
    runProcessing,
  } = useToolProcessor("scholarship-zip", "zip");

  // Local state
  const [slots, setSlots] = useState<DocSlot[]>(INITIAL_SLOTS);
  const [portal, setPortal] = useState<"nsp" | "oasis" | "mahadbt" | "custom">("nsp");
  const [rollNo, setRollNo] = useState("");
  const [zipName, setZipName] = useState("scholarship_documents.zip");
  const [autoRename, setAutoRename] = useState(true);

  // Filter out slots that have files for files array prop
  const uploadedFiles = slots.filter((s) => s.file !== null).map((s) => s.file!);
  const uploadedFileRecords = slots
    .filter((s) => s.file !== null)
    .map((s) => ({
      id: s.id,
      name: s.file!.name,
      size: s.file!.size,
      type: s.file!.type,
    }));

  const isReady = slots.every((s) => !s.required || s.file !== null);

  useEffect(() => {
    if (isReady && typeof window !== "undefined" && window.history.state?.autoProcess) {
      window.history.replaceState({ ...window.history.state, autoProcess: false }, "");
      handleProcess();
    }
  }, [slots, isReady]);

  const handleFileSlotUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const slot = slots.find((s) => s.id === id);
      
      if (slot && selectedFile.size > slot.maxSizeKb * 1024) {
        toast.error(`File size limit exceeded for ${slot.label}. Max size: ${slot.maxSizeKb}KB`);
        return;
      }

      setSlots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, file: selectedFile } : s))
      );
      toast.success(`${slot?.label} uploaded successfully.`);
    }
  };

  const handleRemoveSlotFile = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, file: null } : s))
    );
  };

  const handleProcess = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      
      for (const slot of slots) {
        if (slot.file) {
          let name = slot.file.name;
          const ext = name.split(".").pop();
          
          if (autoRename) {
            const prefix = rollNo ? `${rollNo}_` : "";
            name = `${prefix}${slot.id.toUpperCase()}.${ext}`;
          }
          
          zip.file(name, slot.file);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      await runProcessing({ outputName: zipName }, zipBlob);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate ZIP archive.");
    }
  };

  const handleReset = () => {
    setSlots(INITIAL_SLOTS);
    setRollNo("");
    resetProcessor();
  };

  const configPanel = (
    <div className="space-y-6">
      {/* Portal Selection preset */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Scholarship Portal Preset</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "nsp", label: "NSP (National)" },
            { id: "oasis", label: "OASIS (WB)" },
            { id: "mahadbt", label: "MAHA-DBT" },
            { id: "custom", label: "Custom rules" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setPortal(preset.id as any);
                if (preset.id === "nsp") {
                  setZipName("NSP_Documents.zip");
                } else if (preset.id === "oasis") {
                  setZipName("OASIS_Docs.zip");
                } else if (preset.id === "mahadbt") {
                  setZipName("MAHADBT_Docs.zip");
                }
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold hover:scale-[1.02] active:scale-98 transition-all cursor-pointer ${
                portal === preset.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card/60 hover:bg-card text-foreground/80"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suffix (Roll No / App ID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Roll No / Application ID Suffix</label>
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="e.g. 1029482"
            className="w-full bg-card/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">ZIP File Name</label>
          <input
            type="text"
            value={zipName}
            onChange={(e) => setZipName(e.target.value)}
            placeholder="scholarship_documents.zip"
            className="w-full bg-card/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
          />
        </div>
      </div>

      {/* Auto Rename Option */}
      <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-foreground/80">
        <input
          type="checkbox"
          checked={autoRename}
          onChange={(e) => setAutoRename(e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
        />
        <span>Auto-rename files to portal specification (e.g. PHOTO.jpg)</span>
      </label>

      {/* Information Banner */}
      <div className="bg-card/60 border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground leading-relaxed font-medium">
        <span>✅</span>
        <p>
          All operations run client-side. Your uploaded files never leave your device. Naming specifications are automatically applied.
        </p>
      </div>
    </div>
  );

  const previewPanel = (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Checklist & Document slots</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slots.map((slot) => {
          const hasFile = slot.file !== null;
          return (
            <div
              key={slot.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                hasFile
                  ? "border-primary/25 bg-primary/5 text-foreground"
                  : slot.required
                    ? "border-destructive/20 bg-destructive/5 text-foreground/80"
                    : "border-border bg-card/80 text-muted-foreground"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${hasFile ? "text-primary" : slot.required ? "text-destructive" : "text-muted-foreground/80"}`}>
                    {slot.required ? "Required" : "Optional"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/80 font-mono">Max {slot.maxSizeKb}KB</span>
                </div>
                <h4 className="text-xs font-bold text-foreground/90 mt-1 truncate">{slot.label}</h4>
                {hasFile && (
                  <p className="text-[9px] text-muted-foreground font-mono mt-0.5 truncate">{slot.file!.name}</p>
                )}
              </div>
              
              <div className="shrink-0 flex items-center gap-2">
                {hasFile ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlotFile(slot.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer text-xs font-black"
                  >
                    Remove
                  </button>
                ) : (
                  <label className="px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border text-foreground text-[10px] font-black rounded-lg transition-all cursor-pointer">
                    Upload
                    <input
                      type="file"
                      accept={slot.accept}
                      onChange={(e) => handleFileSlotUpload(slot.id, e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <ToolWorkspace
      toolName="Scholarship ZIP Maker"
      toolDescription="Arrange all required scholarship application documents, rename them automatically, and pack them into a portal-compliant ZIP archive."
      toolIcon={<FileArchive className="h-5 w-5" />}
      accentColor="lime"
      configPanel={configPanel}
      previewPanel={previewPanel}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleReset}
      maxFiles={slots.length}
      onFilesSelected={() => {}}
      files={uploadedFileRecords}
      error={error}
    />
  );
};
export default ScholarshipZIPWorkspace;
