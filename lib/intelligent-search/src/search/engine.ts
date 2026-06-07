import type {
  ToolMetadata,
  SearchConfig,
  SearchResult,
  SearchMatchReason,
  TrieNode,
} from '../types.js';
import { Trie } from '../search/trie.js';
import { levenshteinDistance, damerauLevenshteinDistance, fuzzyScore } from '../search/fuzzy.js';
import { RankingEngine } from '../search/ranking.js';
import { SynonymMapper } from '../features/synonyms.js';
import { SearchAnalytics } from '../features/analytics.js';
import { SearchCache, buildSearchIndex } from '../utils.js';
import { normalize, tokenize } from '../normalizer/index.js';

export class IntelligentSearchEngine {
  private trie: Trie;
  private index: Map<string, ToolMetadata>;
  private tools: ToolMetadata[];
  private rankingEngine: RankingEngine;
  private synonyms: SynonymMapper;
  private analytics: SearchAnalytics;
  private cache: SearchCache<string, SearchResult[]>;
  private config: SearchConfig;

  constructor(
    initialTools: ToolMetadata[] = [],
    config?: Partial<SearchConfig>,
  ) {
    this.trie = new Trie();
    this.index = new Map();
    this.tools = [];
    this.rankingEngine = new RankingEngine(config?.weights);
    this.synonyms = new SynonymMapper();
    this.analytics = new SearchAnalytics();
    this.cache = new SearchCache(config?.cacheMaxAge ?? 5000);
    this.config = { ...config };
    if (initialTools.length > 0) this.indexTools(initialTools);
  }

  indexTools(tools: ToolMetadata[]): void {
    const merged = this.tools.length > 0
      ? this.mergeIncoming([...this.tools, ...tools])
      : [...tools];
    this.tools = merged;
    this.rebuildTrie();
    this.cache.clear();
  }

  addTool(tool: ToolMetadata): void {
    this.tools.push(tool);
    const name = normalize(tool.name);
    const keywords = (tool.keywords ?? []).map(normalize);
    const aliases = (tool.aliases ?? []).map(normalize);
    this.trie.insertTool(name, keywords, aliases, tool.id);
    if (this.index.has(tool.id)) {
      const existing = this.index.get(tool.id)!;
      this.trie.removeTool(
        normalize(existing.name),
        (existing.keywords ?? []).map(normalize),
        (existing.aliases ?? []).map(normalize),
        existing.id,
      );
    }
    this.index.set(tool.id, tool);
    this.cache.clear();
  }

  removeTool(toolId: string): void {
    const tool = this.index.get(toolId);
    if (!tool) return;
    this.tools = this.tools.filter((t) => t.id !== toolId);
    this.trie.removeTool(
      normalize(tool.name),
      (tool.keywords ?? []).map(normalize),
      (tool.aliases ?? []).map(normalize),
      tool.id,
    );
    this.index.delete(toolId);
    this.cache.clear();
  }

  updateSynonym(term: string, synonyms: string[]): void {
    this.synonyms.add(term, synonyms);
    this.cache.clear();
  }

  updateSynonymBatch(entries: Record<string, string[]>): void {
    this.synonyms.addBatch(entries);
    this.cache.clear();
  }

  search(query: string): SearchResult[] {
    const start = performance.now();
    if (!query || query.trim().length === 0) {
      this.analytics.trackSearch(query, 0, performance.now() - start);
      return this.getPopularSuggestions();
    }

    const normalizedQuery = normalize(query);
    const cacheKey = this.config.cacheEnabled ? normalizedQuery : '';

    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      this.analytics.trackSearch(query, cached.length, performance.now() - start);
      return cached;
    }

    const topResult = this.trie.searchPrefix(normalizedQuery);
    const trieResults: { id: string; prefix: string; prefixScore: number }[] = [];

    if (topResult && normalizedQuery.length >= (this.config.prefixMinLength ?? 1)) {
      this.trie.getAllWithPrefix(topResult, normalizedQuery, []);
      for (const id of topResult.toolIds) {
        trieResults.push({ id, prefix: normalizedQuery, prefixScore: 1.0 });
      }
      const vals = this.collectAllChildren(topResult);
      for (const { id, prefix } of vals) {
        if (!trieResults.find((r) => r.id === id)) {
          trieResults.push({ id, prefix, prefixScore: 0.9 });
        }
      }
    }

