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
      py={12}
      px={2}
      textAlign="center"
      sx={{
        borderRadius: nexus.radius.xl,
        background: 'rgba(255,253,250,0.72)',
        border: `1px solid ${nexus.neutral[200]}`,
        boxShadow: nexus.glass.shadow,
      }}
    >
      {children}
      <Typography
        variant="h5"
        fontWeight={600}
        mt={2}
        sx={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #F97316 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" mt={1}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <PremiumButton variant="contained" onClick={onAction} sx={{ mt: 3 }}>
          {actionLabel}
        </PremiumButton>
      )}
    </Box>
  );
}
