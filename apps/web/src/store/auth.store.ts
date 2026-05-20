import { create } from 'zustand';
import { authCookies } from '../lib/auth';
import { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,

  setAuth: (user, accessToken) => {
    authCookies.setToken(accessToken);
    set({ user, isAuthenticated: true });
  },

  clearAuth: () => {
    authCookies.removeToken();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updatedUser) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null,
    })),
}));
