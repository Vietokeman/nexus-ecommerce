import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';
import { nexus } from '@/theme/theme';
import { PremiumButton } from '@/components/ui/primitives';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

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
            border: `1px solid ${nexus.neutral[200]}`,
            background:
              'radial-gradient(130% 130% at 0% 0%, rgba(176,70,70,0.16) 0%, rgba(255,253,250,0.82) 45%, rgba(247,243,238,0.9) 100%)',
            boxShadow: nexus.glass.shadow,
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2.5, width: '100%' }}>
            <PremiumButton variant="contained" magnetic={false} onClick={() => navigate('/cart')}>
              Back to Cart
            </PremiumButton>
            <PremiumButton variant="outlined" magnetic={false} onClick={() => navigate('/')}>
              Continue Shopping
            </PremiumButton>
          </Stack>
        </Stack>
      </motion.div>
    </Box>
  );
}
