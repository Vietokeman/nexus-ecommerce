import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import {
  Badge,
  Box,
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
import { PremiumButton } from '@/components/ui/primitives';
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
        <Badge
          badgeContent={unreadCount}
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 100%)',
              color: '#0C0A09',
              fontWeight: 800,
            }
          }}
        >
          <NotificationsNoneRoundedIcon sx={{ color: '#FAF9F6' }} />
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
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              overflow: 'hidden',
              boxShadow: '0 32px 64px -24px rgba(0, 0, 0, 0.3)',
              background: 'rgba(28, 25, 23, 0.92)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              color: '#FAF9F6',
            },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          px={2.5}
          py={2}
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#FAF9F6' }}>
            Thông báo
          </Typography>
          <Typography variant="caption" sx={{ color: '#D4AF37' }} fontWeight={700}>
            {unreadCount} chưa đọc
          </Typography>
        </Stack>

        {latest.length === 0 ? (
          <Box px={2} py={3}>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" textAlign="center">
              Không có thông báo mới.
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {latest.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => void handleItemClick(item)}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  alignItems: 'flex-start',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  bgcolor: item.isRead ? 'transparent' : 'rgba(212, 175, 55, 0.06)',
                  transition: 'background-color 160ms ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={item.isRead ? 600 : 800} sx={{ color: '#FAF9F6' }}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.6)', mt: 0.5 }}
                      >
                        {item.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.35)', display: 'block', mt: 0.25 }}>
                        {formatTime(item.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}

        <Box p={2}>
          <PremiumButton
            fullWidth
            variant="contained"
            onClick={() => {
              handleClose();
              navigate('/notifications');
            }}
            sx={{
              height: '2.5rem',
            }}
          >
            Xem tất cả thông báo
          </PremiumButton>
        </Box>
      </Menu>
    </>
  );
}
