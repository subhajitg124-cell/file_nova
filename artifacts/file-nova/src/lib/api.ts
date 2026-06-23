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
      // Wait for the delay period
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(input, init, retries - 1, delay);
    }
    throw error;
  }
};

export const apiClient = {
  async checkHealth(): Promise<HealthCheckResult> {
    if (!HAS_BACKEND) {
      return {
        healthy: false,
        capabilities: { libreoffice: false, ffmpeg: false }
      };
    }

    try {
      const res = await fetchWithRetry(`${BACKEND_URL}/api/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error('Health check status not ok');
      const data = await res.json();
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
    const res = await fetchWithRetry(`${BACKEND_URL}/api/v1/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error((errData as any).detail || 'File upload failed.');
    }
    const data = await res.json();
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
    const res = await fetchWithRetry(`${BACKEND_URL}/api/v1/process?job_id=${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, options }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error((errData as any).detail || 'Processing execution failed.');
    }
  },

  async bulkProcess(files: File[], operation: string): Promise<{ filename: string; status: string; downloadUrl: string }[]> {
    const formData = new FormData();
    formData.append('operation', operation);
    files.forEach((f) => formData.append('files', f));
    const res = await fetchWithRetry(`${BACKEND_URL}/api/v1/bulk-process`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error((errData as any).detail || 'Bulk processing failed.');
    }
    const data = await res.json();
    return data.results.map((result: any) => ({
      filename: result.filename,
      status: result.status,
      downloadUrl: `${BACKEND_URL}${result.download_url || ''}`,
    }));
  },

  async pollStatus(jobId: string) {
    const res = await fetchWithRetry(`${BACKEND_URL}/api/v1/status/${jobId}`);
    if (!res.ok) throw new Error('Failed to retrieve job status.');
    return await res.json();
  },

  getDownloadUrl(jobId: string): string {
    return `${BACKEND_URL}/api/v1/download/${jobId}`;
  },

  async createSubscriptionOrder(plan: string, coupon?: string): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ plan, coupon }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create subscription order');
    }
    return res.json();
  },

  async verifySubscriptionPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    plan: string;
  }): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Payment verification failed');
    }
    return res.json();
  },

  async validateCoupon(coupon: string, plan: string): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ coupon, plan }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Coupon validation failed');
    }
    return res.json();
  },

  async submitUpiPayment(payload: {
    utrId: string;
    email: string;
    plan: string;
    amount: number;
  }): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/upi-payment-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'UPI transaction submission failed');
    }
    return res.json();
  },

  async getPaymentHistory(): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/payments/history`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch payment history');
    }
    return res.json();
  },

  async cancelSubscription(): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/cancel`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Subscription cancellation failed');
    }
    return res.json();
  },

  async getSubscriptionStatus(): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/premium/subscription/status`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch subscription status');
    }
    return res.json();
  },

  async getInvoice(subId: string): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/payments/invoice/${subId}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch invoice details');
    }
    return res.json();
  }
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
        cgstAmount: 755,
        sgstAmount: 755,
        supportEmail: 'support@filenova.in',
      }
    };
  }
};
