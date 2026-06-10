import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Scale, FileText, CheckCircle, HelpCircle } from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useTranslation } from "@/lib/i18n";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  const { tText } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            {tText("Back to Tools")}
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground hidden sm:inline-block">FileNova Terms</span>
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 shadow-premium card-shine space-y-8 animated-lines-bg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-glow">
              <Scale className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl mt-4">
              {tText("Terms of Service")}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              {tText("Last Updated: June 10, 2026")}
            </p>
          </div>

          <div className="border-t border-border/40 pt-8 space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">1.</span> {tText("Acceptance of Terms")}
              </h2>
              <p>
                {tText("By accessing or using FileNova.in (\"FileNova\", \"we\", \"us\", or \"our\"), you agree to be bound by these Terms of Service. If you do not agree, please do not access or use our services. These terms apply to all visitors, registered accounts, cyber kiosk operators, and premium subscription members.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">2.</span> {tText("Description of Service")}
              </h2>
              <p>
                {tText("FileNova provides specialized document automation tools including PDF converters, image resizers (such as PAN cards and passport photo dimensions), Aadhaar masking, text extraction (OCR), and scholarship packing. Free access includes up to 3 document processing operations per day, which can be upgraded to our Premium Desk (Basic, Pro, or Elite plans) for unlimited access and enhanced features.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">3.</span> {tText("User Conduct & Intellectual Property")}
              </h2>
              <p>
                {tText("You are responsible for your usage of the tools. You agree not to use FileNova for any illegal purposes or to process fraudulent documents. FileNova does not store your generated documents, and we have zero visibility over your private files. All intellectual property rights of the software design, tools, and branding remain solely owned by FileNova.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">4.</span> {tText("Refund & Cancellation Policy")}
              </h2>
              <p>
                {tText("Our subscription fees are charged on a monthly or yearly basis to cover API hosting, OCR server instances, and developer operations. Please read our guidelines on payment refunds:")}
              </p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>
                  {tText("Since we provide instantaneous activation and free usage limits for testing, we generally do not offer refunds once a payment is processed unless there is a confirmed billing duplicate.")}
                </li>
                <li>
                  {tText("You can cancel your recurring premium subscription at any time via your Profile Page or by emailing customer support. Your access will remain active until the end of your current paid billing period.")}
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">5.</span> {tText("Disclaimer of Warranties")}
              </h2>
              <p>
                {tText("FileNova is provided on an \"AS IS\" and \"AS AVAILABLE\" basis. While we strive to ensure 100% precision for critical documents (like government-regulated crop templates for NSDL and photo formats), we do not warrant that output dimensions will match future site specifications of third-party portals exactly. Please double-check cropped files before final submission.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">6.</span> {tText("Limitation of Liability")}
              </h2>
              <p>
                {tText("Under no circumstances shall FileNova, its founder Subhajit Ghosh, or its operators be liable for any direct, indirect, incidental, or consequential damages resulting from document processing failures, portal rejections, or account subscription issues.")}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
