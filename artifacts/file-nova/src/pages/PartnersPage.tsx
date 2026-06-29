import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, ExternalLink, Star, Shield, Tag,
  Globe, HardDrive, Zap, Palette, Code2, Lock, Brain, Wrench,
} from "lucide-react";
import {
  AFFILIATE_LINKS,
  AFFILIATE_CATEGORIES,
  sanitizeAffiliateUrl,
  type AffiliateCategory,
} from "@/data/affiliateLinks";
import Footer from "@/components/Footer";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "hosting":         <Globe className="h-4 w-4" />,
  "domains":         <Globe className="h-4 w-4" />,
  "cloud-storage":   <HardDrive className="h-4 w-4" />,
  "ai-tools":        <Brain className="h-4 w-4" />,
  "design-tools":    <Palette className="h-4 w-4" />,
  "developer-tools": <Code2 className="h-4 w-4" />,
  "productivity":    <Zap className="h-4 w-4" />,
  "security":        <Lock className="h-4 w-4" />,
};

export default function PartnersPage() {
  const [activeCategory, setActiveCategory] = useState<AffiliateCategory | "all">("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return AFFILIATE_LINKS;
    return AFFILIATE_LINKS.filter((l) => l.category === activeCategory);
  }, [activeCategory]);

  const sponsored = filtered.filter((l) => l.isSponsored);
  const organic   = filtered.filter((l) => !l.isSponsored);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to FileNova
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-black text-primary transition hover:bg-primary/20">
              Premium Plans
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background px-4 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary mb-5">
            <Star className="h-3.5 w-3.5" />
            Recommended by FileNova
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl mb-4">
            Tools We Trust &amp; Recommend
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Carefully selected tools and services that complement FileNova. We only recommend what we genuinely find useful. Some links may earn us a small commission at no extra cost to you.
          </p>

          {/* Disclosure */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              <strong className="text-foreground">Affiliate Disclosure:</strong> Some links on this page may be affiliate links. FileNova may earn a commission if you make a purchase. This helps us keep our tools free.
            </span>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-border px-4 py-4 bg-background/80 sticky top-[57px] z-30">
        <div className="mx-auto max-w-7xl flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            All Tools
          </button>
          {AFFILIATE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground font-semibold whitespace-nowrap">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* Sponsored Section */}
      {sponsored.length > 0 && (
        <section className="px-4 pt-10 pb-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-2 mb-5">
              <Tag className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Sponsored
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sponsored.map((link) => (
                <AffiliateCard key={link.id} link={link} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Organic / Recommended Section */}
      <section className="flex-1 px-4 py-8 pb-14">
        <div className="mx-auto max-w-7xl">
          {sponsored.length > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Recommended
              </span>
            </div>
          )}
          {organic.length === 0 ? (
            <div className="text-center py-20">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-black mb-2">No tools in this category yet</h3>
              <p className="text-sm text-muted-foreground">Check back soon - we are always adding more.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {organic.map((link) => (
                <AffiliateCard key={link.id} link={link} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function AffiliateCard({ link }: { link: typeof AFFILIATE_LINKS[0] }) {
  const safeUrl = sanitizeAffiliateUrl(link.url);
  const catInfo = AFFILIATE_CATEGORIES.find((c) => c.value === link.category);

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
      aria-label={`${link.name} - ${link.tagline} (opens in new tab)`}
    >
      {/* Sponsored badge */}
      {link.isSponsored && (
        <span className="absolute top-3 right-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5">
          Sponsored
        </span>
      )}

      <div className="flex items-start gap-3">
        {/* Logo / Emoji */}
        <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 group-hover:bg-primary/15 transition-colors">
          {link.logoEmoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
              {link.name}
            </h3>
            {link.badge && (
              <span className="rounded-full bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 border border-primary/20">
                {link.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{link.tagline}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{link.description}</p>

      {link.discount && (
        <div className="flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs font-bold text-green-700 dark:text-green-400">
          <Tag className="h-3.5 w-3.5" />
          {link.discount}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-[10px] text-muted-foreground font-semibold inline-flex items-center gap-1">
          {catInfo?.emoji} {catInfo?.label}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-black text-primary group-hover:gap-1.5 transition-all">
          Visit <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}
