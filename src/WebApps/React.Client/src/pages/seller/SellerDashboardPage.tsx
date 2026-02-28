import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Paper,
  IconButton,
  Rating,
  Chip,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';
import type { SellerDashboard } from '@/types/seller';
import loadingAnimation from '@/assets/animations/loading.json';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <motion.div whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} style={{ borderRadius: 16 }}>
      <Paper sx={{ p: 3, borderRadius: 4, height: '100%', position: 'relative', overflow: 'hidden' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
          <Stack
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: `${color}15`,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {icon}
          </Stack>
        </Stack>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${color}, ${color}40)`,
          }}
        />
      </Paper>
    </motion.div>
  );
}

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const theme = useTheme();
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const userName = user?.userName || user?.email || '';

  const {
    data: dashboard,
    isLoading,
    isError,
  } = useQuery<SellerDashboard>({
    queryKey: ['seller-dashboard', userName],
    queryFn: () =>
      api.get(API_ENDPOINTS.SELLER.DASHBOARD(userName)).then((r) => r.data?.result || r.data),
    enabled: !!userName,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (isError) toast.error('Lỗi khi tải dashboard');
  }, [isError]);

  if (isLoading) {
    return (
      <Stack
        width={is480 ? 'auto' : '25rem'}
        height="calc(100vh - 4rem)"
        justifyContent="center"
        alignItems="center"
        mx="auto"
      >
        <Lottie animationData={loadingAnimation} />
      </Stack>
    );
  }

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: dashboard?.totalProducts ?? 0,
      icon: <InventoryIcon sx={{ color: '#2563eb' }} />,
      color: '#2563eb',
      subtitle: `${dashboard?.activeProducts ?? 0} đang bán`,
    },
    {
      title: 'Đánh giá trung bình',
      value: (dashboard?.averageRating ?? 0).toFixed(1),
      icon: <StarIcon sx={{ color: '#f59e0b' }} />,
      color: '#f59e0b',
      subtitle: `${dashboard?.totalReviews ?? 0} đánh giá`,
    },
    {
      title: 'Tổng doanh thu',
      value: `${((dashboard?.totalRevenue ?? 0) / 1000000).toFixed(1)}M`,
      icon: <TrendingUpIcon sx={{ color: '#10b981' }} />,
      color: '#10b981',
      subtitle: 'VNĐ',
    },
    {
      title: 'Chờ xử lý',
      value: dashboard?.pendingProducts ?? 0,
      icon: <ShoppingCartIcon sx={{ color: '#8b5cf6' }} />,
      color: '#8b5cf6',
      subtitle: 'Sản phẩm chờ duyệt',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Stack sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: is480 ? 2 : 4 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}>
          <Stack direction="row" alignItems="center" gap={1}>
            <motion.div whileHover={{ x: -5 }}>
              <IconButton component={Link} to="/">
                <ArrowBackIcon />
              </IconButton>
            </motion.div>
            <div>
              <Typography variant="h4" fontWeight={700}>
                🏪 Seller Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xin chào, {user?.firstName || user?.userName || 'Seller'}!
              </Typography>
            </div>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/seller/create-product')}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            Đăng sản phẩm mới
          </Button>
        </Stack>

        {/* Stat Cards */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Thao tác nhanh
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <Button variant="outlined" onClick={() => navigate('/seller/products')}>
              📦 Quản lý sản phẩm
            </Button>
            <Button variant="outlined" onClick={() => navigate('/seller/create-product')}>
              ➕ Đăng sản phẩm
            </Button>
            <Button variant="outlined" onClick={() => navigate('/orders')}>
              🛒 Xem đơn hàng
            </Button>
          </Stack>
        </Paper>

        {/* Recent Products */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Sản phẩm gần đây
            </Typography>
            <Button size="small" onClick={() => navigate('/seller/products')}>
              Xem tất cả →
            </Button>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          {dashboard?.recentProducts && dashboard.recentProducts.length > 0 ? (
            <Stack spacing={1.5}>
              {dashboard.recentProducts.map((p) => (
                <Stack
                  key={p.id}
                  direction="row"
                  alignItems="center"
                  gap={2}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/product-details/${p.no}`)}
                >
                  <img
                    src={p.imageUrl || `https://via.placeholder.com/50?text=${p.name[0]}`}
                    alt={p.name}
                    style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <Stack flex={1} spacing={0}>
                    <Typography fontWeight={500} fontSize="0.9rem">
                      {p.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.price?.toLocaleString('vi-VN')}₫ • Kho: {p.stockQuantity}
                    </Typography>
                  </Stack>
                  <Chip
                    label={p.status}
                    size="small"
                    color={p.status === 'Active' ? 'success' : p.status === 'Draft' ? 'default' : 'warning'}
                  />
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Chưa có sản phẩm nào. Bắt đầu đăng sản phẩm đầu tiên!
            </Typography>
          )}
        </Paper>

        {/* Recent Reviews */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Đánh giá gần đây
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {dashboard?.recentReviews && dashboard.recentReviews.length > 0 ? (
            <Stack spacing={2}>
              {dashboard.recentReviews.map((r) => (
                <Stack key={r.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }} spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography fontWeight={600} fontSize="0.9rem">
                        {r.displayName || r.userName}
                      </Typography>
                      {r.isVerifiedPurchase && <Chip label="Đã mua" size="small" color="success" variant="outlined" />}
                    </Stack>
                    <Rating value={r.rating} readOnly size="small" />
                  </Stack>
                  <Typography variant="body2">{r.comment}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(r.createdDate!).toLocaleDateString('vi-VN')}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={3}>
              Chưa có đánh giá nào
            </Typography>
          )}
        </Paper>
      </Stack>
    </motion.div>
  );
}
