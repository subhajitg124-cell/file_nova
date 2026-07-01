import { create } from 'zustand';

interface SupportDevState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSupportDevStore = create<SupportDevState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
