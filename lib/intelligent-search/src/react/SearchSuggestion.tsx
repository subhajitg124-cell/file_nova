import type { SearchResult } from '../types.js';
import type { ToolMetadata } from '../types.js';

export interface SearchSuggestionProps {
  query: string;
  result: SearchResult;
  isSelected: boolean;
  onSelect: (result: SearchResult) => void;
  onHover?: (result: SearchResult) => void;
  renderItem?: (result: SearchResult, isSelected: boolean) => React.ReactNode;
  className?: string;
}

export function SearchSuggestion(props: SearchSuggestionProps): React.ReactNode {
  const { query, result, isSelected, onSelect, onHover, renderItem, className } = props;
  const handleClick = () => onSelect(result);
  const handleMouseEnter = () => onHover?.(result);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSelect(result);
    }
  };

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

  const defaultContent = (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={`flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-900 dark:text-gray-100'
      } ${className ?? ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onKeyDown={handleKeyDown}
    >
      {result.tool.icon && (
        <span className="text-xl flex-shrink-0 mt-0.5 h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center" aria-hidden="true">
          {result.tool.icon}
        </span>
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <MatchHighlight text={result.tool.name} query={query} />
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

  return renderItem ? renderItem(result, isSelected) : defaultContent;
}

function MatchHighlight({ text, query }: { text: string; query: string }): React.ReactNode {
  if (!query || query.length === 0) return <span className="text-sm font-bold">{text}</span>;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return <span className="text-sm font-bold">{text}</span>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + lowerQuery.length);
  const after = text.slice(idx + lowerQuery.length);
  return (
    <span className="text-sm font-bold">
      {before}
      <mark className="bg-transparent font-semibold text-blue-700 dark:text-blue-300 underline decoration-blue-400/60 underline-offset-2">
        {match}
      </mark>
      {after}
    </span>
  );
}
