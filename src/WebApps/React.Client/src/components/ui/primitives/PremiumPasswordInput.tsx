import { useState } from 'react';
import { IconButton, InputAdornment, type TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PremiumInput from './PremiumInput';

interface PremiumPasswordInputProps extends Omit<TextFieldProps, 'label'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  density?: 'compact' | 'normal';
}

export default function PremiumPasswordInput({
  label,
  helperText,
  errorText,
  density = 'normal',
  ...props
}: PremiumPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <PremiumInput
      {...props}
      type={showPassword ? 'text' : 'password'}
      label={label}
      helperText={helperText}
      errorText={errorText}
      density={density}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
              onMouseDown={(event) => event.preventDefault()}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
