import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Cookie, Info, CheckCircle } from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { useTranslation } from "@/lib/i18n";
import Footer from "@/components/Footer";

export default function CookiePolicy() {
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
            <span className="text-sm font-semibold text-muted-foreground hidden sm:inline-block">FileNova Cookies</span>
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 shadow-premium card-shine space-y-8 animated-lines-bg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-glow">
              <Cookie className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl mt-4">
              {tText("Cookie Policy")}
            </h1>
            <p className="text-xs text-muted-foreground font-semibold">
              {tText("Last Updated: June 30, 2026")}
            </p>
          </div>

          <div className="border-t border-border/40 pt-8 space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">1.</span> {tText("What are Cookies & Local Storage?")}
              </h2>
              <p>
                {tText("Cookies and local web storage are small files placed on your device to store temporary variables, credentials, preferences, and custom application configurations. They help the website function efficiently and remember your selections on subsequent visits.")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">2.</span> {tText("How FileNova Uses Local Storage & Cookies")}
              </h2>
              <p>
                {tText("We utilize LocalStorage (and session cookies where appropriate) to provide a seamless document processing workspace. We do NOT run tracking cookies from advertising networks, third-party pixel beacons, or data brokers. Here is a breakdown of our storage:")}
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="p-5 rounded-2xl border border-border bg-background/50 space-y-2">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">{tText("1. Essential Session Variables")}</h3>
                  <p className="text-xs">
                    {tText("Includes variables for checking user login sessions, Google OAuth state tokens, and routing settings. These are mandatory for the premium suite, dashboard, and billing features.")}
                  </p>
                </div>
                
                <div className="p-5 rounded-2xl border border-border bg-background/50 space-y-2">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">{tText("2. Application Settings (LocalStorage)")}</h3>
                  <p className="text-xs">
                    {tText("Variables such as your selected language (English, Hindi, Bengali, Tamil, Telugu, etc.), active theme selections, and cached coupon codes to optimize layout rendering.")}
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-background/50 space-y-2">
                  <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">{tText("3. Performance & Analytics Cookies")}</h3>
                  <p className="text-xs">
                    {tText("If you grant consent, we load Google Analytics (gtag) using anonymous IDs to compile statistical data about site usage and tool speed. No data is shared with advertisers or third parties.")}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400">3.</span> {tText("Managing Storage & Consent")}
              </h2>
              <p>
                {tText("You can control or clear cookies and LocalStorage through your web browser's configuration settings. Alternatively, you can click 'Cookie Settings' in the footer at any time to reopen the consent banner and adjust your choices. Note that clearing LocalStorage completely will sign you out and reset your document tool history, preferred language selections, and offline workspace configs.")}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
