import { create } from 'zustand';
import { logger } from './logger';

interface UIState {
  isFilterOpen: boolean;
  isMobileMenuOpen: boolean;
  toggleFilter: () => void;
  toggleMobileMenu: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>()(
  logger(
    (set) => ({
      isFilterOpen: false,
      isMobileMenuOpen: false,
      toggleFilter: () => set((s) => ({ isFilterOpen: !s.isFilterOpen })),
      toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
      closeAll: () => set({ isFilterOpen: false, isMobileMenuOpen: false }),
    }),
    'ui-store',
  ),
);
