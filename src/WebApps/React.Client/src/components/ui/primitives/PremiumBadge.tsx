import { Chip, type ChipProps } from '@mui/material';

export default function PremiumBadge({ sx, ...props }: ChipProps) {
  return (
    <Chip
      {...props}
      size={props.size ?? 'small'}
      sx={{
        borderRadius: '9999px',
        height: 26,
        fontWeight: 600,
        letterSpacing: '0.01em',
        '& .MuiChip-label': {
          px: 1.15,
        },
        ...sx,
      }}
    />
  );
}
