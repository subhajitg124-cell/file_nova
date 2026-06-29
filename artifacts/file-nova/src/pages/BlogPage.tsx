import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CalendarDays, Clock, FileText, Search, Tag, ArrowLeft, BookOpen } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import Footer from "@/components/Footer";
import { useHead } from "@unhead/react";

function useStaggerReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("blog-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    el.querySelectorAll(".blog-card-stagger").forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "PDF Tools", value: "pdf" },
  { label: "India Portals", value: "india" },
  { label: "Privacy & Security", value: "security" },
  { label: "Photos & ID", value: "photo" },
];

function categorize(post: (typeof blogPosts)[0]): string {
  const k = post.keywords.toLowerCase();
  const t = post.title.toLowerCase();
  if (k.includes("aadhaar") || k.includes("privacy") || k.includes("password") || t.includes("security") || t.includes("mask")) return "security";
  if (k.includes("photo") || k.includes("passport") || k.includes("pan card") || k.includes("signature")) return "photo";
  if (k.includes("scholarship") || k.includes("neet") || k.includes("wbjee") || k.includes("csc") || k.includes("svmcm") || k.includes("india")) return "india";
  if (k.includes("pdf") || t.includes("pdf") || t.includes("split") || t.includes("merge") || t.includes("compress") || t.includes("ocr")) return "pdf";
  return "pdf";
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === "all" || categorize(post) === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.keywords.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featured = blogPosts[blogPosts.length - 1];
  const staggerRef = useStaggerReveal();

  useHead({
    link: [
      { rel: "preload", as: "image", href: featured.image },
    ],
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <style>{`
        .blog-card-stagger { opacity: 0; transform: translateY(24px); transition: opacity 0.4s ease, transform 0.4s ease; }
        .blog-revealed { opacity: 1 !important; transform: translateY(0) !important; }
        .blog-card-stagger:nth-child(1) { transition-delay: 0s; }
        .blog-card-stagger:nth-child(2) { transition-delay: 0.08s; }
        .blog-card-stagger:nth-child(3) { transition-delay: 0.16s; }
        .blog-card-stagger:nth-child(4) { transition-delay: 0.24s; }
        .blog-card-stagger:nth-child(5) { transition-delay: 0.32s; }
        .blog-card-stagger:nth-child(6) { transition-delay: 0.4s; }
        .blog-card-img-zoom { transition: transform 0.35s ease; }
        .blog-card:hover .blog-card-img-zoom { transform: scale(1.05); }
      `}</style>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition">Tools</Link>
            <Link href="/pricing" className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-black text-primary transition hover:bg-primary/20">Pricing</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary mb-5">
            <BookOpen className="h-3.5 w-3.5" />
            {blogPosts.length} Guides & Tutorials
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl mb-4">
            PDF &amp; Document Guides<br />
            <span className="text-primary">for India</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Practical tutorials for compressing PDFs, merging documents, preparing scholarship ZIPs, resizing photos for Indian portals, and more.
          </p>
          {/* Search */}
          <div className="mt-8 relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {!searchQuery && activeCategory === "all" && (
        <section className="border-b border-border px-4 py-10 bg-muted/20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" /> Latest Article
            </p>
            <Link href={`/blog/${featured.slug}`} className="group grid md:grid-cols-2 gap-0 rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video md:aspect-auto overflow-hidden bg-muted/30">
                <img
                  src={featured.image}
                  alt={`${featured.title} - FileNova Blog`}
                  className="h-full w-full object-cover blog-card-img-zoom"
                  width="1200"
                  height="675"
                />
              </div>
              <div className="p-6 flex flex-col justify-center gap-4">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {new Date(featured.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featured.readTime}</span>
                </div>
                <h2 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors">{featured.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{featured.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-black text-primary">
                  Read full guide <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filters */}
      <section className="border-b border-border px-4 py-4 bg-background/80">
        <div className="mx-auto max-w-7xl flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground font-semibold whitespace-nowrap">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-black text-foreground mb-2">No articles found</h3>
              <p className="text-sm text-muted-foreground">Try a different search term or category.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-black cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div ref={staggerRef} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="blog-card blog-card-stagger group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1.5"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-muted/30">
                    <img
                      src={post.image}
                      alt={`${post.title} - FileNova Blog`}
                      className="h-full w-full object-cover blog-card-img-zoom"
                      loading="lazy"
                      decoding="async"
                      width="640"
                      height="360"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                    </div>
                    <h2 className="text-base font-black leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">{post.description}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-primary">
                      Read guide <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

