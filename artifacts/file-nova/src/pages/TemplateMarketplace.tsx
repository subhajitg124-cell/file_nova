import React, { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, Sparkles, Lock, FileText, User, Receipt,
  GraduationCap, IdCard, Clock, Star, ArrowRight,
} from "lucide-react";
import Footer from "@/components/Footer";
import { useSubscription } from "@/hooks/useSubscription";

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  icon: React.ReactNode;
  isPaid: boolean;
  price?: number; // in INR
  previewUrl?: string;
  comingSoon?: boolean;
  badge?: string;
  tags: string[];
}

export type TemplateCategory =
  | "resume"
  | "invoice"
  | "government-form"
  | "certificate"
  | "passport-photo"
  | "scholarship";

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; emoji: string; color: string }> = {
  "resume":          { label: "Resume",           emoji: "Resume", color: "text-blue-500" },
  "invoice":         { label: "Invoice",          emoji: "Bill", color: "text-green-500" },
  "government-form": { label: "Government Forms", emoji: "Gov", color: "text-amber-500" },
  "certificate":     { label: "Certificates",     emoji: "Cert", color: "text-purple-500" },
  "passport-photo":  { label: "Passport Photo",   emoji: "Photo", color: "text-cyan-500" },
  "scholarship":     { label: "Scholarship Docs", emoji: "Study", color: "text-rose-500" },
};

// Template catalog - architecture supports paid downloads
const TEMPLATES: TemplateItem[] = [
  // Free templates
  {
    id: "resume-modern",
    title: "Modern Resume - ATS Friendly",
    description: "Clean one-page resume optimized for Indian job portals and ATS systems. Includes education, skills, and internship sections.",
    category: "resume",
    icon: <User className="h-6 w-6" />,
    isPaid: false,
    tags: ["resume", "job", "ats", "india"],
    badge: "Free",
  },
  {
    id: "invoice-gst",
    title: "GST Invoice Template",
    description: "Professional GST invoice with CGST/SGST/IGST fields. Compliant with Indian tax regulations.",
    category: "invoice",
    icon: <Receipt className="h-6 w-6" />,
    isPaid: false,
    tags: ["gst", "invoice", "business", "tax"],
    badge: "Free",
  },
  {
    id: "certificate-participation",
    title: "Participation Certificate",
    description: "Elegant certificate of participation for events, workshops, and competitions. Editable in the browser.",
    category: "certificate",
    icon: <Star className="h-6 w-6" />,
    isPaid: false,
    tags: ["certificate", "event", "participation"],
    badge: "Free",
  },
  // Coming soon paid templates
  {
    id: "resume-executive",
    title: "Executive Resume Pack",
    description: "3 premium resume templates for senior professionals and managers. Includes cover letter template.",
    category: "resume",
    icon: <User className="h-6 w-6" />,
    isPaid: true,
    price: 49,
    tags: ["resume", "premium", "executive"],
    comingSoon: true,
    badge: "Pro",
  },
  {
    id: "svmcm-form-pack",
    title: "SVMCM Application Pack",
    description: "Complete document checklist, income certificate format, and declaration templates for SVMCM scholarship.",
    category: "scholarship",
    icon: <GraduationCap className="h-6 w-6" />,
    isPaid: false,
    tags: ["svmcm", "scholarship", "west bengal"],
    comingSoon: true,
    badge: "Free",
  },
  {
    id: "govt-affidavit",
    title: "Government Affidavit Templates",
    description: "Common affidavit formats used for admissions, income proof, and residence declarations.",
    category: "government-form",
    icon: <FileText className="h-6 w-6" />,
    isPaid: true,
    price: 29,
    tags: ["affidavit", "government", "legal"],
    comingSoon: true,
    badge: "Pro",
  },
  {
    id: "invoice-freelancer",
    title: "Freelancer Invoice Pack",
    description: "5 modern invoice templates for designers, developers, and content creators. PDF + Excel formats.",
    category: "invoice",
    icon: <Receipt className="h-6 w-6" />,
    isPaid: true,
    price: 49,
    tags: ["invoice", "freelancer", "design"],
    comingSoon: true,
    badge: "Pro",
  },
  {
    id: "passport-preset-pack",
    title: "Passport Photo Preset Pack",
    description: "Presets for Indian Passport, US Visa, UK Visa, Schengen, UAE, and 10+ other country photo requirements.",
    category: "passport-photo",
    icon: <IdCard className="h-6 w-6" />,
    isPaid: true,
    price: 19,
    tags: ["passport", "photo", "visa", "presets"],
    comingSoon: true,
    badge: "Pro",
  },
];

