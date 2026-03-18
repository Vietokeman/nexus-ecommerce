import { Box, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { PremiumButton } from '@/components/ui/primitives';
import { nexus } from '@/theme/theme';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: { xs: 3.5, md: 5 },
        borderRadius: nexus.radius.xl,
        background:
          'linear-gradient(145deg, rgba(255,253,250,0.9) 0%, rgba(247,241,236,0.84) 56%, rgba(234,220,212,0.82) 100%)',
        border: `1px solid ${nexus.neutral[200]}`,
        boxShadow: nexus.glass.shadow,
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -80,
          left: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(176,70,70,0.2) 0%, rgba(176,70,70,0) 72%)',
        },
      }}
    >
      <Box
        sx={{
          width: 74,
          height: 74,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          mb: 2,
          background: 'linear-gradient(145deg, rgba(176,70,70,0.16) 0%, rgba(176,70,70,0.05) 100%)',
          border: '1px solid rgba(176,70,70,0.22)',
        }}
      >
        <ErrorOutline sx={{ fontSize: 38, color: 'error.main' }} />
      </Box>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: nexus.neutral[900] }}>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.25, maxWidth: 460 }}>
        {error.message}
      </Typography>
      <PremiumButton variant="contained" onClick={resetErrorBoundary}>
        Try Again
      </PremiumButton>
    </Box>
  );
}
