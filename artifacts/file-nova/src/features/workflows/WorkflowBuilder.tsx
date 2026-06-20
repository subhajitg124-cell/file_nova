import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, GripVertical, ArrowRight, ArrowDown, Play, Save, X, ChevronDown,
  FileDown, Image as ImageIcon, Scissors, Merge, ShieldCheck, Lock, Droplets,
  Settings2, Zap, AlertTriangle, CheckCircle2, RotateCw, FileUp, Fingerprint,
} from 'lucide-react';
import type { Workflow, WorkflowStep } from './types';
import { PRESET_WORKFLOWS } from './presetWorkflows';
import { saveWorkflow, getWorkflows } from './workflowStorage';

// Available step definitions — each maps to a processor in workflowRunner.ts
interface StepDef {
  id: string;
  label: string;
  category: 'pdf' | 'image';
  icon: any;
  defaultConfig: Record<string, unknown>;
  requiresBackend?: boolean;
  isSecurity?: boolean;
  /** Human-readable description of what this step does */
  description: string;
}

const AVAILABLE_STEPS: StepDef[] = [
  {
    id: 'compress-pdf',
    label: 'Compress PDF',
    category: 'pdf',
    icon: FileDown,
    description: 'Reduce PDF file size',
    defaultConfig: { quality: 75 },
  },
  {
    id: 'merge-pdf',
    label: 'Merge PDFs',
    category: 'pdf',
    icon: Merge,
    description: 'Combine multiple PDFs into one',
    defaultConfig: {},
  },
  {
    id: 'add-watermark-pdf',
    label: 'Add Watermark',
    category: 'pdf',
    icon: Droplets,
    description: 'Add visible watermark to PDF pages',
    defaultConfig: {
      watermark_text: 'CONFIDENTIAL',
      watermark_size: 48,
      watermark_opacity: 18,
      watermark_position: 'diagonal',
      watermark_rotation: -45,
    },
  },
  {
    id: 'protect-pdf',
    label: 'Password Protect',
    category: 'pdf',
    icon: Lock,
    description: 'Add password protection to a PDF',
    requiresBackend: true,
    isSecurity: true,
    defaultConfig: { protect_level: 'standard' },
  },
  {
    id: 'compress-image',
    label: 'Compress Image',
    category: 'image',
    icon: ImageIcon,
    description: 'Reduce image file size',
    defaultConfig: { quality: 80 },
  },
  {
    id: 'resize-image',
    label: 'Resize Image',
    category: 'image',
    icon: FileUp,
    description: 'Resize to exact pixel dimensions',
    defaultConfig: { resize_width: 800, resize_height: 600, resize_format: 'jpeg' },
  },
  {
    id: 'convert-image',
    label: 'Convert Image Format',
    category: 'image',
    icon: RotateCw,
    description: 'Convert between PNG, JPEG, WebP',
    defaultConfig: { target_format: 'webp', quality: 92 },
  },
  {
    id: 'aadhaar-mask',
    label: 'Mask Aadhaar Number',
    category: 'pdf',
    icon: Fingerprint,
    description: 'Blur/mask first 8 digits of Aadhaar',
    defaultConfig: {},
  },
];

interface BuilderProps {
  /** Called when user saves a new workflow — parent decides what to do (e.g. navigate) */
  onSaved?: (workflow: Workflow) => void;
}

let stepCounter = 0;
function makeStepId() {
  return `step-${Date.now()}-${++stepCounter}`;
}

