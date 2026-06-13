export interface PPTTheme {
  id: string;
  label: string;
  description: string;
  preview: {
    bgGradient: string;        // for the theme picker card preview (Tailwind classes)
    accentColor: string;       // hex, used in pptxgenjs
  };
  pptx: {
    bgColor: string;           // slide background hex
    titleColor: string;
    bodyColor: string;
    accentColor: string;       // used for bullet markers, dividers, shapes
    fontFamily: string;        // must be a font available in PowerPoint (Calibri, Arial, etc.)
    titleFontFamily?: string;  // optional distinct heading font
    layoutStyle: "minimal" | "bold-header" | "split-panel" | "card-grid" | "academic";
  };
}

export const PPT_THEMES: PPTTheme[] = [
  {
    id: "minimal-light",
    label: "Minimal Light",
    description: "Clean white background, subtle accents — best for academic submissions",
    preview: { bgGradient: "from-gray-50 to-white", accentColor: "#4F46E5" },
    pptx: {
      bgColor: "FFFFFF",
      titleColor: "1E1B4B",
      bodyColor: "374151",
      accentColor: "4F46E5",
      fontFamily: "Calibri",
      layoutStyle: "minimal",
    },
  },
  {
    id: "dark-modern",
    label: "Dark Modern",
    description: "Dark navy background with bright accents — striking for project pitches",
    preview: { bgGradient: "from-slate-900 to-indigo-950", accentColor: "#818CF8" },
    pptx: {
      bgColor: "0F172A",
      titleColor: "FFFFFF",
      bodyColor: "CBD5E1",
      accentColor: "818CF8",
      fontFamily: "Calibri",
      layoutStyle: "bold-header",
    },
  },
  {
    id: "academic-blue",
    label: "Academic Blue",
    description: "Traditional blue/white — familiar for board exam presentations & viva",
    preview: { bgGradient: "from-blue-50 to-blue-100", accentColor: "#1D4ED8" },
    pptx: {
      bgColor: "FFFFFF",
      titleColor: "1E3A8A",
      bodyColor: "1F2937",
      accentColor: "1D4ED8",
      fontFamily: "Times New Roman",
      titleFontFamily: "Georgia",
      layoutStyle: "academic",
    },
  },
  {
    id: "warm-festival",
    label: "Warm Festival",
    description: "Amber/maroon gradient — for cultural, history, or festival-themed topics",
    preview: { bgGradient: "from-amber-100 to-orange-200", accentColor: "#D97706" },
    pptx: {
      bgColor: "FFF7ED",
      titleColor: "7C2D12",
      bodyColor: "451A03",
      accentColor: "D97706",
      fontFamily: "Calibri",
      layoutStyle: "card-grid",
    },
  },
  {
    id: "tech-gradient",
    label: "Tech Gradient",
    description: "Violet-to-cyan gradient headers — for CS/engineering project presentations",
    preview: { bgGradient: "from-violet-100 to-cyan-100", accentColor: "#7C3AED" },
    pptx: {
      bgColor: "FFFFFF",
      titleColor: "5B21B6",
      bodyColor: "374151",
      accentColor: "06B6D4",
      fontFamily: "Calibri",
      layoutStyle: "split-panel",
    },
  },
  {
    id: "nature-green",
    label: "Nature Green",
    description: "Earthy green tones — ideal for biology, environment, geography topics",
    preview: { bgGradient: "from-emerald-50 to-green-100", accentColor: "#059669" },
    pptx: {
      bgColor: "F0FDF4",
      titleColor: "064E3B",
      bodyColor: "1F2937",
      accentColor: "059669",
      fontFamily: "Calibri",
      layoutStyle: "minimal",
    },
  },
];

export function getThemeById(id: string): PPTTheme {
  return PPT_THEMES.find((t) => t.id === id) ?? PPT_THEMES[0];
}
