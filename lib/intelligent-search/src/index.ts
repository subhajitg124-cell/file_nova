export { IntelligentSearchEngine } from './search/engine.js';
export { Trie } from './search/trie.js';
export { levenshteinDistance, damerauLevenshteinDistance, fuzzyScore } from './search/fuzzy.js';
export { RankingEngine } from './search/ranking.js';
export { SynonymMapper } from './features/synonyms.js';
export { SearchAnalytics } from './features/analytics.js';
export { highlightText } from './features/highlight.js';
export { debounce, throttle } from './features/timing.js';
export { SearchCache, buildSearchIndex, mergeTools, sortResults } from './utils.js';
export { normalize, tokenize, isStopword } from './normalizer/index.js';
export { DEFAULT_CONFIG, STOPWORDS } from './types.js';
export type {
  ToolMetadata,
  SearchResult,
  SearchMatchReason,
  TrieNode,
  FuzzyResult,
  RankedWeights,
  SearchConfig,
  SearchAnalyticsEvent,
  SearchHistory,
} from './types.js';
