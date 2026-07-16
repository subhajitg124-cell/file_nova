import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BACKEND_URL, HAS_BACKEND } from '@/lib/api';
import { useFileStore } from './useFileStore';

const DEVELOPER_EMAILS = (
  import.meta.env.VITE_DEVELOPER_EMAILS || 'subhajitgho123@gmail.com'
).split(',').map((e: string) => e.trim().toLowerCase());

export const isDeveloper = (email?: string | null): boolean => {
  if (!email) return false;
  return DEVELOPER_EMAILS.includes(email.toLowerCase());
};

const hashMockPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const isMockActive = () => {
  return !HAS_BACKEND || useFileStore.getState().isMockMode;
};

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  role: 'user' | 'operator' | 'admin' | 'super_admin' | 'developer';
  premiumTier: 'free' | 'basic' | 'pro' | 'elite' | 'pass_24hr' | 'pass_weekly';
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
  token: string | null;
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
  refreshUser: () => Promise<void>;
}


const SESSION_TOKEN_KEY = 'filenova_token';
const LOCAL_USER_KEY = 'filenova_local_user';
const LOCAL_USERS_KEY = 'filenova_local_users';
const API_TIMEOUT_MS = 30000;

const getInitialUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed;
  } catch {
    return null;
  }
};

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
  premiumTier: 'elite',
  premiumEnabled: true,
  referralCode: null,
});

const processUser = (user: UserProfile | null): UserProfile | null => {
  if (!user) return null;

  // Ensure all users have Elite tier benefits since the platform is 100% free
  const role = isDeveloper(user.email) ? 'developer' : user.role;
  const phoneVerified = isDeveloper(user.email) ? true : user.phoneVerified;

  const upgradedUser = {
    ...user,
    role,
    phoneVerified,
    premiumTier: 'elite' as const,
    premiumEnabled: true,
  };

  // For server-backed users: never generate a client-side code — server owns it
  if (!upgradedUser.id.startsWith("local_")) {
    return upgradedUser;
  }

  // Local-only users: generate a code once and persist it
  if (!user.referralCode) {
    const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 5; i += 1) {
      suffix += REFERRAL_ALPHABET[Math.floor(Math.random() * REFERRAL_ALPHABET.length)];
    }
    user.referralCode = `FN-${suffix}`;

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

  if (isDeveloper(user.email)) {
    return {
      ...user,
      role: 'developer',
      premiumTier: 'elite',
      premiumEnabled: true,
      phoneVerified: true,
    };
  }
  return user;
};

const processSubscription = (sub: UserSubscription | null, user: UserProfile | null): UserSubscription | null => {
  if (isDeveloper(user?.email)) {
    return {
      plan: 'elite',
      status: 'active',
      expiresAt: null,
      daysActive: null,
    };
  }
  return sub;
};

