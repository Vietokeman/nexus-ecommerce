import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  FlashSaleSession,
  FlashSaleOrder,
  FlashSalePurchaseDto,
  FlashSaleStockResponse,
} from '@/types/flash-sale';

/* ── Query Keys ── */
const keys = {
  all: ['flash-sales'] as const,
  active: () => [...keys.all, 'active'] as const,
  session: (id: number) => [...keys.all, 'session', id] as const,
  stock: (itemId: number) => [...keys.all, 'stock', itemId] as const,
  orders: (userName: string) => [...keys.all, 'orders', userName] as const,
};

/* ── Queries ── */

export function useActiveSessions() {
  return useQuery({
    queryKey: keys.active(),
    queryFn: async () => {
      const { data } = await api.get<FlashSaleSession[]>(API_ENDPOINTS.FLASH_SALE.ACTIVE_SESSIONS);
      return data;
    },
    refetchInterval: 30_000, // Refresh every 30s
  });
}

export function useFlashSaleSession(id: number) {
  return useQuery({
    queryKey: keys.session(id),
    queryFn: async () => {
      const { data } = await api.get<FlashSaleSession>(API_ENDPOINTS.FLASH_SALE.SESSION_DETAIL(id));
      return data;
    },
    enabled: id > 0,
  });
}

export function useFlashSaleStock(itemId: number, enabled = true) {
  return useQuery({
    queryKey: keys.stock(itemId),
    queryFn: async () => {
      const { data } = await api.get<FlashSaleStockResponse>(
        API_ENDPOINTS.FLASH_SALE.ITEM_STOCK(itemId),
      );
      return data;
    },
    enabled: enabled && itemId > 0,
    refetchInterval: 5_000, // Poll every 5s for live stock
  });
}

export function useFlashSaleOrders(userName: string) {
  return useQuery({
    queryKey: keys.orders(userName),
    queryFn: async () => {
      const { data } = await api.get<FlashSaleOrder[]>(
        API_ENDPOINTS.FLASH_SALE.USER_ORDERS(userName),
      );
      return data;
    },
    enabled: !!userName,
  });
}

/* ── Mutations ── */

export function useFlashSalePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: FlashSalePurchaseDto) => {
      const { data } = await api.post<FlashSaleOrder>(API_ENDPOINTS.FLASH_SALE.PURCHASE, dto);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: keys.stock(variables.itemId) });
      qc.invalidateQueries({ queryKey: keys.active() });
    },
  });
}
