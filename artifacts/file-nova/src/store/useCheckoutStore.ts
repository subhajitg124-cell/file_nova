import { create } from 'zustand';

export type PlanType = 'basic' | 'pro' | 'elite' | 'pass_24h' | 'pass_7d';

interface CheckoutState {
  isOpen: boolean;
  selectedPlan: PlanType | null;
  coupon: string;
  openCheckout: (plan: PlanType, coupon?: string) => void;
  closeCheckout: () => void;
  setCoupon: (coupon: string) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  isOpen: false,
  selectedPlan: null,
  coupon: '',
  openCheckout: (plan, coupon = '') => {
    window.location.assign('/pricing');
  },
  closeCheckout: () => set({ isOpen: false, selectedPlan: null, coupon: '' }),
  setCoupon: (coupon) => set({ coupon }),
}));
