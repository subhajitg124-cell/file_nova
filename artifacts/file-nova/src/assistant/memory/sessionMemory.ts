import { SessionAction } from '../context/types';

const RECENT_TOOLS_KEY = 'filenova-assistant-recent';
const MAX_RECENT = 10;

let recentActions: SessionAction[] = [];

export function addToMemory(action: SessionAction): void {
  recentActions = [action, ...recentActions.filter(a => a.tool !== action.tool).slice(0, MAX_RECENT - 1)];
  try {
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(recentActions));
  } catch {}
}

export function getRecentTools(): string[] {
  return recentActions.map(a => a.tool);
}

export function getRecentActions(): SessionAction[] {
  return [...recentActions];
}

export function clearMemory(): void {
  recentActions = [];
  localStorage.removeItem(RECENT_TOOLS_KEY);
}

export function getCommonWorkflow(): string | null {
  const toolCounts = recentActions.reduce<Record<string, number>>((acc, a) => {
    acc[a.tool] = (acc[a.tool] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

export function getPreferredSettings(toolId: string): Record<string, any> | null {
  const prefs: Record<string, any> = {};
  const toolActions = recentActions.filter(a => a.tool === toolId);
  if (toolActions.length === 0) return null;

  const last = toolActions[toolActions.length - 1];
  return last.options || null;
}