import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Clock, X, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { TOOLS } from "./PopularToolsGrid";
import { trieSearch } from "@/lib/trieSearch";
import { analytics } from "@/lib/analytics";

interface Suggestion {
  type: "tool" | "recent" | "trending";
  label: string;
  description?: string;
  route?: string;
}

const TRENDING: Suggestion[] = [
  { type: "trending", label: "Compress PDF for scholarship", route: "/compress-pdf-for-upload" },
  { type: "trending", label: "Aadhaar mask for CSC", route: "/aadhaar-mask-pdf" },
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

interface SmartSearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SmartSearchBar({
  placeholder,
  className = "",
}: SmartSearchBarProps) {
  const { tText } = useTranslation();
  const defaultPlaceholder = placeholder ?? tText("Search 30+ tools... try 'compress', 'Aadhaar', 'merge'");

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setRecent(loadRecent());
  }, [open]);

  const suggestions: Suggestion[] = useCallback(() => {
    if (!query.trim()) {
      const recentSugs: Suggestion[] = recent.slice(0, 3).map((r) => ({
        type: "recent",
        label: r,
      }));
      return [...recentSugs, ...TRENDING.slice(0, 4 - recentSugs.length)];
    }

    // Dynamic trieSearch lookup for prefixes, synonyms, and typos
    const trieMatches = trieSearch.search(query);
    const toolMatches: Suggestion[] = trieMatches.map((tool) => {
      // Cross reference with local TOOLS list to fetch correct route
      const tInfo = TOOLS.find((t) => t.route.replace("/", "") === tool.id || t.route === `/${tool.id}`);
      return {
        type: "tool" as const,
        label: tool.name,
        description: tool.description,
        route: tInfo ? tInfo.route : `/${tool.id}`,
      };
    }).slice(0, 6);

    return toolMatches;
  }, [query, recent])();

  const resetActive = () => setActiveIdx(-1);

  const handleSelect = (sug: Suggestion) => {
    const term = sug.label;
    setQuery(term);
    saveRecent(term);
    setRecent(loadRecent());
    setOpen(false);
    
    analytics.logEvent("search", "search_redirect", { query: term, matchName: sug.label });

    if (sug.route) {
      setLocation(sug.route);
    } else {
      const best = TOOLS.find((t) =>
        t.label.toLowerCase().includes(term.toLowerCase())
      );
      if (best) setLocation(best.route);
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
        analytics.logEvent("search", "search_input", { query: query.trim() });
        const best = TOOLS.find((t) =>
          t.label.toLowerCase().includes(query.trim().toLowerCase())
        );
        if (best) {
          analytics.logEvent("search", "search_redirect", { query: query.trim(), matchName: best.label });
          setLocation(best.route);
        }
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      resetActive();
    }
  };

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
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input */}
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5
          bg-card/40 backdrop-blur-md
          border transition-all duration-200
          rounded-xl shadow-sm
          ${open ? "border-indigo-500/60 shadow-indigo-500/10 shadow-lg bg-card/60" : "border-border"}
        `}
      >
        <Search
          className={`w-4 h-4 shrink-0 transition-colors duration-200 ${open ? "text-indigo-400" : "text-gray-400"}`}
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
          placeholder={defaultPlaceholder}
          className="flex-1 bg-transparent text-xs text-foreground
                     placeholder:text-gray-400/70
                     outline-none min-w-0 font-medium"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={clearQuery}
            className="text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
            title={tText("Clear search")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2.5 z-[9999]
                       bg-card/95 backdrop-blur-2xl
                       border border-border
                       rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
          {/* Section header */}
          <div className="px-4 pt-3 pb-1.5 flex items-center gap-2 border-b border-border/50">
            {query.trim() ? (
              <>
                <Search className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  {tText("Matching tools")}
                </span>
              </>
            ) : recent.length > 0 ? (
              <>
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {tText("Recent & trending")}
                </span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {tText("Popular in India")}
                </span>
              </>
            )}
          </div>

          <div className="p-1 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent space-y-0.5">
            {suggestions.map((sug, idx) => (
              <button
                key={`${sug.label}-${idx}`}
                onClick={() => handleSelect(sug)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left
                  transition-colors duration-100 cursor-pointer
                  ${activeIdx === idx
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-muted-foreground hover:bg-muted"
                  }
                `}
              >
                {/* Icon by type */}
                <span className="shrink-0">
                  {sug.type === "recent" ? (
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : sug.type === "trending" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </span>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    <HighlightMatch text={sug.label} query={query} />
                  </p>
                  {sug.description && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sug.description}</p>
                  )}
                </div>

                <ArrowRight
                  className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                    activeIdx === idx ? "opacity-100 text-indigo-400" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="border-t border-border/50 px-4 py-2 flex items-center gap-3 bg-muted/10">
            <kbd className="text-[9px] bg-secondary text-muted-foreground px-1 py-0.5 rounded font-extrabold">↑↓</kbd>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{tText("navigate")}</span>
            <kbd className="text-[9px] bg-secondary text-muted-foreground px-1 py-0.5 rounded font-extrabold">↵</kbd>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{tText("select")}</span>
            <kbd className="text-[9px] bg-secondary text-muted-foreground px-1 py-0.5 rounded ml-auto font-extrabold">esc</kbd>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{tText("close")}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-500/30 text-indigo-300 rounded-sm px-0.5 not-italic font-bold">
        {text.slice(idx, idx + query.trim().length)}
      </mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

export default SmartSearchBar;
