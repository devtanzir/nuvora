import api from '../lib/axios';
import { ApiResponse } from '../types/api.types';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
}

export const bannerService = {
  getActiveBanners: async (): Promise<Banner[]> => {
    const res = await api.get<ApiResponse<Banner[]>>('/banners');
    return res.data.data;
  },
};
