import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, maxWidth: 480 }} elevation={3}>
          <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Payment Cancelled
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your payment was cancelled. No charges were made.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/cart')}>
              Back to Cart
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
