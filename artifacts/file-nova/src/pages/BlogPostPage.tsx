import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, CalendarDays, Clock, Copy, MessageCircle, Share2 } from "lucide-react";
import { getBlogPost } from "@/data/blogPosts";
import NotFound from "@/pages/not-found";
import { toast } from "sonner";
import { useHead } from "@unhead/react";

const SITE_URL = "https://filenova.in";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const post = params?.slug ? getBlogPost(params.slug) : undefined;

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | FileNova Blog`;
  }, [post]);

  useHead({
    title: post ? `${post.title} | FileNova Blog` : "Blog Post | FileNova",
    meta: post ? [
      { name: "description", content: post.description },
      { name: "keywords", content: post.keywords },
      { property: "og:title", content: `${post.title} | FileNova Blog` },
      { property: "og:description", content: post.description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE_URL}/blog/${post.slug}` },
      { property: "og:image", content: `${SITE_URL}${post.image}` },
      { property: "og:site_name", content: "FileNova" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${post.title} | FileNova Blog` },
      { name: "twitter:description", content: post.description },
      { name: "twitter:image", content: `${SITE_URL}${post.image}` },
    ] : [],
    link: post ? [
      { rel: "canonical", href: `${SITE_URL}/blog/${post.slug}` },
      { rel: "preload", as: "image", href: post.image },
    ] : [],
  });

  if (!post) return <NotFound />;

  const shareUrl = `${SITE_URL}/blog/${post.slug}`;
  const shareText = `${post.title} - ${shareUrl}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Blog link copied.");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Blog
          </Link>
          <Link href="/" className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground">Open FileNova</Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card mb-8">
          <img
            src={post.image}
            alt={`${post.title} - FileNova Blog`}
            className="h-auto w-full object-cover"
            width="1200"
            height="675"
          />
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{post.title}</h1>

        <div className="mt-4 mb-6 flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {new Date(post.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readTime}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-black text-white">
            <Share2 className="h-4 w-4" />
            Twitter/X
          </a>
          <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-black text-muted-foreground hover:text-foreground">
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
        </div>

        <div className="prose prose-slate dark:prose-invert mt-10 max-w-none prose-headings:font-black prose-p:leading-8">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
