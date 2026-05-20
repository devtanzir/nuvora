'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import { QUERY_KEYS } from '../constants/query-keys';
import getErrorMessage from '../lib/error';

// ─── useCart ──────────────────────────────────────────────────────
export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.CART,
    queryFn: cartService.getCart, // pure - no side effects
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Sync React Query cache → Zustand UI store
  useEffect(() => {
    if (query.data) {
      setCart(query.data);
    }
  }, [query.data, setCart]);

  return query;
}

// ─── useAddToCart ─────────────────────────────────────────────────
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { openCart } = useCartStore();

  return useMutation({
    mutationFn: cartService.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      openCart();
      toast.success('Added to cart');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to add to cart'));
    },
  });
}

// ─── useUpdateCartItem ────────────────────────────────────────────
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update cart'));
    },
  });
}

// ─── useRemoveCartItem ────────────────────────────────────────────
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartService.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      toast.success('Item removed');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to remove item'));
    },
  });
}

// ─── useClearCart ─────────────────────────────────────────────────
export function useClearCart() {
  const queryClient = useQueryClient();
  const { clearCartState } = useCartStore();

  return useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      clearCartState();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to clear cart'));
    },
  });
}
