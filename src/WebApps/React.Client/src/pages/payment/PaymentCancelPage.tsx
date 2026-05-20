import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';
import { nexus } from '@/theme/theme';
import { PremiumButton } from '@/components/ui/primitives';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderNo = searchParams.get('orderNo');
    if (!orderNo) {
      return;
    }

    api.post(API_ENDPOINTS.PAYMENT.CANCEL(orderNo)).catch(() => {
      // no-op: this page is best-effort confirmation
    });
  }, [searchParams]);

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
            maxWidth: 480,
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
            <ErrorOutlineIcon sx={{ fontSize: 96, color: '#EF4444' }} />
          </motion.div>

          <Typography variant="h4" fontWeight={700} sx={{ color: nexus.neutral[900] }}>
            Payment Cancelled
          </Typography>

          <Typography variant="body1" sx={{ color: nexus.neutral[500] }}>
            Your payment was cancelled. No charges were made.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 2.5, width: '100%' }}
          >
            <PremiumButton
              variant="contained"
              magnetic={false}
              onClick={() => navigate('/cart')}
              sx={{
                background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
                color: '#FAF9F6',
                borderRadius: 999,
                fontWeight: 700,
                flex: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                  color: '#0C0A09',
                }
              }}
            >
              Back to Cart
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
                flex: 1,
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
