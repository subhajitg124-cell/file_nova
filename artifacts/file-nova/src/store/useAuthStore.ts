import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  role: 'user' | 'operator' | 'admin' | 'super_admin';
  premiumTier: 'free' | 'basic' | 'pro' | 'elite';
  premiumEnabled: boolean;
  referralCode?: string | null;
}

export interface UserSubscription {
  plan: 'free' | 'basic' | 'pro' | 'elite';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  expiresAt: string | null;
  daysActive: number | null;
}

interface AuthState {
  user: UserProfile | null;
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchMe: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (email: string, phoneNumber: string | null, password: string, name: string | null) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  isLoginModalOpen: boolean;
  loginModalMessage: string | null;
  openLoginModal: (message?: unknown) => void;
  closeLoginModal: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const SESSION_TOKEN_KEY = 'filenova_token';
const API_TIMEOUT_MS = 30000;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Safe JSON parse with empty response handling
async function safeJsonParse(response: Response) {
  const text = await response.text();
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Server returned non-JSON response (${response.status}). Please try again.`);
  }
  if (!text || text.trim() === '') {
    throw new Error('Server returned empty response. Please try again.');
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Server response is invalid. Please try again later.');
  }
}

// Safe fetch with timeout
async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  subscription: null,
  loading: false,
  error: null,
  initialized: false,
  isLoginModalOpen: false,
  loginModalMessage: null,

  openLoginModal: (message) => set({ isLoginModalOpen: true, loginModalMessage: typeof message === 'string' ? message : null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, loginModalMessage: null }),

  clearError: () => set({ error: null }),

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/me`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await safeJsonParse(res);
        if (data.success && data.user) {
          set({
            user: data.user,
            subscription: data.subscription,
            initialized: true,
          });
        } else {
          set({ user: null, subscription: null, initialized: true });
        }
      } else {
        set({ user: null, subscription: null, initialized: true });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch user profile', initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }
      set({
        user: data.user,
        subscription: data.subscription,
      });
      if (data.token) {
        localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      }
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to log in' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email, phoneNumber, password, name) => {
    set({ loading: true, error: null });
    try {
      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          phoneNumber,
          password,
          name,
          referralCode: localStorage.getItem('filenova_referral_code'),
        }),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Signup failed');
      }
      set({
        user: data.user,
        subscription: null,
      });
      if (data.token) {
        localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      }
      localStorage.removeItem('filenova_referral_code');
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to sign up' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async (credential) => {
    set({ loading: true, error: null });
    try {
      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          credential,
          referralCode: localStorage.getItem('filenova_referral_code'),
        }),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Google login failed');
      }
      set({
        user: data.user,
        subscription: data.subscription,
      });
      if (data.token) {
        localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      }
      localStorage.removeItem('filenova_referral_code');
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Google authentication failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await safeFetch(`${BACKEND_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
    } catch (_) {
      // Proceed with local logout even if request fails
    } finally {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      set({ user: null, subscription: null, loading: false });
    }
  },
}));
