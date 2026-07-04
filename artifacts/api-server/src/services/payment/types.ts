export interface CreateOrderInput {
  planId: string;
  billingCycle: string;
}

export interface CreateOrderResult {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isMock?: boolean;
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId?: string;
  billingCycle?: string;
}

export interface OrderDetails {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isMock?: boolean;
}

export interface VerifyPaymentResult {
  success: boolean;
  plan: string;
  expiresAt: string;
  error?: string;
}

export interface RefundInput {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export const PLAN_AMOUNTS: Record<string, number> = {
  basic_monthly: 4900,
  basic_yearly: 49000,
  pro_monthly: 9900,
  pro_yearly: 95000,
  elite_monthly: 19900,
  elite_yearly: 199000,
  pass_24hr: 900,
  pass_24h: 900,
  pass_weekly: 2900,
  pass_7d: 2900,
};

export const PLAN_DURATIONS: Record<string, { days: number; label: string }> = {
  basic_monthly: { days: 30, label: "Basic" },
  basic_yearly: { days: 365, label: "Basic" },
  pro_monthly: { days: 30, label: "Pro" },
  pro_yearly: { days: 365, label: "Pro" },
  elite_monthly: { days: 30, label: "Elite" },
  elite_yearly: { days: 365, label: "Elite" },
  pass_24hr: { days: 1, label: "Pass" },
  pass_weekly: { days: 7, label: "Pass" },
};

export function getPlanAmount(planId: string, billingCycle: string): number {
  const key = `${planId}_${billingCycle}`;
  const amount = PLAN_AMOUNTS[key];
  if (amount !== undefined) return amount;
  if (planId === "pass" && billingCycle === "24hr") return PLAN_AMOUNTS.pass_24hr;
  if (planId === "pass" && billingCycle === "24h") return PLAN_AMOUNTS.pass_24h;
  if (planId === "pass" && billingCycle === "weekly") return PLAN_AMOUNTS.pass_weekly;
  if (planId === "pass" && billingCycle === "7d") return PLAN_AMOUNTS.pass_7d;
  if (planId === "pass_24h" || planId === "pass_24hr") return PLAN_AMOUNTS.pass_24hr;
  if (planId === "pass_weekly" || planId === "pass_7d") return PLAN_AMOUNTS.pass_weekly;
  throw new Error(`Invalid plan: ${planId}/${billingCycle}`);
}

export function resolveTier(planId: string): string {
  if (planId === "pass") return "pass";
  return planId;
}
