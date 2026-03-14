import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Pagination,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useNotificationStore } from '@/store/notification-store';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/hooks/useNotifications';
import type { NotificationItem } from '@/types/notification';

const PAGE_SIZE = 12;

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);

  const replaceNotifications = useNotificationStore((state) => state.replaceNotifications);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  const listQuery = useNotifications({
    isRead: tab === 'unread' ? false : undefined,
    pageIndex: page,
    pageSize: PAGE_SIZE,
  });
  const unreadCountQuery = useUnreadNotificationCount();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  useEffect(() => {
    if (listQuery.data?.results && page === 1 && tab === 'all') {
      replaceNotifications(listQuery.data.results);
    }
  }, [listQuery.data?.results, page, replaceNotifications, tab]);

  useEffect(() => {
    if (typeof unreadCountQuery.data === 'number') {
      setUnreadCount(unreadCountQuery.data);
    }
  }, [setUnreadCount, unreadCountQuery.data]);

  const rows = listQuery.data?.results ?? [];
  const totalRows = listQuery.data?.rowCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  const handleReadAndNavigate = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep track of updates, approvals, and user activities.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending || totalRows === 0}
        >
          Mark all as read
        </Button>
      </Stack>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_event, value: 'all' | 'unread') => {
            setTab(value);
            setPage(1);
          }}
        >
          <Tab value="all" label="All" />
          <Tab value="unread" label="Unread" />
        </Tabs>
      </Paper>

      <Stack spacing={1.5}>
        {rows.map((notification) => (
          <Paper
            key={notification.id}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: notification.isRead ? '#FFFFFF' : '#F5F3FF',
              border: '1px solid',
              borderColor: notification.isRead ? '#E5E7EB' : '#DDD6FE',
              cursor: notification.link ? 'pointer' : 'default',
            }}
            onClick={() => void handleReadAndNavigate(notification)}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="subtitle1" fontWeight={notification.isRead ? 500 : 700}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {notification.message}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.disabled">
                {formatDate(notification.createdAt)}
              </Typography>
            </Stack>
          </Paper>
        ))}

        {!listQuery.isLoading && rows.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="body1">No notifications found.</Typography>
          </Paper>
        )}
      </Stack>

      <Stack direction="row" justifyContent="center">
        <Pagination
          page={page}
          count={pageCount}
          onChange={(_event, value) => setPage(value)}
          color="primary"
        />
      </Stack>
    </Stack>
  );
}
