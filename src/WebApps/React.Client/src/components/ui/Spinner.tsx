import { Box, Stack } from '@mui/material';
import { nexus } from '@/theme/theme';

export default function Spinner() {
  return (
    <Stack justifyContent="center" alignItems="center" minHeight="60vh" spacing={1.2}>
      <Box
        sx={{
          width: { xs: 220, sm: 340 },
          height: 16,
          borderRadius: '9999px',
          background: `linear-gradient(90deg, ${nexus.neutral[100]} 0%, ${nexus.purple[100]} 50%, ${nexus.neutral[100]} 100%)`,
          backgroundSize: '200% 100%',
          animation: 'nx-shimmer 1.4s linear infinite',
        }}
      />
      <Box
        sx={{
          width: { xs: 180, sm: 260 },
          height: 12,
          borderRadius: '9999px',
          background: `linear-gradient(90deg, ${nexus.neutral[100]} 0%, ${nexus.purple[100]} 50%, ${nexus.neutral[100]} 100%)`,
          backgroundSize: '200% 100%',
          animation: 'nx-shimmer 1.4s linear infinite',
          animationDelay: '120ms',
        }}
      />
    </Stack>
  );
}
