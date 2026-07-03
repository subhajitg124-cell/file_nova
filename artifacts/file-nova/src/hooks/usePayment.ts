import { useRef, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  planId: string;
  billingCycle: string;
  userName: string;
  userEmail: string;
  paymentToken?: string;
  onSuccess: (data: any) => void;
  onFailure: (error: any) => void;
}

let razorpyScriptLoaded = false;

function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpyScriptLoaded) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { razorpyScriptLoaded = true; resolve(true); };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getToken(): string | null {
  return localStorage.getItem("filenova_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function usePayment() {
  const scriptLoading = useRef(false);

  const createOrder = useCallback(async (planId: string, billingCycle: string) => {
    const token = getToken();
    if (!token) {
      useAuthStore.getState().logout();
      useAuthStore.getState().openLoginModal("Please log in to continue.");
      return null;
    }

    const headers = { "Content-Type": "application/json", ...authHeaders() };

    try {
      const order = await apiClient.request<{
        orderId: string; amount: number; currency: string; keyId: string; isMock?: boolean;
      }>("/api/payment/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({ planId, billingCycle }),
      });
      return order;
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Authentication required") || msg.includes("401")) {
        useAuthStore.getState().logout();
        useAuthStore.getState().openLoginModal("Session expired. Please log in again.");
        return null;
      }
      throw err;
    }
  }, []);

  const openCheckout = useCallback(async (options: PaymentOptions) => {
    const { planId, billingCycle, userName, userEmail, paymentToken, onSuccess, onFailure } = options;

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Payment gateway failed to load. Please refresh.");
      return;
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json", ...authHeaders() };
      if (paymentToken) {
        headers["x-payment-token"] = paymentToken;
      }

      const order = await apiClient.request<{
        orderId: string; amount: number; currency: string; keyId: string; isMock?: boolean;
      }>("/api/payment/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({ planId, billingCycle }),
      });

      if (order.isMock) {
        onSuccess({ plan: planId, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() });
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "FileNova",
        description: `${planId} Plan`,
        image: "https://filenova.in/logo.png",
        order_id: order.orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#6366F1" },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled.");
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const result = await apiClient.request<{
              success: boolean; plan: string; expiresAt: string; error?: string;
            }>("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", ...authHeaders() },
              body: JSON.stringify({ ...response, planId, billingCycle }),
            });

            if (result.success) {
              onSuccess(result);
            } else {
              onFailure(result.error || "Payment verification failed");
            }
          } catch (err: any) {
            onFailure(err.message || "Verification failed");
          }
        },
      });

      razorpay.on("payment.failed", (response: any) => {
        onFailure(response.error?.description || "Payment failed");
      });

      razorpay.open();
    } catch (err: any) {
      const msg = err.message || "Payment initialization failed";
      if (msg.includes("Authentication required") || msg.includes("401")) {
        useAuthStore.getState().logout();
        useAuthStore.getState().openLoginModal("Session expired. Please log in again.");
        return;
      }
      onFailure(msg);
    }
  }, []);

  const verifyPayment = useCallback(async (
    planId: string,
    billingCycle: string,
    response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
  ) => {
    const result = await apiClient.request<{
      success: boolean; plan: string; expiresAt: string; error?: string;
    }>("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ ...response, planId, billingCycle }),
    });

    if (!result.success) {
      throw new Error(result.error || "Verification failed");
    }
    return result;
  }, []);

  return { createOrder, openCheckout, verifyPayment };
}
