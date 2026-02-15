import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from './logger';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { User, LoginDto, SignupDto, AuthResponse } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (credentials: LoginDto) => Promise<void>;
  signup: (data: SignupDto) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    logger(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        login: async (credentials: LoginDto) => {
          const { data } = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
          const result = data as unknown as { result?: AuthResponse } & AuthResponse;
          const authData = result.result ?? result;
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
          });
          localStorage.setItem('token', authData.token);
        },

        signup: async (signupData: SignupDto) => {
          const { data } = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, signupData);
          const result = data as unknown as { result?: AuthResponse } & AuthResponse;
          const authData = result.result ?? result;
          set({
            user: authData.user,
            token: authData.token,
            isAuthenticated: true,
          });
          if (authData.token) {
            localStorage.setItem('token', authData.token);
          }
        },

        logout: () => {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('token');
        },

        checkAuth: () => {
          const { token, user } = get();
          if (token && user) {
            set({ isAuthenticated: true });
          } else {
            set({ isAuthenticated: false, user: null, token: null });
          }
        },

        setUser: (user: User) => set({ user }),
        setToken: (token: string) => {
          set({ token });
          localStorage.setItem('token', token);
        },
      }),
      'auth-store',
    ),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
