'use client';

import type { UseSearchReturn } from './useSearch.js';
import type { SearchResult } from '../types.js';
import { SearchDropdown } from './SearchDropdown.js';
import { highlightText } from '../features/highlight.js';

export interface SearchInputProps {
  search: UseSearchReturn;
  placeholder?: string;
  onSelectResult?: (result: SearchResult) => void;
  inputClassName?: string;
  containerClassName?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SearchInput({
  search,
  placeholder = 'Search tools...',
  onSelectResult,
  inputClassName = '',
  containerClassName = '',
  autoFocus = false,
  size = 'md',
}: SearchInputProps) {
  const {
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
    selectResult,
    clearHistory,
    latency,
    resultCount,
  } = search;

  const visibleItemCount = query.length > 0 ? results.length : Math.min(history.length, 4) + Math.min(popularQueries.length, 5);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(Math.min(selectedIndex + 1, visibleItemCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(Math.max(selectedIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.tool.name);
    selectResult(result);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelectResult?.(result);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const handleFocus = () => {
    if (query.length > 0 || results.length > 0) {
      setIsOpen(true);
    }
  };

  const sizeClasses: Record<string, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-13 px-5 text-lg',
  };

  const itemCount = visibleItemCount;

  return (
    <div className={`relative w-full max-w-2xl ${containerClassName}`}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-dropdown"
          aria-activedescendant={
            selectedIndex >= 0
              ? `search-item-${selectedIndex}`
              : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleInputKeyDown}
          onBlur={(e) => {
            setTimeout(() => setIsOpen(false), 150);
          }}
          placeholder={placeholder}
          className={`w-full ${sizeClasses[size]} pl-10 pr-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${inputClassName}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          {isLoading && (
            <div className="p-1.5" aria-label="Searching">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      <SearchDropdown
        isOpen={isOpen}
        results={results}
        history={history}
        popularQueries={popularQueries}
        isLoading={isLoading}
        query={query}
        selectedIndex={selectedIndex}
        latency={latency}
        resultCount={resultCount}
        onSelect={handleSelect}
        onHover={setSelectedIndex}
        onSelectHistory={(item) => {
          setQuery(item.query);
          setIsOpen(true);
        }}
        onSelectPopularQuery={(q) => {
          setQuery(q);
          setIsOpen(true);
        }}
        onClose={() => setIsOpen(false)}
        maxHistoryItems={4}
        emptyMessage="No matching tools found"
      />
    </div>
  );
}


