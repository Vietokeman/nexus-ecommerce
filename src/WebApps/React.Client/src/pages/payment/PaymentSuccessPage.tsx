import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';
import { nexus } from '@/theme/theme';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(true);
  const [orderNo, setOrderNo] = useState('');

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
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress sx={{ color: nexus.purple[500] }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: { xs: 4, md: 8 } }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Stack
          className="nx-glass"
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: nexus.radius.xl,
            maxWidth: 480,
            alignItems: 'center',
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
            fontWeight={700}
            sx={{
              background: nexus.gradient.primary,
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
              Order: <strong style={{ color: nexus.neutral[900] }}>{orderNo}</strong>
            </Typography>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate('/orders')}>
              View Orders
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </Stack>
        </Stack>
      </motion.div>
    </Box>
  );
}
