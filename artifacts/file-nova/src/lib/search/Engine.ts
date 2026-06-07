import { Trie, ToolMetadata } from "./Trie";
import { getFuzzyScore } from "./Fuzzy";

export interface SearchResult {
  tool: ToolMetadata;
  score: number;
  reason: string;
}

const SYNONYM_MAP: Record<string, string[]> = {
  "combine": ["merge", "pdf merge"],
  "reduce size": ["compress", "compress pdf"],
  "shrink": ["compress", "compress pdf"],
  "image to pdf": ["jpg to pdf"],
  "pdf to image": ["pdf to jpg"],
  "photo size": ["resize", "resize-image", "pan-card-resize"],
  "mask": ["aadhaar", "aadhaar-mask-pdf"],
  "pancard": ["pan-card", "pan-card-resize"],
  "sign": ["pan-card", "pan-card-resize"],
  "scholarship": ["zip", "scholarship-zip"]
};

export class SearchEngine {
  trie = new Trie();
  tools: ToolMetadata[] = [];
  cache: Record<string, SearchResult[]> = {};

  constructor(tools: ToolMetadata[]) {
    this.tools = tools;
    this.buildIndex();
  }

  private buildIndex() {
    for (const tool of this.tools) {
      // Index exact name
      this.trie.insert(tool.name, tool);

      // Index keywords
      for (const kw of tool.keywords) {
        this.trie.insert(kw, tool);
      }

      // Index aliases
      for (const alias of tool.aliases) {
        this.trie.insert(alias, tool);
      }

      // Index synonyms
      for (const [synonym, targets] of Object.entries(SYNONYM_MAP)) {
        if (targets.some(target => 
          tool.name.toLowerCase().includes(target) || 
          tool.id.toLowerCase().includes(target) ||
          tool.keywords.some(kw => kw.toLowerCase().includes(target))
        )) {
          this.trie.insert(synonym, tool);
        }
      }
    }
  }

  // Click Tracking
  trackClick(toolId: string) {
    try {
      const clickData = JSON.parse(localStorage.getItem("fn_search_clicks") || "{}");
      clickData[toolId] = (clickData[toolId] || 0) + 1;
      localStorage.setItem("fn_search_clicks", JSON.stringify(clickData));

      // Record in recent tools
      const recents = JSON.parse(localStorage.getItem("fn_search_recents") || "[]");
      const updated = [toolId, ...recents.filter((id: string) => id !== toolId)].slice(0, 5);
      localStorage.setItem("fn_search_recents", JSON.stringify(updated));

      // Clear search engine cache as scores will change
      this.cache = {};
    } catch (_) {}
  }

  private getClickCount(toolId: string): number {
    try {
      const clickData = JSON.parse(localStorage.getItem("fn_search_clicks") || "{}");
      return clickData[toolId] || 0;
    } catch (_) {
      return 0;
    }
  }

  private isRecent(toolId: string): boolean {
    try {
      const recents = JSON.parse(localStorage.getItem("fn_search_recents") || "[]");
      return recents.includes(toolId);
    } catch (_) {
      return false;
    }
  }

  search(query: string): SearchResult[] {
    const trimmed = query.toLowerCase().trim();
    if (!trimmed) return [];

    // Check cache
    if (this.cache[trimmed]) {
      return this.cache[trimmed];
    }

    // 1. Trie Prefix Search
    let matchedTools = this.trie.searchPrefix(trimmed);
    let searchType = "Trie Prefix Match";

    // 2. Fallback: Fuzzy Search if Trie returns fewer than 3 results
    if (matchedTools.length < 3) {
      const fuzzyMatches: { tool: ToolMetadata; fuzzyScore: number }[] = [];

      for (const tool of this.tools) {
        let bestFuzzy = 0;
        const targets = [tool.name, tool.id, ...tool.keywords, ...tool.aliases];
        
        for (const target of targets) {
          const score = getFuzzyScore(trimmed, target);
          if (score > bestFuzzy) {
            bestFuzzy = score;
          }
        }

        if (bestFuzzy >= 0.45) {
          fuzzyMatches.push({ tool, fuzzyScore: bestFuzzy });
        }
      }

      fuzzyMatches.sort((a, b) => b.fuzzyScore - a.fuzzyScore);
      for (const match of fuzzyMatches) {
        if (!matchedTools.some(t => t.id === match.tool.id)) {
          matchedTools.push(match.tool);
        }
      }
      searchType = matchedTools.length > 0 ? "Trie Prefix + Fuzzy Match" : "Fuzzy Match";
    }

    // 3. Ranking Algorithm
    const scoredResults: SearchResult[] = matchedTools.map(tool => {
      const isExact = tool.name.toLowerCase() === trimmed || tool.id.toLowerCase() === trimmed;
      const isPrefix = tool.name.toLowerCase().startsWith(trimmed) || tool.id.toLowerCase().startsWith(trimmed);

      // Prefix Score
      const prefixScore = isExact ? 1.0 : (isPrefix ? 0.8 : 0.0);
      const prefixWeight = 0.4;

      // Popularity Score (normalized from max 100)
      const popularityScore = tool.popularity / 100;
      const popularityWeight = 0.2;

      // Fuzzy Score
      let bestFuzzy = 0;
      const targets = [tool.name, tool.id, ...tool.keywords, ...tool.aliases];
      for (const target of targets) {
        const score = getFuzzyScore(trimmed, target);
        if (score > bestFuzzy) {
          bestFuzzy = score;
        }
      }
      const fuzzyScore = bestFuzzy;
      const fuzzyWeight = 0.2;

      // Click Score
      const clicks = this.getClickCount(tool.id);
      const clickScore = Math.min(clicks / 10, 1.0);
      const clickWeight = 0.1;

      // Recent Usage Score
      const recentUsageScore = this.isRecent(tool.id) ? 1.0 : 0.0;
      const recentUsageWeight = 0.1;

      // Calculate final score
      const finalScore = 
        (prefixScore * prefixWeight) +
        (popularityScore * popularityWeight) +
        (fuzzyScore * fuzzyWeight) +
        (clickScore * clickWeight) +
        (recentUsageScore * recentUsageWeight);

      let reason = searchType;
      if (isExact) {
        reason = "Exact Match";
      } else if (isPrefix) {
        reason = "Trie Prefix Match";
      }

      return {
        tool,
        score: parseFloat(finalScore.toFixed(4)),
        reason
      };
    });

    // Sort by final score descending
    scoredResults.sort((a, b) => b.score - a.score);

    // Cache the results
    this.cache[trimmed] = scoredResults;

    return scoredResults;
  }
}
