import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { BACKEND_URL, HAS_BACKEND } from "@/lib/api";

type AdminCreds = { username: string; passwordHash: string } | null;
type Settings = { 
  standaloneMode: boolean; 
  editingEnabled: boolean;
  activeOffer?: string;
  discountPercentage?: number;
  eventTheme?: "none" | "warm" | "cool" | "tricolor" | "diwali" | "holi" | "newYear" | "scholarship";
  libreofficeAvailableOverride?: boolean;
  ffmpegAvailableOverride?: boolean;
  globalNoticeActive?: boolean;
  globalNoticeText?: string;
  globalNoticeType?: "info" | "warning" | "error" | "success";
  popupMessageActive?: boolean;
  popupMessageText?: string;
  adType?: "none" | "internal" | "adsense" | "alternative";
  alternativeAdCode?: string;
  customBannerImg?: string;
  customBannerLink?: string;
};

const CRED_KEY = "filenova-admin";
const SETTINGS_KEY = "filenova-settings";
const SESSION_KEY = "filenova-admin-session";
const DEFAULT_ADMIN_USERNAME = "subhajitghosh";
const DEFAULT_ADMIN_PASSWORD = "Subhajit@56";

const defaultSettings: Settings = { 
  standaloneMode: false, 
  editingEnabled: true,
  activeOffer: "",
  discountPercentage: 0,
  eventTheme: "none",
  libreofficeAvailableOverride: true,
  ffmpegAvailableOverride: true,
  globalNoticeActive: false,
  globalNoticeText: "",
  globalNoticeType: "info",
  popupMessageActive: false,
  popupMessageText: "",
  adType: "internal",
  alternativeAdCode: "",
  customBannerImg: "",
  customBannerLink: "",
};

const AdminContext = createContext<{
  creds: AdminCreds;
  settings: Settings;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setCredentials: (username: string, password: string) => void;
  setSettings: (s: Partial<Settings>) => void;
} | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const hash = (s: string) => {
    try {
      return btoa(unescape(encodeURIComponent(s)));
    } catch (e) {
      return s;
    }
  };

  const defaultCreds: AdminCreds = {
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash: hash(DEFAULT_ADMIN_PASSWORD),
  };

  const [creds, setCreds] = useState<AdminCreds>(() => {
    try {
      const raw = localStorage.getItem(CRED_KEY);
      return raw ? JSON.parse(raw) : defaultCreds;
    } catch (e) {
      return defaultCreds;
    }
  });

  const [settings, setSettingsState] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  // ── Session persistence via sessionStorage ─────────────────────────────────
  // Survives page refresh within the same browser tab/session.
  // Clears automatically when the browser tab is closed.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });

  // Function to get automatic event theme based on date
  const getAutomaticEventTheme = (): Settings["eventTheme"] => {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed: 0=Jan, 11=Dec
    const day = now.getDate();

    // Diwali: Oct-Nov (approx) - we'll set Oct 20 to Nov 15
    if ((month === 9 && day >= 20) || (month === 10 && day <= 15)) {
      return "diwali";
    }
    // Holi: March (approx) - we'll set March 10 to March 30
    if (month === 2 && day >= 10 && day <= 30) {
      return "holi";
    }
    // New Year: Dec 25 to Jan 5
    if ((month === 11 && day >= 25) || (month === 0 && day <= 5)) {
      return "newYear";
    }
    // Scholarship season: June to September
    if (month >= 5 && month <= 8) {
      return "scholarship";
    }
    // Default to none if no season matches
    return "none";
  };

  // Load settings from the server on mount
  useEffect(() => {
    if (!HAS_BACKEND) {
      const autoTheme = getAutomaticEventTheme();
      setSettingsState((current) => current.eventTheme === "none" ? { ...current, eventTheme: autoTheme } : current);
      return;
    }

    fetch(`${BACKEND_URL}/api/v1/premium/subscription/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          // If eventTheme is set to "none", we use the automatic theme
          // Otherwise, we keep the admin-set theme
          if (data.settings.eventTheme === "none") {
            const autoTheme = getAutomaticEventTheme();
            setSettingsState({ ...data.settings, eventTheme: autoTheme });
          } else {
            setSettingsState(data.settings);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load settings from server", err);
      });
  }, []);

  useEffect(() => {
    try {
      if (creds) localStorage.setItem(CRED_KEY, JSON.stringify(creds));
      else localStorage.removeItem(CRED_KEY);
    } catch (e) {}
  }, [creds]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  const login = (username: string, password: string): boolean => {
    if (!creds) return false;
    if (creds.username === username && creds.passwordHash === hash(password)) {
      setIsAuthenticated(true);
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    toast.success("Logged out of admin panel");
  };

  const setCredentials = (username: string, password: string) => {
    const payload: AdminCreds = { username, passwordHash: hash(password) };
    setCreds(payload);
  };

  const setSettings = async (s: Partial<Settings>) => {
    const updated = { ...settings, ...s };
    setSettingsState(updated);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (creds) {
        headers["x-admin-username"] = creds.username;
        headers["x-admin-hash"] = creds.passwordHash;
      }
      if (!HAS_BACKEND) {
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/settings`, {
        method: "POST",
        headers,
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        toast.error("Failed to save settings to server");
      }
    } catch (e) {
      toast.error("Network error saving settings");
    }
  };

  return (
    <AdminContext.Provider
      value={{ creds, settings, isAuthenticated, login, logout, setCredentials, setSettings }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export default AdminProvider;
