import { useState } from 'react';
import {
  Stack,
  Typography,
  Paper,
  Rating,
  Button,
  TextField,
  Chip,
  Divider,
  LinearProgress,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';
import type { ProductReview, ReviewSummary, CreateReviewDto } from '@/types/seller';
import { nexus } from '@/theme/theme';

interface ProductReviewsSectionProps {
  productId: number;
}

export default function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');

  // Fetch reviews
  const { data: reviews = [], isLoading: loadingReviews } = useQuery<ProductReview[]>({
    queryKey: ['product-reviews', productId],
    queryFn: () =>
      api
        .get(API_ENDPOINTS.REVIEWS.BY_PRODUCT(productId))
        .then((r) => r.data?.result || r.data || []),
    enabled: !!productId,
  });

  // Fetch summary
  const { data: summary } = useQuery<ReviewSummary>({
    queryKey: ['review-summary', productId],
    queryFn: () =>
      api.get(API_ENDPOINTS.REVIEWS.SUMMARY(productId)).then((r) => r.data?.result || r.data),
    enabled: !!productId,
  });

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: (dto: CreateReviewDto) => api.post(API_ENDPOINTS.REVIEWS.CREATE, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['review-summary', productId] });
      toast.success('Đánh giá đã được gửi!');
      setShowForm(false);
      setRating(5);
      setComment('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data || 'Lỗi khi gửi đánh giá');
    },
  });

  const handleSubmitReview = () => {
    if (!rating) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return;
    }
    submitReview.mutate({
      productId,
      userName: user?.userName || user?.email || '',
      displayName:
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.userName || '',
      rating,
      comment: comment.trim(),
    });
  };

  // Rating distribution bars
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percent };
  });

  return (
    <Stack spacing={3} mt={4}>
      <Divider />
      <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
        Đánh giá sản phẩm
      </Typography>

      {/* Summary */}
      {summary && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid #E9DCC9',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF7 100%)',
            boxShadow: '0 12px 24px rgba(124, 92, 52, 0.08)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center">
            {/* Average rating */}
            <Stack alignItems="center" spacing={1} minWidth={140}>
              <Typography variant="h2" fontWeight={800} color="primary">
                {summary.averageRating.toFixed(1)}
              </Typography>
              <Rating value={summary.averageRating} readOnly precision={0.1} />
              <Typography variant="body2" color="text.secondary">
                {summary.totalReviews} đánh giá
              </Typography>
            </Stack>

            {/* Distribution bars */}
            <Stack flex={1} spacing={1} width="100%">
              {ratingDistribution.map((d) => (
                <Stack key={d.star} direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" minWidth={20} textAlign="right">
                    {d.star}★
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={d.percent}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: d.star >= 4 ? '#10b981' : d.star === 3 ? '#f59e0b' : '#ef4444',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" minWidth={24}>
                    {d.count}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Write Review Button */}
      {user && !showForm && (
        <Button
          variant="contained"
          onClick={() => setShowForm(true)}
          sx={{ alignSelf: 'flex-start', borderRadius: 999, fontWeight: 700 }}
        >
          ✍️ Viết đánh giá
        </Button>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #E4C48F',
                background: 'linear-gradient(180deg, #FFFFFF, #FFFAF1)',
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Đánh giá của bạn
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography>Chất lượng:</Typography>
                  <Rating value={rating} onChange={(_, val) => setRating(val)} size="large" />
                </Stack>
                <TextField
                  multiline
                  rows={3}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  fullWidth
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleSubmitReview}
                    disabled={submitReview.isPending}
                    startIcon={
                      submitReview.isPending ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : undefined
                    }
                    sx={{ fontWeight: 600 }}
                  >
                    {submitReview.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                  <Button variant="text" onClick={() => setShowForm(false)}>
                    Hủy
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review List */}
      {loadingReviews ? (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
        </Stack>
      ) : reviews.length > 0 ? (
        <Stack spacing={2}>
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  border: '1px solid #E9DCCB',
                  background: 'linear-gradient(180deg, #FFFFFF, #FFFCF8)',
                }}
              >
                <Stack spacing={1.5}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'primary.main',
                          fontSize: '0.9rem',
                          boxShadow: '0 8px 16px rgba(124, 92, 52, 0.18)',
                        }}
                      >
                        {(review.displayName || review.userName)[0]?.toUpperCase()}
                      </Avatar>
                      <Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography fontWeight={600} fontSize="0.95rem">
                            {review.displayName || review.userName}
                          </Typography>
                          {review.isVerifiedPurchase && (
                            <Chip
                              label="✓ Đã mua hàng"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ height: 22 }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdDate!).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Rating value={review.rating} readOnly size="small" />
                  </Stack>

                  {/* Comment */}
                  <Typography variant="body2">{review.comment}</Typography>

                  {/* Seller reply */}
                  {review.sellerReply && (
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: '#FFF6E8',
                        borderLeft: `3px solid ${nexus.orange[500]}`,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" color="primary" fontWeight={600}>
                        🏪 Phản hồi từ người bán
                      </Typography>
                      <Typography variant="body2" mt={0.5}>
                        {review.sellerReply}
                      </Typography>
                      {review.sellerReplyDate && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.sellerReplyDate).toLocaleDateString('vi-VN')}
                        </Typography>
                      )}
                    </Paper>
                  )}
                </Stack>
              </Paper>
            </motion.div>
          ))}
        </Stack>
      ) : (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: '#FFFDF8',
            border: '1px dashed #E5D2B5',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Chưa có đánh giá nào
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
