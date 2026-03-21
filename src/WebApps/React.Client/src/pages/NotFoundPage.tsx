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
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 6 },
            borderRadius: nexus.radius.xl,
            background:
              'radial-gradient(120% 120% at 0% 0%, rgba(203,148,139,0.2) 0%, rgba(255,253,250,0.85) 42%, rgba(247,243,238,0.92) 100%)',
            border: `1px solid ${nexus.neutral[200]}`,
            boxShadow: nexus.glass.shadow,
            maxWidth: 640,
          }}
        >
          <Stack width={{ xs: '16rem', md: '22rem' }}>
            <Lottie animationData={notFoundPageAnimation} />
          </Stack>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: nexus.gradient.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
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
              boxShadow: '0 14px 24px -16px rgba(154, 88, 82, 0.75)',
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
