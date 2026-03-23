import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/endpoints';

type RefreshResponse = {
  accessToken?: string;
  refreshToken?: string;
  result?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

type RetryableRequest = {
  _retry?: boolean;
  headers: Record<string, string>;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getRefreshToken = (): string | null => {
  const direct = localStorage.getItem('refreshToken');
  if (direct) {
    return direct;
  }

  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) {
    return null;
  }

  try {
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
};

const saveAuthTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) {
    return;
  }

  try {
    const parsed = JSON.parse(authStorage);
    if (parsed?.state) {
      parsed.state.token = accessToken;
      if (refreshToken) {
        parsed.state.refreshToken = refreshToken;
      }
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  } catch {
    // ignore serialization errors
  }
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add user id header for payment API
    const user = localStorage.getItem('auth-storage');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed?.state?.user?.id) {
          config.headers['X-User-Id'] = parsed.state.user.id;
        }
      } catch {
        // ignore parse errors
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const { data } = await axios.post<RefreshResponse>(
          `${import.meta.env.VITE_API_BASE_URL || ''}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const nextToken = data.accessToken ?? data.result?.accessToken;
        const nextRefresh = data.refreshToken ?? data.result?.refreshToken ?? refreshToken;
        if (!nextToken) {
          throw new Error('Missing refreshed access token');
        }

        saveAuthTokens(nextToken, nextRefresh);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return api(originalRequest);
      } catch {
        clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export { api };
