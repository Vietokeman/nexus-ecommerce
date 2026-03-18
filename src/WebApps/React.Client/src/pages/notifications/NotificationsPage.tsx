import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Pagination, Stack, Tab, Tabs, Typography } from '@mui/material';
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
    <Stack spacing={3.5}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        sx={{
          p: { xs: 2.25, md: 3 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: '#F1E9DB',
          background:
            'linear-gradient(140deg, rgba(255,255,255,0.95), rgba(255,245,232,0.9) 55%, rgba(244,253,251,0.95))',
          boxShadow: '0 20px 40px rgba(141, 97, 56, 0.12)',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Keep track of updates, approvals, and user activities.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending || totalRows === 0}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 999,
            fontWeight: 700,
            boxShadow: '0 10px 26px rgba(15, 118, 110, 0.25)',
          }}
        >
          Mark all as read
        </Button>
      </Stack>

      <Paper
        sx={{
          p: 2,
          borderRadius: 3.5,
          border: '1px solid #EEE5D6',
          boxShadow: '0 14px 30px rgba(120, 94, 52, 0.08)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF8 100%)',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_event, value: 'all' | 'unread') => {
            setTab(value);
            setPage(1);
          }}
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 999,
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 42,
              fontWeight: 600,
            },
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
              p: { xs: 2, md: 2.25 },
              borderRadius: 3,
              bgcolor: notification.isRead ? '#FFFFFF' : '#FFF9EE',
              border: '1px solid',
              borderColor: notification.isRead ? '#ECE6D9' : '#F0D8B6',
              cursor: notification.link ? 'pointer' : 'default',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
              '&:hover': {
                transform: notification.link ? 'translateY(-2px)' : 'none',
                boxShadow: notification.link ? '0 14px 28px rgba(141, 97, 56, 0.14)' : 'none',
              },
            }}
            onClick={() => void handleReadAndNavigate(notification)}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={notification.isRead ? 600 : 800}>
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
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px dashed #E6D5BE',
              background: 'linear-gradient(180deg, #FFFFFF, #FFFAF1)',
            }}
          >
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
          sx={{
            '& .MuiPaginationItem-root': {
              fontWeight: 600,
            },
          }}
        />
      </Stack>
    </Stack>
  );
}
