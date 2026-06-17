'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { QUERY_KEYS } from '../constants/query-keys';
import { ROUTES } from '../constants/routes';
import { authCookies } from '../lib/auth';
import getErrorMessage from '../lib/error';
import { useUIStore } from '@/store/ui.store';

// ─── useMe ───────────────────────────────────────────────────────
export function useMe() {
  const { setAuth, clearAuth } = useAuthStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: async () => {
      const token = authCookies.getToken();
      if (!token) return null;
      return authService.getMe();
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
    retryDelay: 600,
  });

  useEffect(() => {
    if (query.data) {
      const token = authCookies.getToken();
      if (token) setAuth(query.data, token);
    }

    if (query.isError) {
      const status = (query.error as { response?: { status?: number } })
        ?.response?.status;
      if (status === 401 || status === 403) {
        clearAuth();
      }
    }
  }, [query.data, query.isError, query.error, setAuth, clearAuth]);

  return query;
}

// ─── Modal Login ───────────────────────────────────────────────────────
export function useModalLogin() {
  const { setAuth } = useAuthStore();
  const { closeLoginModal } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.setQueryData(QUERY_KEYS.ME, data.user);
      closeLoginModal();
      toast.success('Welcome back!');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Login failed'));
    },
  });
}

// ─── Page Login ───────────────────────────────────────────────────────
export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.setQueryData(QUERY_KEYS.ME, data.user);
      toast.success('Welcome back!');

      if (data.user.role === 'ADMIN') {
        router.push(ROUTES.ADMIN);
      } else {
        router.push(ROUTES.HOME);
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Login failed'));
    },
  });
}

// ─── useRegister ─────────────────────────────────────────────────
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Registration successful! Please verify your email.');
      router.push(ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Registration failed'));
    },
  });
}

// ─── useLogout ───────────────────────────────────────────────────
export function useLogout() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push(ROUTES.LOGIN);
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}

// ─── useForgotPassword ───────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset link sent to your email');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Something went wrong'));
    },
  });
}

// ─── useResetPassword ────────────────────────────────────────────
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successful');
      router.push(ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Reset failed'));
    },
  });
}
