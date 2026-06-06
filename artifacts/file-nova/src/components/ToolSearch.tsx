import React, { useEffect, useRef } from "react";
import { Search as SearchIcon } from "lucide-react";

interface ToolSearchProps {
  query: string;
  setQuery: (val: string) => void;
}

export function ToolSearch({ query, setQuery }: ToolSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative max-w-lg mx-auto mb-8">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search tools... e.g. compress, Aadhaar, merge"
        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200
                   dark:border-gray-700 bg-white dark:bg-gray-800
                   text-gray-900 dark:text-white text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}

export default ToolSearch;
