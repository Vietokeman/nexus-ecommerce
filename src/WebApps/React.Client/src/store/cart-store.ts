import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from './logger';

interface CartItem {
  itemNo: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemNo: string) => void;
  updateQuantity: (itemNo: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  shipping: () => number;
  taxAmount: () => number;
  total: () => number;
}

const SHIPPING_COST = 5.55;
const TAX_RATE = 5; // percent

export const useCartStore = create<CartState>()(
  persist(
    logger(
      (set, get) => ({
        items: [],

        addItem: (item) => {
          set((state) => {
            const existing = state.items.find((i) => i.itemNo === item.itemNo);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.itemNo === item.itemNo ? { ...i, quantity: i.quantity + 1 } : i,
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
          });
        },

        removeItem: (itemNo) => {
          set((state) => ({
            items: state.items.filter((i) => i.itemNo !== itemNo),
          }));
        },

        updateQuantity: (itemNo, quantity) => {
          if (quantity <= 0) {
            get().removeItem(itemNo);
            return;
          }
          set((state) => ({
            items: state.items.map((i) => (i.itemNo === itemNo ? { ...i, quantity } : i)),
          }));
        },

        clearCart: () => set({ items: [] }),

        totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        shipping: () => (get().items.length > 0 ? SHIPPING_COST : 0),
        taxAmount: () => (get().subtotal() * TAX_RATE) / 100,
        total: () => get().subtotal() + get().shipping() + get().taxAmount(),
      }),
      'cart-store',
    ),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
