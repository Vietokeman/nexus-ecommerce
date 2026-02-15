import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from './logger';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    logger(
      (set, get) => ({
        items: [],

        addItem: (item) => {
          set((state) => {
            if (state.items.find((i) => i.id === item.id)) return state;
            return { items: [...state.items, item] };
          });
        },

        removeItem: (id) => {
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
          }));
        },

        isInWishlist: (id) => get().items.some((i) => i.id === id),

        toggleItem: (item) => {
          if (get().isInWishlist(item.id)) {
            get().removeItem(item.id);
          } else {
            get().addItem(item);
          }
        },
      }),
      'wishlist-store',
    ),
    { name: 'wishlist-storage' },
  ),
);
