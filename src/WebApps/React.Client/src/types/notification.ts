export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  type: string | null;
}

export interface SignalRNotificationPayload {
  id?: string;
  notificationId?: string;
  title?: string;
  message?: string;
  content?: string;
  link?: string;
  url?: string;
  isRead?: boolean;
  createdAt?: string;
  timestamp?: string;
  type?: string;
  action?: string;
}

export interface NotificationPageResult {
  results: NotificationItem[];
  currentPage: number;
  rowCount: number;
  pageSize: number;
}
