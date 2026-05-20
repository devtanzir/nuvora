import api from '../lib/axios';
import { ApiResponse, Meta } from '../types/api.types';
import { User } from '../types/auth.types';
import { Address } from '../types/order.types';

export type UserNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export interface NotificationListResponse {
  notifications: UserNotification[];
  unreadCount: number;
  meta: Meta;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/users/profile');
    return res.data.data;
  },

  updateProfile: async (data: {
    name?: string;
    avatar?: string;
  }): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>('/users/profile', data);
    return res.data.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.patch('/users/change-password', data);
  },

  getAddresses: async (): Promise<Address[]> => {
    const res = await api.get<ApiResponse<Address[]>>('/users/addresses');
    return res.data.data;
  },

  createAddress: async (data: Omit<Address, 'id'>): Promise<Address> => {
    const res = await api.post<ApiResponse<Address>>(
      '/users/addresses',
      data,
    );
    return res.data.data;
  },

  updateAddress: async (
    id: string,
    data: Partial<Omit<Address, 'id'>>,
  ): Promise<Address> => {
    const res = await api.patch<ApiResponse<Address>>(
      `/users/addresses/${id}`,
      data,
    );
    return res.data.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/users/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<void> => {
    await api.patch(`/users/addresses/${id}/default`);
  },

  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unread?: boolean;
  }): Promise<NotificationListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.unread !== undefined)
      query.append('unread', String(params.unread));

    const res = await api.get<ApiResponse<NotificationListResponse>>(
      `/users/notifications?${query.toString()}`,
    );
    return res.data.data;
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await api.patch(`/users/notifications/${id}/read`);
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await api.patch('/users/notifications/read-all');
  },
};
