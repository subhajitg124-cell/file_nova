import React, { useState, useEffect } from "react";
import { useAdmin } from "@/lib/admin";
import { useLocation } from "wouter";
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Clock,
  Package,
  Percentage,
  DollarSign,
  Upload,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminCouponManagement() {
  const admin = useAdmin();
  const [, setLocation] = useLocation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as const,
    value: "",
    minPurchase: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    applicablePlans: ["free", "basic", "pro", "elite"] as const[],
    applicableTools: [],
    isActive: true,
    description: "",
  });

  useEffect(() => {
    if (!admin.isAuthenticated) {
      setLocation("/nova-login");
      return;
    }
    fetchCoupons();
  }, [admin.isAuthenticated, setLocation]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        "x-admin-username": admin.creds?.username || "",
        "x-admin-hash": admin.creds?.passwordHash || "",
      };
      const res = await fetch("/api/v1/premium/subscription/admin/coupons", { headers });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      } else {
        toast.error("Failed to load coupons");
      }
    } catch (err) {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxDiscount: "",
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 30 days from now
      usageLimit: "",
      applicablePlans: ["free", "basic", "pro", "elite"] as const[],
      applicableTools: [],
      isActive: true,
      description: "",
    });
    setEditing(false);
    setCreating(true);
  };

  const handleEditCoupon = (coupon: any) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minPurchase: coupon.minPurchase?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      validFrom: coupon.validFrom.slice(0, 16),
      validUntil: coupon.validUntil.slice(0, 16),
      usageLimit: coupon.usageLimit.toString(),
      applicablePlans: coupon.applicablePlans,
      applicableTools: coupon.applicableTools || [],
      isActive: coupon.isActive,
      description: coupon.description || "",
    });
    setEditing(true);
    setCreating(false);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      const headers: Record<string, string> = {
        "x-admin-username": admin.creds?.username || "",
        "x-admin-hash": admin.creds?.passwordHash || "",
      };
      const res = await fetch(`/api/v1/premium/subscription/admin/coupons/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to delete coupon");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleToggleCoupon = async (id: string, isActive: boolean) => {
    try {
      const headers: Record<string, string> = {
        "x-admin-username": admin.creds?.username || "",
        "x-admin-hash": admin.creds?.passwordHash || "",
      };
      const res = await fetch(`/api/v1/premium/subscription/admin/coupons/${id}/toggle`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Coupon ${data.coupon.isActive ? "activated" : "deactivated"} successfully`);
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to toggle coupon");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    
    if (!formData.value || parseInt(formData.value) <= 0) {
      toast.error("Value must be a positive number");
      return;
    }
    
    if (!formData.usageLimit || parseInt(formData.usageLimit) <= 0) {
      toast.error("Usage limit must be a positive number");
      return;
    }
    
    const validFrom = new Date(formData.validFrom);
    const validUntil = new Date(formData.validUntil);
    
    if (validFrom >= validUntil) {
      toast.error("Valid from date must be before valid until date");
      return;
    }
    
    try {
      setCreating(true);
      setEditing(true);
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-admin-username": admin.creds?.username || "",
        "x-admin-hash": admin.creds?.passwordHash || "",
      };
      
      let res;
      if (selectedCoupon) {
        // Update existing coupon
        res = await fetch(`/api/v1/premium/subscription/admin/coupons/${selectedCoupon.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            ...formData,
            value: parseInt(formData.value),
            minPurchase: formData.minPurchase ? parseInt(formData.minPurchase) : undefined,
            maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) : undefined,
            usageLimit: parseInt(formData.usageLimit),
            validFrom: formData.validFrom,
            validUntil: formData.validUntil,
          }),
        });
      } else {
        // Create new coupon
        res = await fetch("/api/v1/premium/subscription/admin/coupons", {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...formData,
            value: parseInt(formData.value),
            minPurchase: formData.minPurchase ? parseInt(formData.minPurchase) : undefined,
            maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) : undefined,
            usageLimit: parseInt(formData.usageLimit),
            validFrom: formData.validFrom,
            validUntil: formData.validUntil,
          }),
        });
      }
      
      const data = await res.json();
      if (data.success) {
        toast.success(selectedCoupon ? "Coupon updated successfully" : "Coupon created successfully");
        setCreating(false);
        setEditing(false);
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to save coupon");
        setCreating(false);
        setEditing(false);
      }
    } catch (err) {
      toast.error("Network error");
      setCreating(false);
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setCreating(false);
    setEditing(false);
    setSelectedCoupon(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage": return "Percentage Discount";
      case "fixed": return "Fixed Amount Discount";
      case "free_uploads": return "Free Uploads";
      case "extended_validity": return "Extended Validity";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "percentage": return Percentage;
      case "fixed": return DollarSign;
      case "free_uploads": return Upload;
      case "extended_validity": return Clock;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border">
              <img src="/logo.png" alt="FileNova logo" className="h-10 w-auto" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">FileNova AI Console</p>
              <h1 className="text-xl font-black">Coupon Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { admin.logout(); setLocation("/nova-login"); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar - Quick Actions */}
        <aside className="space-y-3 rounded-xl border border-border bg-card p-3 lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <p className="text-sm font-black truncate">Signed in as</p>
            <p className="text-xs text-primary font-bold truncate">{admin.creds?.username}</p>
            <button
              onClick={() => { admin.logout(); setLocation("/nova-login"); }}
              className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-muted/60 transition cursor-pointer"
            >
              Sign out
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Quick Actions</p>
            <div className="space-y-2">
              <button
                onClick={handleCreateCoupon}
                className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Create New Coupon
              </button>
              
              <button
                onClick={() => setLocation("/admin")}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                <Activity className="h-3 w-3" /> Back to Dashboard
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="space-y-5">
          {/* Coupon Form */}
          {creating || editing && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="font-black mb-4">
                {editing ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Coupon Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. STUDENT20, SAVE50"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold uppercase outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Coupon Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Discount</option>
                      <option value="free_uploads">Free Uploads</option>
                      <option value="extended_validity">Extended Validity</option>
                    </select>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Value</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="Enter value"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        {formData.type === "percentage" ? "%" : 
                         formData.type === "fixed" ? "₹" : 
                         formData.type === "free_uploads" ? "uploads" : "days"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Minimum Purchase (₹)</label>
                    <input
                      type="number"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                      placeholder="Optional"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Maximum Discount (₹)</label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="Optional (for percentage coupons)"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Valid From</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Valid Until</label>
                    <input
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Usage Limit</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="Max uses"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Applicable Plans</label>
                    <div className="space-y-2">
                      {["free", "basic", "pro", "elite"].map((plan) => (
                        <div key={plan} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.applicablePlans.includes(plan as any)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, applicablePlans: [...formData.applicablePlans, plan as any] });
                              } else {
                                setFormData({ ...formData, applicablePlans: formData.applicablePlans.filter(p => p !== plan) });
                              }
                            }}
                            className="h-4 w-4"
                          />
                          <span className="text-sm font-medium">{plan.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Applicable Tools (leave empty for all)</label>
                  <input
                    type="text"
                    value={formData.applicableTools.join(", ")}
                    onChange={(e) => setFormData({ ...formData, applicableTools: e.target.value.split(",").map(t => t.trim()).filter(t => t.length > 0) })}
                    placeholder="e.g. pdf_merge, video_compress, image_resize"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Specify tool slugs (comma-separated) that this coupon applies to. Leave empty for all tools.
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Is Active</label>
                    <select
                      value={formData.isActive.toString()}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Optional description"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition"
                  >
                    {editing ? "Update Coupon" : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Coupons List */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black mb-0">Active Coupons ({coupons.length})</h2>
              <button
                onClick={handleCreateCoupon}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground hover:bg-primary/95 transition cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>New Coupon</span>
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center h-8 w-8">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Loading coupons...</p>
              </div>
            ) : (
              coupons.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center h-8 w-8">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">No coupons found. Create your first coupon!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/60 text-xs uppercase text-muted-foreground text-[10px] tracking-wider">
                      <tr>
                        <th className="px-3 py-3">Code</th>
                        <th className="px-3 py-3">Type</th>
                        <th className="px-3 py-3">Value</th>
                        <th className="px-3 py-3">Usage</th>
                        <th className="px-3 py-3">Valid Until</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon.id} className="border-t border-border hover:bg-muted/20 transition">
                          <td className="px-3 py-3 font-mono text-bold">{coupon.code}</td>
                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {getTypeLabel(coupon.type)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {coupon.type === "percentage" ? `${coupon.value}%` : 
                             coupon.type === "fixed" ? `₹${(coupon.value / 100).toFixed(2)}` : 
                             coupon.type === "free_uploads" ? `${coupon.value} uploads` : 
                             `${coupon.value} days`}
                          </td>
                          <td className="px-3 py-3">
                            {coupon.usedCount}/{coupon.usageLimit}
                          </td>
                          <td className="px-3 py-3 text-[10px]">
                            {new Date(coupon.validUntil).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-3">
                            {coupon.isActive ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                Inactive
                              )
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="inline-flex gap-1">
                              <button
                                onClick={() => handleEditCoupon(coupon)}
                                className="text-xs font-bold text-muted-foreground hover:text-primary p-1"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)}
                                className="text-xs font-bold text-muted-foreground hover:text-primary p-1"
                              >
                                {coupon.isActive ? (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="text-xs font-bold text-muted-foreground hover:text-danger p-1"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}