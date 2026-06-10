// SmartSearchBar.tsx
// Fully working search with: suggestions, keyboard nav, recent searches, predictive output

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ArrowRight, Clock, X, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TOOLS } from "./PopularToolsGrid"; // import your tool list

// ─── Types ───────────────────────────────────────────────────────────────────

interface Suggestion {
  type: "tool" | "recent" | "trending";
  label: string;
  description?: string;
  route?: string;
}

// ─── Trending / popular searches (static seed) ───────────────────────────────
const TRENDING: Suggestion[] = [
  { type: "trending", label: "Compress PDF for scholarship", route: "/compress-for-upload" },
  { type: "trending", label: "Aadhaar mask for CSC", route: "/aadhaar-mask" },
  { type: "trending", label: "PAN card photo resize", route: "/pan-card-resize" },
  { type: "trending", label: "OCR Bengali text", route: "/ocr" },
];

const RECENT_KEY = "filenova_recent_searches";

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const prev = loadRecent().filter((r) => r !== query).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...prev]));
}

// ─── Fuzzy match helper ───────────────────────────────────────────────────────
function matchScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  // partial word match
  const words = q.split(/\s+/);
  const hits = words.filter((w) => t.includes(w)).length;
  return hits > 0 ? (hits / words.length) * 40 : 0;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface SmartSearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SmartSearchBar({
  placeholder = "Search 30+ tools... try 'compress', 'Aadhaar', 'merge'",
  className = "",
}: SmartSearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRecent(loadRecent());
  }, [open]);

  // Build suggestion list
  const suggestions: Suggestion[] = useCallback(() => {
    if (!query.trim()) {
      const recentSugs: Suggestion[] = recent.slice(0, 3).map((r) => ({
        type: "recent",
        label: r,
      }));
      return [...recentSugs, ...TRENDING.slice(0, 4 - recentSugs.length)];
    }

    // Match against tools
    const toolMatches: (Suggestion & { score: number })[] = TOOLS.map((t) => ({
      type: "tool" as const,
      label: t.label,
      description: t.description,
      route: t.route,
      score: Math.max(
        matchScore(t.label, query),
        matchScore(t.description, query)
      ),
    }))
      .filter((t) => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return toolMatches;
  }, [query, recent])();

  const resetActive = () => setActiveIdx(-1);

  const handleSelect = (sug: Suggestion) => {
    const term = sug.label;
    setQuery(term);
    saveRecent(term);
    setRecent(loadRecent());
    setOpen(false);
    if (sug.route) {
      navigate(sug.route);
    } else {
      // fallback: find best matching tool
      const best = TOOLS.find((t) =>
        t.label.toLowerCase().includes(term.toLowerCase())
      );
      if (best) navigate(best.route);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown") { setOpen(true); return; }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        handleSelect(suggestions[activeIdx]);
      } else if (query.trim()) {
        saveRecent(query.trim());
        setOpen(false);
        // navigate to search results page if you have one:
        // navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      resetActive();
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-lg ${className}`}>
      {/* Input */}
      <div
        className={`
          flex items-center gap-2 px-3.5 py-2.5
          bg-white dark:bg-gray-800
          border-2 transition-all duration-200
          rounded-xl shadow-sm
          ${open ? "border-indigo-500/60 shadow-indigo-500/10 shadow-lg" : "border-gray-200 dark:border-gray-700"}
        `}
      >
        <Search
          className={`w-4 h-4 shrink-0 transition-colors duration-200 ${open ? "text-indigo-500" : "text-gray-400"}`}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            resetActive();
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     outline-none min-w-0"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={clearQuery}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-[9999]
                     bg-white dark:bg-gray-900
                     border border-gray-200 dark:border-gray-700
                     rounded-2xl shadow-2xl overflow-hidden
                     animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Section header */}
          <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
            {query.trim() ? (
              <>
                <Search className="w-3 h-3 text-indigo-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Matching tools
                </span>
              </>
            ) : recent.length > 0 ? (
              <>
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Recent & trending
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 text-orange-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Popular in India
                </span>
              </>
            )}
          </div>

          <div className="pb-2">
            {suggestions.map((sug, idx) => (
              <button
                key={`${sug.label}-${idx}`}
                onClick={() => handleSelect(sug)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left
                  transition-colors duration-100
                  ${activeIdx === idx
                    ? "bg-indigo-50 dark:bg-indigo-900/30"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }
                `}
              >
                {/* Icon by type */}
                <span className="shrink-0">
                  {sug.type === "recent" ? (
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                  ) : sug.type === "trending" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </span>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    <HighlightMatch text={sug.label} query={query} />
                  </p>
                  {sug.description && (
                    <p className="text-xs text-gray-400 truncate">{sug.description}</p>
                  )}
                </div>

                <ArrowRight
                  className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                    activeIdx === idx ? "opacity-60 text-indigo-500" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 flex items-center gap-3">
            <kbd className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">↑↓</kbd>
            <span className="text-[10px] text-gray-400">navigate</span>
            <kbd className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">↵</kbd>
            <span className="text-[10px] text-gray-400">select</span>
            <kbd className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded ml-auto">esc</kbd>
            <span className="text-[10px] text-gray-400">close</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper: bold-highlight matched substring ─────────────────────────────────
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-sm px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + query.trim().length)}
      </mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}
