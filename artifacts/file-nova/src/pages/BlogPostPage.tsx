import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, CalendarDays, Clock, Copy, MessageCircle, Share2 } from "lucide-react";
import { getBlogPost } from "@/data/blogPosts";
import NotFound from "@/pages/not-found";
import { toast } from "sonner";

const SITE_URL = "https://filenova.in";

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const post = params?.slug ? getBlogPost(params.slug) : undefined;

  useEffect(() => {
    if (!post) return;

    const url = `${SITE_URL}/blog/${post.slug}`;
    document.title = `${post.title} | FileNova Blog`;
    setMeta("description", post.description);
    setMeta("keywords", post.keywords);
    setMeta("og:title", post.title, "property");
    setMeta("og:description", post.description, "property");
    setMeta("og:type", "article", "property");
    setMeta("og:url", url, "property");
    setMeta("og:image", `${SITE_URL}${post.thumbnail}`, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", post.title);
    setMeta("twitter:description", post.description);

    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      image: `${SITE_URL}${post.thumbnail}`,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: "FileNova" },
      publisher: {
        "@type": "Organization",
        name: "FileNova",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
      mainEntityOfPage: url,
    };

    let script = document.getElementById("filenova-article-schema") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "filenova-article-schema";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, [post]);

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
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {new Date(post.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readTime}</span>
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{post.description}</p>

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

        <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card">
          <img src={post.thumbnail} alt="" className="h-auto w-full object-cover" />
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
