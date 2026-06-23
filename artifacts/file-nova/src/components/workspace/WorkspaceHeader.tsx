import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft, Search, Save, HelpCircle, Trash2, FolderGit, Clock, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useFileStore } from "@/store/useFileStore";
import { ToolWorkspaceProps } from "./ToolWorkspace";

interface WorkspaceHeaderProps {
  toolName: string;
  toolIcon: React.ReactNode;
  accentColor: string;
  hasFiles: boolean;
  recentFiles: Array<{ name: string; url: string; time: string }>;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchResults: any[];
  onSearchSelect: (id: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onSaveSession: () => void;
  onPanicShredder: () => void;
  helpOpen: boolean;
  onToggleHelp: () => void;
}

export function WorkspaceHeader({
  toolName,
  toolIcon,
  accentColor,
  hasFiles,
  recentFiles,
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchSelect,
  sidebarOpen,
  onToggleSidebar,
  onSaveSession,
  onPanicShredder,
  helpOpen,
  onToggleHelp,
}: WorkspaceHeaderProps) {
  const [, setLocation] = useLocation();
  const { TOOL_THEMES } = require("./ToolWorkspace");
  const theme = TOOL_THEMES[accentColor] || TOOL_THEMES.violet;

  return (
    <header className="h-14 fn-glass flex items-center justify-between px-4 z-40 sticky top-0">
      <div className="flex items-center gap-3">
        <Link href="/" className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${theme.gradient} text-white shadow-lg`}>
            {toolIcon}
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-foreground leading-none">
              {toolName}
            </h1>
            <span className="text-[9px] text-muted-foreground leading-none">FileNova Sandbox</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 relative max-w-xs w-full">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or Ctrl + K..."
            className="w-full bg-muted/80 border border-border rounded-xl pl-8 pr-3 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute top-9 left-0 right-0 bg-card border border-border rounded-2xl overflow-hidden shadow-2xl p-1 z-50">
            {searchResults.map((r: any) => (
              <button
                key={r.id}
                onClick={() => {
                  onSearchSelect(r.id);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-bold transition flex items-center justify-between cursor-pointer"
              >
                <span>{r.name}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          title="Toggle workspace project library sidebar"
          aria-label="Toggle Project Library"
          className="px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl border border-white/10 bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
        >
          <FolderGit className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Project Library</span>
        </button>

        {recentFiles.length > 0 && (
          <div className="relative group">
            <button
              title="View recent processed files"
              aria-label="View recent processed files"
              className="px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl border border-white/10 bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Recent</span>
            </button>
            <div className="absolute right-0 top-8 w-56 fn-glass rounded-xl shadow-[var(--fn-shadow-elevated)] p-2 hidden group-hover:block z-50 text-[var(--fn-text-primary)]">
              <span className="text-[9px] font-black uppercase text-slate-500 px-2 py-1 block">Recently Processed</span>
              <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                {recentFiles.map((f, i) => (
                  <a
                    key={i}
                    href={f.url}
                    download={f.name}
                    className="w-full text-left p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white text-[10px] font-bold block truncate"
                  >
                    <div className="truncate">{f.name}</div>
                    <span className="text-[8px] text-slate-500">{f.time}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onSaveSession}
          disabled={!hasFiles}
          className="px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl border border-white/10 bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
          title="Save workspace file queue"
          aria-label="Save workspace file queue"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Save Session</span>
        </button>

        <button
          onClick={onPanicShredder}
          className="px-2 py-1 md:px-2.5 md:py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-600 text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-white transition cursor-pointer flex items-center justify-center"
          title="Permanently delete all workspace database cache files"
          aria-label="Panic Shredder Purge"
        >
          <span className="hidden md:inline">Shred Cache</span>
          <span className="md:hidden flex items-center justify-center"><Trash2 className="h-3.5 w-3.5" /></span>
        </button>

        <button
          onClick={onToggleHelp}
          title="Toggle help documentation"
          aria-label="Toggle help documentation"
          className="p-1.5 rounded-xl border border-white/10 bg-slate-950/40 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
