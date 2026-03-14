import { create } from 'zustand';
import { logger } from './logger';
import type { NotificationItem } from '@/types/notification';

const MAX_NOTIFICATIONS = 50;

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  upsertNotification: (notification: NotificationItem) => void;
  replaceNotifications: (notifications: NotificationItem[]) => void;
  markAsReadLocal: (notificationId: string) => void;
  markAllAsReadLocal: () => void;
  setUnreadCount: (count: number) => void;
  reset: () => void;
}

function clampLatest(notifications: NotificationItem[]): NotificationItem[] {
  return notifications
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_NOTIFICATIONS);
}

function computeUnreadCount(notifications: NotificationItem[]): number {
  return notifications.reduce((total, notification) => {
    return notification.isRead ? total : total + 1;
  }, 0);
}

export const useNotificationStore = create<NotificationState>()(
  logger(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      upsertNotification: (notification) =>
        set((state) => {
          const existingIndex = state.notifications.findIndex((item) => item.id === notification.id);
          const merged =
            existingIndex >= 0
              ? state.notifications.map((item, index) =>
                  index === existingIndex ? { ...item, ...notification } : item,
                )
              : [notification, ...state.notifications];

          const notifications = clampLatest(merged);

          return {
            notifications,
            unreadCount: computeUnreadCount(notifications),
          };
        }),

      replaceNotifications: (notifications) => {
        const latest = clampLatest(notifications);
        set({
          notifications: latest,
          unreadCount: computeUnreadCount(latest),
        });
      },

      markAsReadLocal: (notificationId) =>
        set((state) => {
          const notifications = state.notifications.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item,
          );

          return {
            notifications,
            unreadCount: computeUnreadCount(notifications),
          };
        }),

      markAllAsReadLocal: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
          unreadCount: 0,
        })),

      setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

      reset: () => set({ notifications: [], unreadCount: 0 }),
    }),
    'notification-store',
  ),
);
