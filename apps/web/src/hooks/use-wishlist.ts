'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { wishlistService } from '../services/wishlist.service';
import { useAuthStore } from '../store/auth.store';
import { QUERY_KEYS } from '../constants/query-keys';
import getErrorMessage from '../lib/error';

export function useWishlist(page = 1) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.WISHLIST(page),
    queryFn: () => wishlistService.getWishlist(page),
    enabled: isAuthenticated,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WISHLIST() });
      toast.success('Added to wishlist');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to add to wishlist'));
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WISHLIST() });
      toast.success('Removed from wishlist');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to remove from wishlist'));
    },
  });
}

export function useMoveToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: { variantId?: string; quantity?: number };
    }) => wishlistService.moveToCart(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WISHLIST() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      toast.success('Moved to cart');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to move to cart'));
    },
  });
}
