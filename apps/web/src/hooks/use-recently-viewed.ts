'use client';

import { useState, useEffect } from 'react';
import { RecentlyViewedProduct } from '@/types/product.types';

const STORAGE_KEY = 'nuvora_recently_viewed';
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
const [items, setItems] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
  }, []);

const addProduct = (product: RecentlyViewedProduct) => {
  setItems((prev) => {
    const filtered = prev.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  });
};

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  return { items, addProduct, clearAll };
}
