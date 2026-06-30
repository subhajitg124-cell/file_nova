import React from "react";
import { Shield, EyeOff, Trash2, Key, Server, Lock, Laptop, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Security: React.FC = () => {
  const { tText } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--fn-bg)] text-[var(--fn-text-primary)] transition-colors duration-300">
      <Navbar showSearch={false} />
      
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-glow">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl mt-4">
              {tText("Security & Document Privacy")}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              {tText("Last Updated: June 30, 2026")}
            </p>
          </div>

          {/* Privacy Alert banner */}
          <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-base">
              <Lock className="h-5 w-5" />
              <h3>{tText("Your Files, Your Privacy")}</h3>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {tText("At FileNova, we believe that security should be built directly into the design. Traditional tools upload every file you process to remote servers. We take a different route: processing sensitive documents locally inside your web browser using WebAssembly. This ensures personal identifiers remain completely private.")}
            </p>
          </div>

          {/* Architecture Section */}
          <div className="border-t border-border/40 pt-8 space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
            
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">1.</span> {tText("Our Isolated Processing Pipelines")}
              </h2>
              <p>
                {tText("To give you absolute transparency, we divide our file processing into two distinct categories:")}
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2 mt-4">
                
                {/* Local Card */}
                <div className="p-5 rounded-2xl border border-border bg-background/50 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <Laptop className="h-5 w-5" />
                      <h4>{tText("Local-Only (100% Client-Side)")}</h4>
                    </div>
                    <p className="text-xs leading-normal">
                      {tText("Processed entirely inside your browser's sandboxed environment via WebWorkers and compiled WebAssembly binaries. Your files are never uploaded or transmitted over the internet.")}
                    </p>
                    <div className="border-t border-border/40 pt-2.5">
                      <span className="block text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider mb-1.5">{tText("Applies to:")}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["Aadhaar Masking", "PAN Card Resizing", "PDF Compression (Local)", "PDF Merge/Split/Rotate", "Image Crop/Resize", "Fast OCR (Browser Mode)"].map((tag) => (
                          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-border bg-card/60 text-foreground/80">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Server-Assisted Card */}
                <div className="p-5 rounded-2xl border border-border bg-background/50 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Server className="h-5 w-5" />
                      <h4>{tText("Server-Assisted Conversion")}</h4>
                    </div>
                    <p className="text-xs leading-normal">
                      {tText("For formats requiring proprietary or system-level compilation (e.g., LibreOffice rendering or advanced video compression), files are securely transmitted to our API server, compiled, and immediately purged.")}
                    </p>
                    <div className="border-t border-border/40 pt-2.5">
                      <span className="block text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider mb-1.5">{tText("Applies to:")}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["Word/Excel to PDF", "FFmpeg Video Ops", "Accurate OCR (Premium Mode)", "AI PPT Creator"].map((tag) => (
                          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-border bg-card/60 text-foreground/80">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Storage Purge Rules */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">2.</span> {tText("1-Hour Server Purge Protocol")}
              </h2>
              <div className="flex gap-4 items-start bg-card/40 p-4 border border-border rounded-2xl">
                <Trash2 className="h-5 w-5 text-indigo-500 shrink-0 mt-1" />
                <p className="text-xs leading-normal">
                  {tText("For server-assisted tools, we enforce a strict 1-hour retention limit. Uploaded files, conversion artifacts, and temporary caching paths are permanently deleted from our server directories within 1 hour. We do not inspect, catalog, index, or parse the content of your files, and no human operators have access to this temp buffer.")}
                </p>
              </div>
            </section>

            {/* Encryption & Credentials */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">3.</span> {tText("Transit & API Security")}
              </h2>
              <p>
                {tText("To protect metadata and transactions, we enforce the following security baselines:")}
              </p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>
                  <strong className="text-foreground">{tText("Transport Layer Security:")}</strong> {tText(" All file transfers to and from our conversion server are encrypted using TLS 1.3 to protect against interceptors on the wire.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("Secure OAuth Integrations:")}</strong> {tText(" We use official Google Identity Services APIs. We do not store or see your Google account password.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("Grievance Officer:")}</strong> {tText(" Any security concerns, deletion requests, or technical inquiries can be directed to subhajiteditz90@gmail.com.")}
                </li>
              </ul>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Security;
