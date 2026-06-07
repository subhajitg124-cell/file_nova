import { ToolItem } from '@/components/workspace/ToolGrid';
import { fuzzy, partialMatch, multiWordMatch, fuzzyScore } from '../Fuzzy/fuzzy';
import { expandAlias } from '../Aliases/alias';

interface RankedTool {
  tool: ToolItem;
  score: number;
  matchType: 'exact' | 'alias' | 'prefix' | 'fuzzy' | 'workflow';
}

const TRENDING_SCORES: Record<string, number> = {
  'merge': 1.5,
  'compress': 1.4,
  'pdf_to_docx': 1.3,
  'pdf_to_images': 1.2,
  'remove_bg': 1.4,
  'resize': 1.3,
};

const RECENT_SCORES_KEY = 'filenova-search-recent-scores';

function getRecentScores(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(RECENT_SCORES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function rankTools(
  tools: ToolItem[],
  query: string,
  recentTools: string[]
): RankedTool[] {
  if (!query) return tools.map(t => ({ tool: t, score: 0, matchType: 'exact' }));

  const normalizedQuery = query.toLowerCase().trim();
  const recentScores = getRecentScores();

  return tools
    .map(tool => {
      let score = 0;
      let matchType: RankedTool['matchType'] = 'exact';

      const title = tool.title.toLowerCase();
      const desc = tool.description.toLowerCase();
      const action = tool.actionName.toLowerCase();

      if (title.includes(normalizedQuery) || action.includes(normalizedQuery)) {
        score = 100;
        matchType = 'exact';
      } else if (multiWordMatch(title, normalizedQuery) || multiWordMatch(action, normalizedQuery)) {
        score = 80;
        matchType = 'prefix';
      } else if (expandAlias(normalizedQuery).some(a => title.includes(a) || action.includes(a))) {
        score = 70;
        matchType = 'alias';
      } else {
        const fuzzyTitleScore = fuzzyScore(title, normalizedQuery);
        const fuzzyActionScore = fuzzyScore(action, normalizedQuery);
        const bestScore = Math.max(fuzzyTitleScore, fuzzyActionScore);
        if (bestScore > 0.4) {
          score = bestScore * 50;
          matchType = 'fuzzy';
        }
      }

      if (recentTools.includes(tool.actionName)) {
        score += 5;
        matchType = 'workflow';
      }

      const trendingBoost = TRENDING_SCORES[tool.actionName] || 0;
      score += trendingBoost * 2;

      const usageBoost = recentScores[tool.actionName] || 0;
      score += usageBoost * 3;

      return { tool, score, matchType };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function getRankedResults(
  tools: ToolItem[],
  query: string,
  limit: number = 10
): ToolItem[] {
  const recentTools: string[] = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('filenova-recent-tools') || '[]') 
    : [];
  const ranked = rankTools(tools, query, recentTools);
  return ranked.slice(0, limit).map(r => r.tool);
}

export function recordToolUsage(toolId: string, toolName: string): void {
  if (typeof window === 'undefined') return;
  const key = `filenova-search-recent-scores`;
  const scores: Record<string, number> = JSON.parse(localStorage.getItem(key) || '{}');
  scores[toolId] = (scores[toolId] || 0) + 1;
  if (scores[toolId] > 10) scores[toolId] = 10;
  localStorage.setItem(key, JSON.stringify(scores));
}