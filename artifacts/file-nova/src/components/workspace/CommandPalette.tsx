import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, Monitor, Sun, Moon, ArrowRight, Laptop } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { TOOL_REGISTRY, ToolRegistryItem } from "@/lib/toolPlugin";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // Keyboard Navigation inside Command Palette
  const items = React.useMemo(() => {
    const toolItems: Array<{ id: string; name: string; type: "tool"; sub: string; action: () => void }> = Object.values(TOOL_REGISTRY)
      .filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
      .map(t => ({
        id: t.id,
        name: t.name,
        type: "tool" as const,
        sub: t.description,
        action: () => {
          setLocation(`/${t.id}`);
          onClose();
        }
      }));

    const systemItems = [
      {
        id: "theme-light",
        name: "Switch to Light Mode",
        type: "system" as const,
        sub: "Adjust interface to light colors",
        action: () => {
          if (theme !== "light") toggleTheme();
          toast.success("Theme changed to light mode.");
          onClose();
        }
      },
      {
        id: "theme-dark",
        name: "Switch to Dark Mode",
        type: "system" as const,
        sub: "Switch to high contrast dark styling",
        action: () => {
          if (theme !== "dark") toggleTheme();
          toast.success("Theme changed to dark mode.");
          onClose();
        }
      },
      {
        id: "nav-home",
        name: "Navigate to Dashboard",
        type: "system" as const,
        sub: "Return to the main workspace home",
        action: () => {
          setLocation("/");
          onClose();
        }
      }
    ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

    return [...toolItems, ...systemItems];
  }, [query, setLocation, theme, toggleTheme, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 font-sans animate-fade-in">
      <motion.div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-xl bg-card/80 backdrop-blur-2xl border border-border rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[50vh]"
      >
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search a document tool..."
            className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/80"
          />
          <kbd className="hidden sm:inline-block text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase border border-border shrink-0 select-none">
            ESC
          </kbd>
        </div>

        {/* List items */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground/80 font-bold">
              No matching tools or system settings found.
            </div>
          ) : (
            items.map((item, idx) => {
              const active = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    active ? "bg-brand-primary text-white shadow-glow-sm scale-[1.01]" : "hover:bg-muted/5 text-foreground/80"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-black block truncate">
                      {item.name}
                    </span>
                    <span className={`text-[10px] block truncate font-medium mt-0.5 ${active ? "text-indigo-200" : "text-muted-foreground/80"}`}>
                      {item.sub}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.type === "system" ? (
                      <kbd className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${active ? "bg-indigo-700 text-indigo-100" : "bg-muted/60 text-muted-foreground border border-border"}`}>
                        System
                      </kbd>
                    ) : (
                      <kbd className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${active ? "bg-indigo-700 text-indigo-100" : "bg-muted/60 text-muted-foreground border border-border"}`}>
                        Tool
                      </kbd>
                    )}
                    {active && <ArrowRight className="h-4 w-4 shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default CommandPalette;
