import { Box, Stack } from '@mui/material';
import { nexus } from '@/theme/theme';

export default function Spinner() {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      spacing={2}
      sx={{
        px: 2,
      }}
    >
      <Box
        sx={{
          width: 82,
          height: 82,
          borderRadius: '50%',
          border: `2px solid ${nexus.neutral[300]}`,
          borderTopColor: nexus.orange[500],
          borderRightColor: '#0F766E',
          animation: 'nx-spin 1.1s linear infinite',
          position: 'relative',
          boxShadow: '0 12px 24px rgba(126, 96, 54, 0.16)',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 9,
            borderRadius: '50%',
            border: `2px solid rgba(181,108,99,0.22)`,
            borderTopColor: nexus.neutral[800],
            animation: 'nx-spin 1.8s linear infinite reverse',
          },
        }}
      />
      <Box
        sx={{
          width: { xs: 230, sm: 350 },
          height: 14,
          borderRadius: '9999px',
          background: `linear-gradient(90deg, ${nexus.neutral[100]} 0%, ${nexus.orange[200]} 35%, #D3F3EE 70%, ${nexus.neutral[100]} 100%)`,
          backgroundSize: '200% 100%',
          animation: 'nx-shimmer 1.4s linear infinite',
        }}
      />
      <Box
        sx={{
          width: { xs: 180, sm: 260 },
          height: 10,
          borderRadius: '9999px',
          background: `linear-gradient(90deg, ${nexus.neutral[100]} 0%, #F7E8CE 50%, ${nexus.neutral[100]} 100%)`,
          backgroundSize: '200% 100%',
          animation: 'nx-shimmer 1.4s linear infinite',
          animationDelay: '120ms',
        }}
      />
      <Box
        sx={{
          width: { xs: 130, sm: 190 },
          height: 8,
          borderRadius: '9999px',
          background: `linear-gradient(90deg, ${nexus.neutral[100]} 0%, ${nexus.orange[100]} 50%, ${nexus.neutral[100]} 100%)`,
          backgroundSize: '200% 100%',
          animation: 'nx-shimmer 1.4s linear infinite',
          animationDelay: '240ms',
        }}
      />
    </Stack>
  );
}
