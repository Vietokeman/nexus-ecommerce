import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationStore } from '@/store/notification-store';
import type { NotificationItem, SignalRNotificationPayload } from '@/types/notification';

interface EnvWithNotificationHub {
  VITE_API_BASE_URL?: string;
  VITE_NOTIFICATION_HUB_URL?: string;
}

const notificationQueryKeys = {
  root: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

function toNotificationItem(payload: SignalRNotificationPayload): NotificationItem {
  const nowIso = new Date().toISOString();
  const createdAt = payload.createdAt ?? payload.timestamp ?? nowIso;

  return {
    id: payload.id ?? payload.notificationId ?? crypto.randomUUID(),
    title: payload.title ?? 'New notification',
    message: payload.message ?? payload.content ?? 'You have a new update',
    link: payload.link ?? payload.url ?? null,
    isRead: payload.isRead ?? false,
    createdAt,
    type: payload.type ?? payload.action ?? null,
  };
}

function buildHubUrl(): string {
  const env = import.meta.env as ImportMetaEnv & EnvWithNotificationHub;
  if (env.VITE_NOTIFICATION_HUB_URL) {
    return env.VITE_NOTIFICATION_HUB_URL;
  }

  const baseUrl = env.VITE_API_BASE_URL ?? window.location.origin;
  return `${baseUrl.replace(/\/$/, '')}/hubs/notifications`;
}

export function useSignalRNotification() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const resetNotifications = useNotificationStore((state) => state.reset);

  useEffect(() => {
    if (!isAuthenticated) {
      resetNotifications();
      return;
    }

    const hubUrl = buildHubUrl();
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          const stateToken = useAuthStore.getState().token;
          return stateToken ?? localStorage.getItem('token') ?? '';
        },
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('ReceiveNotification', (payload: SignalRNotificationPayload) => {
      const notification = toNotificationItem(payload);
      useNotificationStore.getState().upsertNotification(notification);

      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.root });
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount });

      toast.info(notification.title);
    });

    const startConnection = async () => {
      try {
        await connection.start();
      } catch {
        toast.error('Realtime notification connection failed. Retrying automatically.');
      }
    };

    void startConnection();

    return () => {
      connection.off('ReceiveNotification');
      void connection.stop();
    };
  }, [isAuthenticated, queryClient, resetNotifications, token]);
}
