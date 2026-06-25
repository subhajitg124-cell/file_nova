import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { UploadZone } from "@/components/workspace/UploadZone";
import { ToolWorkspace } from "@/components/workspace/ToolWorkspace";
import { useToolProcessor } from "@/hooks/useToolProcessor";
import { FileText, Download, CheckCircle2, ClipboardEdit } from "lucide-react";

const templates = [
  { name: "Aadhaar Card Enrollment/Correction Form", url: "https://uidai.gov.in/images/aadhaar_enrolment_correction_form_version_2.1.pdf" },
  { name: "PAN Card Form 49A (Indian Citizens)", url: "https://www.tin-nsdl.com/downloads/pan/download/Form49A_NSDL%20e-Gov_05.09.2016.pdf" },
  { name: "Passport Application Form (Print-only Template)", url: "https://www.passportindia.gov.in/AppOnlineProject/pdf/Passport_Application_Form_Main_English_V1.0.pdf" },
  { name: "NSP Scholarship Bonafide Student Certificate", url: "https://scholarships.gov.in/public/FAQ/BonafideCertificate.pdf" }
];

function GovernmentFormFillWorkspace() {
  const {
    files,
    rawFiles,
    isProcessing,
    isUploading,
    progress,
    result,
    error,
    handleFilesSelected,
    handleReset,
    runProcessing,
  } = useToolProcessor("government-form-fill", "edit");

  const isReady = files.length > 0;

  const handleProcess = async () => {
    await runProcessing({});
  };

  const configPanel = (
    <div className="space-y-6">
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-2.5 text-xs text-muted-foreground font-medium">
        <ClipboardEdit className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground/80">Government Form Fill</p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Upload a fillable PDF form. Once uploaded, you can fill in the fields and download the completed form.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-3 text-xs text-muted-foreground">
        <p className="font-bold text-foreground/80">Supported Form Types</p>
        <ul className="text-[10px] mt-1.5 space-y-1 list-disc list-inside">
          <li>Fillable PDF forms with editable fields</li>
          <li>Aadhaar, PAN, Passport, Scholarship forms</li>
          <li>Government application templates</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Input</p>
          <p className="text-sm font-bold text-foreground mt-1">.pdf</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-3.5 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Output</p>
          <p className="text-sm font-bold text-primary mt-1">.pdf</p>
        </div>
      </div>
    </div>
  );

  return (
    <ToolWorkspace
      toolName="Government Form Fill"
      toolDescription="Fill and complete Indian government PDF forms."
      toolIcon={<ClipboardEdit className="h-5 w-5" />}
      accentColor="indigo"
      configPanel={configPanel}
      previewPanel={null}
      onProcess={handleProcess}
      isProcessing={isProcessing}
      isUploading={isUploading}
      progress={progress}
      isReady={isReady}
      resultFile={result}
      onReset={handleReset}
      maxFiles={1}
      acceptedTypes={[".pdf"]}
      onFilesSelected={handleFilesSelected}
      files={files}
      error={error}
    />
  );
}

export default function GovernmentFormFillPage() {
  const files = useFileStore((s) => s.files);

  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  if (files.length > 0) {
    return <GovernmentFormFillWorkspace />;
  }

  return (
    <ToolPageLayout slug="government-form-fill">
      <div className="space-y-8">
        <div className="bg-card/30 border border-border/60 rounded-3xl p-6">
          <h3 className="font-extrabold text-sm text-foreground mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
            Upload fillable PDF form or select template below
          </h3>
          <UploadZone allowedCategory="pdf" />
        </div>

        <div className="bg-card/30 border border-border/60 rounded-3xl p-6">
          <h3 className="font-extrabold text-sm text-foreground mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
            Or download common Indian Government Forms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl, idx) => (
              <a
                key={idx}
                href={tmpl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-muted/50 border border-border hover:border-primary/40 rounded-2xl transition duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xs font-bold text-foreground truncate">{tmpl.name}</span>
                </div>
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-y-0.5 transition-all shrink-0" />
              </a>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 border border-border/60 rounded-3xl p-6 space-y-4">
          <h3 className="font-black text-sm text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Digital Verification & KYC Upload Guidelines (India)
          </h3>
          <ul className="text-xs text-muted-foreground space-y-2.5 list-disc list-inside">
            <li><strong>DigiLocker Integration:</strong> Ensure the filled form contains accurate identity details exactly matching your Aadhaar card for quick digital lockers verification.</li>
            <li><strong>KYC uploads:</strong> For IRCTC, NPS, banking, or passport verification, upload standard PDFs under 1MB or 2MB as required by specific portals.</li>
            <li><strong>Regional languages:</strong> Supports Unicode text input allowing regional language forms (Hindi, Bengali, Marathi, etc.) to be filled correctly.</li>
          </ul>
        </div>
      </div>
    </ToolPageLayout>
  );
}
