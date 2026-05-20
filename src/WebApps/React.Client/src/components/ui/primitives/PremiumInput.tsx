import { Stack, TextField, Typography, type TextFieldProps } from '@mui/material';

type PremiumInputDensity = 'compact' | 'normal';

interface PremiumInputProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  density?: PremiumInputDensity;
  reserveHelperSpace?: boolean;
}

const densityConfig: Record<PremiumInputDensity, { minHeight: number; py: string }> = {
  compact: { minHeight: 44, py: '10px' },
  normal: { minHeight: 48, py: '12px' },
};

export default function PremiumInput({
  label,
  helperText,
  errorText,
  density = 'compact',
  reserveHelperSpace = true,
  sx,
  ...props
}: PremiumInputProps) {
  const hasError = Boolean(errorText) || Boolean(props.error);
  const helperMessage = errorText || helperText;
  const metrics = densityConfig[density];

  return (
    <Stack spacing={0.8}>
      {label && (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: '#FAF9F6',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </Typography>
      )}
      <TextField
        {...props}
        error={hasError}
        sx={{
          '& .MuiInputBase-root': {
            minHeight: metrics.minHeight,
            borderRadius: '12px',
            background: 'rgba(12, 10, 9, 0.45)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
            transition: 'all 200ms ease',
            color: '#FAF9F6',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.08)',
              background: 'rgba(12, 10, 9, 0.55)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.18), 0 10px 22px rgba(0, 0, 0, 0.2)',
              background: 'rgba(12, 10, 9, 0.6)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)',
            transition: 'border-color 200ms ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? 'rgba(239, 68, 68, 0.8)' : 'rgba(212, 175, 55, 0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? '#ef4444' : '#D4AF37',
            borderWidth: '1.5px',
          },
          '& .MuiOutlinedInput-input': {
            paddingTop: metrics.py,
            paddingBottom: metrics.py,
            color: '#FAF9F6',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.4)',
              opacity: 1,
            },
          },
          '& .MuiInputBase-input': {
            color: '#FAF9F6',
          },
          ...sx,
        }}
      />
      {(helperMessage || reserveHelperSpace) && (
        <Typography
          variant="caption"
          color={errorText ? 'error.main' : 'rgba(255, 255, 255, 0.45)'}
          sx={{ ml: 0.5, fontWeight: 500, minHeight: '1.1rem' }}
        >
          {helperMessage || ' '}
        </Typography>
      )}
    </Stack>
  );
}
