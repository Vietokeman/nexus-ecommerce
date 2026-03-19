import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';
import type { SellerProduct } from '@/types/seller';
import loadingAnimation from '@/assets/animations/loading.json';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  Draft: 'default',
  PendingReview: 'warning',
  Active: 'success',
  Inactive: 'info',
  Rejected: 'error',
};

const statusLabel: Record<string, string> = {
  Draft: 'Bản nháp',
  PendingReview: 'Chờ duyệt',
  Active: 'Đang bán',
  Inactive: 'Tạm ẩn',
  Rejected: 'Bị từ chối',
};

export default function SellerProductsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const is768 = useMediaQuery(theme.breakpoints.down(768));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const userName = user?.userName || user?.email || '';

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery<SellerProduct[]>({
    queryKey: ['seller-products', userName],
    queryFn: () =>
      api
        .get(API_ENDPOINTS.SELLER.BY_SELLER(userName))
        .then((r) => r.data?.result || r.data || []),
    enabled: !!userName,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(API_ENDPOINTS.SELLER.PRODUCT_DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Đã xóa sản phẩm!');
      setDeleteId(null);
    },
    onError: () => toast.error('Lỗi khi xóa sản phẩm'),
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (isError) toast.error('Lỗi khi tải danh sách sản phẩm');
  }, [isError]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.no.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <Stack width={is480 ? 'auto' : '25rem'} height="calc(100vh - 4rem)" justifyContent="center" alignItems="center" mx="auto">
        <Lottie animationData={loadingAnimation} />
      </Stack>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Stack sx={{ maxWidth: 1100, mx: 'auto', py: 4, px: is480 ? 2 : 4 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: '1px solid #EEDFCB',
            background:
              'linear-gradient(145deg, rgba(255,248,236,0.9), rgba(240,251,248,0.88) 60%, rgba(255,255,255,0.96))',
            boxShadow: '0 16px 30px rgba(126, 93, 53, 0.1)',
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <motion.div whileHover={{ x: -5 }}>
              <IconButton component={Link} to="/seller/dashboard">
                <ArrowBackIcon />
              </IconButton>
            </motion.div>
            <div>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Sản phẩm của tôi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {products.length} sản phẩm
              </Typography>
            </div>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/seller/create-product')}
            sx={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', fontWeight: 600, borderRadius: 2 }}
          >
            Đăng sản phẩm mới
          </Button>
        </Stack>

        {/* Search */}
        <TextField
          placeholder="Tìm theo tên, mã, danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            mt: 3,
            mb: 2,
            maxWidth: 420,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              background: '#FFFFFF',
              boxShadow: '0 8px 18px rgba(126, 93, 53, 0.08)',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Product List */}
        <Stack spacing={2}>
          {filtered.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: is768 ? 'column' : 'row',
                  gap: 2,
                  alignItems: is768 ? 'stretch' : 'center',
                  border: '1px solid #E9DCCB',
                  background: 'linear-gradient(180deg, #FFFFFF, #FFFCF7)',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 16px 30px rgba(126, 93, 53, 0.14)' },
                }}
              >
                {/* Image */}
                <img
                  src={product.imageUrl || `https://via.placeholder.com/100?text=${product.name[0]}`}
                  alt={product.name}
                  style={{
                    width: is768 ? '100%' : 100,
                    height: is768 ? 200 : 100,
                    objectFit: 'cover',
                    borderRadius: 10,
                    flexShrink: 0,
                  }}
                />

                {/* Info */}
                <Stack flex={1} spacing={0.5}>
                  <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography fontWeight={600}>{product.name}</Typography>
                    <Chip
                      label={statusLabel[product.status] || product.status}
                      color={statusColor[product.status] || 'default'}
                      size="small"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Mã: {product.no} | Danh mục: {product.category || 'Chưa phân loại'}
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography fontWeight={600} color="primary">
                      {product.price?.toLocaleString('vi-VN')}₫
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Kho: {product.stockQuantity}
                    </Typography>
                  </Stack>
                  {product.seoTitle && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      SEO: {product.seoTitle}
                    </Typography>
                  )}
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                  <Tooltip title="Xem chi tiết">
                    <IconButton size="small" onClick={() => navigate(`/product-details/${product.no}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton size="small" color="primary" onClick={() => navigate(`/seller/edit-product/${product.id}`)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton size="small" color="error" onClick={() => setDeleteId(product.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <Stack alignItems="center" py={8} spacing={2}>
              <Typography variant="h6" color="text.secondary">
                {products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm'}
              </Typography>
              {products.length === 0 && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/seller/create-product')}>
                  Đăng sản phẩm đầu tiên
                </Button>
              )}
            </Stack>
          )}
        </Stack>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
          <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
          <DialogContent>
            <Typography>Bạn có chắc muốn xóa sản phẩm này? Hành động không thể hoàn tác.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Hủy</Button>
            <Button color="error" variant="contained" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </motion.div>
  );
}
