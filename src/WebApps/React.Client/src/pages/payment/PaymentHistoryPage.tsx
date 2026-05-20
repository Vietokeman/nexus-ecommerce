import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Chip, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
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
    queryFn: () =>
      api.get(API_ENDPOINTS.PAYMENT.USER(userId)).then((r) => r.data?.result || r.data || []),
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #1C1917 0%, #0D0C0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            Payment History
          </Typography>
          <Button
            component={Link}
            to="/orders"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: 999,
              borderColor: '#1C1917',
              color: '#1C1917',
              fontWeight: 600,
              px: 2,
              '&:hover': {
                borderColor: '#0A0A0A',
                background: 'rgba(28,25,23,0.05)',
              }
            }}
          >
            Back to Orders
          </Button>
        </Stack>

        {isLoading && <Typography color="text.secondary">Loading payment history...</Typography>}

        {!isLoading && payments.length === 0 && (
          <Paper
            className="nx-liquid-glass"
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: '24px',
              border: '1px dashed rgba(212, 175, 55, 0.3)',
              boxShadow: 'none',
            }}
          >
            <Typography color="text.secondary">No payment records found.</Typography>
          </Paper>
        )}

        {payments.map((payment, idx) => {
          const normalizedStatus = (payment.status || 'UNKNOWN').toUpperCase();
          return (
            <Paper
              key={`${payment.transactionId || payment.orderNo || 'payment'}-${idx}`}
              className="nx-liquid-glass"
              sx={{
                p: 3,
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 16px 32px -16px rgba(0, 0, 0, 0.05)',
                transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), border-color 300ms',
                '&:hover': {
                  borderColor: '#D4AF37',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <Stack direction={is700 ? 'column' : 'row'} justifyContent="space-between" gap={2}>
                <Stack>
                  <Typography fontWeight={700}>Order: {payment.orderNo || '-'}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Transaction: {payment.transactionId || '-'}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Created:{' '}
                    {payment.createdDate
                      ? new Date(payment.createdDate).toLocaleString('vi-VN')
                      : '-'}
                  </Typography>
                </Stack>
                <Stack alignItems={is700 ? 'flex-start' : 'flex-end'}>
                  <Typography fontWeight={800} sx={{ color: '#D4AF37' }}>${payment.amount ?? '-'}</Typography>
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
