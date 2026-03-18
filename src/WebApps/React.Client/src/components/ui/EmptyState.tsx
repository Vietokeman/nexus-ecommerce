import { Box, Typography } from '@mui/material';
import { PremiumButton } from '@/components/ui/primitives';
import { nexus } from '@/theme/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={{ xs: 9, md: 12 }}
      px={{ xs: 2.5, md: 4 }}
      textAlign="center"
      sx={{
        borderRadius: nexus.radius.xl,
        background:
          'radial-gradient(120% 120% at 0% 0%, rgba(203,148,139,0.22) 0%, rgba(255,253,250,0.86) 42%, rgba(242,237,231,0.9) 100%)',
        border: `1px solid ${nexus.neutral[200]}`,
        boxShadow: nexus.glass.shadow,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          top: -70,
          right: -60,
          background: 'radial-gradient(circle, rgba(213,171,163,0.45) 0%, rgba(213,171,163,0) 70%)',
        },
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          mb: 1,
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(140deg, rgba(203,148,139,0.22) 0%, rgba(181,108,99,0.1) 100%)',
          border: `1px solid ${nexus.neutral[200]}`,
        }}
      >
        {children}
      </Box>
      <Typography
        variant="h5"
        fontWeight={600}
        mt={1.5}
        sx={{
          background: 'linear-gradient(140deg, #6E3A35 0%, #9A5852 52%, #B56C63 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          maxWidth: 560,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" mt={1} sx={{ maxWidth: 560 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <PremiumButton variant="contained" onClick={onAction} sx={{ mt: 3.5 }}>
          {actionLabel}
        </PremiumButton>
      )}
    </Box>
  );
}
