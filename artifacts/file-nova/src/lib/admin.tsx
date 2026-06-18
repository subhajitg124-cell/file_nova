import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { BACKEND_URL, HAS_BACKEND } from "@/lib/api";

type AdminCreds = { username: string; passwordHash: string } | null;
type Settings = { 
  standaloneMode: boolean; 
  editingEnabled: boolean;
  activeOffer?: string;
  discountPercentage?: number;
  eventTheme?: "none" | "warm" | "cool" | "tricolor" | "diwali" | "holi" | "newYear" | "scholarship" | "durgaPuja" | "poilaBaisakh" | "saraswatiPuja" | "eid" | "christmas" | "rabindraJayanti";
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
  enableSeasonalThemes?: boolean;
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
  enableSeasonalThemes: false,
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

    // 1. Republic Day (Tricolor): Jan 24 to Jan 28
    if (month === 0 && day >= 24 && day <= 28) {
      return "tricolor";
    }
    // 2. Saraswati Puja (Basanti Yellow): Jan 29 to Feb 10
    if ((month === 0 && day >= 29) || (month === 1 && day <= 10)) {
      return "saraswatiPuja";
    }
    // 3. Holi / Dol Jatra: March 10 to March 30
    if (month === 2 && day >= 10 && day <= 30) {
      return "holi";
    }
    // 4. Poila Baisakh (Bengali New Year): April 10 to April 18
    if (month === 3 && day >= 10 && day <= 18) {
      return "poilaBaisakh";
    }
    // 5. Rabindra Jayanti: May 5 to May 12
    if (month === 4 && day >= 5 && day <= 12) {
      return "rabindraJayanti";
    }
    // 6. Eid (Green/Gold): May 15 to May 25
    if (month === 4 && day >= 15 && day <= 25) {
      return "eid";
    }
    // 7. Independence Day (Tricolor): Aug 11 to Aug 18
    if (month === 7 && day >= 11 && day <= 18) {
      return "tricolor";
    }
    // 8. Durga Puja: Sept 25 to Oct 25
    if ((month === 8 && day >= 25) || (month === 9 && day <= 25)) {
      return "durgaPuja";
    }
    // 9. Diwali / Kali Puja: Oct 26 to Nov 15
    if ((month === 9 && day >= 26) || (month === 10 && day <= 15)) {
      return "diwali";
    }
    // 10. Christmas: Dec 15 to Dec 25
    if (month === 11 && day >= 15 && day <= 25) {
      return "christmas";
    }
    // 11. New Year: Dec 26 to Jan 5
    if ((month === 11 && day >= 26) || (month === 0 && day <= 5)) {
      return "newYear";
    }
    // 12. Scholarship / College Admission Season: June 1 to August 10
    if ((month === 5) || (month === 6) || (month === 7 && day <= 10)) {
      return "scholarship";
    }

    // Default to none if no season matches
    return "none";
  };

  // Load settings from the server on mount
  useEffect(() => {
    if (!HAS_BACKEND) {
      return;
    }

    fetch(`${BACKEND_URL}/api/v1/premium/subscription/settings`)
      .then((res) => {
        if (!res.ok) throw new Error("Server returned non-ok status");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.settings) {
          setSettingsState(data.settings);
        }
      })
      .catch((err) => {
        console.warn("Failed to load settings from server, using local/cached values.", err);
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
        console.warn("Failed to save settings to server");
      }
    } catch (e) {
      console.warn("Network error saving settings to server, saved locally:", e);
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
