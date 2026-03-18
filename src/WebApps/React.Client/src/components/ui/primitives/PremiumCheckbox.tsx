import { Checkbox, type CheckboxProps } from '@mui/material';

export default function PremiumCheckbox({ sx, ...props }: CheckboxProps) {
  return (
    <Checkbox
      {...props}
      sx={{
        p: 0.75,
        borderRadius: '10px',
        transition: 'all 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          backgroundColor: 'rgba(181, 108, 99, 0.09)',
        },
        ...sx,
      }}
    />
  );
}
