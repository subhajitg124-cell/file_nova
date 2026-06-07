import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Clock, TrendingUp, FileText, Image, Video, FileSpreadsheet, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { TOOLS, ToolItem } from '@/components/workspace/ToolGrid';
import { rankTools, getRankedResults, recordToolUsage } from '../search/Ranking/ranking';
import { fuzzy, multiWordMatch, fuzzyScore } from '../search/Fuzzy/fuzzy';
import { expandAlias } from '../search/Aliases/alias';

const RECENT_SEARCHES_KEY = 'filenova-recent-searches';
const TRENDING_TOOLS: string[] = ['Merge PDFs', 'Compress PDF', 'Remove Background', 'Resize Image', 'PDF to DOCX', 'OCR PDF'];

interface GlobalSearchProps {
  onSearch?: (query: string) => void;
  expanded?: boolean;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSearch, expanded = false }) => {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const next = [term, ...recentSearches.filter(s => s !== term).slice(0, 4)];
    setRecentSearches(next);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  };

  const results = useMemo(() => {
    const recentTools: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('filenova-recent-tools');
        if (stored) recentTools.push(...JSON.parse(stored));
      } catch {}
    }
    return getRankedResults(TOOLS, query);
  }, [query]);

  const trendingMatches = useMemo(() => {
    return TRENDING_TOOLS.filter(t => t.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(0);
    onSearch?.('');
  };

  const handleSelectTool = (tool: ToolItem) => {
    saveSearch(query);
    setQuery('');
    setIsOpen(false);
    recordToolUsage(tool.actionName, tool.title);
    const toolUrl = `/${tool.actionName.replace(/_/g, '-')}`;
    setLocation(toolUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[highlightedIndex]) {
        handleSelectTool(results[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const categories = [
    { key: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-400' },
    { key: 'image', label: 'Images', icon: Image, color: 'text-blue-400' },
    { key: 'video', label: 'Video', icon: Video, color: 'text-violet-400' },
    { key: 'office', label: 'Office', icon: FileSpreadsheet, color: 'text-emerald-400' },
  ];

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${expanded ? 'fixed inset-4 z-50 bg-background' : ''}`}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tools... (e.g. 'merge pdf', 'compress image')"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
            onSearch?.(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className={`w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60 ${expanded ? 'text-base py-4' : ''}`}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-premium max-h-96 overflow-y-auto z-50"
          >
            {query ? (
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-2">
                  Search Results ({results.length})
                </p>
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.slice(0, 8).map((tool: ToolItem, idx: number) => (
                      <button
                        key={tool.actionName}
                        onMouseDown={() => handleSelectTool(tool)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition text-left ${
                          idx === highlightedIndex ? 'bg-muted' : ''
                        }`}
                      >
                        <tool.icon className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{tool.title}</p>
                          <p className="text-[10px] text-muted-foreground">{tool.description.slice(0, 50)}...</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground px-3 py-4 text-center">
                    No tools found. Try "merge pdf", "compress image", or "ocr pdf".
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Recent Searches
                    </p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {recentSearches.slice(0, 5).map((term) => (
                        <button
                          key={term}
                          onMouseDown={() => { setQuery(term); setIsOpen(true); onSearch?.(term); }}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 px-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Trending Tools
                  </p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {trendingMatches.map((toolName) => {
                      const tool = TOOLS.find(t => t.title === toolName);
                      return tool ? (
                        <button
                          key={tool.actionName}
                          onMouseDown={() => handleSelectTool(tool)}
                          className="text-xs px-2 py-1 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          {toolName}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;