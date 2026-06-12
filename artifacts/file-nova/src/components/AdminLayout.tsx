import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  SlidersHorizontal,
  Percent,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
  Shield,
  CheckCircle2,
  AlertTriangle,
  User,
  Globe,
  BellRing,
  Sparkles,
  KeyRound
} from "lucide-react";
import { useAdmin } from "@/lib/admin";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const admin = useAdmin();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Stats endpoints / Health checks info
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch("/api/v1/health");
      const data = await res.json();
      setBackendHealth(data);
    } catch {
      setBackendHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  React.useEffect(() => {
    if (admin.isAuthenticated) {
      fetchHealth();
    }
  }, [admin.isAuthenticated]);

  if (!admin.isAuthenticated) {
    return <>{children}</>; // Let page handle redirect to login
  }

  const navItems = [
    { href: "/nova-control", label: "Dashboard Overview", icon: SlidersHorizontal },
    { href: "/admin/upi-payments", label: "UPI Verification", icon: CreditCard },
    { href: "/admin/coupons", label: "Coupons & Offers", icon: Percent },
    { href: "/admin/analytics", label: "System Analytics", icon: BarChart3 },
  ];

  const handleSignOut = () => {
    admin.logout();
    setLocation("/nova-login");
  };

  const handleUpdateCreds = () => {
    if (newUser && newPass) {
      admin.setCredentials(newUser, newPass);
      toast.success("Credentials updated successfully!");
      setNewUser("");
      setNewPass("");
    } else {
      toast.error("Please fill in both new username and password.");
    }
  };

  // Status variables
  const isBackendOnline = !!backendHealth;
  const isLibreOfficeActive = backendHealth?.services?.libreoffice_headless === "available";
  const isFFmpegActive = backendHealth?.services?.ffmpeg === "available";

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#070b13]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 lg:hidden text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center p-1.5 shadow-md shadow-indigo-500/10">
              <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  FileNova AI Console
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-md font-bold leading-none mt-0.5 text-white tracking-tight">{title}</h1>
            </div>
          </div>
        </div>

        {/* Global Action items */}
        <div className="flex items-center gap-2">
          {/* Quick health stats badges */}
          <div className="hidden md:flex items-center gap-2 text-xs mr-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.05] bg-white/[0.02]">
              <span className="text-[10px] text-slate-400">Server:</span>
              <span className={`flex items-center gap-1 font-bold ${isBackendOnline ? "text-emerald-400" : "text-rose-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isBackendOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                {isBackendOnline ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.05] bg-white/[0.02]">
              <span className="text-[10px] text-slate-400">Office:</span>
              <span className={`font-bold ${isLibreOfficeActive ? "text-emerald-400" : "text-amber-500"}`}>
                {isLibreOfficeActive ? "Active" : "Unavailable"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.05] bg-white/[0.02]">
              <span className="text-[10px] text-slate-400">FFmpeg:</span>
              <span className={`font-bold ${isFFmpegActive ? "text-emerald-400" : "text-amber-500"}`}>
                {isFFmpegActive ? "Active" : "Unavailable"}
              </span>
            </div>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loadingHealth}
            className="p-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
            title="Refresh Server Health"
          >
            <Activity className={`h-4 w-4 ${loadingHealth ? "animate-spin" : ""}`} />
          </button>
          
          <Link href="/" className="px-3.5 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/5 text-xs font-bold text-slate-300 hover:text-white transition">
            Launch App
          </Link>
        </div>
      </header>

      {/* Workspace container */}
      <div className="flex-1 flex relative z-10">
        
        {/* Sidebar Nav */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 border-r border-white/[0.06] bg-[#070b13] p-4 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:bg-transparent lg:border-white/[0.04] shrink-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            
            {/* User Session Info */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 relative overflow-hidden group">
              <div className="absolute -right-3 -top-3 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all duration-300" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Super Administrator</p>
                  <p className="text-sm font-black truncate text-white mt-0.5">{admin.creds?.username}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="mt-3.5 w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 px-3 py-2 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out Session</span>
              </button>
            </div>

            {/* Navigation links */}
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 px-3 mb-2">Navigation Panel</p>
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group relative
                      ${isActive 
                        ? "bg-gradient-to-r from-indigo-600/25 to-purple-600/25 text-white border border-indigo-500/20 shadow-sm" 
                        : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"}
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-gradient-to-b from-indigo-500 to-purple-500" />
                    )}
                    <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Collapsible Global Settings panel */}
            <div className="border-t border-white/[0.05] pt-4 space-y-2">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-1.5">
                  <Settings className="h-3 w-3" /> System Engine
                </span>
                <span className="text-[10px] text-indigo-400 font-bold">{settingsOpen ? "Collapse" : "Expand"}</span>
              </button>

              {settingsOpen && (
                <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-3.5 space-y-4 animate-scale-in text-xs">
                  {/* Standalone / Editing checks */}
                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-slate-300">Simulator Mode</span>
                      <input
                        type="checkbox"
                        checked={admin.settings.standaloneMode || false}
                        onChange={(e) => admin.setSettings({ standaloneMode: e.target.checked })}
                        className="accent-indigo-500 h-3.5 w-3.5 rounded border-white/10"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-slate-300">Editing Option</span>
                      <input
                        type="checkbox"
                        checked={admin.settings.editingEnabled !== false}
                        onChange={(e) => admin.setSettings({ editingEnabled: e.target.checked })}
                        className="accent-indigo-500 h-3.5 w-3.5 rounded border-white/10"
                      />
                    </label>
                  </div>

                  {/* Manual Overrides */}
                  <div className="border-t border-white/[0.05] pt-3 space-y-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Manual Overrides
                    </p>
                    <label className="flex items-center justify-between cursor-pointer" title="Force LibreOffice availability">
                      <span className="text-[11px] text-slate-450">LibreOffice (Office)</span>
                      <input
                        type="checkbox"
                        checked={admin.settings.libreofficeAvailableOverride !== false}
                        onChange={async (e) => {
                          await admin.setSettings({ libreofficeAvailableOverride: e.target.checked });
                          fetchHealth();
                        }}
                        className="accent-indigo-500 h-3.5 w-3.5 rounded border-white/10"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer" title="Force FFmpeg availability">
                      <span className="text-[11px] text-slate-450">FFmpeg (Video)</span>
                      <input
                        type="checkbox"
                        checked={admin.settings.ffmpegAvailableOverride !== false}
                        onChange={async (e) => {
                          await admin.setSettings({ ffmpegAvailableOverride: e.target.checked });
                          fetchHealth();
                        }}
                        className="accent-indigo-500 h-3.5 w-3.5 rounded border-white/10"
                      />
                    </label>
                  </div>

                  {/* Notices and Themes */}
                  <div className="border-t border-white/[0.05] pt-3 space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Event & Themes
                    </p>
                    
                    <div>
                      <label htmlFor="layout-event-theme" className="block text-[10px] text-slate-400 mb-1">Active Event Theme</label>
                      <select
                        id="layout-event-theme"
                        value={admin.settings.eventTheme || "none"}
                        onChange={(e) => admin.setSettings({ eventTheme: e.target.value as any })}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="none">Standard Dark (Default)</option>
                        <option value="warm">Warm/Festival</option>
                        <option value="cool">Cool/Tech</option>
                        <option value="tricolor">Indian Tri-color</option>
                        <option value="diwali">Diwali (Gold/Purple)</option>
                        <option value="holi">Holi (Vibrant Gradient)</option>
                        <option value="newYear">New Year (Sparkles)</option>
                        <option value="scholarship">Scholarship Mode</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="layout-offer-text" className="block text-[10px] text-slate-400 mb-1">Offer Title</label>
                      <input
                        id="layout-offer-text"
                        value={admin.settings.activeOffer || ""}
                        onChange={(e) => admin.setSettings({ activeOffer: e.target.value })}
                        placeholder="e.g. 50% Off Launch Deal!"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="layout-discount-pct" className="block text-[10px] text-slate-400 mb-1">Discount (%)</label>
                      <input
                        id="layout-discount-pct"
                        type="number" min="0" max="100"
                        value={admin.settings.discountPercentage || 0}
                        onChange={(e) => admin.setSettings({ discountPercentage: Number(e.target.value) })}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  {/* Notice Banner */}
                  <div className="border-t border-white/[0.05] pt-3 space-y-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <BellRing className="h-3 w-3" /> Global Notice Banner
                    </p>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-slate-305">Active Banner</span>
                      <input
                        type="checkbox"
                        checked={admin.settings.globalNoticeActive || false}
                        onChange={(e) => admin.setSettings({ globalNoticeActive: e.target.checked })}
                        className="accent-indigo-500 h-3.5 w-3.5 rounded border-white/10"
                      />
                    </label>
                    <div>
                      <label htmlFor="layout-notice-text" className="block text-[10px] text-slate-400 mb-1">Banner Text</label>
                      <input
                        id="layout-notice-text"
                        value={admin.settings.globalNoticeText || ""}
                        onChange={(e) => admin.setSettings({ globalNoticeText: e.target.value })}
                        placeholder="Banner description..."
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="layout-notice-type" className="block text-[10px] text-slate-400 mb-1">Alert Color</label>
                      <select
                        id="layout-notice-type"
                        value={admin.settings.globalNoticeType || "info"}
                        onChange={(e) => admin.setSettings({ globalNoticeType: e.target.value as any })}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="info">Info (Blue)</option>
                        <option value="warning">Warning (Amber)</option>
                        <option value="error">Error/Danger (Red)</option>
                        <option value="success">Success (Green)</option>
                      </select>
                    </div>
                  </div>

                  {/* Popups */}
                  <div className="border-t border-white/[0.05] pt-3 space-y-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Announcement Pop-up
                    </p>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-semibold text-slate-305">Active Modal</span>
                      <input
                        type="checkbox"
                        checked={admin.settings.popupMessageActive || false}
                        onChange={(e) => admin.setSettings({ popupMessageActive: e.target.checked })}
                        className="accent-indigo-500 h-3.5 w-3.5 rounded border-white/10"
                      />
                    </label>
                    <div>
                      <label htmlFor="layout-popup-text" className="block text-[10px] text-slate-400 mb-1">Pop-up Text</label>
                      <textarea
                        id="layout-popup-text"
                        value={admin.settings.popupMessageText || ""}
                        onChange={(e) => admin.setSettings({ popupMessageText: e.target.value })}
                        placeholder="Pop-up message..."
                        rows={2}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs resize-none"
                      />
                    </div>
                  </div>

                  {/* Ad Settings */}
                  <div className="border-t border-white/[0.05] pt-3 space-y-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> Ad Monetization
                    </p>
                    <div>
                      <label htmlFor="layout-ad-type" className="block text-[10px] text-slate-400 mb-1">Monetization Type</label>
                      <select
                        id="layout-ad-type"
                        value={admin.settings.adType || "internal"}
                        onChange={(e) => admin.setSettings({ adType: e.target.value as any })}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="none">No Ads (Ad Gate Disabled)</option>
                        <option value="internal">Internal Promos (Upsell Premium)</option>
                        <option value="adsense">Google AdSense (Original)</option>
                        <option value="alternative">Alternative Code (Adsterra, etc.)</option>
                      </select>
                    </div>
                    {admin.settings.adType === "alternative" && (
                      <div>
                        <label htmlFor="layout-alt-ad-code" className="block text-[10px] text-slate-400 mb-1">Alternative Ad Script HTML</label>
                        <textarea
                          id="layout-alt-ad-code"
                          value={admin.settings.alternativeAdCode || ""}
                          onChange={(e) => admin.setSettings({ alternativeAdCode: e.target.value })}
                          placeholder="Paste Adsterra / PopAds banner script here..."
                          rows={3}
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs resize-none font-mono"
                        />
                      </div>
                    )}
                    {admin.settings.adType === "internal" && (
                      <>
                        <div>
                          <label htmlFor="layout-banner-img" className="block text-[10px] text-slate-400 mb-1">Custom Banner Image URL</label>
                          <input
                            id="layout-banner-img"
                            value={admin.settings.customBannerImg || ""}
                            onChange={(e) => admin.setSettings({ customBannerImg: e.target.value })}
                            placeholder="Leave blank for auto premium upsell"
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label htmlFor="layout-banner-link" className="block text-[10px] text-slate-400 mb-1">Custom Banner Link URL</label>
                          <input
                            id="layout-banner-link"
                            value={admin.settings.customBannerLink || ""}
                            onChange={(e) => admin.setSettings({ customBannerLink: e.target.value })}
                            placeholder="e.g. /pricing or affiliate link"
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Admin Credentials */}
                  <div className="border-t border-white/[0.05] pt-3 space-y-2.5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <KeyRound className="h-3 w-3" /> Admin Auth Settings
                    </p>
                    <input
                      value={newUser}
                      onChange={(e) => setNewUser(e.target.value)}
                      placeholder="New username"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs"
                    />
                    <input
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="New password"
                      type="password"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs"
                    />
                    <button
                      onClick={handleUpdateCreds}
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10.5px] py-1.5 shadow-md shadow-indigo-500/15 cursor-pointer transition"
                    >
                      Update Auth Creds
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile backdrop shadow */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}

export default AdminLayout;
