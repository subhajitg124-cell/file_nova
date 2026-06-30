import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle } from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useTranslation } from "@/lib/i18n";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
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
            <span className="text-sm font-semibold text-muted-foreground hidden sm:inline-block">FileNova Security</span>
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 shadow-premium card-shine space-y-8 animated-lines-bg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-glow">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl mt-4">
              {tText("Privacy Policy")}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              {tText("Last Updated: June 30, 2026")}
            </p>
          </div>

          <div className="border-t border-border/40 pt-8 space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {/* Core Principle Banner */}
            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-base">
                <Lock className="h-5 w-5" />
                <h3>{tText("Our Core Security Promise")}</h3>
              </div>
              <p className="text-sm font-medium">
                {tText("FileNova is engineered with a strict client-side-first architecture. This means the vast majority of our document editing, cropping, compression, and formatting tools process your files directly inside your browser cache. Sensitive personal document files are handled 100% locally in your browser and are NEVER uploaded to our servers.")}
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">1.</span> {tText("Information We Collect")}
              </h2>
              <p>
                {tText("We believe in minimal data collection. We only collect the minimal personal information necessary to manage billing transactions, referrals, and user login accounts:")}
              </p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>
                  <strong className="text-foreground">{tText("Account Information:")}</strong> {tText(" If you choose to register (via email or Google OAuth), we store your name and email address to maintain your profile and premium subscription.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("Payment & Billing references:")}</strong> {tText(" When purchasing premium subscription tiers (via Razorpay or UPI payment forms), transaction reference IDs, UTRs, and payment state are linked to your profile to verify activation.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("System Usage Metadata:")}</strong> {tText(" Anonymous performance stats (such as language selection and button clicks) are recorded to optimize UI rendering.")}
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">2.</span> {tText("How Your Files are Handled")}
              </h2>
              <p>
                {tText("We separate document handling into two specific pipelines to respect your privacy:")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <h4>{tText("100% Browser-Local Processing")}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tText("Sensitive workflows (including Aadhaar masking, PAN Card resizing, image compression, PDF splits/merges, and Fast OCR) run locally inside browser memory using WebAssembly. Files never leave your device.")}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <h4>{tText("Secure Server-Assisted Conversion")}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tText("For formats requiring external software layers (such as Word to PDF conversion, video operations, or Accurate AI OCR), files are sent via secure TLS transit, processed, and immediately purged within 1 hour.")}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">3.</span> {tText("Cookies & Analytics")}
              </h2>
              <p>
                {tText("FileNova uses cookies and LocalStorage to improve performance. We do not use third-party tracking pixels or run advertising networks on this site. Essential settings (language, active theme, and session tokens) are stored in your browser. With your explicit consent, anonymous Google Analytics cookies are loaded to monitor application performance.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">4.</span> {tText("GDPR Compliance (EU & International)")}
              </h2>
              <p>
                {tText("For users in the European Union, FileNova processes personal data under the following legal bases:")}
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li>{tText("Consent: For optional performance tracking cookies (Google Analytics).")}</li>
                <li>{tText("Contract Performance: For profile creation, login sessions, and premium subscription billing.")}</li>
              </ul>
              <p className="text-xs mt-2">
                {tText("Under the GDPR, you have the right to request erasure of your account details, access your recorded transaction history, or object to data processing. These requests can be filed by contacting our support team.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">5.</span> {tText("DPDPA Compliance (India)")}
              </h2>
              <p>
                {tText("In compliance with India's Digital Personal Data Protection Act (DPDPA), FileNova acts as the Data Fiduciary for your account profile data:")}
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li>{tText("Purpose Limitation: Account details are exclusively used to authorize dashboard access.")}</li>
                <li>{tText("Browser Processing: Personal documents (Aadhaar cards, PAN cards, etc.) are processed locally in your browser memory and are not compiled or stored by FileNova.")}</li>
                <li>{tText("Correction & Erasure: Indian users have the right to review, update, or completely delete their account profile at any time.")}</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">6.</span> {tText("Data Security")}
              </h2>
              <p>
                {tText("We utilize secure SSL/TLS encryption protocols for all API communications, enforce session token hashing, and perform regular purging of backend temp files. While no transmission is completely immune to risks, we implement maximum architectural isolation to defend your document privacy.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">7.</span> {tText("Contact Information")}
              </h2>
              <p>
                {tText("If you wish to execute your rights under GDPR/DPDPA, report an issue, or clear your profile data, please contact our support email directly at ")}
                <a href="mailto:subhajiteditz90@gmail.com" className="text-indigo-400 hover:underline">subhajiteditz90@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
