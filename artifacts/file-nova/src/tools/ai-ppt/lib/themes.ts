export interface PPTColorPalette {
  background: string;
  surface: string;       // card/panel background (slightly different from bg)
  primary: string;       // headings, key shapes
  secondary: string;     // accents, dividers
  text: string;
  textMuted: string;
  onPrimary: string;     // text color when placed ON the primary color
}

export interface PPTFontPairing {
  heading: string;        // PowerPoint-safe font name
  body: string;
  headingFallback?: string;
}

export type DecorationShape =
  | "corner-triangle"
  | "diagonal-stripe"
  | "dot-grid"
  | "circle-cluster"
  | "side-bar"
  | "underline-swoosh"
  | "none";

export interface PPTTheme {
  id: string;
  label: string;
  description: string;
  category: "professional" | "academic" | "creative" | "minimal" | "festival";
  preview: {
    bgGradient: string;
    accentColor: string;
    textColor: string;
  };
  pptx: {
    palette: PPTColorPalette;
    fonts: PPTFontPairing;
    layoutStyle:
      | "minimal"
      | "bold-header"
      | "split-panel"
      | "card-grid"
      | "academic"
      | "magazine"
      | "timeline"
      | "dark-luxe";
    decoration: DecorationShape;
    pageNumberStyle: "circle" | "bar" | "minimal" | "none";
  };
}

