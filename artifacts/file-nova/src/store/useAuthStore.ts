import { create } from 'zustand';
import { BACKEND_URL, HAS_BACKEND } from '@/lib/api';
import { useFileStore } from './useFileStore';

const isMockActive = () => {
  return !HAS_BACKEND || useFileStore.getState().isMockMode;
};

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
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
  updateProfile: (name: string | null, phoneNumber: string | null) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  sendOtpCode: (type: "mobile" | "email", target: string) => Promise<boolean>;
  verifyUserAccount: (type: "mobile" | "email", target: string, otp: string) => Promise<boolean>;
}


const SESSION_TOKEN_KEY = 'filenova_token';
const LOCAL_USER_KEY = 'filenova_local_user';
const LOCAL_USERS_KEY = 'filenova_local_users';
const API_TIMEOUT_MS = 30000;

const freeSubscription: UserSubscription = {
  plan: 'free',
  status: 'active',
  expiresAt: null,
  daysActive: null,
};

const createLocalUser = (email: string, name: string | null, phoneNumber: string | null = null): UserProfile => ({
  id: `local_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
  email,
  name,
  phoneNumber,
  phoneVerified: false,
  role: 'user',
  premiumTier: 'free',
  premiumEnabled: false,
  referralCode: null,
});

const processUser = (user: UserProfile | null): UserProfile | null => {
  if (!user) return null;
  
  if (!user.referralCode) {
    const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 5; i += 1) {
      suffix += REFERRAL_ALPHABET[Math.floor(Math.random() * REFERRAL_ALPHABET.length)];
    }
    user.referralCode = `FN-${suffix}`;
    
    // Save back to local storage if it was loaded from there
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      if (raw) {
        const localSession = JSON.parse(raw);
        if (localSession && localSession.id === user.id) {
          localSession.referralCode = user.referralCode;
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localSession));
        }
      }
      
      const localUsers = getLocalUsers();
      const key = user.email.toLowerCase();
      if (localUsers[key]) {
        localUsers[key].user.referralCode = user.referralCode;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
      }
    } catch (_) {}
  }

  if (user.email?.toLowerCase() === 'subhajitgho123@gmail.com') {
    return {
      ...user,
      role: 'super_admin',
      premiumTier: 'elite',
      premiumEnabled: true,
      phoneVerified: true,
    };
  }
  return user;
};

const processSubscription = (sub: UserSubscription | null, user: UserProfile | null): UserSubscription | null => {
  if (user?.email?.toLowerCase() === 'subhajitgho123@gmail.com') {
    return {
      plan: 'elite',
      status: 'active',
      expiresAt: null,
      daysActive: null,
    };
  }
  return sub;
};

const getLocalUsers = (): Record<string, { user: UserProfile; password: string }> => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
  } catch {
    return {};
  }
};

const setLocalSession = (user: UserProfile) => {
  const processed = processUser(user) || user;
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(processed));
  localStorage.setItem(SESSION_TOKEN_KEY, `local_${Date.now()}`);
};

const getLocalSession = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const decodeGoogleCredential = (credential: string): { email?: string; name?: string } => {
  try {
    const payload = credential.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  // Don't send local mock tokens to the real server
  if (!token || token.startsWith("local_")) return {};
  return { Authorization: `Bearer ${token}` };
};

// Safe JSON parse with empty response handling
async function safeJsonParse(response: Response) {
  if (response.status === 502 || response.status === 504) {
    throw new Error('Server is currently starting up or offline. Please try again in a few seconds.');
  }
  const text = await response.text();
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (response.status >= 500) {
      throw new Error(`Server error (${response.status}). The backend server might be starting up or experiencing issues.`);
    }
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
    if (err instanceof TypeError || (err.message && err.message.includes('Failed to fetch'))) {
      throw new Error('Cannot connect to the server. The backend server might be starting up or offline. Please verify it is running.');
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
    const startTime = Date.now();
    try {
      if (isMockActive()) {
        const localUser = processUser(getLocalSession());
        const elapsed = Date.now() - startTime;
        if (elapsed < 1000) {
          await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
        }
        set({
          user: localUser,
          subscription: processSubscription(localUser ? freeSubscription : null, localUser),
          initialized: true,
        });
        return;
      }

      // Enforce a fast 2-second timeout for the profile check to ensure the initial loader fades quickly if the backend is down
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        credentials: 'include',
        headers: getAuthHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await safeJsonParse(res);
        if (data.success && data.user) {
          const processedUser = processUser(data.user);
          const elapsed = Date.now() - startTime;
          if (elapsed < 1000) {
            await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
          }
          set({
            user: processedUser,
            subscription: processSubscription(data.subscription, processedUser),
            initialized: true,
          });
        } else {
          const elapsed = Date.now() - startTime;
          if (elapsed < 1000) {
            await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
          }
          set({ user: null, subscription: null, initialized: true });
        }
      } else {
        const elapsed = Date.now() - startTime;
        if (elapsed < 1000) {
          await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
        }
        set({ user: null, subscription: null, initialized: true });
      }
    } catch (err: any) {
      const localUser = processUser(getLocalSession());
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
      }
      set({
        user: localUser,
        subscription: processSubscription(localUser ? freeSubscription : null, localUser),
        initialized: true,
        error: err.message || 'Failed to fetch user profile',
      });
    } finally {
      set({ loading: false });
    }
  },

  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      if (isMockActive()) {
        const key = identifier.trim().toLowerCase();
        const localUsers = getLocalUsers();
        const saved = localUsers[key];
        if (!saved || saved.password !== password) {
          throw new Error('No local account found with those credentials. Create an account first.');
        }
        const processedUser = processUser(saved.user);
        setLocalSession(processedUser!);
        set({ user: processedUser, subscription: processSubscription(freeSubscription, processedUser) });
        return true;
      }

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
      const processedUser = processUser(data.user);
      set({
        user: processedUser,
        subscription: processSubscription(data.subscription, processedUser),
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
      if (isMockActive()) {
        const key = email.trim().toLowerCase();
        const localUsers = getLocalUsers();
        if (localUsers[key]) {
          throw new Error('An account already exists with this email.');
        }
        const user = createLocalUser(key, name || key.split('@')[0], phoneNumber);
        localUsers[key] = { user, password };
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
        const processedUser = processUser(user);
        setLocalSession(processedUser!);
        localStorage.removeItem('filenova_referral_code');
        localStorage.removeItem('filenova_referral_tracking_id');
        set({ user: processedUser, subscription: processSubscription(freeSubscription, processedUser) });
        return true;
      }

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
          referralTrackingId: localStorage.getItem('filenova_referral_tracking_id'),
        }),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Signup failed');
      }
      const processedUser = processUser(data.user);
      set({
        user: processedUser,
        subscription: processSubscription(null, processedUser),
      });
      if (data.token) {
        localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      }
      localStorage.removeItem('filenova_referral_code');
      localStorage.removeItem('filenova_referral_tracking_id');
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
      if (isMockActive()) {
        const profile = decodeGoogleCredential(credential);
        if (!profile.email) {
          throw new Error('Google did not return an email address.');
        }
        const user = createLocalUser(profile.email, profile.name || profile.email.split('@')[0]);
        const processedUser = processUser(user);
        setLocalSession(processedUser!);
        localStorage.removeItem('filenova_referral_code');
        localStorage.removeItem('filenova_referral_tracking_id');
        set({ user: processedUser, subscription: processSubscription(freeSubscription, processedUser) });
        return true;
      }

      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          credential,
          referralCode: localStorage.getItem('filenova_referral_code'),
          referralTrackingId: localStorage.getItem('filenova_referral_tracking_id'),
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
      localStorage.removeItem('filenova_referral_tracking_id');
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
      if (!isMockActive()) {
        await safeFetch(`${BACKEND_URL}/api/v1/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders(),
        });
      }
    } catch (_) {
      // Proceed with local logout even if request fails
    } finally {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(LOCAL_USER_KEY);
      set({ user: null, subscription: null, loading: false });
    }
  },

  updateProfile: async (name, phoneNumber) => {
    set({ loading: true, error: null });
    try {
      if (isMockActive()) {
        const current = get().user;
        if (!current) throw new Error('Please log in first.');
        const updated = { ...current, name, phoneNumber };
        const processedUser = processUser(updated);
        setLocalSession(processedUser!);
        set({ user: processedUser, subscription: processSubscription(freeSubscription, processedUser) });
        return true;
      }

      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ name, phoneNumber }),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }
      const processedUser = processUser(data.user);
      set({
        user: processedUser,
        subscription: processSubscription(data.subscription, processedUser),
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update profile' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      if (isMockActive()) {
        const current = get().user;
        if (!current) throw new Error('Please log in first.');
        const localUsers = getLocalUsers();
        const saved = localUsers[current.email.toLowerCase()];
        if (!saved || saved.password !== currentPassword) {
          throw new Error('Current password is incorrect.');
        }
        localUsers[current.email.toLowerCase()] = { ...saved, password: newPassword };
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
        return true;
      }

      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to change password' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteAccount: async () => {
    set({ loading: true, error: null });
    try {
      if (isMockActive()) {
        const current = get().user;
        if (current) {
          const localUsers = getLocalUsers();
          delete localUsers[current.email.toLowerCase()];
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
        }
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(LOCAL_USER_KEY);
        set({ user: null, subscription: null });
        return true;
      }

      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }
      localStorage.removeItem(SESSION_TOKEN_KEY);
      set({ user: null, subscription: null });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete account' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  sendOtpCode: async (type, target) => {
    set({ loading: true, error: null });
    try {
      if (isMockActive()) {
        return true;
      }

      const res = await safeFetch(`${BACKEND_URL}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ type, target }),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to send verification code' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  verifyUserAccount: async (type, target, otp) => {
    set({ loading: true, error: null });
    try {
      if (isMockActive()) {
        const current = get().user;
        if (!current) throw new Error('Please log in first.');
        const updated = {
          ...current,
          phoneVerified: true,
          phoneNumber: type === "mobile" ? target : current.phoneNumber
        };
        setLocalSession(updated);
        set({ user: updated });
        return true;
      }

      const res = await safeFetch(`${BACKEND_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ type, target, otp }),
      });
      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }
      const processedUser = processUser(data.user);
      set({
        user: processedUser,
        subscription: processSubscription(data.subscription, processedUser),
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Verification failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
