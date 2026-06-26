/**
 * SEOPhotoCompressor Component
 * Hyper-local SEO optimized landing page for compressing and resizing photos to legal bounds (e.g., PAN Card photo to 50KB).
 * Dynamically injects search engine metadata and embeds the offline resizing workspace.
 */

import React, { useEffect } from "react";
import { Link } from "wouter";
import ResizePhotoWorkspace from "@/tools/image/ResizePhotoWorkspace";
import { ChevronLeft, Info, HelpCircle, BookOpen, AlertCircle } from "lucide-react";

export default function SEOPhotoCompressor() {
  // Inject SEO metadata and JSON-LD structured schema on mount
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "PAN Card Photo Resizer & Compressor Online (Under 50KB) | FileNova";

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute("content") : "";
    
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Resize and compress PAN Card photographs to exact legal dimensions (3.5cm x 2.5cm, under 50KB, 200 DPI) online. Secure, fast, and 100% client-side offline formatting.");

    // Inject HowTo Schema markup
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "seo-howto-pan-card";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Resize and Compress PAN Card Photo to 50KB Online",
      "description": "Step-by-step instructions to format passport photos for NSDL or UTIITSL PAN Card applications under 50KB.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Upload Photograph",
          "text": "Select your portrait image file from your computer or phone."
        },
        {
          "@type": "HowToStep",
          "name": "Select Standard Dimensions",
          "text": "Set width to 35mm (or 2.5cm) and height to 45mm (or 3.5cm) with a white background."
        },
        {
          "@type": "HowToStep",
          "name": "Download JPEG File",
          "text": "Click 'Resize Photo' to crop and export a compressed JPEG file under 50KB."
        }
      ],
      "totalTime": "PT1M"
    });
    document.head.appendChild(script);

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute("content", originalDesc);
      }
      const existingScript = document.getElementById("seo-howto-pan-card");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-sky-950/20 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[15%] left-[-5%] w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header info */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" />
          FileNova Home
        </Link>
        <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
          Client-Side Resizer
        </span>
      </header>

      {/* Structured Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 lg:py-12 space-y-12 relative z-10 w-full">
        {/* Banner Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            PAN Card Photo Resizer & Compressor Online
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Format your passport photograph to the exact NSDL & UTIITSL specifications (3.5 cm x 2.5 cm, strictly under 50KB) dynamically in your browser. Files process 100% offline for complete privacy.
          </p>
        </div>

        {/* Embedded Resizer Tool Workspace */}
        <div className="rounded-3xl border border-white/[0.06] bg-slate-900/20 p-1 shadow-2xl backdrop-blur-sm">
          <ResizePhotoWorkspace />
        </div>

        {/* Informational SEO Content Layout (For search indexers) */}
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto pt-6 text-left">
          
          {/* Table: Specifications comparison */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-6 space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-sky-400" />
              PAN Card Photo Specifications (2026)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-white/[0.05] bg-slate-950">
              <table className="w-full text-xs">
                <thead className="bg-white/[0.02] font-bold text-slate-400 border-b border-white/[0.05]">
                  <tr>
                    <th className="px-4 py-3">Parameter</th>
                    <th className="px-4 py-3">NSDL / UTIITSL Guideline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  {[
                    { key: "Physical Dimensions", val: "3.5 cm × 2.5 cm (35 mm × 25 mm)" },
                    { key: "Max File Size", val: "Strictly under 50 KB (JPEG format)" },
                    { key: "Min Resolution", val: "200 DPI (dots per inch)" },
                    { key: "Background Color", val: "Solid white or light blue background" },
                    { key: "Signature Dimensions", val: "2.0 cm × 4.5 cm (under 50 KB)" },
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 font-bold">{row.key}</td>
                      <td className="px-4 py-3">{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 items-start bg-sky-500/5 border border-sky-500/10 rounded-xl p-3.5 text-[11px] text-sky-300 leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Make sure your photo does not contain stamps or writing. Uploading blurry or colored background images may cause application rejection.</span>
            </div>
          </div>

          {/* Guide: Step-by-Step Instructions */}
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-6 space-y-4">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-sky-400" />
              How to Format Your Photograph online
            </h2>
            <ol className="space-y-4 text-xs text-slate-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-sky-500/15 border border-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">1</span>
                <div>
                  <h3 className="font-bold text-white">Select and Upload Portrait</h3>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">Choose your photo file in the dropzone above. The file remains client-side.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-sky-500/15 border border-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">2</span>
                <div>
                  <h3 className="font-bold text-white">Select Custom setup</h3>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">Click 'Custom Setup'. Set the physical unit to mm, Width to 25, and Height to 35. Set resolution to 300 DPI.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-sky-500/15 border border-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">3</span>
                <div>
                  <h3 className="font-bold text-white">Adjust Quality and Compile</h3>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">Drag the compression slider to set target size bounds under 50KB, then click 'Resize Photo'.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-6 pt-6 text-left">
          <h2 className="text-xl font-black text-white text-center flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5 text-sky-400" />
            Frequently Asked Questions (FAQ)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                q: "What is the standard size of a PAN card photo?",
                a: "The legal size requirement is 3.5 cm height by 2.5 cm width (35mm x 25mm), with a file size between 10KB and 50KB in JPEG format."
              },
              {
                q: "Why is 200 DPI required for PAN cards?",
                a: "NSDL/UTIITSL scanning systems require a minimum of 200 DPI print density to ensure applicant details scan clearly on the printed physical card."
              },
              {
                q: "Is FileNova secure for government forms?",
                a: "Absolutely. FileNova runs processing algorithms locally in your browser sandbox using Canvas APIs. Your documents never upload to any external servers."
              },
              {
                q: "How can I reduce image size under 50KB?",
                a: "Upload your image and slide our 'Quality' setting down to 80-90%. This will compress file size without compromising visual legibility."
              }
            ].map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-white/[0.05] bg-slate-900/20 p-5 space-y-1.5">
                <h3 className="text-xs font-bold text-white">❓ {faq.q}</h3>
                <p className="text-[11px] text-slate-405 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
