import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// Request interceptor: token her zaman güncel olsun
apiClient.interceptors.request.use(config => {
  if (authToken && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      setAuthToken(null);
    }
    // Network hatası logla (debug için)
    if (!error.response && __DEV__) {
      console.warn('[API] Bağlantı hatası:', error.config?.url, error.message);
    }
    return Promise.reject(error);
  },
);

// API'nin erişilebilir olup olmadığını test et
export async function checkApiConnection(): Promise<boolean> {
  try {
    const baseUrl = API_BASE_URL.replace('/api', '');
    await apiClient.get(`${baseUrl}/health`, { timeout: 3000, baseURL: '' });
    return true;
  } catch {
    return false;
  }
}
