# FileNova — SEO Guide

**Purpose:** Search engine optimization standards and best practices.

---

## 1. SEO Philosophy

FileNova targets Indian users searching for document tools. SEO is critical for discoverability.

**Core Principles:**
1. **Unique content per page** — no thin/duplicate content
2. **Technical correctness** — valid HTML, proper tags, fast loading
3. **User intent match** — content answers search queries
4. **Local relevance** — India-specific keywords, language support
5. **Structured data** — help search engines understand content

---

## 2. Technical SEO Foundation

### 2.1 Meta Tags (Required on Every Page)
```tsx
import { ToolSEO } from '@/seo/ToolSEO';
import { ToolStructuredData } from '@/seo/ToolStructuredData';

<ToolSEO
  title="Merge PDF – Free Online PDF Merger | FileNova"
  metaDescription="Merge PDF files online for free. Combine multiple PDF documents into one in seconds. No signup needed. Works on any device — try FileNova's free PDF merger now."
  keywords="merge pdf, combine pdf online, pdf merger free, merge pdf files"
  canonicalUrl="https://filenova.in/merge-pdf"
/>
```

### 2.2 Title Tag Rules
- **Length:** 50–60 characters
- **Format:** `Tool Action – Benefit | Brand`
- **Example:** "Merge PDF – Free Online PDF Merger | FileNova"
- **Include:** Primary keyword near the beginning
- **Avoid:** Keyword stuffing, all caps

### 2.3 Meta Description Rules
- **Length:** 150–160 characters
- **Include:** Primary keyword, value proposition, CTA
- **Tone:** Helpful, conversational, Indian-English
- **Example:** "Compress PDF files online and reduce file size without losing quality. Free, fast, no signup. Works on Android, iPhone, and desktop."

### 2.4 Canonical URLs
```tsx
<ToolSEO canonicalUrl="https://filenova.in/merge-pdf" />
```
- Always use `https://`
- No trailing slash (unless directory)
- No query parameters for canonical pages

### 2.5 Open Graph Tags
```tsx
<ToolSEO
  ogTitle="Merge PDF Online Free | FileNova"
  ogDescription="Combine multiple PDF files instantly. No signup required."
  ogImage="/og-merge-pdf.png"
  ogUrl="https://filenova.in/merge-pdf"
/>
```
- Image: 1200×630px minimum
- Image must be accessible (public URL)
- Same content for Twitter Cards

### 2.6 Twitter Cards
```tsx
<ToolSEO
  twitterCard="summary_large_image"
  twitterTitle="Merge PDF Online Free | FileNova"
  twitterDescription="Combine PDFs instantly."
  twitterImage="/og-merge-pdf.png"
/>
```

---

## 3. Structured Data

### 3.1 SoftwareApplication Schema
```tsx
<ToolStructuredData
  toolName="FileNova PDF Merger"
  toolDescription="Free online tool to merge multiple PDF files into one combined document instantly."
  applicationCategory="UtilitiesApplication"
  operatingSystem="Web"
  url="https://filenova.in/merge-pdf"
/>
```

### 3.2 HowTo Schema
For tools with step-by-step guides:
```tsx
<ToolStructuredData
  howToName="Merge PDF Files Online"
  steps={[
    { name: "Upload your PDF files", text: "Click or drag PDFs..." },
    { name: "Arrange file order", text: "Drag to reorder..." },
    { name: "Merge and download", text: "Click merge..." },
  ]}
/>
```

### 3.3 FAQPage Schema
```tsx
<ToolStructuredData
  faqs={[
    { question: "How do I merge PDF files?", answer: "Upload..." },
    { question: "Is there a file limit?", answer: "Free users..." },
  ]}
/>
```

---

## 4. Content Standards

### 4.1 Tool Page Structure
```
H1: Tool name + primary keyword
Intro paragraph (1–2 sentences, answer query)
Features list (3–5 bullets)
"How to use" steps (3–5 steps)
FAQ section (4–6 questions)
Related tools (3–4 links)
```

### 4.2 Content Rules
- **Minimum 300 words** per tool page (aim for 500+)
- **Natural keyword usage** — don't stuff
- **Indian context** — mention CSC, students, government portals
- **Actionable** — tell user exactly what to do
- **Unique per page** — no duplicate paragraphs across tools

