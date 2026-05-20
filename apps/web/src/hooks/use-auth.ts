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

// ─── useMe ───────────────────────────────────────────────────────
export function useMe() {
  const { setAuth, clearAuth } = useAuthStore();
  const hasToken = !!authCookies.getToken();

  const query = useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: authService.getMe,
    enabled: hasToken,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      // Token already in cookie, just sync user to store
      const token = authCookies.getToken();
      if (token) setAuth(query.data, token);
    }

    if (query.isError) {
      clearAuth();
    }
  }, [query.data, query.isError, setAuth, clearAuth]);

  return query;
}

// ─── useLogin ────────────────────────────────────────────────────
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
