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
  Percent,
  DollarSign,
  Upload,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

export default function AdminCouponManagement() {
  const admin = useAdmin();
  const [, setLocation] = useLocation();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    type: "percentage" | "fixed" | "free_uploads" | "extended_validity";
    value: string;
    minPurchase: string;
    maxDiscount: string;
    validFrom: string;
    validUntil: string;
    usageLimit: string;
    applicablePlans: ("free" | "basic" | "pro" | "elite")[];
    applicableTools: string[];
    isActive: boolean;
    description: string;
  }>({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
    applicablePlans: ["free", "basic", "pro", "elite"],
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
      applicablePlans: ["free", "basic", "pro", "elite"],
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
      }
    } catch (err) {
      toast.error("Network error");
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
      case "percentage": return Percent;
      case "fixed": return DollarSign;
      case "free_uploads": return Upload;
      case "extended_validity": return Clock;
      default: return Package;
    }
  };

  return (
    <AdminLayout title="Coupons & Offers">
      <div className="space-y-6 animate-fade-in">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">System Coupon Configurations</h2>
            <p className="text-xs text-slate-400 mt-0.5">Generate, toggle, and view active campaign discount codes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCoupons}
              title="Refresh Coupons"
              aria-label="Refresh Coupons"
              className="inline-flex items-center justify-center p-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleCreateCoupon}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-indigo-500/10 hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>

        {/* Coupon Form */}
        {(creating || editing) && (
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 shadow-sm animate-scale-in">
            <h3 className="text-sm font-black text-white mb-4">
              {editing ? "Modify Coupon Blueprint" : "Create New Coupon Blueprint"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="coupon-code" className="block text-slate-400 mb-2 font-semibold">Coupon Code</label>
                  <input
                    id="coupon-code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. STUDENT20, SAVE50"
                    title="Coupon Code"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm font-semibold uppercase text-white outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="coupon-type" className="block text-slate-400 mb-2 font-semibold">Coupon Type</label>
                  <select
                    id="coupon-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    title="Coupon Type"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-indigo-500"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed">Fixed Amount Discount</option>
                    <option value="free_uploads">Free Uploads</option>
                    <option value="extended_validity">Extended Validity</option>
                  </select>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="coupon-value" className="block text-slate-400 mb-2 font-semibold">Value</label>
                  <div className="flex items-center gap-2">
                    <input
                      id="coupon-value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="Enter numerical value"
                      title="Value"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-400 shrink-0">
                      {formData.type === "percentage" ? "%" : 
                       formData.type === "fixed" ? "₹ (paise)" : 
                       formData.type === "free_uploads" ? "uploads" : "days"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="coupon-min-purchase" className="block text-slate-400 mb-2 font-semibold">Minimum Purchase (paise)</label>
                  <input
                    id="coupon-min-purchase"
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="Optional (in paise)"
                    title="Minimum Purchase"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="coupon-max-discount" className="block text-slate-400 mb-2 font-semibold">Maximum Discount (paise)</label>
                  <input
                    id="coupon-max-discount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Optional (in paise)"
                    title="Maximum Discount"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="coupon-valid-from" className="block text-slate-400 mb-2 font-semibold">Valid From</label>
                  <input
                    id="coupon-valid-from"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    title="Valid From"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="coupon-valid-until" className="block text-slate-400 mb-2 font-semibold">Valid Until</label>
                  <input
                    id="coupon-valid-until"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    title="Valid Until"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="coupon-usage-limit" className="block text-slate-400 mb-2 font-semibold">Usage Limit</label>
                  <input
                    id="coupon-usage-limit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Max total uses"
                    title="Usage Limit"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <span className="block text-slate-400 mb-2 font-semibold">Applicable Plans</span>
                  <div className="flex gap-4 flex-wrap">
                    {["free", "basic", "pro", "elite"].map((plan) => (
                      <div key={plan} className="flex items-center gap-1.5">
                        <input
                          id={`plan-${plan}`}
                          type="checkbox"
                          checked={formData.applicablePlans.includes(plan as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, applicablePlans: [...formData.applicablePlans, plan as any] });
                            } else {
                              setFormData({ ...formData, applicablePlans: formData.applicablePlans.filter(p => p !== plan) });
                            }
                          }}
                          className="h-4 w-4 rounded border-white/10 accent-indigo-500"
                        />
                        <label htmlFor={`plan-${plan}`} className="text-xs font-semibold uppercase cursor-pointer text-slate-350">{plan}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="coupon-applicable-tools" className="block text-slate-400 mb-2 font-semibold">Applicable Tools (comma-separated, optional)</label>
                <input
                  id="coupon-applicable-tools"
                  type="text"
                  value={formData.applicableTools.join(", ")}
                  onChange={(e) => setFormData({ ...formData, applicableTools: e.target.value.split(",").map(t => t.trim()).filter(t => t.length > 0) })}
                  placeholder="e.g. pdf_merge, image_resize"
                  title="Applicable Tools"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="coupon-description" className="block text-slate-400 mb-2 font-semibold">Coupon Description</label>
                <textarea
                  id="coupon-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Marketing text or campaign notes..."
                  title="Description"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-black text-white shadow-md shadow-indigo-500/10 hover:opacity-95 transition"
                >
                  {selectedCoupon ? "Update Coupon Blueprint 🚀" : "Publish Coupon Blueprint 🚀"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons List */}
        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 shadow-sm">
          {loading ? (
            <div className="text-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-400" />
              <p className="mt-2 text-xs text-slate-500 font-bold">Loading system coupons database...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-10 bg-slate-950 border border-white/[0.05] rounded-2xl text-slate-450">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-30 text-indigo-400" />
              <p className="font-bold text-white text-xs">No active campaign coupons found</p>
              <p className="text-[10px] text-slate-500 mt-1">Initialize coupon codes using the form above to activate client discounts.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-white/[0.05]">
                  <tr>
                    <th className="px-4 py-3.5">Code</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Discount Value</th>
                    <th className="px-4 py-3.5">Redemption</th>
                    <th className="px-4 py-3.5">Expiry Date</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-white tracking-wide">{coupon.code}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                          {getTypeLabel(coupon.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white font-bold">
                        {coupon.type === "percentage" ? `${coupon.value}%` : 
                         coupon.type === "fixed" ? `₹${(coupon.value / 100).toFixed(2)}` : 
                         coupon.type === "free_uploads" ? `${coupon.value} uploads` : 
                         `${coupon.value} days`}
                      </td>
                      <td className="px-4 py-4 text-slate-400 font-semibold">
                        {coupon.usedCount} / {coupon.usageLimit}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        {coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[9px] font-bold text-slate-500">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditCoupon(coupon)}
                            className="p-1.5 text-slate-450 hover:text-white rounded-lg hover:bg-white/[0.04] transition"
                            title="Edit Coupon"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] transition"
                            title={coupon.isActive ? "Deactivate Coupon" : "Activate Coupon"}
                          >
                            {coupon.isActive ? (
                              <XCircle className="h-3.5 w-3.5 text-rose-500 hover:text-rose-400" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 hover:text-emerald-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="p-1.5 text-slate-450 hover:text-rose-400 rounded-lg hover:bg-white/[0.04] transition"
                            title="Delete Coupon"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}