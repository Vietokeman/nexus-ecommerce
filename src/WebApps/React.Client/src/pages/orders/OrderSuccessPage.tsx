import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import orderSuccessAnimation from '@/assets/animations/orderSuccess.json';

export default function OrderSuccessPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, maxWidth: 520 }} elevation={3}>
          <Box sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}>
            <Lottie animationData={orderSuccessAnimation} loop={false} />
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Order Placed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Your order has been confirmed successfully.
          </Typography>
          {orderNo && (
            <Typography variant="h6" sx={{ my: 2, fontFamily: 'monospace' }}>
              {orderNo}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Check order status in my orders
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/orders')}>
              Track Order
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
