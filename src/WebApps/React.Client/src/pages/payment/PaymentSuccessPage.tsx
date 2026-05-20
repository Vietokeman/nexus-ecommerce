import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';
import { nexus } from '@/theme/theme';
import Spinner from '@/components/ui/Spinner';
import { PremiumButton } from '@/components/ui/primitives';
import { toast } from 'react-toastify';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(true);
  const [orderNo, setOrderNo] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const code = searchParams.get('orderCode') || searchParams.get('code');
    if (code) {
      api
        .get(API_ENDPOINTS.PAYMENT.STATUS_BY_CODE(Number(code)))
        .then(({ data }) => {
          setOrderNo(data.result?.orderNo || '');
          clearCart();
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      clearCart();
      setLoading(false);
    }
  }, [searchParams, clearCart]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: { xs: 5, md: 10 } }}>
        <Spinner />
      </Box>
    );
  }

  const handleCancelPayment = async () => {
    if (!orderNo) {
      toast.info('Missing order number for cancellation.');
      return;
    }

    setCancelling(true);
    try {
      await api.post(API_ENDPOINTS.PAYMENT.CANCEL(orderNo));
      toast.success('Payment cancellation request submitted.');
      navigate('/payment/cancel');
    } catch {
      toast.error('Could not cancel payment for this order.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: { xs: 4, md: 8 } }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Stack
          className="nx-liquid-glass"
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: '28px',
            maxWidth: 520,
            alignItems: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 32px 64px -24px rgba(0, 0, 0, 0.15)',
          }}
          spacing={2}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 96, color: '#10B981' }} />
          </motion.div>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Payment Successful!
          </Typography>

          <Typography variant="body1" sx={{ color: nexus.neutral[500] }}>
            Thank you for your purchase.
          </Typography>

          {orderNo && (
            <Typography variant="body2" sx={{ color: nexus.neutral[500] }}>
              Order: <strong style={{ color: '#D4AF37' }}>{orderNo}</strong>
            </Typography>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mt: 2.5, width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <PremiumButton
              variant="contained"
              magnetic={false}
              onClick={() => navigate('/orders')}
              sx={{
                background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
                color: '#FAF9F6',
                borderRadius: 999,
                fontWeight: 700,
                px: 2.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                  color: '#0C0A09',
                }
              }}
            >
              View Orders
            </PremiumButton>
            <PremiumButton
              variant="outlined"
              magnetic={false}
              onClick={() => navigate('/payment/history')}
              sx={{
                borderColor: '#1C1917',
                color: '#1C1917',
                borderRadius: 999,
                fontWeight: 700,
                px: 2.5,
                '&:hover': {
                  borderColor: '#0A0A0A',
                  background: 'rgba(28,25,23,0.05)',
                }
              }}
            >
              Payment History
            </PremiumButton>
            <PremiumButton
              variant="outlined"
              magnetic={false}
              onClick={handleCancelPayment}
              disabled={cancelling}
              sx={{
                borderColor: '#ef4444',
                color: '#ef4444',
                borderRadius: 999,
                fontWeight: 700,
                px: 2.5,
                '&:hover': {
                  borderColor: '#dc2626',
                  background: 'rgba(239,68,68,0.05)',
                }
              }}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Payment'}
            </PremiumButton>
            <PremiumButton
              variant="outlined"
              magnetic={false}
              onClick={() => navigate('/')}
              sx={{
                borderColor: '#1C1917',
                color: '#1C1917',
                borderRadius: 999,
                fontWeight: 700,
                px: 2.5,
                '&:hover': {
                  borderColor: '#0A0A0A',
                  background: 'rgba(28,25,23,0.05)',
                }
              }}
            >
              Continue Shopping
            </PremiumButton>
          </Stack>
        </Stack>
      </motion.div>
    </Box>
  );
}
