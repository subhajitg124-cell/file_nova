import { useState, useEffect, useMemo, useCallback } from "react";
import { SearchEngine, SearchResult } from "@/lib/search/Engine";
import { ToolMetadata } from "@/lib/search/Trie";
import { useTranslation } from "@/lib/i18n";

// Helper to debounce state updates
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function useIntelligentSearch(rawToolsList: any[], debounceDelay = 150) {
  const { tText } = useTranslation();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, debounceDelay);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentTools, setRecentTools] = useState<ToolMetadata[]>([]);
  const [frequentTools, setFrequentTools] = useState<ToolMetadata[]>([]);

  // Convert raw tools to ToolMetadata format
  const formattedTools = useMemo((): ToolMetadata[] => {
    return rawToolsList.map(t => {
      const canonical = t.canonical || `/${t.id}`;
      const id = t.id;
      const name = t.title;
      const description = t.description;
      const category = t.category || "pdf";
      const iconName = t.id;
      const popularity = t.badge === "Popular" ? 95 : (t.badge === "AI" ? 90 : (t.badge === "New" ? 85 : 50));
      const keywords = t.tags || [];
      const aliases = [t.id.toLowerCase()];

      return {
        id,
        name,
        canonical,
        description,
        category,
        iconName,
        popularity,
        keywords: [name.toLowerCase(), description.toLowerCase(), ...keywords],
        aliases
      };
    });
  }, [rawToolsList]);

  // Instantiate search engine
  const engine = useMemo(() => new SearchEngine(formattedTools), [formattedTools]);

  // Sync recents and popular tools
  const syncMetrics = useCallback(() => {
    try {
      // 1. Recents
      const recents = JSON.parse(localStorage.getItem("fn_search_recents") || "[]") as string[];
      const matchedRecents = recents
        .map(id => formattedTools.find(t => t.id === id))
        .filter((t): t is ToolMetadata => !!t)
        .slice(0, 5);
      setRecentTools(matchedRecents);

      // 2. Popular/Frequently Clicked
      const clickData = JSON.parse(localStorage.getItem("fn_search_clicks") || "{}");
      const matchedFrequents = [...formattedTools]
        .filter(t => clickData[t.id] > 0)
        .sort((a, b) => (clickData[b.id] || 0) - (clickData[a.id] || 0))
        .slice(0, 5);
      setFrequentTools(matchedFrequents);
    } catch (_) {}
  }, [formattedTools]);

  // Initialize and listen to storage events for real-time updates
  useEffect(() => {
    syncMetrics();
    window.addEventListener("fn-search-click-tracked", syncMetrics);
    return () => {
      window.removeEventListener("fn-search-click-tracked", syncMetrics);
    };
  }, [syncMetrics]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const startTime = performance.now();
    const searchResults = engine.search(debouncedQuery);
    const duration = performance.now() - startTime;
    
    if (import.meta.env.DEV) {
      console.log(`[Search Analytics] Query: "${debouncedQuery}", Results: ${searchResults.length}, Duration: ${duration.toFixed(2)}ms`);
    }
    
    setResults(searchResults);
  }, [debouncedQuery, engine]);

  // Track user selection/click on a search suggestion
  const trackSelection = useCallback((toolId: string) => {
    engine.trackClick(toolId);
    window.dispatchEvent(new Event("fn-search-click-tracked"));
  }, [engine]);

  return {
    query,
    setQuery,
    results,
    recentTools,
    frequentTools,
    trackSelection,
    syncMetrics
  };
}
