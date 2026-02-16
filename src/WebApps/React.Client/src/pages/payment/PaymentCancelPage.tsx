import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';
import { nexus } from '@/theme/theme';

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

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate('/cart')}>
              Back to Cart
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
