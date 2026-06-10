import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDropZone } from "./FileDropZone";
import { DownloadResult } from "./DownloadResult";
import { useSubscription } from "@/hooks/useSubscription";
import { Confetti } from "@/components/AnimatedEffects";
import { Progress } from "@/components/ui/progress";
import { FileRecord } from "@/store/useFileStore";

export interface ToolWorkspaceProps {
  toolName: string;
  toolDescription: string;
  toolIcon: React.ReactNode;
  accentColor: string; // e.g., "violet", "blue", "emerald", "amber", "red", "pink", "orange", "indigo", "lime", "purple", "sky", "cyan"
  configPanel: React.ReactNode;
  previewPanel: React.ReactNode;
  onProcess: () => Promise<void>;
  isProcessing: boolean;
  progress?: number;
  isReady: boolean;
  resultFile?: { name: string; url: string; size: string; savings?: string } | null;
  onReset: () => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  onFilesSelected: (files: File[]) => void;
  files: FileRecord[];
  error?: string | null;
}

export const TOOL_THEMES: Record<string, { accent: string; bg: string; border: string; text: string; gradient: string; glow: string }> = {
  violet: { accent: "violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/30" },
  blue:   { accent: "blue-500",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   gradient: "from-blue-500 to-cyan-500",    glow: "shadow-blue-500/30" },
  emerald:{ accent: "emerald-500",bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/30" },
  amber:  { accent: "amber-500",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/30" },
  red:    { accent: "red-500",    bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-400",    gradient: "from-red-500 to-rose-600",     glow: "shadow-red-500/30" },
  pink:   { accent: "pink-500",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   text: "text-pink-400",   gradient: "from-pink-500 to-fuchsia-500", glow: "shadow-pink-500/30" },
  orange: { accent: "orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", gradient: "from-orange-500 to-amber-600",  glow: "shadow-orange-500/30" },
  indigo: { accent: "indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", gradient: "from-indigo-500 to-blue-600",   glow: "shadow-indigo-500/30" },
  lime:   { accent: "lime-500",   bg: "bg-lime-500/10",   border: "border-lime-500/20",   text: "text-lime-400",   gradient: "from-lime-500 to-green-600",   glow: "shadow-lime-500/30" },
  purple: { accent: "purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", gradient: "from-purple-500 to-pink-600",  glow: "shadow-purple-500/30" },
  sky:    { accent: "sky-500",    bg: "bg-sky-500/10",    border: "border-sky-500/20",    text: "text-sky-400",    gradient: "from-sky-500 to-blue-500",     glow: "shadow-sky-500/30" },
  cyan:   { accent: "cyan-500",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-400",   gradient: "from-cyan-500 to-teal-600",    glow: "shadow-cyan-500/30" },
};

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  toolName,
  toolDescription,
  toolIcon,
  accentColor,
  configPanel,
  previewPanel,
  onProcess,
  isProcessing,
  progress = 0,
  isReady,
  resultFile,
  onReset,
  maxFiles = 1,
  acceptedTypes = ["*"],
  onFilesSelected,
  files,
  error,
}) => {
  const { premiumTier, useCount, getDailyLimit } = useSubscription();
  const [activeTab, setActiveTab] = useState<"files" | "settings" | "preview">("files");

  const theme = TOOL_THEMES[accentColor] || TOOL_THEMES.violet;
  const hasFiles = files.length > 0;
  const isElite = premiumTier === "elite";
  const limitVal = getDailyLimit();
  const maxUsesStr = limitVal === Infinity ? "Unlimited" : limitVal;
  const remaining = limitVal === Infinity ? "Unlimited" : Math.max(0, limitVal - useCount);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = Array.from(e.dataTransfer.files);
      onFilesSelected(selected);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Visual background elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_60%)] pointer-events-none z-0" />
      
      {/* Confetti celebration */}
      <Confetti show={!!resultFile} />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl hover:bg-white/5 transition-colors border border-white/[0.05] text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl bg-gradient-to-tr ${theme.gradient} text-white shadow-lg ${theme.glow}`}>
                {toolIcon}
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                  {toolName}
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium line-clamp-1">
                  {toolDescription}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/10 select-none bg-slate-900 ${
              premiumTier === "free" ? "text-emerald-400 border-emerald-500/20" : "text-amber-400 border-amber-500/20"
            }`}>
              {premiumTier}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!hasFiles ? (
            /* STATE 1 - Drop Zone */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-slate-900/40 border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient} opacity-50`} />
                <FileDropZone
                  acceptedTypes={acceptedTypes}
                  maxFiles={maxFiles}
                  onFilesSelected={onFilesSelected}
                  accentColor={accentColor}
                />
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 border-t border-white/[0.05] pt-6 font-medium">
                  <span>🔒</span>
                  <span>Files processed locally in your browser (when applicable)</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* STATE 2 - Config and preview panels */
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {resultFile ? (
                /* STATE 4 - Completion Screen */
                <div className="max-w-2xl mx-auto w-full">
                  <DownloadResult
                    fileName={resultFile.name}
                    fileSize={resultFile.size}
                    downloadUrl={resultFile.url}
                    savings={resultFile.savings}
                    onReset={onReset}
                    accentColor={accentColor}
                  />
                </div>
              ) : (
                <>
                  {/* Desktop Grid Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-6 items-start">
                    {/* Left: Files / Input Dropzone */}
                    <div className="col-span-4 space-y-4">
                      <div className="bg-slate-900/40 border border-white/[0.08] rounded-3xl p-5 shadow-xl backdrop-blur-md">
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                          <span>Uploaded Files</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.bg} ${theme.text} border ${theme.border}`}>
                            {files.length} / {maxFiles}
                          </span>
                        </h2>
                        
                        <FileDropZone
                          acceptedTypes={acceptedTypes}
                          maxFiles={maxFiles}
                          onFilesSelected={onFilesSelected}
                          accentColor={accentColor}
                          compact
                        />
                      </div>
                    </div>

                    {/* Right: Config Panel */}
                    <div className="col-span-8 space-y-6">
                      <div className="bg-slate-900/40 border border-white/[0.08] rounded-3xl p-6 shadow-xl backdrop-blur-md">
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-5">
                          Configure Settings
                        </h2>
                        <div className={isProcessing ? "opacity-50 pointer-events-none" : ""}>
                          {configPanel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Tabbed Layout */}
                  <div className="md:hidden flex flex-col gap-4">
                    <div className="flex bg-slate-900/60 border border-white/[0.06] p-1.5 rounded-2xl">
                      {(["files", "settings", "preview"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            activeTab === tab
                              ? `bg-gradient-to-r ${theme.gradient} text-white font-black shadow-lg`
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-900/40 border border-white/[0.08] rounded-3xl p-5 min-h-[300px]">
                      {activeTab === "files" && (
                        <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Files ({files.length})</h3>
                          <FileDropZone
                            acceptedTypes={acceptedTypes}
                            maxFiles={maxFiles}
                            onFilesSelected={onFilesSelected}
                            accentColor={accentColor}
                            compact
                          />
                        </div>
                      )}
                      {activeTab === "settings" && (
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Settings</h3>
                          <div className={isProcessing ? "opacity-50 pointer-events-none" : ""}>
                            {configPanel}
                          </div>
                        </div>
                      )}
                      {activeTab === "preview" && (
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Preview</h3>
                          {previewPanel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Preview Panel (Desktop only or if active tab in mobile) */}
                  <div className="hidden md:block bg-slate-900/40 border border-white/[0.08] rounded-3xl p-6 shadow-xl backdrop-blur-md">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-5">
                      Live Preview
                    </h2>
                    {previewPanel}
                  </div>

                  {/* Errors / Warnings */}
                  {error && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold max-w-xl mx-auto w-full">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Processing Overlay / Loader */}
                  {isProcessing && (
                    <div className="bg-slate-900/60 border border-white/[0.06] rounded-3xl p-6 flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
                        <span className="text-sm font-bold text-white">Processing Document...</span>
                      </div>
                      <Progress value={progress} className="h-2 w-full bg-slate-800" />
                      <span className="text-[10px] text-slate-400 font-mono">{progress}% Complete</span>
                    </div>
                  )}

                  {/* Sticky Action Bar */}
                  {!isProcessing && (
                    <div className="sticky bottom-6 z-20 max-w-3xl mx-auto w-full bg-slate-900/90 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
                      <button
                        onClick={onReset}
                        className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Start Over
                      </button>

                      <div className="flex items-center gap-4">
                        {/* Usage Limit Tracker */}
                        <div className="hidden sm:flex flex-col text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Free Usage Meter</span>
                          <span className="text-[11px] font-bold text-slate-300">
                            {remaining} remaining of {maxUsesStr} today
                          </span>
                        </div>

                        <button
                          onClick={onProcess}
                          disabled={!isReady || files.length === 0}
                          className={`relative group px-6 py-3 rounded-xl text-xs font-black text-white shadow-lg tracking-wider transition-all duration-350 cursor-pointer overflow-hidden border border-white/10 ${
                            isReady && files.length > 0
                              ? `bg-gradient-to-r ${theme.gradient} hover:scale-[1.03] active:scale-95 shadow-${theme.glow}`
                              : "opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border-none"
                          }`}
                        >
                          <span className="relative z-10 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            Process Files
                          </span>
                          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
