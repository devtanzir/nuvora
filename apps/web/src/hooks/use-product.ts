'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productService } from '@/services/product.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import getErrorMessage from '@/lib/error';
import { reviewService } from '@/services/review.service';

// ─── useProduct ───────────────────────────────────────────────────
export function useProduct(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(slug),
    queryFn: () => productService.getProduct(slug),
    enabled: !!slug,
  });
}

// ─── useReviews ───────────────────────────────────────────────────
export function useReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS(productId, { page }),
    queryFn: () => reviewService.getReviews(productId, page),
    enabled: !!productId,
  });
}

// ─── useReviewSummary ─────────────────────────────────────────────
export function useReviewSummary(productId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEW_SUMMARY(productId),
    queryFn: () => reviewService.getReviewSummary(productId),
    enabled: !!productId,
  });
}

// ─── useSubmitReview ──────────────────────────────────────────────
export function useSubmitReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewService.submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REVIEWS(productId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REVIEW_SUMMARY(productId),
      });
      toast.success('Review submitted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to submit review'));
    },
  });
}
