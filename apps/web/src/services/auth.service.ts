import api from '../lib/axios';
import { ApiResponse } from '../types/api.types';
import { LoginResponse, RegisterResponse, User } from '../types/auth.types';

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<RegisterResponse> => {
    const res = await api.post<ApiResponse<RegisterResponse>>(
      '/auth/register',
      data,
    );
    return res.data.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      data,
    );
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.get(`/auth/verify-email?token=${token}`);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: {
    token: string;
    password: string;
  }): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },
  exchangeOAuthCode: async (code: string): Promise<{ accessToken: string }> => {
  const res = await api.post<ApiResponse<{ accessToken: string }>>('/auth/exchange-oauth-code', { code });
  return res.data.data;
},
};
