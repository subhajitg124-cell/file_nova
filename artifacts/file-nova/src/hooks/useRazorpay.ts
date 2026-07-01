import { apiClient } from "@/lib/api";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  
  // Load Razorpay script dynamically
  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openPayment = async ({
    planId,
    billingCycle,
    userName,
    userEmail,
    onSuccess,
    onFailure,
  }: {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    userName: string;
    userEmail: string;
    onSuccess: (data: any) => void;
    onFailure: (error: any) => void;
  }) => {
    const loaded = await loadScript();
    if (!loaded) {
      toast.error('Payment gateway failed to load. Please refresh.');
      return;
    }

    try {
      // Create order on backend
      const order = await apiClient.request<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      });

      const options = {
        key: order.keyId,                    // rzp_test_xxx from backend
        amount: order.amount,
        currency: order.currency,
        name: 'FileNova',
        description: `${planId} Plan`,
        image: 'https://filenova.in/logo.png',
        order_id: order.orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: '#6366F1' },   // FileNova indigo
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.');
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Verify on backend immediately
            const result = await apiClient.request<{
              success: boolean;
              plan: string;
              expiresAt: string;
              error?: string;
            }>('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                // Pass plan context as fallback if DB is unavailable server-side
                planId,
                billingCycle,
              }),
            });

            if (result.success) {
              onSuccess(result);
            } else {
              onFailure(result.error || 'Payment verification failed');
            }
          } catch (err: any) {
            onFailure(err.message || 'Signature verification request failed');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        onFailure(response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Could not initialize payment. Please try again.');
    }
  };

  return { openPayment };
}
