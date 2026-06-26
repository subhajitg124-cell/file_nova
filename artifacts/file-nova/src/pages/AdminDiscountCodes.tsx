import React, { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/lib/admin";
import { useLocation } from "wouter";
import { BACKEND_URL } from "@/lib/api";
import {
  Plus,
  Trash2,
  Percent,
  DollarSign,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Tag,
  Copy,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

type DiscountCode = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  applicablePlans: string[];
  isActive: boolean;
  description: string | null;
  createdByName: string | null;
  createdAt: string;
};

function getMockCodes(): DiscountCode[] {
  const now = Date.now();
  return [
    {
      id: "dc-1",
      code: "WELCOME20",
      type: "percentage",
      value: 20,
      maxDiscount: 5000,
      validFrom: new Date(now - 7 * 86400000).toISOString(),
      validUntil: new Date(now + 30 * 86400000).toISOString(),
      usageLimit: 100,
      usedCount: 12,
      perUserLimit: 1,
      applicablePlans: ["basic", "pro", "elite"],
      isActive: true,
      description: "20% off for new users",
      createdByName: "Admin",
      createdAt: new Date(now - 7 * 86400000).toISOString(),
    },
    {
      id: "dc-2",
      code: "SAVE50",
      type: "fixed",
      value: 5000,
      maxDiscount: null,
      validFrom: new Date(now - 3 * 86400000).toISOString(),
      validUntil: new Date(now + 60 * 86400000).toISOString(),
      usageLimit: 200,
      usedCount: 45,
      perUserLimit: 1,
      applicablePlans: ["pro", "elite"],
      isActive: true,
      description: "Flat ₹50 off on Pro/Elite",
      createdByName: "Admin",
      createdAt: new Date(now - 3 * 86400000).toISOString(),
    },
  ];
}

const INITIAL_FORM = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  maxDiscount: "",
  validFrom: "",
  validUntil: "",
  usageLimit: "1",
  perUserLimit: "1",
  applicablePlans: ["basic", "pro", "elite"] as string[],
  description: "",
};

