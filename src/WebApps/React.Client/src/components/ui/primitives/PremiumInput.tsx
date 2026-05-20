import { Stack, TextField, Typography, type TextFieldProps } from '@mui/material';

type PremiumInputDensity = 'compact' | 'normal';

interface PremiumInputProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  density?: PremiumInputDensity;
  reserveHelperSpace?: boolean;
}

const densityConfig: Record<PremiumInputDensity, { minHeight: number; py: number }> = {
  compact: { minHeight: 44, py: 10 },
  normal: { minHeight: 48, py: 11.5 },
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
            color: 'text.primary',
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
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.02)',
            transition: 'all 200ms ease',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(212, 175, 55, 0.08)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.25), 0 10px 22px rgba(212, 175, 55, 0.12)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? undefined : 'rgba(212, 175, 55, 0.3)',
            transition: 'border-color 200ms ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? undefined : '#D4AF37',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? undefined : '#D4AF37',
          },
          '& .MuiOutlinedInput-input': {
            paddingTop: metrics.py,
            paddingBottom: metrics.py,
          },
          ...sx,
        }}
      />
      {(helperMessage || reserveHelperSpace) && (
        <Typography
          variant="caption"
          color={errorText ? 'error.main' : 'text.secondary'}
          sx={{ ml: 0.5, fontWeight: 500, minHeight: '1.1rem' }}
        >
          {helperMessage || ' '}
        </Typography>
      )}
    </Stack>
  );
}
