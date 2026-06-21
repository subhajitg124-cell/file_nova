'use client';

import type { SearchResult, SearchHistory } from '../types.js';
import { SearchSuggestion } from './SearchSuggestion.js';

export interface SearchDropdownProps {
  isOpen: boolean;
  results: SearchResult[];
  history: SearchHistory[];
  popularQueries: { query: string; count: number }[];
  isLoading: boolean;
  query: string;
  selectedIndex: number;
  latency: number;
  resultCount: number;
  onSelect: (result: SearchResult) => void;
  onHover?: (idx: number) => void;
  onSelectHistory?: (item: SearchHistory) => void;
  onSelectPopularQuery?: (q: string) => void;
  onClose?: () => void;
  renderItem?: (result: SearchResult, isSelected: boolean) => React.ReactNode;
  maxHistoryItems?: number;
  maxPopularItems?: number;
  emptyMessage?: string;
  className?: string;
  listClassName?: string;
}

export function SearchDropdown({
  isOpen,
  results,
  history,
  popularQueries,
  isLoading,
  query,
  selectedIndex,
  onSelect,
  onHover,
  latency: _latency,
  resultCount: _resultCount,
  onSelectHistory,
  onSelectPopularQuery,
  onClose,
  renderItem,
  maxHistoryItems = 5,
  maxPopularItems = 5,
  emptyMessage = 'No results found',
  className = '',
  listClassName = '',
}: SearchDropdownProps) {
  if (!isOpen) return null;

  const showHistory = !query && history.length > 0;
  const showPopular = !query && popularQueries.length > 0;
  const showResults = query.length > 0;

  return (
    <div
      className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden ${className}`}
      role="listbox"
      aria-label="Search suggestions"
    >
      {isLoading && (
        <div className="px-4 py-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Searching...</span>
        </div>
      )}

      {!isLoading && showResults && results.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <p>{emptyMessage}</p>
          {query.length > 0 && (
            <p className="text-xs mt-1 text-gray-400">
              Try different keywords or check spelling
            </p>
          )}
        </div>
      )}

      {/* ── Bento Grid: History + Popular (no query) ──────────────────── */}
      {!isLoading && !showResults && (showHistory || showPopular) && (
        <div className={`p-3 grid gap-2 ${showHistory && showPopular ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} ${listClassName}`}>
          {showHistory && (
            <div className="space-y-1.5">
              <p className="px-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Recent Searches
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {history.slice(0, maxHistoryItems).map((item, i) => {
                  const globalIndex = i;
                  return (
                    <button
                      key={item.toolId + item.timestamp}
                      type="button"
                      role="option"
                      aria-selected={selectedIndex === globalIndex}
                      className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                        selectedIndex === globalIndex
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => onSelectHistory?.(item)}
                      onMouseEnter={() => onHover?.(globalIndex)}
                    >
                      <span className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs flex-shrink-0" aria-hidden="true">🕓</span>
                      <span className="truncate font-medium text-xs">"{item.query.toLowerCase()}"</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showPopular && (
            <div className="space-y-1.5">
              <p className="px-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Popular Tools
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {popularQueries.slice(0, maxPopularItems).map((pq, i) => {
                  const globalIndex = (showHistory ? Math.min(history.length, maxHistoryItems) : 0) + i;
                  return (
                    <button
                      key={pq.query}
                      type="button"
                      role="option"
                      aria-selected={selectedIndex === globalIndex}
                      className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
                        selectedIndex === globalIndex
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => onSelectPopularQuery?.(pq.query)}
                      onMouseEnter={() => onHover?.(globalIndex)}
                    >
                      <span className="h-7 w-7 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-xs flex-shrink-0" aria-hidden="true">🔥</span>
                      <span className="flex-1 truncate font-medium text-xs">{pq.query}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono flex-shrink-0">{pq.count}x</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bento Grid: Search Results ────────────────────────────────── */}
      {showResults && !isLoading && results.length > 0 && (
        <>
          <div className={`p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 ${listClassName}`}>
            {results.map((result, i) => {
              const globalIndex = i;
              return (
                <div
                  key={result.tool.id}
                  role="option"
                  aria-selected={selectedIndex === globalIndex}
                  className={`rounded-xl border transition-all duration-150 ${
                    selectedIndex === globalIndex
                      ? 'border-blue-300 dark:border-blue-600 bg-blue-50/80 dark:bg-blue-900/20 shadow-sm'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  {renderItem ? (
                    renderItem(result, selectedIndex === globalIndex)
                  ) : (
                    <BentoResultCard
                      result={result}
                      query={query}
                      isSelected={selectedIndex === globalIndex}
                      onSelect={onSelect}
                      onHover={() => onHover?.(globalIndex)}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30">
            <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            <span>{Math.round(_latency || 0)}ms</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Bento Result Card ─────────────────────────────────────────────────── */

function BentoResultCard({
  result,
  query,
  isSelected,
  onSelect,
  onHover,
}: {
  result: SearchResult;
  query: string;
  isSelected: boolean;
  onSelect: (r: SearchResult) => void;
  onHover: () => void;
}) {
  const handleClick = () => onSelect(result);

  const reasonLabels: Record<string, string> = {
    exact: 'Exact match',
    prefix: 'Starts with',
    keyword: 'Keyword',
    alias: 'Also known as',
    fuzzy: 'Similar',
    popular: 'Trending',
    recent: 'Recently used',
  };

  const pct = Math.round(result.score * 100);
  const scoreColor =
    pct >= 90
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : pct >= 70
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';

  return (
    <button
      type="button"
      className="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-colors"
      onClick={handleClick}
      onMouseEnter={onHover}
    >
      {result.tool.icon && (
        <span className="text-xl flex-shrink-0 mt-0.5 h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center" aria-hidden="true">
          {result.tool.icon}
        </span>
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            <MatchHighlight text={result.tool.name} query={query} />
          </span>
          {result.tool.category && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0">
              {result.tool.category}
            </span>
          )}
        </div>
        {result.tool.description && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
            {result.tool.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${scoreColor}`}>
            {pct}%
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {reasonLabels[result.reason] || result.reason}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function MatchHighlight({ text, query }: { text: string; query: string }): React.ReactNode {
  if (!query || query.length === 0) return <span>{text}</span>;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <span>{text}</span>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + lowerQuery.length);
  const after = text.slice(idx + lowerQuery.length);
  return (
    <span>
      {before}
      <mark className="bg-transparent font-semibold text-blue-700 dark:text-blue-300 underline decoration-blue-400/60 underline-offset-2">
        {match}
      </mark>
      {after}
    </span>
  );
}
