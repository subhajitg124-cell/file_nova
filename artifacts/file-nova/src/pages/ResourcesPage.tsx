import React from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Server,
  Palette,
  Printer,
  Fingerprint,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Cpu,
  BadgeAlert
} from "lucide-react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

interface ResourceCardProps {
  title: string;
  category: string;
  tag: string;
  tagColor: string;
  desc: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  icon: React.ReactNode;
  popular?: boolean;
}

function ResourceCard({
  title,
  category,
  tag,
  tagColor,
  desc,
  features,
  ctaText,
  ctaUrl,
  icon,
  popular
}: ResourceCardProps) {
  return (
    <div className={`relative flex flex-col justify-between rounded-3xl border p-6 transition duration-300 ${popular ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40 shadow-premium hover:shadow-panel"}`}>
      {popular && (
        <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-glow">
          ⭐ Operator Essential
        </span>
      )}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="rounded-2xl bg-background border border-border p-3 text-primary shadow-sm">
            {icon}
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${tagColor}`}>
            {tag}
          </span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">{category}</p>
        <h3 className="mt-1.5 text-lg font-black text-foreground">{title}</h3>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        
        <ul className="mt-5 space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-6 pt-5 border-t border-border/50">
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition cursor-pointer ${popular ? "bg-primary text-primary-foreground hover:opacity-90 shadow-glow" : "bg-secondary text-foreground hover:bg-muted border border-border"}`}
        >
          <span>{ctaText}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const recommendations: ResourceCardProps[] = [
    {
      title: "Hostinger Web Hosting",
      category: "Digital Desk & Portfolios",
      tag: "Best Deal",
      tagColor: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
      desc: "Set up a professional website or digital shopfront for your CSC cyber cafe. Hostinger offers fast server speeds, easy-to-use WordPress tools, and a free custom domain.",
      features: [
        "Free Custom Domain Name (.in / .com)",
        "Free Unlimited SSL Certificates",
        "99.9% Uptime Guarantee",
        "24/7 Premium Local Support"
      ],
      ctaText: "Get Hosting Deal (75% Off)",
      ctaUrl: "https://www.hostinger.in/",
      icon: <Server className="h-6 w-6" />,
      popular: true
    },
    {
      title: "Canva Pro",
      category: "Design & Custom Forms",
      tag: "Student Choice",
      tagColor: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
      desc: "Perfect for designing high-fidelity resumes, passport photo layouts, custom flyers, certificates, and crop borders. Unlock premium templates, fonts, and one-click background removers.",
      features: [
        "100M+ Premium Photos & Videos",
        "One-Click Image Background Remover",
        "Resize designs instantly for prints",
        "Custom Brand Kits & Fonts"
      ],
      ctaText: "Try Canva Pro Free",
      ctaUrl: "https://www.canva.com/",
      icon: <Palette className="h-6 w-6" />
    },
    {
      title: "EcoTank Inkjet Printers",
      category: "High-Volume Hardware",
      tag: "Cafe Classic",
      tagColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      desc: "Minimize your cost per page for student assignments and government application printouts. EcoTank printers offer ultra-low-cost color prints with easy ink refills.",
      features: [
        "Ultra-low-cost printing (9 paise/page)",
        "Wi-Fi connectivity for mobile prints",
        "Fast scan-to-PDF desk workflows",
        "High bottle yield (up to 7,500 pages)"
      ],
      ctaText: "View Printers on Amazon",
      ctaUrl: "https://www.amazon.in/s?k=ecotank+printer",
      icon: <Printer className="h-6 w-6" />
    },
    {
      title: "Biometric Scanners & e-Sign",
      category: "Identity & Portal Auth",
      tag: "CSC Mandatory",
      tagColor: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
      desc: "Required for Aadhaar Enabled Payment System (AePS), PMGDISHA, DigiLocker, and state e-district portals. Secure high-durability optical fingerprint scanners (Mantra/Morpho).",
      features: [
        "UIDAI RD Service approved scanners",
        "Plug-and-play USB & OTG support",
        "Perfect for PM-Kisan authentication",
        "High-performance biometric matching"
      ],
      ctaText: "Shop Scanners on Amazon",
      ctaUrl: "https://www.amazon.in/s?k=mantra+mfs100+scanner",
      icon: <Fingerprint className="h-6 w-6" />
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            Back to FileNova
          </Link>
          <UserProfileDropdown />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          Monetization & Affiliate Resources
        </div>
        <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto">
          Digital Operator & <span className="gradient-text">Student Resources</span>
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground font-semibold max-w-2xl mx-auto">
          Handpicked services, hardware, and design assets to help you run a high-earning cyber cafe, optimize prints, or publish your student portfolios.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((rec, idx) => (
            <ResourceCard key={idx} {...rec} />
          ))}
        </div>
      </section>

      {/* Support / Donation Section */}
      <section className="border-t border-border bg-background px-4 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h3 className="text-lg font-black text-foreground flex items-center justify-center gap-2">
              <span>☕ Support FileNova Project</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
              FileNova is built to keep Indian document utilities accessible and ad-free. If our platform saves you money on premium PDF tools, consider supporting our work!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="upi://pay?pa=subhajitgho123-1@oksbi&pn=FileNova&am=10"
              className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-5 py-2.5 text-xs font-black hover:border-amber-500/40 hover:bg-amber-500/5 transition cursor-pointer"
            >
              <span>☕ Buy Chai (₹10)</span>
            </a>
            <a
              href="upi://pay?pa=subhajitgho123-1@oksbi&pn=FileNova&am=50"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground hover:opacity-90 shadow-glow cursor-pointer transition"
            >
              <span>❤️ Support Project (₹50)</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/20 px-4 py-10 text-center">
        <p className="text-xs text-muted-foreground">
          Disclaimer: Some of the recommendations above contain affiliate links, meaning we may earn a small commission if you purchase through them at no extra cost to you. We only recommend high-quality tools we trust.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} FileNova. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
