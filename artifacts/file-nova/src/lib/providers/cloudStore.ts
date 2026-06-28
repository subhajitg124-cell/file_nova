import type { CloudImportFile, CloudImportState } from "./types";

const STORAGE_KEY = "filenova_cloud_imports";

function loadState(): CloudImportState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { recentImports: [], pinnedFiles: [], lastUsedProvider: null, favoriteProvider: null };
}

function saveState(state: CloudImportState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export const cloudStore = {
  getState: loadState,

  addRecent(file: CloudImportFile) {
    const state = loadState();
    state.recentImports = state.recentImports.filter((f) => !(f.name === file.name && f.source === file.source));
    state.recentImports.unshift(file);
    if (state.recentImports.length > 20) state.recentImports.pop();
    state.lastUsedProvider = file.source;
    saveState(state);
  },

  getRecent(): CloudImportFile[] {
    return loadState().recentImports;
  },

  togglePin(file: CloudImportFile) {
    const state = loadState();
    const idx = state.pinnedFiles.findIndex(
      (f) => f.name === file.name && f.source === file.source
    );
    if (idx >= 0) {
      state.pinnedFiles.splice(idx, 1);
    } else {
      state.pinnedFiles.unshift(file);
      if (state.pinnedFiles.length > 10) state.pinnedFiles.pop();
    }
    saveState(state);
  },

  getPinned(): CloudImportFile[] {
    return loadState().pinnedFiles;
  },

  isPinned(file: CloudImportFile): boolean {
    const state = loadState();
    return state.pinnedFiles.some(
      (f) => f.name === file.name && f.source === file.source
    );
  },

  setLastUsedProvider(providerId: string) {
    const state = loadState();
    state.lastUsedProvider = providerId;
    saveState(state);
  },

  getLastUsedProvider(): string | null {
    return loadState().lastUsedProvider;
  },

  setFavoriteProvider(providerId: string | null) {
    const state = loadState();
    state.favoriteProvider = providerId;
    saveState(state);
  },

  getFavoriteProvider(): string | null {
    return loadState().favoriteProvider;
  },

  getAll(): CloudImportFile[] {
    const state = loadState();
    const seen = new Set<string>();
    const all: CloudImportFile[] = [];
    for (const f of state.pinnedFiles) {
      const key = `${f.source}:${f.name}`;
      if (!seen.has(key)) { seen.add(key); all.push(f); }
    }
    for (const f of state.recentImports) {
      const key = `${f.source}:${f.name}`;
      if (!seen.has(key)) { seen.add(key); all.push(f); }
    }
    return all;
  },
};
