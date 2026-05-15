import { create } from 'zustand';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    primaryImage: string | null;
    isActive: boolean;
  };
  variant: {
    id: string;
    name: string;
    value: string;
    stock: number;
    price: number | null;
  } | null;
  itemTotal: number;
}

interface CartState {
  id: string | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isOpen: boolean;

  // Actions
  setCart: (data: {
    id: string | null;
    items: CartItem[];
    subtotal: number;
    itemCount: number;
  }) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearCartState: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  id: null,
  items: [],
  subtotal: 0,
  itemCount: 0,
  isOpen: false,

  setCart: ({ id, items, subtotal, itemCount }) =>
    set({ id, items, subtotal, itemCount }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  clearCartState: () =>
    set({ id: null, items: [], subtotal: 0, itemCount: 0, isOpen: false }),
}));