### 4.3 Headings
```tsx
<h1>Merge PDF – Free Online PDF Merger</h1>
<h2>Why Use FileNova PDF Merger?</h2>
<h3>Fast and Free</h3>
<h3>No Installation Required</h3>
<h2>How to Merge PDF Files Online</h2>
<h3>Step 1: Upload Your PDFs</h3>
<h3>Step 2: Arrange Order</h3>
<h3>Step 3: Download Merged PDF</h3>
<h2>Frequently Asked Questions</h2>
```

**Rules:**
- One `<h1>` per page (the tool title)
- Logical hierarchy (no skipping levels)
- Include keywords in H2s/H3s

---

## 5. URL Structure

### 5.1 Format
```
https://filenova.in/
├── /                    # Home
├── /merge-pdf          # Tool page
├── /pdf-to-word        # Tool page
├── /tools              # All tools catalog
├── /tools/merge-pdf    # Legacy (301 redirect to /merge-pdf)
├── /pricing            # Pricing
├── /dashboard          # Dashboard (auth)
└── /blog/post-name     # Blog
```

### 5.2 Rules
- **Lowercase** with hyphens
- **Descriptive** — tool name or clear content
- **No query parameters** for content pages
- **No file extensions** (`.html`, `.php`)
- **Legacy redirects maintained** — never 404 old URLs

### 5.3 Legacy Redirects (Already Implemented)
```
/merge → /merge-pdf
/compress → /compress-pdf
/split → /split-pdf
/ocr-pdf → /ocr
/pdf-merge → /merge-pdf
/tools/compress-pdf → /compress-pdf
/tools/merge-pdf → /merge-pdf
```

---

## 6. Internal Linking

### 6.1 Related Tools
Every tool page must link to 3–4 related tools:
```tsx
const relatedTools = [
  { label: "Split PDF", slug: "split-pdf", icon: "scissors" },
  { label: "Compress PDF", slug: "compress-pdf", icon: "file-zip" },
  { label: "PDF to Word", slug: "pdf-to-word", icon: "file-word" },
];
```

### 6.2 Contextual Links
- Blog posts link to relevant tools
- Tool pages link to blog posts (where relevant)
- Footer links to legal pages, sitemap

### 6.3 Anchor Text
```tsx
// ✅ Descriptive
<a href="/compress-pdf">Compress PDF files online</a>

// ❌ Generic
<a href="/compress-pdf">Click here</a>
```

---

## 7. Image SEO

### 7.1 Alt Text
```tsx
// ✅ Descriptive
<img src="/og-merge-pdf.png" alt="FileNova PDF Merger - merge multiple PDF files online" />

// ❌ Missing or generic
<img src="/og-merge-pdf.png" alt="" />
<img src="/og-merge-pdf.png" alt="image" />
```

### 7.2 Image Optimization
- Use WebP format with fallbacks
- Responsive images (`srcset`, `sizes`)
- Lazy load below-fold images (`loading="lazy"`)
- Descriptive filenames: `merge-pdf-tool-thumbnail.webp`

---

## 8. Blog SEO

### 8.1 Structure
```tsx
<h1>How to Reduce PDF File Size for Free (2025 Guide)</h1>
<p>Meta description paragraph...</p>
<h2>Why PDF Files Get Large</h2>
<h2>Best Ways to Compress PDF</h2>
<h3>1. Use FileNova's Free PDF Compressor</h3>
<h3>2. Reduce Image Quality</h3>
<h2>Frequently Asked Questions</h2>
```

### 8.2 Rules
- **1,500+ words** for primary content
- **Internal links** to relevant tools
- **External links** to authoritative sources (sparingly)
- **Keyword in H1, first paragraph, and at least one H2**
- **Images** with descriptive alt text

---

## 9. Mobile SEO

- **Mobile-first indexing**: Google uses mobile version for ranking
- **Responsive images**: Correct `srcset`
- **Touch targets**: ≥ 48×48px
- **Font size**: Minimum 16px body text
- **No horizontal scroll**: Test on real devices

---

## 10. Core Web Vitals Optimization

