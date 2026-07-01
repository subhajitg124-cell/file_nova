import { FileRecord, ProcessingSavings } from '@/store/useFileStore';

export const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';
export const API_BASE = BACKEND_URL;
export const HAS_BACKEND = Boolean(BACKEND_URL || import.meta.env.MODE === 'production');

export interface HealthCheckResult {
  healthy: boolean;
  capabilities: {
    libreoffice: boolean;
    ffmpeg: boolean;
  };
}

// Fetch with retry logic for network errors
const fetchWithRetry = async (input: RequestInfo, init?: RequestInit, retries = 3, delay = 2000): Promise<Response> => {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (retries > 0 && error instanceof TypeError && error.message === 'Failed to fetch') {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(input, init, retries - 1, delay);
    }
    throw error;
  }
};

export const apiClient = {
  // Centralized request wrapper
  async request<T>(path: string, options: RequestInit = {}, timeoutMs = 30000): Promise<T> {
    const url = path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
    
    // Attach authorization header if available
    const token = localStorage.getItem('filenova_token');
    const headers = new Headers(options.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    
    const fetchOptions: RequestInit = {
      credentials: 'include',
      ...options,
      headers,
      signal: controller.signal,
    };
    
    try {
      const res = await fetchWithRetry(url, fetchOptions);
      clearTimeout(timer);
      
      if (!res.ok) {
        let errorMessage = `Request failed with status ${res.status}`;
        try {
          const errData = await res.json();
          errorMessage = errData.error || errData.detail || errorMessage;
        } catch (_) {
          // ignore JSON parse failure for error response
        }
        throw new Error(errorMessage);
      }
      
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return (await res.text()) as unknown as T;
    } catch (error: any) {
      clearTimeout(timer);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  },

  async checkHealth(): Promise<HealthCheckResult> {
    if (!HAS_BACKEND) {
      return {
        healthy: false,
        capabilities: { libreoffice: false, ffmpeg: false }
      };
    }

    try {
      const data = await this.request<any>('/api/health', {}, 3000);
      return {
        healthy: data.status === 'healthy' || data.status === 'degraded',
        capabilities: {
          libreoffice: data.services?.libreoffice_headless === 'available' || data.services?.libreoffice_headless === 'static-client',
          ffmpeg: data.services?.ffmpeg === 'available' || data.services?.ffmpeg === 'static-client',
        }
      };
    } catch (e) {
      console.warn('Backend connection failed, using mock mode fallbacks:', e);
      return {
        healthy: false,
        capabilities: { libreoffice: false, ffmpeg: false }
      };
    }
  },

  async uploadFiles(files: File[], jobId: string): Promise<FileRecord[]> {
    const formData = new FormData();
    formData.append('job_id', jobId);
    files.forEach((f) => formData.append('files', f));
    
    const data = await this.request<any>('/api/v1/upload', {
      method: 'POST',
      body: formData,
    });

    return data.files.map((file: any) => ({
      id: file.temp_filename,
      name: file.filename,
      size: file.size_bytes,
      type: file.mime_type,
      tempPath: file.temp_path,
      tempFilename: file.temp_filename,
      previewUrl: file.preview_url ? `${BACKEND_URL}${file.preview_url}` : undefined
    }));
  },

  async startProcessing(jobId: string, operation: string, options: Record<string, any>): Promise<void> {
    await this.request<void>(`/api/v1/process?job_id=${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, options }),
    });
  },

  async bulkProcess(files: File[], operation: string): Promise<{ filename: string; status: string; downloadUrl: string }[]> {
    const formData = new FormData();
    formData.append('operation', operation);
    files.forEach((f) => formData.append('files', f));

    const data = await this.request<any>('/api/v1/bulk-process', {
      method: 'POST',
      body: formData,
    });

    return data.results.map((result: any) => ({
      filename: result.filename,
      status: result.status,
      downloadUrl: `${BACKEND_URL}${result.download_url || ''}`,
    }));
  },

  async pollStatus(jobId: string): Promise<any> {
    return this.request<any>(`/api/v1/status/${jobId}`);
  },

  getDownloadUrl(jobId: string): string {
    return `${BACKEND_URL}/api/v1/download/${jobId}`;
  },

  async createSupportOrder(amount: 10 | 50, note: string): Promise<any> {
    return this.request<any>('/api/support-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, note }),
    });
  },

  async verifySupportPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }): Promise<any> {
    return this.request<any>('/api/support-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async createSubscriptionOrder(plan: string, coupon?: string): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, coupon }),
    });
  },

  async verifySubscriptionPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    plan: string;
  }): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async validateCoupon(coupon: string, plan: string): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coupon, plan }),
    });
  },

  async submitUpiPayment(payload: {
    utrId: string;
    email: string;
    plan: string;
    amount: number;
  }): Promise<any> {
    return this.request<any>('/api/upi-payment-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async getPaymentHistory(): Promise<any> {
    return this.request<any>('/api/payments/history', {
      method: 'GET',
    });
  },

  async cancelSubscription(): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/cancel', {
      method: 'POST',
    });
  },

  async getSubscriptionStatus(): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/status', {
      method: 'GET',
    });
  },

  async getInvoice(subId: string): Promise<any> {
    return this.request<any>(`/api/payments/invoice/${subId}`, {
      method: 'GET',
    });
  },

  // Dynamic user and workspace endpoints refactored for centralization
  async getHistory(): Promise<any> {
    return this.request<any>('/api/v1/history');
  },

  async trackReferral(trackingId: string, referralCode: string): Promise<any> {
    return this.request<any>('/api/v1/referral/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingId, referralCode }),
    });
  },

  // AI PPT Maker API methods disabled — uncomment to re-enable
  /*
  async getAIPPTOutline(topic: string, slideCount: number): Promise<any> {
    return this.request<any>('/api/ai-ppt/outline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, slideCount }),
    });
  },

  async regenerateAIPPTSlide(slideId: string, instructions: string): Promise<any> {
    return this.request<any>('/api/ai-ppt/regenerate-slide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideId, instructions }),
    });
  },
  */

  async getPremiumSecurityStatus(): Promise<any> {
    return this.request<any>('/api/v1/premium/security/status');
  },

  async getPremiumShares(): Promise<any> {
    return this.request<any>('/api/v1/premium/shares');
  },

  async createPremiumShare(payload: any): Promise<any> {
    return this.request<any>('/api/v1/premium/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async sharePremiumOnWhatsapp(payload: any): Promise<any> {
    return this.request<any>('/api/v1/premium/shares/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async getPremiumShareDetails(token: string): Promise<any> {
    return this.request<any>(`/api/v1/premium/shares/${token}`);
  },

  async verifyPremiumShare(token: string, details: any): Promise<any> {
    return this.request<any>(`/api/v1/premium/shares/verify/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
  },

  async generatePremiumQR(payload: any): Promise<any> {
    return this.request<any>('/api/v1/premium/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Admin Panel endpoints
  async getAdminStats(): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/admin/stats');
  },

  async getAdminUpiPayments(): Promise<any> {
    return this.request<any>('/api/upi-payments');
  },

  async approveAdminUpiPayment(id: string): Promise<any> {
    return this.request<any>(`/api/upi-payments/${id}/approve`, {
      method: 'POST',
    });
  },

  async getAdminDiscountCodes(): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/admin/discount-codes');
  },

  async createAdminDiscountCode(payload: any): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/admin/discount-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminDiscountCode(id: string): Promise<any> {
    return this.request<any>(`/api/v1/premium/subscription/admin/discount-codes/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleAdminDiscountCode(id: string): Promise<any> {
    return this.request<any>(`/api/v1/premium/subscription/admin/discount-codes/${id}/toggle`, {
      method: 'POST',
    });
  },

  async getAdminCoupons(): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/admin/coupons');
  },

  async getAdminCouponDetails(id: string): Promise<any> {
    return this.request<any>(`/api/v1/premium/subscription/admin/coupons/${id}`);
  },

  async saveAdminCoupon(id: string | null, payload: any): Promise<any> {
    return this.request<any>(id ? `/api/v1/premium/subscription/admin/coupons/${id}` : '/api/v1/premium/subscription/admin/coupons', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async deleteAdminCoupon(id: string): Promise<any> {
    return this.request<any>(`/api/v1/premium/subscription/admin/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleAdminCoupon(id: string): Promise<any> {
    return this.request<any>(`/api/v1/premium/subscription/admin/coupons/${id}/toggle`, {
      method: 'POST',
    });
  },

  async getAdminSettings(): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/settings');
  },

  async saveAdminSettings(payload: any): Promise<any> {
    return this.request<any>('/api/v1/premium/subscription/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
};

const createMockPreviewPlaceholder = (file: File): string => {
  const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
  const safeName = file.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="100%" height="100%" fill="#f8fafc" />
      <rect x="30" y="30" width="240" height="90" rx="20" fill="#0ea5e9" />
      <text x="150" y="80" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Arial,sans-serif" font-size="32" fill="#ffffff">${safeName.substring(0, 10)}</text>
      <text x="150" y="220" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Arial,sans-serif" font-size="16" fill="#475569">${extension}</text>
    </svg>
  `.trim();

  const encoded = window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
};

export const apiMock = {
  async uploadFiles(files: File[], _jobId: string): Promise<FileRecord[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return files.map((file) => {
      const ext = file.name.split('.').pop() || '';
      let detectedType = file.type;
      if (ext === 'docx') detectedType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      if (ext === 'xlsx') detectedType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (ext === 'pptx') detectedType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      const previewUrl = detectedType.startsWith('image/')
        ? URL.createObjectURL(file)
        : createMockPreviewPlaceholder(file);
      return {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: detectedType,
        previewUrl
      };
    });
  },

  simulateProcessing(
    _jobId: string,
    operation: string,
    files: FileRecord[],
    onProgress: (p: number) => void,
    onSuccess: (downloadUrl: string, savings: ProcessingSavings | null) => void,
    onFailure: (err: string) => void,
    outputMime?: string
  ) {
    let currentProgress = 0;
    const isSlowOp = (operation === 'compress' && files[0]?.type.startsWith('video/')) || operation === 'split';
    const interval = setInterval(() => {
      const step = isSlowOp ? 5 : 10;
      currentProgress += step;
      if (currentProgress >= 100) {
        clearInterval(interval);
        onProgress(100);
        const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);
        let ratio = 0.85;
        if (operation === 'compress') ratio = 0.42;
        if (operation === 'enhance') ratio = 1.05;
        if (outputMime && outputMime !== files[0]?.type) ratio = 0.9;
        const newSize = Math.round(originalTotalSize * ratio);
        const percent = Math.round(((originalTotalSize - newSize) / originalTotalSize) * 100);
        const resolvedMime = outputMime || files[0]?.type || 'application/octet-stream';
        const mockBlob = new Blob(['Simulated FileNova Output'], { type: resolvedMime });
        const mockUrl = URL.createObjectURL(mockBlob);
        onSuccess(mockUrl, { originalSize: originalTotalSize, newSize, percent });
      } else {
        onProgress(currentProgress);
      }
    }, 180);
    return () => clearInterval(interval);
  },

  async createSupportOrder(amount: 10 | 50, note: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      orderId: `order_mock_support_${Math.random().toString(36).substring(7)}`,
      amount: amount * 100,
      currency: 'INR',
      keyId: 'rzp_test_mockkey',
      isMock: true,
      note,
    };
  },

  async verifySupportPayment(payload: any) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      orderId: payload.razorpay_order_id,
      message: 'Support payment verified (Mock Mode)',
    };
  },

  async createSubscriptionOrder(plan: string, coupon?: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      orderId: `order_mock_${Math.random().toString(36).substring(7)}`,
      amount: plan === 'basic' ? 4900 : plan === 'pro' ? 9900 : 19900,
      currency: 'INR',
      plan,
      keyId: 'rzp_test_mockkey',
    };
  },

  async verifySubscriptionPayment(payload: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      plan: payload.plan,
      message: 'Subscription activated (Mock Mode)',
    };
  },

  async validateCoupon(coupon: string, plan: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const code = coupon.toUpperCase().trim();
    if (['STUDENT20', 'CYBER50', 'FIRST30', 'WB10'].includes(code)) {
      const discount = code === 'STUDENT20' ? 20 : code === 'CYBER50' ? 50 : code === 'FIRST30' ? 30 : 10;
      return {
        success: true,
        valid: true,
        discountPercentage: discount,
        message: `${discount}% discount applied!`,
      };
    }
    return {
      success: true,
      valid: false,
      discountPercentage: 0,
      message: 'Invalid coupon code in mock mode.',
    };
  },

  async submitUpiPayment(payload: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Payment received! Your account will be upgraded within 2-4 hours after verification.',
    };
  },

  async getPaymentHistory() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      success: true,
      history: [
        {
          id: 'pay_mock_123',
          plan: 'pro',
          amount: 9900,
          status: 'active',
          createdAt: new Date().toISOString(),
        }
      ],
    };
  },

  async cancelSubscription() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, message: 'Subscription cancelled successfully.' };
  },

  async getSubscriptionStatus() {
    return {
      success: true,
      premiumTier: 'free',
      premiumEnabled: false,
      usageToday: 0,
      limit: 3,
      subscription: null,
      usersServedToday: 3847,
    };
  },

  async getInvoice(subId: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      invoice: {
        invoiceNumber: `INV-${subId.substring(0, 8).toUpperCase()}-${new Date().getFullYear()}`,
        invoiceDate: new Date().toISOString(),
        customerName: 'Mock User',
        customerEmail: 'mock@filenova.in',
        planName: 'PRO',
        paymentMethod: 'Razorpay Checkout',
        transactionId: 'pay_mock_' + subId,
        currency: 'INR',
        originalAmount: 9900,
        discountAmount: 0,
        netAmount: 9900,
        gstRate: 18,
        baseAmount: 8390,
        baseRate: 18,
        cgstAmount: 755,
        sgstAmount: 755,
        supportEmail: 'support@filenova.in',
      }
    };
  }
};
