import { Chip, type ChipProps } from '@mui/material';

export default function PremiumBadge({ sx, ...props }: ChipProps) {
  return (
    <Chip
      {...props}
      size={props.size ?? 'small'}
      sx={{
        borderRadius: '9999px',
        height: 27,
        fontWeight: 700,
        letterSpacing: '0.01em',
        border: '1px solid rgba(233, 220, 201, 0.95)',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8ED 100%)',
        boxShadow: '0 8px 16px rgba(124, 92, 52, 0.08)',
        '& .MuiChip-label': {
          px: 1.15,
        },
        ...sx,
      }}
    />
  );
}
