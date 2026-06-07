export interface ToolMetadata {
  id: string;
  name: string;
  description?: string;
  category?: string;
  keywords: string[];
  aliases: string[];
  tags?: string[];
  url?: string;
  icon?: string;
  popularity: number;
  clickCount: number;
  recentUsage: number;
  lastUsedAt?: number;
  createdAt: number;
  customScore?: number;
}

export interface SearchResult {
  tool: ToolMetadata;
  score: number;
  reason: SearchMatchReason;
  matchedText?: string;
}

export type SearchMatchReason =
  | 'exact'
  | 'prefix'
  | 'keyword'
  | 'alias'
  | 'fuzzy'
  | 'popular'
  | 'recent';

export interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  toolIds: Set<string>;
  popularity: number;
  recentUsage: number;
}

export interface FuzzyResult {
  tool: ToolMetadata;
  score: number;
  editDistance: number;
  matchedPositions: number[];
  matchType: 'levenshtein' | 'damerau_levenshtein';
}

export interface RankedWeights {
  prefixWeight: number;
  popularityWeight: number;
  fuzzyWeight: number;
  clickWeight: number;
  recentUsageWeight: number;
  exactMatchBonus: number;
}

export interface SearchConfig {
  maxResults: number;
  fuzzyThreshold: number;
  prefixMinLength: number;
  debounceMs: number;
  cacheEnabled: boolean;
  cacheMaxAge: number;
  normalizeCase: boolean;
  removeStopwords: boolean;
  weights: RankedWeights;
  synonyms: Map<string, string[]>;
}

export interface SearchAnalyticsEvent {
  type: 'search' | 'select' | 'hover';
  query: string;
  toolId?: string;
  timestamp: number;
  resultCount: number;
  latencyMs: number;
}

export interface SearchHistory {
  query: string;
  toolId: string;
  timestamp: number;
}

export const DEFAULT_CONFIG: SearchConfig = {
  maxResults: 10,
  fuzzyThreshold: 0.35,
  prefixMinLength: 1,
  debounceMs: 120,
  cacheEnabled: true,
  cacheMaxAge: 5000,
  normalizeCase: true,
  removeStopwords: true,
  weights: {
    prefixWeight: 0.4,
    popularityWeight: 0.25,
    fuzzyWeight: 0.15,
    clickWeight: 0.1,
    recentUsageWeight: 0.1,
    exactMatchBonus: 1.5,
  },
  synonyms: new Map(),
};

export const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
  'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'out',
  'off', 'over', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'can', 'will', 'just', 'should', 'now',
]);
