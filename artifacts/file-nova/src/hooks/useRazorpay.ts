import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

declare global {
  interface Window { Razorpay: any; }
}

interface OpenPaymentParams {
  planId: string;
  billingCycle: string;
  paymentToken: string;
  onSuccess: (data: any) => void;
  onFailure: (error: string) => void;
}

export function useRazorpay() {
  const { user } = useAuthStore();

  const loadScript = (): Promise<boolean> =>
    new Promise(resolve => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const openPayment = async ({
    planId, billingCycle, paymentToken,
    onSuccess, onFailure,
  }: OpenPaymentParams) => {
    const loaded = await loadScript();
    if (!loaded) {
      toast.error('Payment gateway failed to load. Refresh and try again.');
      return;
    }

    try {
      const order = await apiClient.request<{
        orderId: string; amount: number; currency: string; keyId: string;
      }>('/api/payment/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-payment-token': paymentToken 
        },
        body: JSON.stringify({ planId, billingCycle }),
      });

      const rzp = new window.Razorpay({
        key: order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'FileNova',
        description: `${planId} Plan`,
        image: '/logo.png',
        order_id: order.orderId,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#6366F1' },
        modal: { ondismiss: () => toast('Payment cancelled.') },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await apiClient.request<{
              success: boolean; plan: string; expiresAt: string; error?: string;
            }>('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            if (result.success) {
              onSuccess(result);
            } else {
              onFailure(result.error || 'Verification failed');
            }
          } catch (err: any) {
            onFailure(err.message || 'Verification failed');
          }
        },
      });

      rzp.on('payment.failed', (r: any) => {
        onFailure(r.error?.description || 'Payment failed');
      });

      rzp.open();
    } catch (err: any) {
      const msg = err.message || 'Order creation failed';
      if (msg.includes('verify') || msg.includes('verification') || msg.includes('403')) {
        toast.error('Please verify your account first.');
      } else {
        toast.error(msg);
      }
      onFailure(msg);
    }
  };

  return { openPayment };
}