const getLocalUsers = (): Record<string, { user: UserProfile; password?: string; passwordHash?: string }> => {
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

const simulateMockReferral = (referredUser: UserProfile) => {
  try {
    const refCode = localStorage.getItem('filenova_referral_code');
    if (!refCode) return;

    // Find referrer in local users
    const localUsers = getLocalUsers();
    let referrer: UserProfile | null = null;
    let referrerKey = "";
    for (const [key, val] of Object.entries(localUsers)) {
      if (val.user.referralCode === refCode) {
        referrer = val.user;
        referrerKey = key;
        break;
      }
    }

    if (!referrer || referrer.id === referredUser.id) return;

    // Save completed referral record
    const referralsRaw = localStorage.getItem('filenova_mock_referrals');
    const referrals = referralsRaw ? JSON.parse(referralsRaw) : [];
    
    // Check if duplicate referred email
    const duplicate = referrals.find((r: any) => r.referredEmail?.toLowerCase() === referredUser.email.toLowerCase() && r.status === "completed");
    if (duplicate) return;

    const newRef = {
      id: `mock_ref_${Date.now()}`,
      referrerUserId: referrer.id,
      referredEmail: referredUser.email,
      status: "completed",
      rewardGiven: true,
      createdAt: new Date().toISOString()
    };
    referrals.push(newRef);
    localStorage.setItem('filenova_mock_referrals', JSON.stringify(referrals));

    // Save reward records
    const rewardsRaw = localStorage.getItem('filenova_mock_rewards');
    const rewards = rewardsRaw ? JSON.parse(rewardsRaw) : [];

    // Referrer reward
    rewards.push({
      id: `mock_rw_${Date.now()}_1`,
      referrerUserId: referrer.id,
      referredUserId: referredUser.id,
      rewardType: "bonus_days",
      rewardValue: 3,
      status: "approved",
      notes: `Referral signup credit for ${referredUser.email}`,
      createdAt: new Date().toISOString()
    });

    // Referred user reward
    rewards.push({
      id: `mock_rw_${Date.now()}_2`,
      referrerUserId: referrer.id,
      referredUserId: referredUser.id,
      rewardType: "bonus_days",
      rewardValue: 3,
      status: "approved",
      notes: `Signup bonus matching invite from ${referrer.email}`,
      createdAt: new Date().toISOString()
    });

    // Update referrer premium info
    referrer.premiumEnabled = true;
    referrer.premiumTier = referrer.premiumTier === "free" ? "pro" : referrer.premiumTier;
    localUsers[referrerKey].user = referrer;
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

    // Count referrals to trigger milestones
    const referrerCompletedCount = referrals.filter((r: any) => r.referrerUserId === referrer?.id && r.status === "completed").length;
    const milestone = [
      { target: 5, reward: 7, name: "Bronze Advocate" },
      { target: 10, reward: 15, name: "Silver Promoter" },
      { target: 20, reward: 30, name: "Gold Ambassador" },
      { target: 50, reward: 100, name: "Diamond Elite" },
    ].find(m => m.target === referrerCompletedCount);

    if (milestone) {
      // Add milestone reward record
      rewards.push({
        id: `mock_ms_${Date.now()}`,
        referrerUserId: referrer.id,
        referredUserId: null,
        rewardType: "bonus_days",
        rewardValue: milestone.reward,
        status: "approved",
        notes: `Milestone Reward: Reached ${milestone.target} referrals (${milestone.name})`,
        createdAt: new Date().toISOString()
      });
    }

    localStorage.setItem('filenova_mock_rewards', JSON.stringify(rewards));

  } catch (_) {}
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
  if (!token) return {};
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

// Attempt to refresh an expired session token via /api/v1/auth/refresh
async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) return false;
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      return true;
    }
    return false;
  } catch {
    return false;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: getInitialUser(),
      subscription: null,
      loading: false,
      error: null,
      initialized: false,
      token: localStorage.getItem(SESSION_TOKEN_KEY),
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

      // Enforce a 10-second timeout to allow database cold starts to complete
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
            token: localStorage.getItem(SESSION_TOKEN_KEY),
          });
          // Sync fresh server user to localStorage so local fallback is current
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(processedUser));
        } else {
          // Backend returned 200 but no user — session invalid, clear stale state
          console.warn("[Auth] /me returned success but no user — clearing stale session");
          localStorage.removeItem(SESSION_TOKEN_KEY);
          localStorage.removeItem(LOCAL_USER_KEY);
          set({
            user: null,
            subscription: null,
            initialized: true,
            token: null,
          });
        }
      } else {
        // 401 or other error — session expired or invalid, clear stale state
        console.warn("[Auth] /me returned", res.status, "— clearing stale session");
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(LOCAL_USER_KEY);
        set({
          user: null,
          subscription: null,
          initialized: true,
          token: null,
        });
      }
    } catch (err: any) {
      console.error("fetchMe network error:", err);
      set({
        initialized: true,
        error: 'Failed to reach server. Please check your connection.',
      });
    } finally {
      set({ loading: false });
    }
  },

  refreshUser: async () => {
    if (isMockActive()) {
      const localUser = processUser(getLocalSession());
      set({
        user: localUser,
        subscription: processSubscription(localUser ? freeSubscription : null, localUser),
      });
      return;
    }
    try {
      let res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      // Attempt token refresh on 401 before clearing auth
      if (res.status === 401) {
        const refreshed = await attemptTokenRefresh();
        if (refreshed) {
          res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
            headers: getAuthHeaders(),
            credentials: 'include',
          });
        }
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const processedUser = processUser(data.user);
          set({
            user: processedUser,
            subscription: processSubscription(data.subscription, processedUser)
          });
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(processedUser));
        } else {
          localStorage.removeItem(SESSION_TOKEN_KEY);
          localStorage.removeItem(LOCAL_USER_KEY);
          set({ user: null, subscription: null, token: null });
        }
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(LOCAL_USER_KEY);
        set({ user: null, subscription: null, token: null });
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  },

  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      if (isMockActive()) {
        const key = identifier.trim().toLowerCase();
        const localUsers = getLocalUsers();
        const saved = localUsers[key];
        const passwordHash = await hashMockPassword(password);
        if (!saved || (saved.passwordHash !== passwordHash && saved.password !== password)) {
          throw new Error('No local account found with those credentials. Create an account first.');
        }
        const processedUser = processUser(saved.user);
        setLocalSession(processedUser!);
        set({ user: processedUser, token: localStorage.getItem(SESSION_TOKEN_KEY), subscription: processSubscription(freeSubscription, processedUser) });
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
        token: data.token || null,
        subscription: processSubscription(data.subscription, processedUser),
        initialized: true,
      });
      if (data.token) {
        localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      }
      if (processedUser) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(processedUser));
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
        const passwordHash = await hashMockPassword(password);
        localUsers[key] = { user, passwordHash };
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
        const processedUser = processUser(user);
        simulateMockReferral(processedUser!);
        setLocalSession(processedUser!);
        localStorage.removeItem('filenova_referral_code');
        localStorage.removeItem('filenova_referral_tracking_id');
        set({ user: processedUser, token: localStorage.getItem(SESSION_TOKEN_KEY), subscription: processSubscription(freeSubscription, processedUser) });
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
        token: data.token || null,
        subscription: processSubscription(null, processedUser),
        initialized: true,
      });
      if (data.token) {
        localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      }
      if (processedUser) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(processedUser));
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
        simulateMockReferral(processedUser!);
        setLocalSession(processedUser!);
        localStorage.removeItem('filenova_referral_code');
        localStorage.removeItem('filenova_referral_tracking_id');
        set({ user: processedUser, token: localStorage.getItem(SESSION_TOKEN_KEY), subscription: processSubscription(freeSubscription, processedUser) });
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
      const processedUser = processUser(data.user);
      set({
        user: processedUser,
        token: data.token || null,
        subscription: processSubscription(data.subscription, processedUser),
        initialized: true,
      });
      if (data.token) {
        localStorage.setItem(SESSION_TOKEN_KEY, data.token);
      }
      if (processedUser) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(processedUser));
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
      console.log("%c[AUTH] logout() called", "color:red;font-size:14px;font-weight:bold", {
        hadToken: !!localStorage.getItem(SESSION_TOKEN_KEY),
        hadLocalUser: !!localStorage.getItem(LOCAL_USER_KEY),
        timestamp: new Date().toISOString(),
        stack: new Error().stack?.split("\n").slice(2, 6).join("\n"),
      });
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(LOCAL_USER_KEY);
      set({ user: null, subscription: null, token: null, loading: false });
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
        set({ user: null, subscription: null, token: null });
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
      localStorage.removeItem(LOCAL_USER_KEY);
      set({ user: null, subscription: null, token: null });
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

      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/send-otp`, {
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

      const res = await safeFetch(`${BACKEND_URL}/api/v1/auth/verify-otp`, {
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
}), {
  name: 'fn-auth',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    user: state.user,
    token: state.token,
    subscription: state.subscription,
  }),
}));

if (typeof window !== 'undefined') {
  (window as any).useAuthStore = useAuthStore;
}