    const synonymTerms = this.getExpandedQueryTerms(query);
    for (const term of synonymTerms) {
      const node = this.trie.searchPrefix(normalize(term));
      if (node) {
        this.trie.getAllWithPrefix(node, normalize(term), []);
        for (const id of node.toolIds) {
          if (!trieResults.find((r) => r.id === id)) {
            trieResults.push({ id, prefix: normalize(term), prefixScore: 0.85 });
          }
        }
      }
    }

    const seenToolIds = new Set<string>(trieResults.map((r) => r.id));
    const fuzzyResults = this.runFuzzySearch(normalizedQuery, seenToolIds);

    const candidates = this.buildCandidates(normalizedQuery, trieResults, fuzzyResults);
    const ranked = this.rankingEngine.rank(candidates, normalizedQuery, this.config);

    if (cacheKey) this.cache.set(cacheKey, ranked);

    this.analytics.trackSearch(query, ranked.length, performance.now() - start);
    return ranked;
  }

  recordSelect(query: string, result: SearchResult): void {
    this.analytics.trackSelect(query, result.tool.id);
    const tool = this.index.get(result.tool.id);
    if (tool) {
      tool.clickCount += 1;
      tool.recentUsage += 1;
      tool.lastUsedAt = Date.now();
      this.index.set(result.tool.id, tool);
      this.tools = this.tools.map((t) =>
        t.id === tool.id ? { ...tool } : t,
      );
    }
    this.cache.clear();
  }

  getSynonyms(): SynonymMapper {
    return this.synonyms;
  }

  getAnalytics(): SearchAnalytics {
    return this.analytics;
  }

  getTrie(): Trie {
    return this.trie;
  }

  getToolById(id: string): ToolMetadata | undefined {
    return this.index.get(id);
  }

  getAllTools(): ToolMetadata[] {
    return [...this.tools];
  }

  getHistory() {
    return this.analytics.getHistory();
  }

  getPopularQueries() {
    return this.analytics.getPopularQueries();
  }

  clearHistory(): void {
    this.analytics.clear();
  }

  private rebuildTrie(): void {
    this.trie.clear();
    for (const tool of this.tools) {
      const name = normalize(tool.name);
      const keywords = (tool.keywords ?? []).map(normalize);
      const aliases = (tool.aliases ?? []).map(normalize);
      this.trie.insertTool(name, keywords, aliases, tool.id);
      this.index.set(tool.id, tool);
    }
  }

  private mergeIncoming(tools: ToolMetadata[]): ToolMetadata[] {
    const map = new Map<string, ToolMetadata>();
    for (const t of tools) map.set(t.id, t);
    return Array.from(map.values());
  }

  private collectAllChildren(
    node: TrieNode,
    prefix = '',
  ): { id: string; prefix: string }[] {
    const results: { id: string; prefix: string }[] = [];
    const queue: { node: TrieNode; prefix: string }[] = [{ node, prefix }];
    while (queue.length > 0) {
      const { node: current, prefix: p } = queue.shift()!;
      for (const [ch, child] of current.children) {
        const newPrefix = p + ch;
        if (child.toolIds.size > 0) {
          for (const id of child.toolIds) {
            results.push({ id, prefix: newPrefix });
          }
        }
        queue.push({ node: child, prefix: newPrefix });
      }
    }
    return results;
  }

  private runFuzzySearch(
    query: string,
    avoidIds: Set<string>,
  ): { tool: ToolMetadata; score: number; reason: string }[] {
    if (query.length === 0) return [];
    const results: { tool: ToolMetadata; score: number; reason: string }[] = [];
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return results;

    for (const tool of this.tools) {
      if (avoidIds.has(tool.id)) continue;
      const nameTokens = tokenize(tool.name);
      const expansionTokens = new Set<string>();
      for (const kw of tool.keywords ?? []) {
        for (const t of tokenize(kw)) expansionTokens.add(t);
      }
      for (const alias of tool.aliases ?? []) {
        for (const t of tokenize(alias)) expansionTokens.add(t);
      }
      const allTokens = [...nameTokens, ...expansionTokens];

      let bestFuzzy = 0;
      let bestReason = '';

      for (const qt of queryTokens) {
        let bestT = 0;
        let bestLabel = '';
        for (const ct of allTokens) {
          const lev = fuzzyScore(qt, ct, 2);
          if (lev > bestT) {
            bestT = lev;
            bestLabel = ct;
          }
        }
        if (bestT > 0 && bestT >= 0.5) {
          if (nameTokens.includes(bestLabel)) {
            bestReason = 'fuzzy_name';
          } else {
            bestReason = 'fuzzy_keyword';
          }
        }
        bestFuzzy = Math.max(bestFuzzy, bestT);
      }

      for (const synTerm of this.getExpandedQueryTerms(query)) {
        const synTokens = tokenize(synTerm);
        for (const st of synTokens) {
          let bestSyn = 0;
          for (const ct of allTokens) {
            const lev = fuzzyScore(st, ct, 2);
            bestSyn = Math.max(bestSyn, lev);
          }
          bestFuzzy = Math.max(bestFuzzy, bestSyn);
        }
      }

      if (bestFuzzy > 0.25) {
        results.push({
          tool,
          score: bestFuzzy,
          reason: bestReason || 'fuzzy',
        });
      }
    }
    return results;
  }

  private buildCandidates(
    query: string,
    trieResults: { id: string; prefix: string; prefixScore: number }[],
    fuzzyResults: { tool: ToolMetadata; score: number; reason: string }[],
  ): {
    tool: ToolMetadata;
    prefixScore: number;
    fuzzyScore: number;
    reason: string;
  }[] {
    const candidates = new Map<string, {
      tool: ToolMetadata;
      prefixScore: number;
      fuzzyScore: number;
      reason: string;
      reasons: string[];
    }>();

    for (const { id, prefix, prefixScore } of trieResults) {
      const tool = this.index.get(id);
      if (!tool) continue;
      if (!candidates.has(id)) {
        candidates.set(id, {
          tool,
          prefixScore: prefixScore,
          fuzzyScore: 0,
          reason: 'prefix',
          reasons: ['prefix'],
        });
      } else {
        const c = candidates.get(id)!;
        c.prefixScore = Math.max(c.prefixScore, prefixScore);
        if (!c.reasons.includes('prefix')) c.reasons.push('prefix');
      }
    }

    for (const { tool, score, reason } of fuzzyResults) {
      if (!candidates.has(tool.id)) {
        candidates.set(tool.id, {
          tool,
          prefixScore: 0,
          fuzzyScore: score,
          reason: reason.startsWith('fuzzy') ? reason : 'fuzzy',
          reasons: ['fuzzy'],
        });
      } else {
        const c = candidates.get(tool.id)!;
        if (!c.reasons.includes('fuzzy')) {
          c.fuzzyScore = Math.max(c.fuzzyScore, score);
          c.reasons.push('fuzzy');
          c.reason = c.reason === 'prefix' ? 'prefix+fuzzy' : c.reason;
        }
      }
    }

    return Array.from(candidates.values()).map((c) => ({
      tool: c.tool,
      prefixScore: c.prefixScore,
      fuzzyScore: c.fuzzyScore,
      reason: c.reasons.join('+'),
    }));
  }

  private getExpandedQueryTerms(query: string): string[] {
    const terms: string[] = [];
    const tokens = tokenize(query);
    for (const token of tokens) {
      const canonical = this.synonyms.getCanonical(token);
      terms.push(canonical);
      const syns = this.synonyms.getSynonyms(token);
      terms.push(...syns);
    }
    return [...new Set(terms)];
  }

  private getPopularSuggestions(): SearchResult[] {
    const sorted = [...this.tools]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, (this.config.maxResults ?? 10));
    return sorted.map((tool) => ({
      tool,
      score: tool.popularity / 100,
      reason: 'popular' as SearchMatchReason,
    }));
  }
}
