import { Stack, TextField, Typography, type TextFieldProps } from '@mui/material';

interface PremiumInputProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export default function PremiumInput({ label, helperText, errorText, sx, ...props }: PremiumInputProps) {
  const hasError = Boolean(errorText) || Boolean(props.error);

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
            minHeight: 52,
            borderRadius: 2,
            background: 'linear-gradient(180deg, rgba(255,255,255,1), rgba(255,251,245,0.92))',
            boxShadow: '0 8px 20px rgba(120, 94, 52, 0.06)',
            transition: 'box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              boxShadow: '0 10px 22px rgba(120, 94, 52, 0.1)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(181, 108, 99, 0.18), 0 14px 24px rgba(120, 94, 52, 0.12)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? undefined : '#E7D8C5',
          },
          '& .MuiOutlinedInput-input': {
            paddingTop: 14,
            paddingBottom: 14,
          },
          ...sx,
        }}
      />
      {(errorText || helperText) && (
        <Typography
          variant="caption"
          color={errorText ? 'error.main' : 'text.secondary'}
          sx={{ ml: 0.5, fontWeight: 500 }}
        >
          {errorText || helperText}
        </Typography>
      )}
    </Stack>
  );
}
