import { Link } from "wouter";
import { ArrowRight, CalendarDays, Clock, FileText } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="FileNova logo" className="h-8 w-auto" />
            <span className="text-sm font-black">FileNova</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">Tools</Link>
            <Link href="/pricing" className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-black text-primary">Pricing</Link>
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <FileText className="h-3.5 w-3.5" />
            FileNova Guides
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">PDF, image, and document guides for faster submissions</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Practical tutorials for compressing PDFs, merging documents, converting images, and preparing Indian form uploads with FileNova.
          </p>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/50 hover:shadow-premium">
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <img src={post.thumbnail} alt={`${post.title} - FileNova Blog`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readTime}</span>
                </div>
                <h2 className="text-lg font-black leading-tight group-hover:text-primary">{post.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{post.description}</p>
                <span className="inline-flex items-center gap-2 text-xs font-black text-primary">
                  Read guide <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
