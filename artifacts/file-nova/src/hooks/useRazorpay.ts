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
  const t1 = localStorage.getItem('filenova_token');
  if (t1) return t1;
  const t2 = localStorage.getItem('fn_token');
  if (t2) return t2;
  try {
    const storeRaw = localStorage.getItem('fn-auth');
    if (storeRaw) {
      const store = JSON.parse(storeRaw);
      if (store?.state?.token) return store.state.token;
    }
  } catch (_) {}
  return null;
}

/** Build auth headers from every available token source */
function getAuthHeaders(): Record<string, string> {
  const token = getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useRazorpay() {

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
    paymentToken,
    onSuccess,
    onFailure,
  }: {
    planId: string;
    billingCycle: string;
    userName: string;
    userEmail: string;
    paymentToken?: string;
    onSuccess: (data: any) => void;
    onFailure: (error: any) => void;
  }) => {
    console.log('[useRazorpay] openPayment called', {
      planId,
      billingCycle,
      hasPaymentToken: !!paymentToken,
      paymentTokenPrefix: paymentToken ? paymentToken.substring(0, 8) + '...' : null,
    });

    const loaded = await loadScript();
    if (!loaded) {
      toast.error('Payment gateway failed to load. Please refresh.');
      return;
    }

    const token = getSessionToken();
    console.log('[useRazorpay] Auth token check:', token ? `${token.substring(0, 12)}... (found)` : 'MISSING');

    if (!token) {
      toast.error('Session expired. Please log in again.');
      useAuthStore.getState().openLoginModal('Please log in to continue with payment.');
      return;
    }

    const authHeaders = getAuthHeaders();

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeaders };
      if (paymentToken) {
        headers['x-payment-token'] = paymentToken;
        console.log('[useRazorpay] x-payment-token header set');
      }

      console.log('[useRazorpay] Creating order...', { planId, billingCycle });
      const order = await apiClient.request<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        isMock?: boolean;
      }>('/api/payment/create-order', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId, billingCycle }),
      });

      console.log('[useRazorpay] Order created successfully', {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        isMock: order.isMock,
      });

      if (order.isMock) {
        onSuccess({ plan: planId, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() });
        return;
      }

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
            console.log('[useRazorpay] Razorpay modal dismissed by user');
            toast('Payment cancelled.');
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          console.log('[useRazorpay] Payment completed, verifying...', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
          });
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
                planId,
                billingCycle,
              }),
            });

            if (result.success) {
              console.log('[useRazorpay] Payment verified successfully', { plan: result.plan });
              onSuccess(result);
            } else {
              console.warn('[useRazorpay] Payment verification failed', { error: result.error });
              onFailure(result.error || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error('[useRazorpay] Payment verification request failed', { message: err.message });
            onFailure(err.message || 'Signature verification request failed');
          }
        },
      };

      console.log('[useRazorpay] Opening Razorpay checkout...');
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.warn('[useRazorpay] Razorpay payment failed', response);
        onFailure(response.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch (err: any) {
      console.error('[useRazorpay] Payment initialization failed', { message: err.message });
      const msg = err.message || 'Could not initialize payment. Please try again.';
      if (msg.includes('Authentication required') || msg.includes('log in first') || msg.includes('401')) {
        onFailure(msg);
      } else {
        toast.error(msg);
      }
    }
  };

  return { openPayment };
}
