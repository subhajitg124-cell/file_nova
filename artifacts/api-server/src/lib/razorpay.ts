import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('⚠️  RAZORPAY keys missing from environment');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Plan amounts in paise — matches existing pricing exactly
export const PLAN_AMOUNTS: Record<string, number> = {
  basic_monthly:  4900,   // ₹49
  basic_yearly:   47000,  // ₹470
  pro_monthly:    9900,   // ₹99
  pro_yearly:     95000,  // ₹950
  elite_monthly:  19900,  // ₹199
  elite_yearly:   190000, // ₹1900
  pass_24hr:      900,    // ₹9
  pass_weekly:    2900,   // ₹29
};

export function getPlanExpiry(planId: string): Date {
  const now = new Date();
  if (planId.includes('yearly'))
    return new Date(now.setFullYear(now.getFullYear() + 1));
  if (planId === 'pass_24hr')
    return new Date(now.setHours(now.getHours() + 24));
  if (planId === 'pass_weekly')
    return new Date(now.setDate(now.getDate() + 7));
  return new Date(now.setMonth(now.getMonth() + 1)); // monthly
}
