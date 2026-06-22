import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ChevronLeft, User, Phone, Mail, Lock, ShieldAlert, 
  Trash2, Save, X, Edit3, KeyRound, Award, History 
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading, error, updateProfile, changePassword, deleteAccount, logout } = useAuthStore();
  const [, setLocation] = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation("/login?redirect=/profile");
    } else {
      setName(user.name || "");
      setPhone(user.phoneNumber || "");
    }
  }, [user, setLocation]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    const success = await updateProfile(name, phone || null);
    if (success) {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } else {
      toast.error(useAuthStore.getState().error || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      toast.success("Password changed successfully!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(useAuthStore.getState().error || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      toast.error("Please enter the confirmation text exactly");
      return;
    }

    const success = await deleteAccount();
    if (success) {
      toast.success("Your account has been permanently deleted.");
      setLocation("/");
    } else {
      toast.error(useAuthStore.getState().error || "Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_65%)] pointer-events-none z-0" />

      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/45 backdrop-blur-md px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all hover:scale-105">
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-up">
          
          {/* Left Column: Summary Card */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-card/45 border border-border/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col items-center text-center shadow-premium card-shine">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg border-2 border-slate-800">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <h2 className="font-black text-lg text-white leading-tight">{user.name || "FileNova User"}</h2>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>

              <div className="mt-6 w-full pt-6 border-t border-slate-900/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">Plan Tier</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                    <Award className="h-3 w-3 fill-current" />
                    {user.premiumTier}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">Role</span>
                  <span className="text-slate-300 font-extrabold uppercase text-[10px]">{user.role}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setLocation("/");
                }}
                className="w-full mt-8 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-850 text-red-400 hover:text-red-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Logout Account
              </button>
            </div>

            {/* Quick stats box */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Account Usage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Daily limit gate</span>
                    <span className="text-slate-300 font-extrabold">{user.premiumEnabled ? "Unlimited" : "3 files / day"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full bg-indigo-500 transition-all duration-500 ${user.premiumEnabled ? "w-full" : "w-[30%]"}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings Panels */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Profile Info */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-indigo-400" />
                  Personal Information
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 py-1 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="relative mt-2 group/field">
                    <input
                      type="text"
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="peer w-full bg-slate-950/45 border border-slate-900 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-white focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                      required
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="profile-name"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-slate-500 peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
                        peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[9px] peer-focus:font-bold peer-focus:text-indigo-400 peer-focus:uppercase peer-focus:tracking-wider pointer-events-none"
                    >
                      Full Name
                    </label>
                  </div>

                  <div className="relative group/field">
                    <input
                      type="tel"
                      id="profile-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="peer w-full bg-slate-950/45 border border-slate-900 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-white focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="profile-phone"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-slate-500 peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
                        peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[9px] peer-focus:font-bold peer-focus:text-indigo-400 peer-focus:uppercase peer-focus:tracking-wider pointer-events-none"
                    >
                      Phone Number
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-glow-indigo cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name || "");
                        setPhone(user.phoneNumber || "");
                      }}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 py-2 border-b border-slate-900/40">
                    <span className="text-slate-500 font-bold">Full Name</span>
                    <span className="col-span-2 text-white font-semibold">{user.name || "Not provided"}</span>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b border-slate-900/40">
                    <span className="text-slate-500 font-bold">Email Address</span>
                    <span className="col-span-2 text-white font-semibold">{user.email}</span>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <span className="text-slate-500 font-bold">Phone Number</span>
                    <span className="col-span-2 text-white font-semibold">{user.phoneNumber || "Not provided"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password (Security) */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-indigo-400" />
                  Security
                </h3>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-1.5 py-1 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div className="relative mt-2 group/field">
                    <input
                      type="password"
                      id="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="peer w-full bg-slate-950/45 border border-slate-900 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-white focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="current-password"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-slate-500 peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
                        peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[9px] peer-focus:font-bold peer-focus:text-indigo-400 peer-focus:uppercase peer-focus:tracking-wider pointer-events-none"
                    >
                      Current Password
                    </label>
                  </div>

                  <div className="relative group/field">
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="peer w-full bg-slate-950/45 border border-slate-900 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-white focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="new-password"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-slate-500 peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
                        peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[9px] peer-focus:font-bold peer-focus:text-indigo-400 peer-focus:uppercase peer-focus:tracking-wider pointer-events-none"
                    >
                      New Password (Min 8 chars)
                    </label>
                  </div>

                  <div className="relative group/field">
                    <input
                      type="password"
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="peer w-full bg-slate-950/45 border border-slate-900 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-white focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="confirm-password"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-slate-500 peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
                        peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[9px] peer-focus:font-bold peer-focus:text-indigo-400 peer-focus:uppercase peer-focus:tracking-wider pointer-events-none"
                    >
                      Confirm New Password
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-glow-indigo cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Regular password resets protect your data. If you log in via Google authentication, password changes are handled inside your Google Account settings.
                </p>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/[0.02] border border-red-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group/danger shadow-red-950/10">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.02] via-transparent to-red-500/[0.02] pointer-events-none" />
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-36 h-36 bg-red-500/[0.04] rounded-full blur-2xl group-hover/danger:bg-red-500/[0.08] transition-all duration-700 pointer-events-none" />
              <h3 className="font-extrabold text-sm text-red-400 uppercase tracking-wider flex items-center gap-2 mb-3 relative z-10">
                <ShieldAlert className="h-4.5 w-4.5" />
                Danger Zone
              </h3>
              <p className="text-xs text-slate-400/90 leading-relaxed mb-6 relative z-10">
                Permanently delete your account and all associated document configurations. This action is instantaneous, irreversible, and cannot be undone.
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 relative z-10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <h4 className="font-black text-base text-white flex items-center gap-2 mb-3">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Delete Account Permanently?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              To proceed with deletion, please type <strong className="text-white font-extrabold">delete my account</strong> below to confirm.
            </p>

            <div className="relative group/field mb-6">
              <input
                type="text"
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="peer w-full bg-slate-950/60 border border-red-950 focus:border-red-500/50 rounded-xl px-4 pt-5 pb-2 text-xs text-white focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                placeholder=" "
              />
              <label 
                htmlFor="delete-confirm"
                className="absolute left-4 top-2 text-[9px] font-bold text-red-400 uppercase tracking-wider transition-all
                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-slate-500 peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
                  peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[9px] peer-focus:font-bold peer-focus:text-red-400 peer-focus:uppercase peer-focus:tracking-wider pointer-events-none"
              >
                Type "delete my account" to confirm
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== "delete my account" || loading}
                className="py-2 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
