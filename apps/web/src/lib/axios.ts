import axios, { AxiosError } from 'axios';
import { authCookies } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Unwrap helper ────────────────────────────────────────────────
function unwrapResponse(data: unknown): unknown {
  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    data.data &&
    typeof data.data === 'object' &&
    'data' in data.data
  ) {
    return {
      ...(data as Record<string, unknown>),
      data: (data as Record<string, unknown> & { data: Record<string, unknown> }).data.data,
    };
  }
  return data;
}

// ─── Refresh queue ────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

const redirectToLogin = (): void => {
  processQueue(new Error('Session expired'), null);
  authCookies.removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ─── Raw client for token refresh (no interceptors → avoids recursion) ───
const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ─── Request interceptor ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = authCookies.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Unwrap double-nested if present, otherwise keep as is
    response.data = unwrapResponse(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (!originalRequest) return Promise.reject(error);

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;

    if (!is401 || alreadyRetried) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await refreshClient.post('/auth/refresh');
console.log('[refresh raw response]', refreshRes.data);
      const newToken: string = refreshRes.data.data.accessToken;
      console.log('[new token]', newToken);
      authCookies.setToken(newToken);
      processQueue(null, newToken);

      originalRequest.headers!.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
