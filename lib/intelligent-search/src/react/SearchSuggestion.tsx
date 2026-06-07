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

  const defaultContent = (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={`block w-full text-left px-4 py-3 transition-colors duration-150 ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
      } ${className ?? ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3">
        {result.tool.icon && (
          <span className="text-lg flex-shrink-0" aria-hidden="true">
            {result.tool.icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <MatchHighlight text={result.tool.name} query={query} />
          {result.tool.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {result.tool.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreBadge score={result.score} />
          <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
            {result.reason.replace(/_/g, ' ')}
          </span>
        </div>
      </div>
    </button>
  );

  return renderItem ? renderItem(result, isSelected) : defaultContent;
}

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

function ScoreBadge({ score }: { score: number }): React.ReactNode {
  const pct = Math.round(score * 100);
  const color =
    pct >= 90
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : pct >= 70
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  return (
    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${color}`}>
      {pct}%
    </span>
  );
}
