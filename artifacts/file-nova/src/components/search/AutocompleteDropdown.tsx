import React, { useEffect } from "react";
import { SearchResult } from "@/lib/search/Engine";
import { ToolMetadata } from "@/lib/search/Trie";
import { History, Sparkles, Clock, Flame, ChevronRight, Zap } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useLocation } from "wouter";

interface AutocompleteDropdownProps {
  query: string;
  results: SearchResult[];
  recentTools: ToolMetadata[];
  frequentTools: ToolMetadata[];
  activeIndex: number;
  onSelect: (tool: ToolMetadata) => void;
  onClose: () => void;
}

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function AutocompleteDropdown({
  query,
  results,
  recentTools,
  frequentTools,
  activeIndex,
  onSelect,
  onClose
}: AutocompleteDropdownProps) {
  const { tText } = useTranslation();
  const [, setLocation] = useLocation();

  const highlightMatch = (text: string, queryStr: string) => {
    const trimmed = queryStr.trim();
    if (!trimmed) return text;
    try {
      const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === trimmed.toLowerCase() 
          ? <mark key={i} className="bg-indigo-500/30 text-indigo-450 dark:text-indigo-300 font-bold px-0.5 rounded">{part}</mark>
          : part
      );
    } catch (_) {
      return text;
    }
  };

  useEffect(() => {
    const handleOutsideClick = () => onClose();
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [onClose]);

  const showRecentOrFrequent = !query.trim();

  if (showRecentOrFrequent && recentTools.length === 0 && frequentTools.length === 0) {
    return null;
  }

  if (!showRecentOrFrequent && results.length === 0) {
    return (
      <div 
        className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-border rounded-2xl shadow-premium p-6 text-center z-50 backdrop-blur-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs text-muted-foreground">{tText("No matching tools found. Try searching for synonyms like 'combine' or 'shrink'.")}</p>
      </div>
    );
  }

  return (
    <div 
      className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 dark:bg-slate-950/95 border border-border/80 rounded-2xl shadow-premium overflow-hidden z-50 backdrop-blur-xl animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      {showRecentOrFrequent ? (
        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {recentTools.length > 0 && (
            <div>
              <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400" />
                {tText("Recent Tools")}
              </h4>
              <div className="space-y-1">
                {recentTools.map((tool) => (
                  <button
                    key={`recent-${tool.id}`}
                    onClick={() => onSelect(tool)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/[0.04] transition group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground font-bold group-hover:text-primary transition-colors">{tool.name}</span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {frequentTools.length > 0 && (
            <div>
              <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                {tText("Frequently Used Tools")}
              </h4>
              <div className="space-y-1">
                {frequentTools.map((tool) => (
                  <button
                    key={`freq-${tool.id}`}
                    onClick={() => onSelect(tool)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/[0.04] transition group"
                  >
                    <div>
                      <p className="text-xs text-foreground font-bold group-hover:text-primary transition-colors">{tool.name}</p>
                      <p className="text-[9px] text-muted-foreground leading-none mt-0.5">{tool.description}</p>
                    </div>
                    <ChevronRight className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-2 max-h-[350px] overflow-y-auto space-y-0.5 animate-scale-in">
          {results.map((result, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={result.tool.id}
                onClick={() => onSelect(result.tool)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                  isSelected ? "bg-primary text-primary-foreground shadow-glow" : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black truncate ${isSelected ? "text-white" : "text-foreground"}`}>
                      {highlightMatch(result.tool.name, query)}
                    </span>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-white/20 text-white" : "bg-muted/50 text-slate-400"
                    }`}>
                      {result.tool.category}
                    </span>
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 leading-none ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                    {result.tool.description}
                  </p>
                </div>
                
                <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-0.5">
                  <span className={`text-[8px] font-black tracking-wider uppercase ${
                    isSelected ? "text-white/90" : "text-indigo-400"
                  }`}>
                    {result.reason}
                  </span>
                  <span className={`text-[9px] font-extrabold leading-none ${
                    isSelected ? "text-white/70" : "text-slate-500"
                  }`}>
                    Match: {(result.score * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