export function WorkflowBuilder({ onSaved }: BuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const addStep = useCallback((def: StepDef) => {
    const newStep: WorkflowStep = {
      id: def.id,
      label: def.label,
      config: { ...def.defaultConfig },
      requiresBackend: def.requiresBackend,
      isSecurity: def.isSecurity,
    };
    setSteps((prev) => [...prev, newStep]);
    setExpandedStep(newStep.label);
  }, []);

  const removeStep = useCallback((idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const moveStep = useCallback((idx: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setSaveError('Give your workflow a name.');
      return;
    }
    if (steps.length === 0) {
      setSaveError('Add at least one step.');
      return;
    }

    const workflow: Workflow = {
      id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      description: description.trim(),
      steps,
      isPreset: false,
      createdAt: Date.now(),
    };

    setSaving(true);
    try {
      saveWorkflow(workflow);
      onSaved?.(workflow);
      // Reset form
      setName('');
      setDescription('');
      setSteps([]);
      setExpandedStep(null);
      setSaveError('');
    } catch {
      setSaveError('Could not save — localStorage may be full.');
    } finally {
      setSaving(false);
    }
  }, [name, description, steps, onSaved]);

  return (
    <div className="space-y-6">
      {/* Builder Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-3">
          <Zap className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Workflow Builder</span>
        </div>
        <h2 className="text-xl font-black text-foreground">Build a custom workflow</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Chain multiple tools together — compress, resize, protect — into one automated sequence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: Steps */}
        <div className="space-y-4">
          {/* Workflow Name + Description */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Scholarship ready pack"
              className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description — what does this workflow do?"
              className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Step List */}
          <AnimatePresence mode="popLayout">
            {steps.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center"
              >
                <Settings2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No steps yet — pick tools from the right panel.</p>
              </motion.div>
            )}

            {steps.map((step, idx) => {
              const def = AVAILABLE_STEPS.find((d) => d.id === step.id);
              const Icon = def?.icon ?? Settings2;
              const isExpanded = expandedStep === `${step.label}-${idx}`;
              return (
                <motion.div
                  key={`${step.id}-${idx}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedStep(isExpanded ? null : `${step.label}-${idx}`)}
                  >
                    <div className="text-muted-foreground/40 cursor-grab">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black shrink-0">
                      {idx + 1}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-foreground block truncate">{step.label}</span>
                      {def && <span className="text-[10px] text-muted-foreground block">{def.description}</span>}
                    </div>
                    {step.isSecurity && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Security
                      </span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveStep(idx, -1); }}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-muted disabled:opacity-20 transition-colors cursor-pointer"
                        title="Move up"
                      >
                        <ArrowRight className="h-3 w-3 rotate-[-90deg]" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveStep(idx, 1); }}
                        disabled={idx === steps.length - 1}
                        className="p-1 rounded hover:bg-muted disabled:opacity-20 transition-colors cursor-pointer"
                        title="Move down"
                      >
                        <ArrowRight className="h-3 w-3 rotate-90" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeStep(idx); }}
                        className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove step"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded config */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-border/50">
                          <StepConfigEditor step={step} stepIdx={idx} onChange={(patch) => {
                            setSteps((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
                          }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Save Button */}
          {steps.length > 0 && (
            <div className="space-y-2">
              {saveError && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  {saveError}
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Workflow'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Available Steps */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">Add a step</h3>
          {(['pdf', 'image'] as const).map((cat) => (
            <div key={cat} className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider pl-1">
                {cat === 'pdf' ? 'PDF Tools' : 'Image Tools'}
              </span>
              {AVAILABLE_STEPS.filter((s) => s.category === cat).map((def) => {
                const Icon = def.icon;
                return (
                  <button
                    key={def.id}
                    onClick={() => addStep(def)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-card border border-border rounded-lg hover:border-indigo-500/40 hover:bg-indigo-500/5 text-left transition-all group cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shrink-0">
                      <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground block">{def.label}</span>
                      <span className="text-[9px] text-muted-foreground block truncate">{def.description}</span>
                    </div>
                    <Plus className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-indigo-500 ml-auto shrink-0 transition-colors" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Inline config editors per step type ─────────────────────────────────────

function StepConfigEditor({ step, stepIdx, onChange }: { step: WorkflowStep; stepIdx: number; onChange: (patch: Partial<WorkflowStep>) => void }) {
  const cfg = step.config;

  // Generic numeric input helper
  const NumInput = ({ label, field, min, max }: { label: string; field: string; min?: number; max?: number }) => (
    <div className="flex items-center justify-between gap-2">
      <label className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{label}</label>
      <input
        type="number"
        value={(cfg[field] as number) ?? 0}
        min={min}
        max={max}
        onChange={(e) => onChange({ config: { ...cfg, [field]: Number(e.target.value) } })}
        className="w-20 bg-transparent border border-border rounded px-2 py-1 text-xs text-foreground text-right focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
      />
    </div>
  );

  const SelectInput = ({ label, field, options }: { label: string; field: string; options: { value: string; label: string }[] }) => (
    <div className="flex items-center justify-between gap-2">
      <label className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{label}</label>
      <select
        value={(cfg[field] as string) ?? options[0].value}
        onChange={(e) => onChange({ config: { ...cfg, [field]: e.target.value } })}
        className="bg-transparent border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/40 cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  switch (step.id) {
    case 'compress-pdf':
      return (
        <div className="space-y-2">
          <NumInput label="Quality" field="quality" min={10} max={100} />
          <p className="text-[9px] text-muted-foreground/70">Lower = smaller file. 70–80 is a good balance.</p>
        </div>
      );

    case 'compress-image':
      return (
        <div className="space-y-2">
          <NumInput label="Quality %" field="quality" min={10} max={100} />
          <p className="text-[9px] text-muted-foreground/70">65–80 for web, 85–95 for print.</p>
        </div>
      );

    case 'resize-image':
      return (
        <div className="space-y-2">
          <NumInput label="Width (px)" field="resize_width" min={10} max={10000} />
          <NumInput label="Height (px)" field="resize_height" min={10} max={10000} />
          <SelectInput label="Format" field="resize_format" options={[
            { value: 'jpeg', label: 'JPEG' },
            { value: 'png', label: 'PNG' },
            { value: 'webp', label: 'WebP' },
          ]} />
        </div>
      );

    case 'convert-image':
      return (
        <div className="space-y-2">
          <SelectInput label="Target" field="target_format" options={[
            { value: 'webp', label: 'WebP' },
            { value: 'png', label: 'PNG' },
            { value: 'jpeg', label: 'JPEG' },
          ]} />
          <NumInput label="Quality %" field="quality" min={10} max={100} />
        </div>
      );

    case 'add-watermark-pdf':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">Text</label>
            <input
              type="text"
              value={(cfg.watermark_text as string) ?? 'CONFIDENTIAL'}
              onChange={(e) => onChange({ config: { ...cfg, watermark_text: e.target.value } })}
              className="flex-1 bg-transparent border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
            />
          </div>
          <NumInput label="Size" field="watermark_size" min={12} max={120} />
          <NumInput label="Opacity %" field="watermark_opacity" min={1} max={100} />
          <SelectInput label="Position" field="watermark_position" options={[
            { value: 'diagonal', label: 'Diagonal' },
            { value: 'center', label: 'Center' },
            { value: 'top-left', label: 'Top Left' },
            { value: 'bottom-right', label: 'Bottom Right' },
          ]} />
        </div>
      );

    case 'protect-pdf':
      return (
        <div className="space-y-2">
          <SelectInput label="Protection" field="protect_level" options={[
            { value: 'standard', label: 'Standard (password to open)' },
          ]} />
          <p className="text-[9px] text-amber-500 flex items-center gap-1">
            <AlertTriangle className="h-2.5 w-2.5" />
            Requires server connection. If offline, the workflow will halt here.
          </p>
        </div>
      );

    case 'merge-pdf':
      return (
        <p className="text-[9px] text-muted-foreground/70">
          Merges all input files into one PDF in order. Upload multiple PDFs when running this workflow.
        </p>
      );

    case 'aadhaar-mask':
      return (
        <p className="text-[9px] text-muted-foreground/70">
          Masks the first 8 digits of the Aadhaar number visible in the PDF. Uses client-side processing.
        </p>
      );

    default:
      return null;
  }
}
