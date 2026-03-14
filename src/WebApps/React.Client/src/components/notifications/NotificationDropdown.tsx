import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import {
  Badge,
  Box,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Stack,
  Typography,
} from '@mui/material';
import { useNotificationStore } from '@/store/notification-store';
import {
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/hooks/useNotifications';
import { nexus } from '@/theme/theme';
import type { NotificationItem } from '@/types/notification';

function formatTime(value: string): string {
  return new Date(value).toLocaleString();
}

export default function NotificationDropdown() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const notifications = useNotificationStore((state) => state.notifications);
  const replaceNotifications = useNotificationStore((state) => state.replaceNotifications);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  const listQuery = useNotifications({ pageIndex: 1, pageSize: 20 });
  const unreadCountQuery = useUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationAsRead();

  useEffect(() => {
    if (listQuery.data?.results) {
      replaceNotifications(listQuery.data.results);
    }
  }, [listQuery.data?.results, replaceNotifications]);

  useEffect(() => {
    if (typeof unreadCountQuery.data === 'number') {
      setUnreadCount(unreadCountQuery.data);
    }
  }, [setUnreadCount, unreadCountQuery.data]);

  const latest = useMemo(() => notifications.slice(0, 6), [notifications]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    handleClose();
    navigate(notification.link || '/notifications');
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <Badge color="secondary" badgeContent={unreadCount} max={99}>
          <NotificationsNoneRoundedIcon sx={{ color: nexus.neutral[700] }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxWidth: '95vw',
              borderRadius: 3,
              border: `1px solid ${nexus.neutral[200]}`,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {unreadCount} unread
          </Typography>
        </Stack>

        {latest.length === 0 ? (
          <Box px={2} py={3}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No notifications yet.
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {latest.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => void handleItemClick(item)}
                sx={{
                  py: 1.25,
                  px: 2,
                  alignItems: 'flex-start',
                  borderBottom: `1px solid ${nexus.neutral[100]}`,
                  bgcolor: item.isRead ? '#FFFFFF' : nexus.purple[50],
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={item.isRead ? 500 : 700}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {item.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatTime(item.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}

        <Box p={1.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              handleClose();
              navigate('/notifications');
            }}
          >
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
}
