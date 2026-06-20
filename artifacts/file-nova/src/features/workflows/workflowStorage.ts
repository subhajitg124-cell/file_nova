/**
 * localStorage-backed CRUD for user-saved workflows.
 * No account required. Unlimited saves — no artificial cap
 * (workflows are local-only and cost nothing server-side).
 */

import type { Workflow } from './types';

const STORAGE_KEY = 'filenova_workflows';

export function getWorkflows(): Workflow[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveWorkflow(workflow: Workflow): void {
  try {
    const existing = getWorkflows().filter((w) => w.id !== workflow.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([workflow, ...existing]));
  } catch {
    // localStorage full — silently fail, never break the UI
  }
}

export function deleteWorkflow(id: string): void {
  try {
    const updated = getWorkflows().filter((w) => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function updateWorkflow(id: string, patch: Partial<Workflow>): void {
  try {
    const updated = getWorkflows().map((w) =>
      w.id === id ? { ...w, ...patch } : w
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
