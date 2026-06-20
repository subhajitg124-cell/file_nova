import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Zap, ChevronDown, ChevronUp, Play, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { WorkflowBuilder } from "@/features/workflows/WorkflowBuilder";
import { SavedWorkflows } from "@/features/workflows/SavedWorkflows";
import { PRESET_WORKFLOWS } from "@/features/workflows/presetWorkflows";
import type { Workflow, WorkflowResult } from "@/features/workflows/types";
import { WorkflowHaltError } from "@/features/workflows/types";
import { runWorkflow } from "@/features/workflows/workflowRunner";
import { motion, AnimatePresence } from "framer-motion";

// ── Preset card (copy of the preset data, shown with run button) ─────────────

function PresetCard({ preset }: { preset: Workflow }) {
  const [expanded, setExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRun = async (files: File[]) => {
    if (!files.length || isRunning) return;
    setIsRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await runWorkflow(preset.steps, files, {
        isMockMode: false,
        onProgress: (cur, total, label) => setProgress({ current: cur, total, label }),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof WorkflowHaltError ? err.message : err instanceof Error ? err.message : 'Workflow failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) handleRun(files);
    e.target.value = '';
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xl shrink-0">{preset.icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-foreground block">{preset.name}</span>
          <span className="text-[10px] text-muted-foreground block">{preset.description}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-bold bg-muted/50 rounded-full px-2 py-0.5 shrink-0">
          {preset.steps.length} step{preset.steps.length !== 1 && 's'}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-3">
              <div className="space-y-1">
                {preset.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black shrink-0">{idx + 1}</span>
                    <span className="font-bold text-foreground">{step.label}</span>
                    {step.isSecurity && <span className="text-[9px] text-amber-500 font-bold">🔒</span>}
                  </div>
                ))}
              </div>

              {isRunning && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-bold">{progress.label}</span>
                    <span>{progress.current + 1} / {progress.total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" initial={{ width: '0%' }} animate={{ width: `${((progress.current + 1) / progress.total) * 100}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>
              )}

              {result && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold">Complete — {result.stepsCompleted} steps ran</span>
                  </div>
                  <a href={result.url} download={result.filename} className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors">
                    <Download className="h-3.5 w-3.5" />
                    Download {result.filename}
                  </a>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{error}</span>
                </div>
              )}

              <div>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,image/*" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  {isRunning ? 'Running...' : 'Run with files'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

type Tab = 'presets' | 'builder' | 'saved';

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('presets');

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 font-sans">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold transition hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <UserProfileDropdown />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6 animate-fade-in">
        <section className="rounded-3xl border border-border bg-card p-8 shadow-premium">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Workflows</h1>
              <p className="text-sm text-muted-foreground">
                Chain multiple tools into one automated sequence — save and re-run anytime.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border w-fit mb-6">
            {([
              { key: 'presets', label: 'Starter workflows', icon: Zap },
              { key: 'builder', label: 'Build new', icon: null },
              { key: 'saved', label: 'My workflows', icon: null },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === key
                    ? "bg-card shadow-sm text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-4">
                Pre-built workflows for common Indian student & CSC tasks — click to expand and run.
              </p>
              {PRESET_WORKFLOWS.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          )}

          {activeTab === 'builder' && (
            <WorkflowBuilder onSaved={() => setActiveTab('saved')} />
          )}

          {activeTab === 'saved' && (
            <SavedWorkflows />
          )}
        </section>
      </main>
    </div>
  );
}
