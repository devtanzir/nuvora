import api from '../lib/axios';
import { ApiResponse, Meta } from '../types/api.types';

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewListResponse {
  reviews: Review[];
  meta: Meta;
}

export interface SubmitReviewData {
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  body?: string;
}

export const reviewService = {
  getReviews: async (
    productId: string,
    page = 1,
    sort = 'newest',
  ): Promise<ReviewListResponse> => {
    const res = await api.get<ApiResponse<ReviewListResponse>>(
      `/products/${productId}/reviews?page=${page}&limit=10&sort=${sort}`,
    );
    return res.data.data;
  },

  getReviewSummary: async (productId: string): Promise<ReviewSummary> => {
    const res = await api.get<ApiResponse<ReviewSummary>>(
      `/products/${productId}/reviews/summary`,
    );
    return res.data.data;
  },

  submitReview: async (data: SubmitReviewData): Promise<Review> => {
    const { productId, ...rest } = data;
    const res = await api.post<ApiResponse<Review>>(
      `/products/${productId}/reviews`,
      rest,
    );
    return res.data.data;
  },

  updateReview: async (
    productId: string,
    reviewId: string,
    data: { rating?: number; title?: string; body?: string },
  ): Promise<Review> => {
    const res = await api.patch<ApiResponse<Review>>(
      `/products/${productId}/reviews/${reviewId}`,
      data,
    );
    return res.data.data;
  },

  deleteReview: async (
    productId: string,
    reviewId: string,
  ): Promise<void> => {
    await api.delete(`/products/${productId}/reviews/${reviewId}`);
  },
};
