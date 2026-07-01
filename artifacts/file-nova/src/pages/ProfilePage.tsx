import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ChevronLeft, User, Phone, Mail, Lock, ShieldAlert, 
  Trash2, Save, X, Edit3, KeyRound, Award, History,
  CreditCard, Download, Loader2, Heart, Sparkles, CheckCircle2
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient, apiMock, HAS_BACKEND } from "@/lib/api";
import { FEATURE_PAYMENT_GATEWAY } from "@/config/featureFlags";
import { useSupportDevStore } from "@/store/useSupportDevStore";
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

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    setLoadingHistory(true);
    try {
      const client = HAS_BACKEND ? apiClient : apiMock;
      const res = await client.getPaymentHistory();
      if (res.success) {
        setPaymentHistory(res.history || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch payment history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownloadInvoice = async (subId: string) => {
    if (subId.startsWith("upi_")) {
      toast.info("Invoices for manual UPI payments are available once approved by admin.");
      return;
    }
    setDownloadingInvoiceId(subId);
    try {
      const client = HAS_BACKEND ? apiClient : apiMock;
      const res = await client.getInvoice(subId);
      if (res.success && res.invoice) {
        const inv = res.invoice;
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Invoice ${inv.invoiceNumber}</title>
                <style>
                  body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; background: #ffffff; }
                  .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
                  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
                  .logo { font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: -0.025em; }
                  .invoice-details { text-align: right; font-size: 13px; color: #64748b; }
                  .invoice-details h2 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
                  .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                  .details-block h4 { margin: 0 0 8px 0; text-transform: uppercase; font-size: 10px; font-weight: 800; tracking-wider; color: #94a3b8; }
                  .details-block p { margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #334155; }
                  .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                  .table th { background: #f8fafc; padding: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; text-align: left; border-bottom: 1px solid #e2e8f0; }
                  .table td { padding: 16px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; color: #334155; }
                  .totals-container { display: flex; justify-content: flex-end; }
                  .totals { width: 300px; font-size: 13px; color: #475569; }
                  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
                  .totals-row.grand { border-top: 2px solid #f1f5f9; padding-top: 12px; font-size: 16px; font-weight: 850; color: #0f172a; }
                  .footer { border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 60px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.6; }
                  @media print {
                    body { padding: 0; }
                    .invoice-box { border: none; box-shadow: none; padding: 0; }
                  }
                </style>
              </head>
              <body>
                <div class="invoice-box">
                  <div class="header">
                    <div>
                      <div class="logo">FileNova</div>
                      <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Premium Document Productivity Platform</p>
                    </div>
                    <div class="invoice-details">
                      <h2>TAX INVOICE</h2>
                      <p style="margin: 4px 0 0 0; color: #334155;"><strong>No: ${inv.invoiceNumber}</strong></p>
                      <p style="margin: 2px 0 0 0;">Date: ${new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div class="details-grid">
                    <div class="details-block">
                      <h4>Billed To</h4>
                      <p>${inv.customerName}</p>
                      <p>${inv.customerEmail}</p>
                    </div>
                    <div class="details-block" style="text-align: right;">
                      <h4>Payment Details</h4>
                      <p>Method: ${inv.paymentMethod}</p>
                      <p>Transaction ID: ${inv.transactionId}</p>
                      <p>Currency: ${inv.currency}</p>
                    </div>
                  </div>

                  <table class="table">
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th style="text-align: right;">Taxable Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>FileNova ${inv.planName} SaaS Access</strong><br/>
                          <span style="font-size: 11px; color: #64748b;">Cloud document processing, templates and tools activation.</span>
                        </td>
                        <td style="text-align: right;">₹${(inv.baseAmount / 100).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="totals-container">
                    <div class="totals">
                      <div class="totals-row">
                        <span>Taxable Subtotal</span>
                        <span>₹${(inv.baseAmount / 100).toFixed(2)}</span>
                      </div>
                      <div class="totals-row">
                        <span>CGST (9%)</span>
                        <span>₹${(inv.cgstAmount / 100).toFixed(2)}</span>
                      </div>
                      <div class="totals-row">
                        <span>SGST (9%)</span>
                        <span>₹${(inv.sgstAmount / 100).toFixed(2)}</span>
                      </div>
                      <div class="totals-row grand">
                        <span>Total (Incl. Tax)</span>
                        <span>₹${(inv.netAmount / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div class="footer">
                    <p>Thank you for subscribing to FileNova Premium! Your billing transaction is processed securely.</p>
                    <p>For support and queries, please email us at <strong>${inv.supportEmail}</strong>.</p>
                    <p style="font-size: 9px; margin-top: 15px;">* This is a computer-generated tax invoice that complies with SaaS digital transaction rules. No signature required.</p>
                  </div>
                </div>
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else {
        toast.error("Failed to load invoice details.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to download invoice.");
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

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
      <div className="min-h-screen bg-card flex items-center justify-center">
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
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg border-2 border-border">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <h2 className="font-black text-lg text-foreground leading-tight">{user.name || "FileNova User"}</h2>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>

              <div className="mt-6 w-full pt-6 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-bold">Plan Tier</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                    <Award className="h-3 w-3 fill-current" />
                    {user.premiumTier}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-bold">Role</span>
                  <span className="text-foreground font-extrabold uppercase text-[10px]">{user.role}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setLocation("/");
                }}
                className="w-full mt-8 py-2.5 px-4 bg-card hover:bg-muted border border-border hover:border-border text-red-400 hover:text-red-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Logout Account
              </button>
            </div>

            {/* Quick stats box */}
            <div className="bg-card/40 border border-border rounded-3xl p-5 backdrop-blur-xl shadow-lg space-y-4">
              <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider">Account Usage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Daily limit gate</span>
                    <span className="text-foreground font-extrabold">{user.premiumEnabled ? "Unlimited" : "3 files / day"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-card rounded-full overflow-hidden">
                    <div className={`h-full bg-indigo-500 transition-all duration-500 ${user.premiumEnabled ? "w-full" : "w-[30%]"}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings Panels */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Profile Info */}
            <div className="bg-card/30 border border-border rounded-3xl p-6 backdrop-blur-xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-400" />
                  Personal Information
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 py-1 px-3 bg-card hover:bg-muted border border-border rounded-lg text-xs font-bold text-foreground hover:text-foreground transition-all cursor-pointer"
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
                      className="peer w-full bg-card/45 border border-border focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-foreground focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                      required
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="profile-name"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
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
                      className="peer w-full bg-card/45 border border-border focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-foreground focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="profile-phone"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
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
                      className="py-2.5 px-4 bg-card hover:bg-muted border border-border hover:border-border text-muted-foreground hover:text-foreground font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-bold">Full Name</span>
                    <span className="col-span-2 text-foreground font-semibold">{user.name || "Not provided"}</span>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b border-border/40">
                    <span className="text-muted-foreground font-bold">Email Address</span>
                    <span className="col-span-2 text-foreground font-semibold">{user.email}</span>
                  </div>
                  <div className="grid grid-cols-3 py-2">
                    <span className="text-muted-foreground font-bold">Phone Number</span>
                    <span className="col-span-2 text-foreground font-semibold">{user.phoneNumber || "Not provided"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password (Security) */}
            <div className="bg-card/30 border border-border rounded-3xl p-6 backdrop-blur-xl shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-400" />
                  Security
                </h3>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-1.5 py-1 px-3 bg-card hover:bg-muted border border-border rounded-lg text-xs font-bold text-foreground hover:text-foreground transition-all cursor-pointer"
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
                      className="peer w-full bg-card/45 border border-border focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-foreground focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="current-password"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
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
                      className="peer w-full bg-card/45 border border-border focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-foreground focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="new-password"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
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
                      className="peer w-full bg-card/45 border border-border focus:border-indigo-500/50 rounded-xl pl-10 pr-4 pt-5 pb-2 text-xs text-foreground focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                      placeholder=" "
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground peer-focus:text-indigo-400 transition-all h-4 w-4 pointer-events-none" />
                    <label 
                      htmlFor="confirm-password"
                      className="absolute left-10 top-2 text-[9px] font-bold text-indigo-400 uppercase tracking-wider transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
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
                      className="py-2.5 px-4 bg-card hover:bg-muted border border-border hover:border-border text-muted-foreground hover:text-foreground font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Regular password resets protect your data. If you log in via Google authentication, password changes are handled inside your Google Account settings.
                </p>
              )}
            </div>

            {/* Support Development */}
            {!FEATURE_PAYMENT_GATEWAY && (
              <div className="bg-card/30 border border-border rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Heart className="h-4 w-4 text-rose-400" />
                  Support Development
                </h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25">
                    <Sparkles className="h-3 w-3" />
                    Development Mode
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                    Payment Gateway: Coming Soon
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <CheckCircle2 className="h-3 w-3" />
                    In Progress
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Payment integration is currently undergoing final testing. All tools remain free during this time.
                </p>
                <button
                  type="button"
                  onClick={() => useSupportDevStore.getState().open()}
                  className="inline-flex items-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  <Heart className="h-3.5 w-3.5" />
                  Learn About Supporting FileNova
                </button>
              </div>
            )}

            {/* Billing & Payment History */}
            <div className="bg-card/30 border border-border rounded-3xl p-6 backdrop-blur-xl shadow-xl">
              <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2 mb-6">
                <CreditCard className="h-4 w-4 text-indigo-400" />
                Billing & Payment History
              </h3>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                  <span className="text-xs text-muted-foreground">Loading your transactions...</span>
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-2xl bg-card/20">
                  <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-semibold">No transactions found</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Upgrade to Premium to see your billing history here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="pb-3 pr-2">Plan</th>
                        <th className="pb-3 px-2">Date</th>
                        <th className="pb-3 px-2">Amount</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 pl-2 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40">
                      {paymentHistory.map((item) => (
                        <tr key={item.id} className="text-foreground hover:text-foreground transition-colors">
                          <td className="py-3.5 pr-2 font-bold capitalize">
                            {item.plan}
                          </td>
                          <td className="py-3.5 px-2 text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 px-2 font-semibold">
                            ₹{(item.amount / 100).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              item.status === 'active' || item.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                : item.status.includes('pending')
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                : 'bg-slate-500/10 text-muted-foreground border border-slate-500/25'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 pl-2 text-right">
                            {item.status.includes('pending') ? (
                              <span className="text-[10px] text-muted-foreground italic">Pending approval</span>
                            ) : (
                              <button
                                onClick={() => handleDownloadInvoice(item.id)}
                                disabled={downloadingInvoiceId === item.id}
                                className="inline-flex items-center gap-1.5 py-1 px-2 bg-card hover:bg-muted border border-border rounded-lg text-[11px] font-bold text-foreground hover:text-foreground hover:border-border transition-all cursor-pointer disabled:opacity-50"
                              >
                                {downloadingInvoiceId === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                                PDF
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/[0.02] border border-red-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group/danger shadow-red-950/10">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.02] via-transparent to-red-500/[0.02] pointer-events-none" />
              <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-36 h-36 bg-red-500/[0.04] rounded-full blur-2xl group-hover/danger:bg-red-500/[0.08] transition-all duration-700 pointer-events-none" />
              <h3 className="font-extrabold text-sm text-red-400 uppercase tracking-wider flex items-center gap-2 mb-3 relative z-10">
                <ShieldAlert className="h-4 w-4" />
                Danger Zone
              </h3>
              <p className="text-xs text-muted-foreground/90 leading-relaxed mb-6 relative z-10">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <h4 className="font-black text-base text-foreground flex items-center gap-2 mb-3">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Delete Account Permanently?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-5">
              To proceed with deletion, please type <strong className="text-foreground font-extrabold">delete my account</strong> below to confirm.
            </p>

            <div className="relative group/field mb-6">
              <input
                type="text"
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="peer w-full bg-card/60 border border-red-950 focus:border-red-500/50 rounded-xl px-4 pt-5 pb-2 text-xs text-foreground focus:outline-none transition-all placeholder-transparent backdrop-blur-md"
                placeholder=" "
              />
              <label 
                htmlFor="delete-confirm"
                className="absolute left-4 top-2 text-[9px] font-bold text-red-400 uppercase tracking-wider transition-all
                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:font-normal peer-placeholder-shown:lowercase peer-placeholder-shown:normal-case
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
                className="py-2 px-4 bg-card hover:bg-muted border border-border text-foreground font-bold text-xs rounded-xl transition cursor-pointer"
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