export const PPT_THEMES: PPTTheme[] = [
  {
    id: "corporate-slate",
    label: "Corporate Slate",
    description: "Navy & steel blue — boardroom-ready, ideal for project pitches",
    category: "professional",
    preview: { bgGradient: "from-slate-100 to-slate-200", accentColor: "#1E3A5F", textColor: "#1E293B" },
    pptx: {
      palette: { background: "FFFFFF", surface: "F1F5F9", primary: "1E3A5F", secondary: "3B82F6", text: "1E293B", textMuted: "64748B", onPrimary: "FFFFFF" },
      fonts: { heading: "Montserrat", headingFallback: "Calibri", body: "Calibri" },
      layoutStyle: "bold-header",
      decoration: "side-bar",
      pageNumberStyle: "bar",
    },
  },
  {
    id: "emerald-executive",
    label: "Emerald Executive",
    description: "Deep green & gold accents — premium, finance/business feel",
    category: "professional",
    preview: { bgGradient: "from-emerald-50 to-emerald-100", accentColor: "#065F46", textColor: "#064E3B" },
    pptx: {
      palette: { background: "FFFFFF", surface: "ECFDF5", primary: "065F46", secondary: "D4AF37", text: "1F2937", textMuted: "6B7280", onPrimary: "FFFFFF" },
      fonts: { heading: "Georgia", body: "Calibri" },
      layoutStyle: "magazine",
      decoration: "underline-swoosh",
      pageNumberStyle: "circle",
    },
  },
  {
    id: "classic-ivy",
    label: "Classic Ivy",
    description: "Maroon & cream serif — traditional academic submissions",
    category: "academic",
    preview: { bgGradient: "from-amber-50 to-rose-50", accentColor: "#7F1D1D", textColor: "#451A03" },
    pptx: {
      palette: { background: "FFFBF5", surface: "FEF3E2", primary: "7F1D1D", secondary: "B45309", text: "451A03", textMuted: "92400E", onPrimary: "FFFBF5" },
      fonts: { heading: "Georgia", body: "Times New Roman" },
      layoutStyle: "academic",
      decoration: "corner-triangle",
      pageNumberStyle: "minimal",
    },
  },
  {
    id: "crisp-scholar",
    label: "Crisp Scholar",
    description: "Navy & white, clean grid — board exams & viva presentations",
    category: "academic",
    preview: { bgGradient: "from-blue-50 to-indigo-50", accentColor: "#1D4ED8", textColor: "#1E3A8A" },
    pptx: {
      palette: { background: "FFFFFF", surface: "EFF6FF", primary: "1E3A8A", secondary: "1D4ED8", text: "1F2937", textMuted: "6B7280", onPrimary: "FFFFFF" },
      fonts: { heading: "Calibri", body: "Calibri" },
      layoutStyle: "academic",
      decoration: "dot-grid",
      pageNumberStyle: "minimal",
    },
  },
  {
    id: "sunset-gradient",
    label: "Sunset Gradient",
    description: "Coral-to-purple gradient — startup pitches, creative projects",
    category: "creative",
    preview: { bgGradient: "from-orange-200 via-pink-200 to-purple-200", accentColor: "#DB2777", textColor: "#831843" },
    pptx: {
      palette: { background: "FFFFFF", surface: "FFF1F2", primary: "DB2777", secondary: "F97316", text: "1F2937", textMuted: "6B7280", onPrimary: "FFFFFF" },
      fonts: { heading: "Montserrat", headingFallback: "Trebuchet MS", body: "Calibri" },
      layoutStyle: "magazine",
      decoration: "circle-cluster",
      pageNumberStyle: "circle",
    },
  },
  {
    id: "tech-neon",
    label: "Tech Neon",
    description: "Dark mode with cyan/violet glow — CS/engineering demos",
    category: "creative",
    preview: { bgGradient: "from-slate-900 to-indigo-950", accentColor: "#22D3EE", textColor: "#E0E7FF" },
    pptx: {
      palette: { background: "0B1120", surface: "151E32", primary: "22D3EE", secondary: "A78BFA", text: "E2E8F0", textMuted: "94A3B8", onPrimary: "0B1120" },
      fonts: { heading: "Montserrat", headingFallback: "Calibri", body: "Calibri" },
      layoutStyle: "dark-luxe",
      decoration: "diagonal-stripe",
      pageNumberStyle: "bar",
    },
  },
  {
    id: "pure-mono",
    label: "Pure Mono",
    description: "Black, white & one accent — distraction-free, content-first",
    category: "minimal",
    preview: { bgGradient: "from-gray-50 to-gray-100", accentColor: "#111827", textColor: "#111827" },
    pptx: {
      palette: { background: "FFFFFF", surface: "F9FAFB", primary: "111827", secondary: "EF4444", text: "1F2937", textMuted: "9CA3AF", onPrimary: "FFFFFF" },
      fonts: { heading: "Helvetica Neue", headingFallback: "Arial", body: "Arial" },
      layoutStyle: "minimal",
      decoration: "none",
      pageNumberStyle: "minimal",
    },
  },
  {
    id: "soft-lavender",
    label: "Soft Lavender",
    description: "Pastel violet & white — gentle, approachable for any subject",
    category: "minimal",
    preview: { bgGradient: "from-violet-50 to-purple-50", accentColor: "#7C3AED", textColor: "#5B21B6" },
    pptx: {
      palette: { background: "FFFFFF", surface: "F5F3FF", primary: "5B21B6", secondary: "A78BFA", text: "374151", textMuted: "9CA3AF", onPrimary: "FFFFFF" },
      fonts: { heading: "Calibri", body: "Calibri" },
      layoutStyle: "split-panel",
      decoration: "circle-cluster",
      pageNumberStyle: "circle",
    },
  },
  {
    id: "diwali-gold",
    label: "Diwali Gold",
    description: "Maroon & gold — festival projects, cultural presentations",
    category: "festival",
    preview: { bgGradient: "from-amber-100 to-orange-200", accentColor: "#B45309", textColor: "#7C2D12" },
    pptx: {
      palette: { background: "FFF7ED", surface: "FEF3C7", primary: "7C2D12", secondary: "D97706", text: "451A03", textMuted: "92400E", onPrimary: "FFF7ED" },
      fonts: { heading: "Georgia", body: "Calibri" },
      layoutStyle: "card-grid",
      decoration: "corner-triangle",
      pageNumberStyle: "circle",
    },
  },
  {
    id: "timeline-teal",
    label: "Timeline Teal",
    description: "Teal with numbered flow — perfect for processes, history, steps",
    category: "professional",
    preview: { bgGradient: "from-teal-50 to-cyan-50", accentColor: "#0F766E", textColor: "#134E4A" },
    pptx: {
      palette: { background: "FFFFFF", surface: "F0FDFA", primary: "134E4A", secondary: "0F766E", text: "1F2937", textMuted: "6B7280", onPrimary: "FFFFFF" },
      fonts: { heading: "Montserrat", headingFallback: "Calibri", body: "Calibri" },
      layoutStyle: "timeline",
      decoration: "dot-grid",
      pageNumberStyle: "circle",
    },
  },
];

export function getThemeById(id: string): PPTTheme {
  return PPT_THEMES.find((t) => t.id === id) ?? PPT_THEMES[0];
}

export const THEME_CATEGORIES = [
  { id: "professional", label: "Professional", icon: "💼" },
  { id: "academic", label: "Academic", icon: "🎓" },
  { id: "creative", label: "Creative", icon: "🎨" },
  { id: "minimal", label: "Minimal", icon: "◽" },
  { id: "festival", label: "Festival", icon: "🪔" },
] as const;
