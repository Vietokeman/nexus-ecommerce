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
          <NotificationsNoneRoundedIcon sx={{ color: nexus.neutral[800] }} />
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
              borderRadius: 4,
              border: '1px solid #E9DDCC',
              overflow: 'hidden',
              boxShadow: '0 18px 34px rgba(120, 94, 52, 0.18)',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF6 100%)',
            },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          px={2}
          py={1.75}
          sx={{
            borderBottom: '1px solid #EFE4D4',
            background:
              'linear-gradient(135deg, rgba(255,247,232,0.8), rgba(245,252,251,0.9) 60%, rgba(255,255,255,1))',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
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
                  py: 1.4,
                  px: 2,
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #F1E7D8',
                  bgcolor: item.isRead ? '#FFFFFF' : '#FFF8EB',
                  transition: 'background-color 160ms ease',
                  '&:hover': {
                    bgcolor: item.isRead ? '#FFFBF4' : '#FFF3DE',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={item.isRead ? 600 : 800}>
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
            variant="contained"
            onClick={() => {
              handleClose();
              navigate('/notifications');
            }}
            sx={{
              borderRadius: 999,
              fontWeight: 700,
              py: 0.9,
              boxShadow: '0 10px 22px rgba(15, 118, 110, 0.2)',
            }}
          >
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
}
