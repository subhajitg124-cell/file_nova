import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance with better configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for PDF operations
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry for non-network errors
    if (error.response) {
      return Promise.reject(error);
    }

    // Retry logic for network errors
    if (!originalRequest._retry && error.code === 'ECONNREFUSED') {
      originalRequest._retry = true;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Health check with multiple fallback URLs
export const checkServerHealth = async () => {
  const urlsToTry = [
    API_BASE_URL,
    import.meta.env.VITE_API_URL_FALLBACK || process.env.NEXT_PUBLIC_API_URL_FALLBACK,
    '/api',
    'https://api.filenova.in/api'
  ].filter(Boolean);

  for (const url of urlsToTry) {
    try {
      const response = await axios.get(`${url}/health`, {
        timeout: 5000,
      });
      
      if (response.data.status === 'healthy') {
        return {
          status: 'online',
          url: url,
          data: response.data
        };
      }
    } catch (error) {
      continue; // Try next URL
    }
  }

  return {
    status: 'offline',
    error: 'All server endpoints unreachable'
  };
};

// PDF Processing API calls
export const pdfAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  preview: (fileId: string) => {
    return apiClient.get(`/pdf/preview/${fileId}`, {
      responseType: 'blob',
    });
  },
  
  process: (fileId: string, options: any) => {
    return apiClient.post(`/pdf/process/${fileId}`, options);
  },
  
  download: (fileId: string) => {
    return apiClient.get(`/pdf/download/${fileId}`, {
      responseType: 'blob',
    });
  }
};

export default apiClient;
