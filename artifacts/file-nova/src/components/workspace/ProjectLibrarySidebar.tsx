import React, { useState } from "react";
import {
  FolderGit, Play, Star, Download, Trash2, AlertTriangle, CloudOff, CloudLightning
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DBFileRecord } from "@/lib/fileDatabase";

interface ProjectLibrarySidebarProps {
  currentProject: string;
  projectsList: string[];
  showAddProject: boolean;
  newProjectName: string;
  activeTab: "current" | "recent" | "downloads" | "favorites";
  files: Array<{ id: string; name: string; size: number; type: string }>;
  libraryFiles: DBFileRecord[];
  dbSize: number;
  isOnline: boolean;
  formatBytes: (bytes: number) => string;
  onProjectChange: (val: string) => void;
  onToggleAddProject: () => void;
  onNewProjectNameChange: (val: string) => void;
  onAddProject: (e: React.FormEvent) => void;
  onActiveTabChange: (tab: "current" | "recent" | "downloads" | "favorites") => void;
  onImportLibraryFile: (dbFile: DBFileRecord) => void;
  onToggleFavoriteFile: (dbFile: DBFileRecord) => void;
  onDownloadLibraryFile: (dbFile: DBFileRecord) => void;
  onDeleteLibraryFile: (id: string) => void;
}

export function ProjectLibrarySidebar({
  currentProject,
  projectsList,
  showAddProject,
  newProjectName,
  activeTab,
  files,
  libraryFiles,
  dbSize,
  isOnline,
  formatBytes,
  onProjectChange,
  onToggleAddProject,
  onNewProjectNameChange,
  onAddProject,
  onActiveTabChange,
  onImportLibraryFile,
  onToggleFavoriteFile,
  onDownloadLibraryFile,
  onDeleteLibraryFile,
}: ProjectLibrarySidebarProps) {
  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "22rem", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="hidden lg:flex border-r border-border bg-muted/20 p-4 flex-col gap-5 overflow-y-auto h-full shrink-0"
    >
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1">
          <FolderGit className="h-3.5 w-3.5 text-primary" /> Active Project Sandbox
        </h3>

        <div className="flex gap-1.5">
          <select
            value={currentProject}
            onChange={(e) => onProjectChange(e.target.value)}
            title="Select active user project container"
            className="flex-1 bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-bold"
          >
            {projectsList.map(proj => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
          <button
            onClick={onToggleAddProject}
            className="px-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-black text-xs cursor-pointer"
            title="Create new project folder"
          >
            +
          </button>
        </div>

        {showAddProject && (
          <form onSubmit={onAddProject} className="flex gap-1.5 animate-fade-up">
            <input
              type="text"
              required
              value={newProjectName}
              onChange={(e) => onNewProjectNameChange(e.target.value)}
              placeholder="New project name..."
              className="flex-1 bg-muted border border-border rounded-xl p-1.5 text-[10px] text-foreground focus:outline-none focus:border-primary"
            />
            <button type="submit" className="px-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer">Add</button>
          </form>
        )}
      </div>

      <div className="space-y-3 flex-1 flex flex-col min-h-0">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
          <span>Global File Manager</span>
          <span className="text-[8px] font-mono text-muted-foreground/80 bg-muted px-1 py-0.5 rounded uppercase">{activeTab} view</span>
        </h3>

        <div className="grid grid-cols-4 gap-1 p-1 bg-muted/60 rounded-xl border border-border">
          {(["current", "recent", "downloads", "favorites"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => onActiveTabChange(tab)}
              className={`text-[9px] font-black uppercase py-1 rounded-lg transition text-center cursor-pointer ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/5"
              }`}
            >
              {tab === "current" ? "Queue" : tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-muted/45 border border-border rounded-2xl p-2 space-y-1.5 min-h-[150px]">
          {activeTab === "current" ? (
            files.length === 0 ? (
              <span className="text-[9px] text-muted-foreground/60 block text-center py-6">No files currently in active processing queue.</span>
            ) : (
              files.map((f, idx) => (
                <div key={f.id} className="flex flex-col gap-1 text-[11px] bg-card/50 p-2.5 rounded-xl border border-border">
                  <span className="truncate font-bold text-foreground">{idx + 1}. {f.name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/80">{formatBytes(f.size)} &bull; {f.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}</span>
                </div>
              ))
            )
          ) : (
            libraryFiles.length === 0 ? (
              <span className="text-[9px] text-muted-foreground/60 block text-center py-6">No files stored in project sandbox library.</span>
            ) : (
              libraryFiles.map((lf) => (
                <div key={lf.id} className="flex items-center justify-between text-[11px] bg-card/40 p-2 rounded-xl border border-border hover:bg-card/80 transition group">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-foreground/80 block truncate" title={lf.name}>{lf.name}</span>
                    <span className="text-[8.5px] font-mono text-muted-foreground/80 block">{formatBytes(lf.size)}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onImportLibraryFile(lf)}
                      title="Load into workspace raw files queue"
                      className="p-1 rounded bg-muted hover:bg-primary hover:text-white text-primary cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-current" />
                    </button>
                    <button
                      onClick={() => onToggleFavoriteFile(lf)}
                      title="Add/remove favorite"
                      className={`p-1 rounded bg-muted hover:bg-accent hover:text-foreground cursor-pointer ${
                        lf.category === "Favorites" ? "text-accent-foreground" : "text-muted-foreground/80"
                      }`}
                    >
                      <Star className="h-3 w-3 fill-current" />
                    </button>
                    <button
                      onClick={() => onDownloadLibraryFile(lf)}
                      title="Download file blob"
                      className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDeleteLibraryFile(lf.id)}
                      title="Delete file permanently"
                      className="p-1 rounded bg-muted hover:bg-destructive/10 hover:text-destructive text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">Offline Caching & Sync</h3>
        <div className="p-3 bg-muted/85 border border-border rounded-2xl text-[10px] space-y-2 leading-relaxed">
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground">IndexedDB status:</span>
            <span className="text-emerald-400 font-black uppercase">Active</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground">Total Cache Size:</span>
            <span className={`font-mono ${dbSize > 100 * 1024 * 1024 ? "text-destructive font-bold" : "text-primary/80"}`}>
              {formatBytes(dbSize)}
            </span>
          </div>

          {dbSize > 100 * 1024 * 1024 && (
            <div className="p-2 rounded-xl bg-rose-950/50 border border-rose-500/20 text-rose-400 flex items-start gap-1">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400 animate-pulse" />
              <span>Cache exceeds 100MB. Consider clearing old projects.</span>
            </div>
          )}

          {!isOnline ? (
            <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/20 text-red-400 flex items-start gap-1">
              <CloudOff className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400" />
              <span>Internet offline. Cloud-based conversions will fail until reconnected.</span>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-955/50 border border-emerald-500/20 text-emerald-400 flex items-start gap-1">
              <CloudLightning className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" />
              <span>Synchronized with cloud server gateway. Offline fallbacks active.</span>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