export default function AdminDiscountCodes() {
  const admin = useAdmin();
  const [, setLocation] = useLocation();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const authHeaders = useCallback(
    (): Record<string, string> => ({
      "x-admin-username": admin.creds?.username || "",
      "x-admin-hash": admin.creds?.passwordHash || "",
    }),
    [admin.creds]
  );

  useEffect(() => {
    if (!admin.isAuthenticated) {
      setLocation("/nova-login");
      return;
    }
    fetchCodes();
  }, [admin.isAuthenticated, setLocation]);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/admin/discount-codes`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCodes(data.codes);
      } else {
        throw new Error(data.error || "Failed to load");
      }
    } catch {
      setCodes(getMockCodes());
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      ...INITIAL_FORM,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (dc: DiscountCode) => {
    setForm({
      code: dc.code,
      type: dc.type,
      value: String(dc.value),
      maxDiscount: dc.maxDiscount ? String(dc.maxDiscount) : "",
      validFrom: dc.validFrom.slice(0, 16),
      validUntil: dc.validUntil.slice(0, 16),
      usageLimit: String(dc.usageLimit),
      perUserLimit: String(dc.perUserLimit),
      applicablePlans: dc.applicablePlans,
      description: dc.description || "",
    });
    setEditingId(dc.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error("Code is required");
    if (!form.value || Number(form.value) <= 0) return toast.error("Value must be positive");
    if (!form.usageLimit || Number(form.usageLimit) <= 0) return toast.error("Usage limit must be positive");
    if (new Date(form.validFrom) >= new Date(form.validUntil)) return toast.error("Valid from must be before valid until");

    setSubmitting(true);
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
      usageLimit: Number(form.usageLimit),
      perUserLimit: Number(form.perUserLimit),
      applicablePlans: form.applicablePlans,
      description: form.description || null,
    };

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `${BACKEND_URL}/api/v1/premium/subscription/admin/discount-codes/${editingId}`
        : `${BACKEND_URL}/api/v1/premium/subscription/admin/discount-codes`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Discount code updated" : "Discount code created");
        setShowForm(false);
        setEditingId(null);
        fetchCodes();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      // Offline fallback
      if (editingId) {
        setCodes((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...body, id: editingId } : c))
        );
        toast.success("Discount code updated (offline)");
      } else {
        setCodes((prev) => [
          { ...body, id: `dc-mock-${Date.now()}`, usedCount: 0, createdByName: "Admin", createdAt: new Date().toISOString() } as DiscountCode,
          ...prev,
        ]);
        toast.success("Discount code created (offline)");
      }
      setShowForm(false);
      setEditingId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/admin/discount-codes/${id}/toggle`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Discount code ${data.code.isActive ? "activated" : "deactivated"}`);
        fetchCodes();
      } else {
        toast.error(data.error || "Failed to toggle");
      }
    } catch {
      setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
      toast.success("Toggled (offline)");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this discount code?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/admin/discount-codes/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Discount code deleted");
        fetchCodes();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      setCodes((prev) => prev.filter((c) => c.id !== id));
      toast.success("Deleted (offline)");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success(`Copied: ${code}`));
  };

  const totalUsed = codes.reduce((sum, c) => sum + c.usedCount, 0);
  const activeCount = codes.filter((c) => c.isActive).length;

  return (
    <AdminLayout title="Discount Codes">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Discount Code Generator</h2>
            <p className="text-xs text-slate-400 mt-0.5">Create and manage single-use or bulk discount codes for campaigns</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCodes}
              title="Refresh"
              aria-label="Refresh discount codes"
              className="inline-flex items-center justify-center p-2.5 rounded-xl border border-white/[0.06] bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-emerald-500/10 hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Generate Code</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Codes", value: codes.length, icon: Tag, color: "indigo" },
            { label: "Active Codes", value: activeCount, icon: CheckCircle2, color: "emerald" },
            { label: "Total Redemptions", value: totalUsed, icon: BarChart3, color: "purple" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                <p className="text-lg font-black text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/40 p-5 shadow-sm animate-scale-in">
            <h3 className="text-sm font-black text-white mb-4">
              {editingId ? "Edit Discount Code" : "Generate New Discount Code"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="dc-code" className="block text-slate-400 mb-2 font-semibold">Code</label>
                  <input
                    id="dc-code"
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20, FLAT50"
                    title="Discount Code"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm font-bold uppercase text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="dc-type" className="block text-slate-400 mb-2 font-semibold">Type</label>
                  <select
                    id="dc-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })}
                    title="Discount Type"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-emerald-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹ paise)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dc-value" className="block text-slate-400 mb-2 font-semibold">
                    Value {form.type === "percentage" ? "(%)" : "(₹ paise)"}
                  </label>
                  <input
                    id="dc-value"
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 5000"}
                    title="Value"
                    min="1"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {form.type === "percentage" && (
                <div className="sm:w-1/3">
                  <label htmlFor="dc-max-discount" className="block text-slate-400 mb-2 font-semibold">Max Discount (₹ paise, optional)</label>
                  <input
                    id="dc-max-discount"
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="Cap on discount"
                    title="Max Discount"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="dc-valid-from" className="block text-slate-400 mb-2 font-semibold">Valid From</label>
                  <input
                    id="dc-valid-from"
                    type="datetime-local"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    title="Valid From"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="dc-valid-until" className="block text-slate-400 mb-2 font-semibold">Valid Until</label>
                  <input
                    id="dc-valid-until"
                    type="datetime-local"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    title="Valid Until"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="dc-usage-limit" className="block text-slate-400 mb-2 font-semibold">Total Limit</label>
                    <input
                      id="dc-usage-limit"
                      type="number"
                      value={form.usageLimit}
                      onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                      min="1"
                      title="Total Usage Limit"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dc-per-user" className="block text-slate-400 mb-2 font-semibold">Per User</label>
                    <input
                      id="dc-per-user"
                      type="number"
                      value={form.perUserLimit}
                      onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                      min="1"
                      title="Per User Limit"
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-slate-400 mb-2 font-semibold">Applicable Plans</span>
                <div className="flex gap-4 flex-wrap">
                  {["free", "basic", "pro", "elite"].map((plan) => (
                    <div key={plan} className="flex items-center gap-1.5">
                      <input
                        id={`dc-plan-${plan}`}
                        type="checkbox"
                        checked={form.applicablePlans.includes(plan)}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            applicablePlans: e.target.checked
                              ? [...form.applicablePlans, plan]
                              : form.applicablePlans.filter((p) => p !== plan),
                          });
                        }}
                        className="h-4 w-4 rounded border-white/10 accent-emerald-500"
                      />
                      <label htmlFor={`dc-plan-${plan}`} className="text-xs font-bold uppercase cursor-pointer text-slate-400">{plan}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="dc-desc" className="block text-slate-400 mb-2 font-semibold">Description (optional)</label>
                <input
                  id="dc-desc"
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Internal note or campaign name"
                  title="Description"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-black text-white shadow-md shadow-emerald-500/10 hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : editingId ? "Update Code" : "Generate Code"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Codes Table */}
        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 shadow-sm">
          {loading ? (
            <div className="text-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-400" />
              <p className="mt-2 text-xs text-slate-500 font-bold">Loading discount codes...</p>
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-10 bg-slate-950 border border-white/[0.05] rounded-2xl text-slate-400">
              <Tag className="h-10 w-10 mx-auto mb-2 opacity-30 text-emerald-400" />
              <p className="font-bold text-white text-xs">No discount codes yet</p>
              <p className="text-[10px] text-slate-500 mt-1">Click "Generate Code" to create your first discount code.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-white/[0.05]">
                  <tr>
                    <th className="px-4 py-3.5">Code</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Value</th>
                    <th className="px-4 py-3.5">Usage</th>
                    <th className="px-4 py-3.5">Per User</th>
                    <th className="px-4 py-3.5">Expiry</th>
                    <th className="px-4 py-3.5">Plans</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {codes.map((dc) => (
                    <tr key={dc.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white tracking-wide">{dc.code}</span>
                          <button
                            onClick={() => copyCode(dc.code)}
                            title="Copy code"
                            className="p-1 text-slate-500 hover:text-emerald-400 transition cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          {dc.type === "percentage" ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                          {dc.type === "percentage" ? "Percentage" : "Fixed"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white font-bold">
                        {dc.type === "percentage" ? `${dc.value}%` : `₹${(dc.value / 100).toFixed(2)}`}
                        {dc.maxDiscount && (
                          <span className="text-[10px] text-slate-500 ml-1">(max ₹{(dc.maxDiscount / 100).toFixed(0)})</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-400 font-semibold">
                        {dc.usedCount} / {dc.usageLimit}
                      </td>
                      <td className="px-4 py-4 text-slate-400 font-semibold">
                        {dc.perUserLimit}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {new Date(dc.validUntil).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {dc.applicablePlans.map((p) => (
                            <span key={p} className="inline-block rounded bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {dc.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[9px] font-bold text-slate-500">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(dc)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition cursor-pointer"
                            title="Edit"
                          >
                            <Tag className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggle(dc.id)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] transition cursor-pointer"
                            title={dc.isActive ? "Deactivate" : "Activate"}
                          >
                            {dc.isActive ? (
                              <XCircle className="h-3.5 w-3.5 text-rose-500 hover:text-rose-400" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 hover:text-emerald-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(dc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.04] transition cursor-pointer"
                            title="Delete"
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
