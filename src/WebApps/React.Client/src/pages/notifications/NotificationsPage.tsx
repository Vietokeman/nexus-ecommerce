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
        className="nx-liquid-glass"
        sx={{
          p: { xs: 2.25, md: 3 },
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 48px -20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #1C1917 0%, #0D0C0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
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
            background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
            color: '#FAF9F6',
            '&:hover': {
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
              color: '#0C0A09',
            },
          }}
        >
          Mark all as read
        </Button>
      </Stack>

      <Paper
        className="nx-liquid-glass"
        sx={{
          p: 1.5,
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 16px 32px -16px rgba(0, 0, 0, 0.08)',
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
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 100%)',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 42,
              fontWeight: 600,
              color: '#8A8576',
              '&.Mui-selected': {
                color: '#D4AF37',
              }
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
              borderRadius: '20px',
              bgcolor: notification.isRead ? 'rgba(255, 255, 255, 0.3)' : 'rgba(212, 175, 55, 0.05)',
              border: '1px solid',
              borderColor: notification.isRead ? 'rgba(255, 255, 255, 0.1)' : 'rgba(212, 175, 55, 0.25)',
              backdropFilter: 'blur(10px)',
              cursor: notification.link ? 'pointer' : 'default',
              transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), border-color 300ms, box-shadow 300ms',
              '&:hover': {
                transform: notification.link ? 'translateY(-3px)' : 'none',
                borderColor: notification.link ? '#D4AF37' : (notification.isRead ? 'rgba(255, 255, 255, 0.1)' : 'rgba(212, 175, 55, 0.25)'),
                boxShadow: notification.link ? '0 16px 32px -16px rgba(212, 175, 55, 0.2)' : 'none',
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
                <Typography variant="subtitle1" fontWeight={notification.isRead ? 600 : 800} sx={{ color: '#1C1917' }}>
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
            className="nx-liquid-glass"
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '24px',
              border: '1px dashed rgba(212, 175, 55, 0.3)',
              boxShadow: 'none',
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
