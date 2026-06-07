import { useCallback, useEffect, useRef, useState } from 'react';
import { IntelligentSearchEngine } from '../search/engine.js';
import type { SearchResult, SearchConfig, SearchHistoryItem, ToolMetadata } from '../types.js';

export interface UseSearchOptions extends Partial<SearchConfig> {
  initialTools?: ToolMetadata[];
  autoBuildIndex?: boolean;
}

export interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  history: SearchHistoryItem[];
  popularQueries: { query: string; count: number }[];
  engine: IntelligentSearchEngine;
  selectResult: (result: SearchResult) => void;
  clearHistory: () => void;
  latency: number;
  resultCount: number;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const engineRef = useRef<IntelligentSearchEngine | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [popularQueries, setPopularQueries] = useState<{ query: string; count: number }[]>([]);
  const [latency, setLatency] = useState(0);
  const [resultCount, setResultCount] = useState(0);
  const isInitialMount = useRef(true);

  if (!engineRef.current) {
    engineRef.current = new IntelligentSearchEngine(
      options.initialTools ?? [],
      buildConfig(options),
    );
  }

  const engine = engineRef.current;

  useEffect(() => {
    if (!isInitialMount.current) {
      setHistory(engine.getHistory());
      setPopularQueries(engine.getPopularQueries());
      return;
    }
    isInitialMount.current = false;
  }, [engine]);

  const doSearch = useCallback(
    (q: string) => {
      const start = performance.now();
      const r = engine.search(q);
      const ms = performance.now() - start;
      setResults(r);
      setLatency(ms);
      setResultCount(r.length);
      setIsOpen(r.length > 0 || q.length > 0);
      setSelectedIndex(-1);
      setHistory(engine.getHistory());
      setPopularQueries(engine.getPopularQueries());
    },
    [engine],
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      setLatency(0);
      setResultCount(0);
      return;
    }
    setIsLoading(true);
    const delay = options.debounceMs ?? 120;
    const timer = setTimeout(() => {
      doSearch(query);
      setIsLoading(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [query, options.debounceMs, doSearch]);

  const selectResult = useCallback(
    (result: SearchResult) => {
      engine.recordSelect(query, result);
      setHistory(engine.getHistory());
      setPopularQueries(engine.getPopularQueries());
    },
    [engine, query],
  );

  const clearHistory = useCallback(() => {
    engine.clearHistory();
    setHistory([]);
    setPopularQueries([]);
  }, [engine]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    history,
    popularQueries,
    engine,
    selectResult,
    clearHistory,
    latency,
    resultCount,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function buildConfig(options: UseSearchOptions): SearchConfig {
  return {
    maxResults: options.maxResults ?? 10,
    fuzzyThreshold: options.fuzzyThreshold ?? 0.35,
    prefixMinLength: options.prefixMinLength ?? 1,
    debounceMs: options.debounceMs ?? 120,
    cacheEnabled: options.cacheEnabled ?? true,
    cacheMaxAge: options.cacheMaxAge ?? 5000,
    normalizeCase: options.normalizeCase ?? true,
    removeStopwords: options.removeStopwords ?? true,
    weights: options.weights ?? {
      prefixWeight: 0.4,
      popularityWeight: 0.25,
      fuzzyWeight: 0.15,
      clickWeight: 0.1,
      recentUsageWeight: 0.1,
      exactMatchBonus: 1.5,
    },
    synonyms: new Map(Object.entries(options.synonyms ?? {})),
  };
}
