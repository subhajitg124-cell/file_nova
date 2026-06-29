/**
 * FileNova Affiliate & Partner Links Configuration
 * Central config for all affiliate, partner, and recommended links.
 * Add new partners here; no code changes elsewhere required.
 *
 * IMPORTANT: All links are sanitized and only https:// URLs are allowed.
 */

export interface AffiliateLink {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: AffiliateCategory;
  url: string;
  logoEmoji: string;
  badge?: string;
  discount?: string;
  isSponsored: boolean;
}

export type AffiliateCategory =
  | "hosting"
  | "domains"
  | "cloud-storage"
  | "ai-tools"
  | "design-tools"
  | "developer-tools"
  | "productivity"
  | "security";

export const AFFILIATE_CATEGORIES: { value: AffiliateCategory; label: string; emoji: string }[] = [
  { value: "hosting", label: "Web Hosting", emoji: "Host" },
  { value: "domains", label: "Domains", emoji: "DNS" },
  { value: "cloud-storage", label: "Cloud Storage", emoji: "Cloud" },
  { value: "ai-tools", label: "AI Tools", emoji: "AI" },
  { value: "design-tools", label: "Design Tools", emoji: "Design" },
  { value: "developer-tools", label: "Developer Tools", emoji: "Dev" },
  { value: "productivity", label: "Productivity", emoji: "Ops" },
  { value: "security", label: "Security", emoji: "Safe" },
];

export function sanitizeAffiliateUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "#";
    return url;
  } catch {
    return "#";
  }
}

export const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    id: "hostinger",
    name: "Hostinger",
    tagline: "Fast web hosting in India",
    description: "Budget-friendly hosting with strong uptime, free SSL, and one-click WordPress. Useful for students, creators, and small businesses.",
    category: "hosting",
    url: "https://www.hostinger.in/",
    logoEmoji: "HN",
    badge: "Most Popular",
    discount: "Up to 80% off for new users",
    isSponsored: false,
  },
  {
    id: "cloudways",
    name: "Cloudways",
    tagline: "Managed cloud hosting",
    description: "Managed hosting on AWS, GCP, and DigitalOcean. Useful for growing SaaS apps and high-traffic websites.",
    category: "hosting",
    url: "https://www.cloudways.com/",
    logoEmoji: "CW",
    isSponsored: false,
  },
  {
    id: "godaddy",
    name: "GoDaddy India",
    tagline: "Register .in and .com domains",
    description: "Popular domain registrar for Indian users who need a quick business, portfolio, or local-service domain.",
    category: "domains",
    url: "https://in.godaddy.com/",
    logoEmoji: "GD",
    isSponsored: false,
  },
  {
    id: "namecheap",
    name: "Namecheap",
    tagline: "Affordable global domains",
    description: "Domain registration with privacy protection options. Commonly used by developers and small teams worldwide.",
    category: "domains",
    url: "https://www.namecheap.com/",
    logoEmoji: "NC",
    badge: "Best Value",
    isSponsored: false,
  },
  {
    id: "google-one",
    name: "Google One",
    tagline: "Cloud storage for documents",
    description: "Expand Google Drive storage for documents, PDFs, scans, and photos using Google's storage infrastructure.",
    category: "cloud-storage",
    url: "https://one.google.com/",
    logoEmoji: "G1",
    isSponsored: false,
  },
  {
    id: "backblaze",
    name: "Backblaze B2",
    tagline: "Affordable file backup",
    description: "S3-compatible object storage that can help developers and businesses keep backups of generated files and assets.",
    category: "cloud-storage",
    url: "https://www.backblaze.com/b2/cloud-storage.html",
    logoEmoji: "B2",
    badge: "Dev Friendly",
    isSponsored: false,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    tagline: "AI assistant for work",
    description: "Useful for writing, coding, document analysis, and creative work. Free and paid plans are available.",
    category: "ai-tools",
    url: "https://chat.openai.com/",
    logoEmoji: "AI",
    isSponsored: false,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    tagline: "Google AI for everyday tasks",
    description: "AI assistant for writing, image analysis, coding, and research with access through a Google account.",
    category: "ai-tools",
    url: "https://gemini.google.com/",
    logoEmoji: "GM",
    badge: "Free to Use",
    isSponsored: false,
  },
  {
    id: "runway",
    name: "Runway ML",
    tagline: "AI video and image generation",
    description: "Creative AI tools for video generation, background removal, and image workflows.",
    category: "ai-tools",
    url: "https://runwayml.com/",
    logoEmoji: "RW",
    isSponsored: false,
  },
  {
    id: "canva",
    name: "Canva",
    tagline: "Graphic design platform",
    description: "Create posters, social graphics, presentations, certificates, and resumes with a large template library.",
    category: "design-tools",
    url: "https://www.canva.com/",
    logoEmoji: "CV",
    badge: "Recommended",
    isSponsored: false,
  },
  {
    id: "figma",
    name: "Figma",
    tagline: "Professional UI and UX design",
    description: "Collaborative design platform for interfaces, prototypes, and design systems.",
    category: "design-tools",
    url: "https://www.figma.com/",
    logoEmoji: "FG",
    isSponsored: false,
  },
  {
    id: "vercel",
    name: "Vercel",
    tagline: "Deploy frontend apps instantly",
    description: "Zero-configuration deployment for React, Next.js, and Vite apps with a global CDN.",
    category: "developer-tools",
    url: "https://vercel.com/",
    logoEmoji: "VC",
    badge: "Dev Favourite",
    isSponsored: false,
  },
  {
    id: "github",
    name: "GitHub",
    tagline: "Code hosting and collaboration",
    description: "Host repositories, automate workflows with GitHub Actions, and collaborate with teams.",
    category: "developer-tools",
    url: "https://github.com/",
    logoEmoji: "GH",
    isSponsored: false,
  },
  {
    id: "notion",
    name: "Notion",
    tagline: "All-in-one workspace",
    description: "Notes, docs, databases, and project planning in one workspace. Useful for organizing document workflows.",
    category: "productivity",
    url: "https://www.notion.so/",
    logoEmoji: "NO",
    isSponsored: false,
  },
  {
    id: "bitwarden",
    name: "Bitwarden",
    tagline: "Open-source password manager",
    description: "Secure passwords and sensitive account data with end-to-end encryption.",
    category: "security",
    url: "https://bitwarden.com/",
    logoEmoji: "BW",
    badge: "Open Source",
    isSponsored: false,
  },
];

export function getAffiliateLinks(category?: AffiliateCategory): AffiliateLink[] {
  if (!category) return AFFILIATE_LINKS;
  return AFFILIATE_LINKS.filter((link) => link.category === category);
}

export function getFeaturedAffiliateLinks(limit = 6): AffiliateLink[] {
  return AFFILIATE_LINKS.filter((link) => link.badge).slice(0, limit);
}