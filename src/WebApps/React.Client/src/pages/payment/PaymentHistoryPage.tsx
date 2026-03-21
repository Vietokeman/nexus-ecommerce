import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';

interface PaymentItem {
  orderNo?: string;
  status?: string;
  amount?: number;
  createdDate?: string;
  transactionId?: string;
}

const statusColorMap: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  PAID: 'success',
  SUCCESS: 'success',
  FAILED: 'error',
  CANCELLED: 'default',
};

export default function PaymentHistoryPage() {
  const user = useAuthStore((s) => s.user);
  const theme = useTheme();
  const is700 = useMediaQuery(theme.breakpoints.down(700));
  const userId = user?.id || '';

  const {
    data: payments = [],
    isError,
    isLoading,
  } = useQuery<PaymentItem[]>({
    queryKey: ['payment-history', userId],
    queryFn: () => api.get(API_ENDPOINTS.PAYMENT.USER(userId)).then((r) => r.data?.result || r.data || []),
    enabled: !!userId,
  });

  useEffect(() => {
    if (isError) {
      toast.error('Could not load payment history');
    }
  }, [isError]);

  return (
    <Stack alignItems="center" mb="5rem" mt={3} px={2}>
      <Stack width="100%" maxWidth="64rem" rowGap={2.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="h4" fontWeight={800}>
            Payment History
          </Typography>
          <Button component={Link} to="/orders" startIcon={<ArrowBackIcon />}>
            Back to Orders
          </Button>
        </Stack>

        {isLoading && <Typography color="text.secondary">Loading payment history...</Typography>}

        {!isLoading && payments.length === 0 && (
          <Paper sx={{ p: 3, borderRadius: 2.5, border: '1px solid #EADFCC' }}>
            <Typography>No payment records found.</Typography>
          </Paper>
        )}

        {payments.map((payment, idx) => {
          const normalizedStatus = (payment.status || 'UNKNOWN').toUpperCase();
          return (
            <Paper
              key={`${payment.transactionId || payment.orderNo || 'payment'}-${idx}`}
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                border: '1px solid #EADFCC',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF7 100%)',
              }}
            >
              <Stack direction={is700 ? 'column' : 'row'} justifyContent="space-between" gap={2}>
                <Stack>
                  <Typography fontWeight={700}>Order: {payment.orderNo || '-'}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Transaction: {payment.transactionId || '-'}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Created: {payment.createdDate ? new Date(payment.createdDate).toLocaleString('vi-VN') : '-'}
                  </Typography>
                </Stack>
                <Stack alignItems={is700 ? 'flex-start' : 'flex-end'}>
                  <Typography fontWeight={700}>${payment.amount ?? '-'}</Typography>
                  <Chip
                    size="small"
                    label={normalizedStatus}
                    color={statusColorMap[normalizedStatus] || 'default'}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}