### 10.1 LCP (Largest Contentful Paint)
- Target: < 2.5s
- **Optimization:**
  - Preload hero image/font
  - Lazy load non-critical images
  - Optimize server response (TTFB < 600ms)

### 10.2 FID (First Input Delay)
- Target: < 100ms
- **Optimization:**
  - Minimize JavaScript on critical path
  - Code splitting (already done)
  - Avoid long tasks (> 50ms)

### 10.3 CLS (Cumulative Layout Shift)
- Target: < 0.1
- **Optimization:**
  - Reserve space for images (aspect-ratio)
  - Avoid dynamic content above fold
  - Use `font-display: swap` to prevent FOIT

---

## 11. Sitemap

### 11.1 Dynamic Sitemap
Route: `/sitemap.xml` (server-generated)
- Includes all canonical tool pages
- Includes blog posts
- Includes legal pages
- Excludes auth/protected pages
- Updated on build

---

## 12. robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /nova-*

Sitemap: https://filenova.in/sitemap.xml
```

---

## 13. International SEO

### 13.1 Language-Specific URLs (Future)
```
/en/merge-pdf    # English
/hi/merge-pdf    # Hindi
/bn/merge-pdf    # Bengali
```

### 13.2 Current State
- Single URL with i18n via React context
- Not ideal for SEO, but functional
- Google can index JS-rendered content
- Consider hreflang tags in future

---

## 14. Rich Results

Target these rich results:
- **FAQ**: For tool FAQ sections (FAQPage schema)
- **HowTo**: For step-by-step guides (HowTo schema)
- **SoftwareApplication**: For tool pages

**Validation:** Use Google Rich Results Test before deployment.

---

## 15. Search Console

### 15.1 Setup
- Google Search Console verified
- Sitemap submitted
- Robots.txt tested

### 15.2 Monitoring
- Core Web Vitals report
- Mobile usability
- Manual actions
- Coverage errors

---

## 16. SEO Checklist (Per Page)

### 16.1 Before Publishing
- [ ] Unique `<title>` (50–60 chars)
- [ ] Unique meta description (150–160 chars)
- [ ] Canonical URL set
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] H1 includes primary keyword
- [ ] 300+ words of unique content
- [ ] At least one internal link
- [ ] At least one image with alt text
- [ ] Structured data (JSON-LD) valid

### 16.2 Technical Checks
- [ ] Returns 200 (not 302/404)
- [ ] No `noindex` tag
- [ ] Loads in < 3s
- [ ] Mobile-friendly
- [ ] HTTPS enabled

---

## 17. Keywords Strategy

### 17.1 Primary Keywords (India)
- "merge pdf online free"
- "compress pdf for upload"
- "pdf to word converter"
- "aadhaar card mask"
- "pan card photo resize"
- "scholarship zip maker"
- "ocr pdf free"

### 17.2 Long-tail Keywords
- "how to compress pdf under 100kb"
- "merge pdf files for government job"
- "compress pdf for SSC application"
- "aadhaar masking for bank kyc"

### 17.3 Local Keywords
- "pdf tools india"
- "document tools for students"
- "csc center software"
- "cyber cafe document tools"

---

## 18. Competitor Analysis

| Competitor | Strengths | FileNova Advantage |
|------------|-----------|-------------------|
| Smallpdf | Brand recognition | India-specific tools (Aadhaar, PAN) |
| ILovePDF | Feature breadth | CSC/student focus |
| Sejda | Freemium | Cheaper pricing (₹49–199) |
| Adobe Acrobat | Trust | Free tier, no account needed |

---

## 19. Link Building

### 19.1 Tactics
- Student portal partnerships
- CSC center training materials
- Tech blog mentions
- Government scheme guides (contextual links)

### 19.2 Local
- Google Business Profile
- JustDial listing
- Sulekha presence
- CSC e-Governance portal (if applicable)

---

## 20. Monitoring & Iteration

| Metric | Tool | Frequency |
|--------|------|-----------|
| Rankings | Google Search Console | Weekly |
| Organic traffic | GA4 | Weekly |
| Index coverage | Search Console | Weekly |
| Core Web Vitals | Search Console | Monthly |
| Backlinks | Ahrefs/SEMrush (future) | Monthly |
| Competitor rankings | Manual/automated | Monthly |
