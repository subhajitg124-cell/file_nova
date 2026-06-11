export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
  ogImage?: string;
  toolName?: string;
  toolDescription?: string;
  faqs?: Array<{ q: string; a: string }>;
  isHomepage?: boolean;
  steps?: Array<{ title: string; description: string; icon?: string }>;
  howToName?: string;
  toolCategory?: string;
}

export function useSEO(_config: SEOConfig): void {
  // Intentionally empty.
  // All metadata and schemas are now managed declaratively by Unhead components
  // (ToolSEO and ToolStructuredData) in App.tsx.
}
