import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useNotificationStore } from '@/store/notification-store';
import type { NotificationPageResult } from '@/types/notification';

export interface NotificationListParams {
  isRead?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: NotificationListParams) =>
    [
      'notifications',
      'list',
      params.isRead ?? null,
      params.pageIndex ?? 1,
      params.pageSize ?? 20,
    ] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications(params: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<NotificationPageResult>(API_ENDPOINTS.NOTIFICATIONS.LIST, {
        params: {
          isRead: params.isRead,
          pageIndex: params.pageIndex ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      });

      return data;
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: async () => {
      const { data } = await api.get<{ unreadCount: number }>(
        API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
      );
      return data.unreadCount;
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
      return id;
    },
    onSuccess: (id) => {
      useNotificationStore.getState().markAsReadLocal(id);
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
    },
    onSuccess: () => {
      useNotificationStore.getState().markAllAsReadLocal();
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
