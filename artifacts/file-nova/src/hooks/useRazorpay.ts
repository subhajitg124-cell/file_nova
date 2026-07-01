import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/** Read the session token from every possible storage location */
function getSessionToken(): string | null {
  // Primary key used by useAuthStore (SESSION_TOKEN_KEY = 'filenova_token')
  const t1 = localStorage.getItem('filenova_token');
  if (t1) return t1;
  // Legacy / alternate key
  const t2 = localStorage.getItem('fn_token');
  if (t2) return t2;
  // Zustand persisted auth store (name: 'fn-auth', partializes token field)
  try {
    const storeRaw = localStorage.getItem('fn-auth');
    if (storeRaw) {
      const store = JSON.parse(storeRaw);
      if (store?.state?.token) return store.state.token;
    }
  } catch (_) {}
  return null;
}

export function useRazorpay() {

  // Load Razorpay checkout.js dynamically
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

  /** Build auth headers from every available token source */
  const getAuthHeaders = (): Record<string, string> => {
    const token = getSessionToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
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

    const token = getSessionToken();

    // Dev diagnostic: log token presence
    if (import.meta.env.DEV) {
      console.log('[useRazorpay] Auth token:', token ? `${token.slice(0, 12)}... (found)` : 'MISSING — user will get 401');
    }

    if (!token) {
      toast.error('Session expired. Please log in again.');
      useAuthStore.getState().openLoginModal('Please log in to continue with payment.');
      return;
    }

    const authHeaders = getAuthHeaders();

    try {
      // Create Razorpay order on backend
      const order = await apiClient.request<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>('/api/payment/create-order', {
        method: 'POST',
        // Explicitly inject Authorization header so token always reaches backend
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ planId, billingCycle }),
      });

      const options = {
        key: order.keyId,
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
        theme: { color: '#6366F1' },
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
            const result = await apiClient.request<{
              success: boolean;
              plan: string;
              expiresAt: string;
              error?: string;
            }>('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({
                ...response,
                // Fallback plan context when DB is unavailable server-side
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
