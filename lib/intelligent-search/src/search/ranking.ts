import type { ToolMetadata, SearchResult, SearchConfig, RankedWeights } from '../types.js';

export class RankingEngine {
  private weights: RankedWeights;

  constructor(weights?: RankedWeights) {
    this.weights = weights ?? {
      prefixWeight: 0.4,
      popularityWeight: 0.25,
      fuzzyWeight: 0.15,
      clickWeight: 0.1,
      recentUsageWeight: 0.1,
      exactMatchBonus: 1.5,
    };
  }

  rank(
    candidates: { tool: ToolMetadata; prefixScore: number; fuzzyScore: number; reason: string }[],
    query: string,
    config: SearchConfig,
  ): SearchResult[] {
    const results = candidates.map(({ tool, prefixScore, fuzzyScore, reason }) => {
      const { weights } = this;

      const normalizedPopularity = tool.popularity / 100;
      const normalizedClicks = Math.min(tool.clickCount / 500, 1);
      const normalizedRecency = this.normalizeRecency(tool.recentUsage);
      const isExact = tool.name.toLowerCase() === query.toLowerCase();
      const prefixP = Math.max(prefixScore, 0);
      const fuzzyP = Math.max(fuzzyScore, 0);

      const score =
        prefixP * weights.prefixWeight +
        normalizedPopularity * weights.popularityWeight +
        fuzzyP * weights.fuzzyWeight +
        normalizedClicks * weights.clickWeight +
        normalizedRecency * weights.recentUsageWeight +
        (isExact ? weights.exactMatchBonus : 0) +
        (tool.customScore ?? 0);

      const final = Math.min(score, 1.0);

      return {
        tool,
        score: final,
        reason: reason as import('../types.js').SearchMatchReason,
      };
    });

    return results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxResults);
  }

  private normalizeRecency(recentUsage: number): number {
    if (recentUsage <= 0) return 0;
    if (recentUsage >= 50) return 1;
    return recentUsage / 50;
  }
}
