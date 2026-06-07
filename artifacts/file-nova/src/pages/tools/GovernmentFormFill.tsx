import React, { useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { useFileStore } from "@/store/useFileStore";
import { UploadZone } from "@/components/workspace/UploadZone";
import { FileText, Download, CheckCircle2 } from "lucide-react";

export default function GovernmentFormFillPage() {
  useEffect(() => {
    const store = useFileStore.getState();
    store.clearStore();
    store.setSelectedSection("pdf");
    store.setOperation("edit");
  }, []);

  const templates = [
    { name: "Aadhaar Card Enrollment/Correction Form", url: "https://uidai.gov.in/images/aadhaar_enrolment_correction_form_version_2.1.pdf" },
    { name: "PAN Card Form 49A (Indian Citizens)", url: "https://www.tin-nsdl.com/downloads/pan/download/Form49A_NSDL%20e-Gov_05.09.2016.pdf" },
    { name: "Passport Application Form (Print-only Template)", url: "https://www.passportindia.gov.in/AppOnlineProject/pdf/Passport_Application_Form_Main_English_V1.0.pdf" },
    { name: "NSP Scholarship Bonafide Student Certificate", url: "https://scholarships.gov.in/public/FAQ/BonafideCertificate.pdf" }
  ];

  return (
    <ToolPageLayout slug="government-form-fill">
      <div className="space-y-8">
        {/* Step 1: Upload fillable PDF */}
        <div className="bg-card/30 border border-border/60 rounded-3xl p-6">
          <h3 className="font-extrabold text-sm text-foreground mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">1</span>
            Upload fillable PDF form or select template below
          </h3>
          <UploadZone allowedCategory="pdf" />
        </div>

        {/* Templates List */}
        <div className="bg-card/30 border border-border/60 rounded-3xl p-6">
          <h3 className="font-extrabold text-sm text-foreground mb-4 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">2</span>
            Or download common Indian Government Forms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl, idx) => (
              <a
                key={idx}
                href={tmpl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-slate-900/10 dark:bg-slate-900/40 border border-border/80 hover:border-indigo-500/40 rounded-2xl transition duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-foreground truncate">{tmpl.name}</span>
                </div>
                <Download className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-y-0.5 transition-all shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Detailed Guidelines Block */}
        <div className="bg-slate-900/10 dark:bg-slate-900/45 border border-border/60 rounded-3xl p-6 space-y-4">
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
