'use client';

import type { SearchResult, SearchHistoryItem } from '../../types.js';
import { SearchSuggestion } from './SearchSuggestion.js';

export interface SearchDropdownProps {
  isOpen: boolean;
  results: SearchResult[];
  history: SearchHistoryItem[];
  popularQueries: { query: string; count: number }[];
  isLoading: boolean;
  query: string;
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
  onHover?: (idx: number) => void;
  onSelectHistory?: (item: SearchHistoryItem) => void;
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

  const getItemCount = () => {
    let count = 0;
    if (showResults) count += results.length;
    if (showHistory) count += Math.min(history.length, maxHistoryItems);
    if (showPopular) count += Math.min(popularQueries.length, maxPopularItems);
    return count;
  };

  return (
    <div
      className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden ${className}`}
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

      <ul
        className={`max-h-96 overflow-y-auto py-2 ${listClassName}`}
        role="listbox"
      >
        {showHistory && (
          <>
            <li className="px-4 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recent Searches
            </li>
            {history.slice(0, maxHistoryItems).map((item, i) => {
              const globalIndex = i;
              return (
                <button
                  key={item.toolId + item.timestamp}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === globalIndex}
                  className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selectedIndex === globalIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => onSelectHistory?.(item)}
                  onMouseEnter={() => onHover?.(globalIndex)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">🕓</span>
                    <span className="truncate italic">"{item.query.toLowerCase()}"</span>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {showPopular && (
          <>
            {showHistory && (
              <li className="px-4 pt-2 pb-1 text-xs font-medium text-gray-500 uppercase tracking-wider border-t border-gray-100 dark:border-gray-800">
                Popular
              </li>
            )}
            {!showHistory && (
              <li className="px-4 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Popular Tools
              </li>
            )}
            {popularQueries.slice(0, maxPopularItems).map((pq, i) => {
              const globalIndex = (showHistory ? Math.min(history.length, maxHistoryItems) : 0) + i;
              return (
                <button
                  key={pq.query}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === globalIndex}
                  className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selectedIndex === globalIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => onSelectPopularQuery?.(pq.query)}
                  onMouseEnter={() => onHover?.(globalIndex)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">🔥</span>
                      <span className="truncate">{pq.query}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{pq.count}x</span>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {showResults &&
          results.map((result, i) => {
            const globalIndex = i;
            return (
              <li key={result.tool.id} role="option" aria-selected={selectedIndex === globalIndex}>
                <SearchSuggestion
                  query={query}
                  result={result}
                  isSelected={selectedIndex === globalIndex}
                  onSelect={onSelect}
                  onHover={() => onHover?.(globalIndex)}
                  renderItem={renderItem}
                />
              </li>
            );
          })}
      </ul>

      {showResults && results.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30">
          <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
          <span>{Math.round(latency || 0)}ms</span>
        </div>
      )}
    </div>
  );
}
