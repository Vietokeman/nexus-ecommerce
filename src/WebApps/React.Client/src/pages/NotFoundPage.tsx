import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { SentimentVeryDissatisfied } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <SentimentVeryDissatisfied sx={{ fontSize: 120, color: 'text.disabled', mb: 2 }} />
      </motion.div>
      <Typography variant="h2" fontWeight={800} gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" size="large" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </Box>
  );
}
