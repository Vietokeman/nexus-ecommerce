import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';

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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, maxWidth: 480 }} elevation={3}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Thank you for your purchase.
          </Typography>
          {orderNo && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Order: <strong>{orderNo}</strong>
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button variant="contained" onClick={() => navigate('/orders')}>
              View Orders
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
