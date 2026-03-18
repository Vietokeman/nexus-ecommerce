import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import orderSuccessAnimation from '@/assets/animations/orderSuccess.json';
import { nexus } from '@/theme/theme';
import { PremiumButton } from '@/components/ui/primitives';

export default function OrderSuccessPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: { xs: 4, md: 6 } }}>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: nexus.radius.xl,
            maxWidth: 520,
            border: `1px solid ${nexus.neutral[200]}`,
            boxShadow: nexus.glass.shadow,
          }}
          elevation={0}
        >
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
            <PremiumButton variant="contained" magnetic={false} onClick={() => navigate('/orders')}>
              Track Order
            </PremiumButton>
            <PremiumButton variant="outlined" magnetic={false} onClick={() => navigate('/')}>
              Continue Shopping
            </PremiumButton>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
