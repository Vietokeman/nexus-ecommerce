import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Verified } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function OrderSuccessPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  return (
    <>
      <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, maxWidth: 520 }} elevation={3}>
            <Verified sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
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
              We'll send you an email with tracking details once your order ships.
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
    </>
  );
}
