import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import notFoundPageAnimation from '@/assets/animations/notFoundPage.json';
import { nexus } from '@/theme/theme';
import { PremiumButton } from '@/components/ui/primitives';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100dvh - 4rem)"
      sx={{ px: 2, py: { xs: 4, md: 8 } }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack
          className="nx-liquid-glass"
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 6 },
            borderRadius: '28px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 32px 64px -24px rgba(0, 0, 0, 0.15)',
            maxWidth: 640,
          }}
        >
          <Stack width={{ xs: '16rem', md: '22rem' }}>
            <Lottie animationData={notFoundPageAnimation} />
          </Stack>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}
          >
            404 — Page Not Found
          </Typography>
          <Typography variant="body1" sx={{ color: nexus.neutral[500], textAlign: 'center' }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </Typography>

          <PremiumButton
            sx={{
              mt: 2.5,
              height: '3rem',
              px: 4,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
              color: '#FAF9F6',
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                color: '#0C0A09',
              }
            }}
            size="large"
            onClick={() => navigate('/')}
            variant="contained"
          >
            Back to Home
          </PremiumButton>
        </Stack>
      </motion.div>
    </Stack>
  );
}
