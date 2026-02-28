import { Link } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import notFoundPageAnimation from '@/assets/animations/notFoundPage.json';
import { nexus } from '@/theme/theme';

export default function NotFoundPage() {
  return (
    <Stack justifyContent="center" alignItems="center" height="calc(100vh - 4rem)" sx={{ px: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack spacing={2} justifyContent="center" alignItems="center">
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

          <Button
            sx={{ mt: 2, height: '3rem', px: 4 }}
            size="large"
            component={Link}
            to="/"
            variant="contained"
          >
            Back to Home
          </Button>
        </Stack>
      </motion.div>
    </Stack>
  );
}
