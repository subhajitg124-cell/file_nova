// Shared TypeScript types for the FileNova Workflow system.

export interface WorkflowStep {
  /** Maps to a processor function (see workflowRunner.ts) */
  id: string;
  label: string;
  /** Tool-specific config (preset values only — no free-text) */
  config: Record<string, unknown>;
  /** True for steps that require a backend server connection */
  requiresBackend?: boolean;
  /**
   * True for SECURITY-CRITICAL steps (protect-pdf, pdf-encrypt).
   * If this step can't run, the runner HALTS — never skip-and-continue.
   * Rationale: a student who believes their document is password-protected
   * when it isn't faces a real, concrete consequence.
   */
  isSecurity?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  /** Step count badge label */
  stepCount?: number;
  steps: WorkflowStep[];
  /** FileNova-curated starter workflows shown to everyone */
  isPreset?: boolean;
  /** Icon emoji shown on the card */
  icon?: string;
  createdAt: number;
}

/** Result returned when a workflow completes all steps successfully */
export interface WorkflowResult {
  url: string;
  filename: string;
  /** Number of steps that ran */
  stepsCompleted: number;
  mimeType: string;
}

/** Thrown when the runner halts — either due to a security step failing
 *  or explicit user cancellation */
export class WorkflowHaltError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowHaltError';
  }
}
