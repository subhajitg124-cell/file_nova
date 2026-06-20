import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Trash2, Edit3, ChevronDown, ChevronUp, Clock, Settings2,
  AlertTriangle, CheckCircle2, XCircle, Loader2, Download, Zap, ShieldCheck,
} from 'lucide-react';
import type { Workflow, WorkflowResult } from './types';
import { WorkflowHaltError } from './types';
import { getWorkflows, deleteWorkflow } from './workflowStorage';
import { runWorkflow } from './workflowRunner';

interface SavedWorkflowsProps {
  /** Triggered to switch to builder with an existing workflow loaded for editing */
  onEdit?: (workflow: Workflow) => void;
}

export function SavedWorkflows({ onEdit }: SavedWorkflowsProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => getWorkflows());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Re-sync from localStorage whenever the tab gains focus
  useEffect(() => {
    const handler = () => setWorkflows(getWorkflows());
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteWorkflow(id);
    setWorkflows(getWorkflows());
    if (expandedId === id) setExpandedId(null);
  }, [expandedId]);

  if (workflows.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
        <Zap className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm font-bold text-muted-foreground">No saved workflows yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Use the builder above to create your first workflow.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workflows.map((wf) => (
        <WorkflowCard
          key={wf.id}
          workflow={wf}
          isExpanded={expandedId === wf.id}
          onToggle={() => setExpandedId(expandedId === wf.id ? null : wf.id)}
          onDelete={() => handleDelete(wf.id)}
          onEdit={() => onEdit?.(wf)}
          onRunComplete={() => setWorkflows(getWorkflows())}
        />
      ))}
    </div>
  );
}

// ── Individual workflow card ────────────────────────────────────────────────

function WorkflowCard({
  workflow,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
  onRunComplete,
}: {
  workflow: Workflow;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onRunComplete: () => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRun = useCallback(async (files: File[]) => {
    if (!files.length || isRunning) return;
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const res = await runWorkflow(workflow.steps, files, {
        isMockMode: false,
        onProgress: (cur, total, label) => setProgress({ current: cur, total, label }),
      });
      setResult(res);
    } catch (err) {
      if (err instanceof WorkflowHaltError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Workflow failed unexpectedly.');
      }
    } finally {
      setIsRunning(false);
    }
  }, [workflow, isRunning]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) handleRun(files);
    e.target.value = '';
  }, [handleRun]);

  const stepCount = workflow.steps.length;
  const hasSecurity = workflow.steps.some((s) => s.isSecurity);

  return (
    <motion.div
      layout
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Card Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        {workflow.icon && <span className="text-lg shrink-0">{workflow.icon}</span>}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-foreground block truncate">{workflow.name}</span>
          {workflow.description && (
            <span className="text-[10px] text-muted-foreground block truncate">{workflow.description}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground font-bold bg-muted/50 rounded-full px-2 py-0.5">
            {stepCount} step{stepCount !== 1 && 's'}
          </span>
          {hasSecurity && (
            <span className="inline-flex items-center gap-0.5 text-amber-500" title="Contains security step">
              <ShieldCheck className="h-3 w-3" />
            </span>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-3">
              {/* Step List */}
              <div className="space-y-1">
                {workflow.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-foreground">{step.label}</span>
                    {step.isSecurity && <span className="text-[9px] text-amber-500 font-bold">🔒</span>}
                    {step.requiresBackend && !step.isSecurity && <span className="text-[9px] text-muted-foreground/60">(server)</span>}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {isRunning && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-bold">{progress.label}</span>
                    <span>{progress.current + 1} / {progress.total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((progress.current + 1) / progress.total) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold">Workflow complete — {result.stepsCompleted} steps ran</span>
                  </div>
                  <a
                    href={result.url}
                    download={result.filename}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download {result.filename}
                  </a>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">{error}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,image/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Run workflow
                    </>
                  )}
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 border border-red-500/20 rounded-lg px-3 py-2 hover:bg-red-500/10 transition-colors cursor-pointer ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
