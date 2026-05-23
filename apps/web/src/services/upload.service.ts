import api from '../lib/axios';
import { ApiResponse } from '../types/api.types';

export interface UploadResponse {
  url: string;
  publicId: string;
}

export const uploadService = {
  uploadImage: async (file: File, folder = 'avatars'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<UploadResponse>>(
      `/upload/image?folder=${folder}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return res.data.data;
  },

  uploadImages: async (files: File[], folder = 'products'): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await api.post<ApiResponse<UploadResponse[]>>(
      `/upload/images?folder=${folder}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return res.data.data;
  },
};
