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
  compact: { minHeight: 44, py: 10.5 },
  normal: { minHeight: 52, py: 14 },
};

export default function PremiumInput({
  label,
  helperText,
  errorText,
  density = 'normal',
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
            borderRadius: 2,
            background: 'linear-gradient(180deg, rgba(255,255,255,1), rgba(255,251,245,0.92))',
            boxShadow: '0 6px 16px rgba(120, 94, 52, 0.05)',
            transition: 'box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              boxShadow: '0 8px 18px rgba(120, 94, 52, 0.09)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(181, 108, 99, 0.16), 0 10px 22px rgba(120, 94, 52, 0.11)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? undefined : '#E7D8C5',
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
