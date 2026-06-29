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
              {tText("Last Updated: June 10, 2026")}
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
                {tText("FileNova is engineered with a strict client-side-first architecture. This means 95%+ of our document editing, cropping, compression, and formatting tools process your files directly inside your browser cache. Your documents never touch our servers unless explicitly requested (such as for specialized AI translation or OCR services).")}
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">1.</span> {tText("Information We Collect")}
              </h2>
              <p>
                {tText("We believe in minimal data collection. The only information we collect is what is necessary to provide you with secure access to our premium tier and maintain system security:")}
              </p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>
                  <strong className="text-foreground">{tText("Account Information:")}</strong> {tText(" If you register for an account (via Google OAuth or email), we collect your email address, name, and profile photo.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("Payment Details:")}</strong> {tText(" For UPI or card subscription purchases, transaction IDs and billing reference IDs are stored securely by our billing partners (e.g. Razorpay/UPI gateway providers) and referenced in our database to activate your subscription tier.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("Usage Logs:")}</strong> {tText(" Anonymous usage stats (e.g., button clicks, language selections) to help improve user experience.")}
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">2.</span> {tText("How Your Files are Handled")}
              </h2>
              <p>
                {tText("Unlike traditional document tools that upload files to remote servers, FileNova processes your sensitive documents (like Aadhaar cards, PAN cards, passport photos, and school marksheets) locally:")}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <h4>{tText("Local Browser Processing")}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tText("Image resizing, PDF merging, splits, rotations, and scholarship packing run locally inside your browser using WebAssembly. Files never leave your computer.")}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-background/50">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <h4>{tText("Immediate Deletion")}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tText("If any cloud tool requires temp upload, processed files are automatically purged from browser storage and server temp cache within 1 hour.")}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">3.</span> {tText("Cookies, Google Ads & Third-Party Analytics")}
              </h2>
              <p>
                {tText("FileNova uses cookies and LocalStorage to optimize user experience. These include essential cookies (to keep you logged in and track session state), analytics cookies, and Google Adsense advertising cookies:")}
              </p>
              <ul className="list-disc pl-6 space-y-2 font-medium">
                <li>
                  <strong className="text-foreground">{tText("Google AdSense & DoubleClick Cookie:")}</strong> {tText(" As a third-party vendor, Google uses cookies to serve ads on FileNova. Google's use of the DoubleClick cookie enables it and its partners to serve ads to our users based on their visits to our site and other sites on the Internet.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("Opt-Out Options:")}</strong> {tText(" Users may opt out of personalized advertising by visiting Google Ads Settings (https://www.google.com/settings/ads) or through consent options on our cookie banner.")}
                </li>
                <li>
                  <strong className="text-foreground">{tText("Google OAuth & Cloud Sync (Drive/Dropbox):")}</strong> {tText(" If you log in via Google or link your cloud storage, we only use necessary permissions to read/write files as requested. We never access, store, or share unauthorized private files or data.")}
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">4.</span> {tText("Data Security")}
              </h2>
              <p>
                {tText("We utilize standard industry practices, including SSL/TLS encryption for all api-server communication, secure OAuth login integrations, and database hashing to safeguard your credentials. No method of transmission over the Internet is 100% secure, but we apply extreme security protocols to protect your billing accounts.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">5.</span> {tText("Contact Information")}
              </h2>
              <p>
                {tText("If you have any questions about this Privacy Policy or file security, please email us directly at ")}
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
