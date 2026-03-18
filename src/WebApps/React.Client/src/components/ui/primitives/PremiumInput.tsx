import { Stack, TextField, Typography, type TextFieldProps } from '@mui/material';

interface PremiumInputProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export default function PremiumInput({ label, helperText, errorText, sx, ...props }: PremiumInputProps) {
  const hasError = Boolean(errorText) || Boolean(props.error);

  return (
    <Stack spacing={0.75}>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {label}
        </Typography>
      )}
      <TextField
        {...props}
        error={hasError}
        sx={{
          '& .MuiInputBase-root': {
            minHeight: 50,
          },
          ...sx,
        }}
      />
      {(errorText || helperText) && (
        <Typography variant="caption" color={errorText ? 'error.main' : 'text.secondary'}>
          {errorText || helperText}
        </Typography>
      )}
    </Stack>
  );
}
