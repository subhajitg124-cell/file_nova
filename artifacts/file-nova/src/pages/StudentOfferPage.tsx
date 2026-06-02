import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, Copy, Gift, MessageCircle, Percent, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

export default function StudentOfferPage() {
  const [copied, setCopied] = useState(false);
  const couponCode = "STUDENT20";
  const shareLink = "https://filenova.in/pricing?coupon=STUDENT20";
  const whatsappMessage = `Hey! Get 20% off FileNova Pro/Basic Desk using coupon code: STUDENT20. Use my link to sign up: ${shareLink}`;

  const copyCoupon = async () => {
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success("Coupon code STUDENT20 copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          <UserProfileDropdown />
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-8 sm:p-12 shadow-premium card-shine text-center space-y-8 animated-lines-bg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-glow">
              <Percent className="h-8 w-8" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1.5 text-xs font-black text-sky-500 animate-pulse mt-4">
              <Sparkles className="h-3.5 w-3.5" />
              Special Student Discount
            </div>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Flat <span className="gradient-text">20% Off</span> Premium Plans
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground font-semibold sm:text-base">
              Are you preparing for exams (WBJEE, JEE, NEET, CUET) or submitting scholarship forms?
              Unlock priority download speeds, exam photo/signature crop templates, unlimited history, and completely remove ad gates!
            </p>
          </div>

          <div className="max-w-md mx-auto p-6 rounded-2xl border border-dashed border-border bg-background/50 space-y-4">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Your Discount Coupon</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center justify-center rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 font-mono text-lg font-black text-primary uppercase select-all">
                {couponCode}
              </div>
              <button
                onClick={copyCoupon}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-primary-foreground shadow-glow cursor-pointer transition transform hover:-translate-y-0.5 active:scale-95 shrink-0"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              Apply this coupon code in the checkout box on the <Link href="/pricing" className="underline text-primary">Pricing Page</Link> to get 20% off any plan immediately.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-xl mx-auto border-t border-border/40 pt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-6 py-3.5 text-xs font-black shadow-lg cursor-pointer transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <Gift className="h-4 w-4" />
              <span>Use Discount Now</span>
            </Link>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 text-xs font-black shadow-lg cursor-pointer transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
