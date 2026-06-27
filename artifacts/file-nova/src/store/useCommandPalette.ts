import { create } from 'zustand';

const RECENT_KEY = 'fn_cmd_recent';
const FAV_KEY = 'fn_cmd_favorites';

interface CmdItem {
  id: string;
  label: string;
  description?: string;
  route?: string;
  action?: () => void;
  icon?: string;
  category: 'tool' | 'page' | 'command' | 'developer' | 'setting' | 'blog' | 'workflow';
}

interface CmdState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  recent: string[];
  favorites: string[];
  addRecent: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  query: string;
  setQuery: (q: string) => void;
}

function loadArr(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function saveArr(key: string, arr: string[]) {
  localStorage.setItem(key, JSON.stringify(arr));
}

export const useCommandPalette = create<CmdState>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open, query: open ? get().query : '' }),
  toggle: () => set((s) => ({ open: !s.open, query: s.open ? '' : s.query })),
  recent: loadArr(RECENT_KEY),
  favorites: loadArr(FAV_KEY),
  addRecent: (id) => {
    const prev = loadArr(RECENT_KEY).filter((r) => r !== id).slice(0, 19);
    const next = [id, ...prev];
    saveArr(RECENT_KEY, next);
    set({ recent: next });
  },
  toggleFavorite: (id) => {
    const prev = loadArr(FAV_KEY);
    const next = prev.includes(id) ? prev.filter((f) => f !== id) : [id, ...prev];
    saveArr(FAV_KEY, next);
    set({ favorites: next });
  },
  isFavorite: (id) => get().favorites.includes(id),
  query: '',
  setQuery: (query) => set({ query }),
}));