const CATEGORIES_LIST = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
  value: value as TemplateCategory,
  ...config,
}));

export default function TemplateMarketplace() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const { premiumEnabled } = useSubscription();

  const filtered = activeCategory === "all"
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === activeCategory);

  const freeCount = TEMPLATES.filter((t) => !t.isPaid).length;
  const paidCount = TEMPLATES.filter((t) => t.isPaid).length;

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
          <Link href="/pricing" className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-black text-primary transition hover:bg-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade for Pro Templates
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background px-4 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary mb-5">
            <FileText className="h-3.5 w-3.5" />
            Template Marketplace
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl mb-4">
            Ready-to-Use Templates<br />
            <span className="text-primary">for Every Indian Need</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Resumes, invoices, certificates, scholarship forms, and more - download, customize, and submit faster.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="rounded-xl border border-border bg-card px-5 py-3 text-center">
              <div className="text-2xl font-black text-foreground">{freeCount}</div>
              <div className="text-xs text-muted-foreground font-semibold">Free Templates</div>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-3 text-center">
              <div className="text-2xl font-black text-primary">{paidCount}</div>
              <div className="text-xs text-muted-foreground font-semibold">Pro Templates</div>
            </div>
            <div className="rounded-xl border border-border bg-card px-5 py-3 text-center">
              <div className="text-2xl font-black text-foreground">6</div>
              <div className="text-xs text-muted-foreground font-semibold">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-border px-4 py-4 bg-background/80">
        <div className="mx-auto max-w-7xl flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            All Templates
          </button>
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Template Grid */}
      <section className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isPremiumUser={premiumEnabled}
              />
            ))}
          </div>

          {/* Coming Soon Banner */}
          <div className="mt-12 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
            <Clock className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-black mb-2">More Templates Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
              We are building more templates for NDA forms, government ID applications, ITR acknowledgements, property NOC letters, and more.
            </p>
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-black hover:opacity-90 transition">
              <Sparkles className="h-4 w-4" />
              Get Early Access with Pro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TemplateCard({
  template,
  isPremiumUser,
}: {
  template: TemplateItem;
  isPremiumUser: boolean;
}) {
  const catConfig = CATEGORY_CONFIG[template.category];
  const isLocked = template.isPaid && !isPremiumUser;

  return (
    <div className={`group relative flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-all ${
      isLocked
        ? "border-border opacity-80 hover:opacity-100"
        : "border-border hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
    }`}>
      {/* Badge */}
      {template.badge && (
        <span className={`absolute top-3 right-3 rounded-full text-[10px] font-black px-2 py-0.5 ${
          template.isPaid
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
        }`}>
          {template.badge}
        </span>
      )}

      {/* Coming soon tag */}
      {template.comingSoon && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black px-2 py-0.5">
          <Clock className="h-2.5 w-2.5" /> Soon
        </span>
      )}

      {/* Icon */}
      <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${catConfig.color}`}>
        {template.icon}
      </div>

      <div className="flex-1">
        <h3 className="font-black text-sm text-foreground leading-tight mb-1 group-hover:text-primary transition-colors pr-10">
          {template.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {template.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {template.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-semibold">
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="pt-2 border-t border-border">
        {template.comingSoon ? (
          <button disabled className="w-full py-2 rounded-lg bg-muted text-muted-foreground text-xs font-black cursor-not-allowed flex items-center justify-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Coming Soon
          </button>
        ) : isLocked ? (
          <Link href="/pricing" className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-black hover:bg-primary/10 transition">
            <Lock className="h-3.5 w-3.5" />
            Unlock with Pro - Rs. {template.price}
          </Link>
        ) : (
          <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-black hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer">
            <ArrowRight className="h-3.5 w-3.5" />
            Use Template - Free
          </button>
        )}
      </div>
    </div>
  );
}
