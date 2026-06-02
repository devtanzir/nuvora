'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { orderService } from '@/services/order.service';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useOrderDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER(id),
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
}

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(1000).optional(),
});

export type ReviewForm = z.infer<typeof reviewSchema>;
