import React from "react";
import { useLocation } from "wouter";
import { ChevronLeft, CheckCircle2, Loader, RefreshCw } from "lucide-react";
import { useAdmin } from "@/lib/admin";
import { toast } from "sonner";

type UpiPayment = {
  id: string;
  email: string;
  utrId: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function AdminUpiPayments() {
  const admin = useAdmin();
  const [, setLocation] = useLocation();
  const [payments, setPayments] = React.useState<UpiPayment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [approvingId, setApprovingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!admin.isAuthenticated) {
      setLocation("/nova-login");
    }
  }, [admin.isAuthenticated, setLocation]);

  const adminHeaders = React.useMemo(() => {
    const headers: Record<string, string> = {};
    if (admin.creds) {
      headers["x-admin-username"] = admin.creds.username;
      headers["x-admin-hash"] = admin.creds.passwordHash;
    }
    return headers;
  }, [admin.creds]);

  const loadPayments = React.useCallback(async () => {
    if (!admin.isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch("/api/upi-payments", { headers: adminHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load UPI payments.");
      setPayments(data.payments || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load UPI payments.");
    } finally {
      setLoading(false);
    }
  }, [admin.isAuthenticated, adminHeaders]);

  React.useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const approvePayment = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/upi-payments/${id}/approve`, {
        method: "POST",
        headers: adminHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve payment.");
      toast.success(data.message || "UPI payment approved.");
      setPayments((current) => current.filter((payment) => payment.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to approve payment.");
    } finally {
      setApprovingId(null);
    }
  };

  if (!admin.isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background bg-mesh text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            onClick={() => setLocation("/nova-control")}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Admin Console
          </button>
          <button
            onClick={loadPayments}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-primary-foreground hover:opacity-90 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary">Manual Verification</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Pending UPI Payments</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Approving a payment activates the selected plan for 30 days.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card/70 shadow-premium">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-10 text-sm font-bold text-muted-foreground">
              <Loader className="h-5 w-5 animate-spin text-primary" />
              Loading pending payments
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-3 text-sm font-black">No pending UPI payments</p>
              <p className="mt-1 text-xs text-muted-foreground">New manual payment requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">UTR ID</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4 font-bold">{payment.email}</td>
                      <td className="px-4 py-4 font-mono text-xs">{payment.utrId}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-primary">
                          {payment.plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-black">Rs {payment.amount}</td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => approvePayment(payment.id)}
                          disabled={approvingId === payment.id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-foreground hover:opacity-90 disabled:opacity-60 cursor-pointer"
                        >
                          {approvingId === payment.id ? (
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
