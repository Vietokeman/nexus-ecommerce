import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import orderSuccessAnimation from '@/assets/animations/orderSuccess.json';
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
          className="nx-liquid-glass"
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: '28px',
            maxWidth: 520,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 32px 64px -24px rgba(0, 0, 0, 0.15)',
          }}
          elevation={0}
        >
          <Box sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}>
            <Lottie animationData={orderSuccessAnimation} loop={false} />
          </Box>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            Order Placed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Your order has been confirmed successfully.
          </Typography>
          {orderNo && (
            <Typography
              variant="h6"
              sx={{
                my: 2,
                fontFamily: 'monospace',
                border: '1px dashed rgba(212, 175, 55, 0.4)',
                borderRadius: '12px',
                px: 2,
                py: 1,
                display: 'inline-block',
                bgcolor: 'rgba(212, 175, 55, 0.05)',
                color: '#CA8A04',
                fontWeight: 700,
              }}
            >
              {orderNo}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Check order status in my orders
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PremiumButton
              variant="contained"
              magnetic={false}
              onClick={() => navigate('/orders')}
              sx={{
                background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
                color: '#FAF9F6',
                borderRadius: 999,
                fontWeight: 700,
                px: 3.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                  color: '#0C0A09',
                }
              }}
            >
              Track Order
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
                px: 3.5,
                '&:hover': {
                  borderColor: '#0A0A0A',
                  background: 'rgba(28,25,23,0.05)',
                }
              }}
            >
              Continue Shopping
            </PremiumButton>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
