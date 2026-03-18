import { Tooltip, type TooltipProps } from '@mui/material';

export default function PremiumTooltip({ componentsProps, ...props }: TooltipProps) {
  return (
    <Tooltip
      {...props}
      arrow
      componentsProps={{
        ...componentsProps,
        tooltip: {
          ...componentsProps?.tooltip,
          sx: {
            backgroundColor: 'rgba(43, 33, 29, 0.94)',
            color: '#fffdfa',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 18px 45px -24px rgba(58, 40, 35, 0.36)',
            fontSize: '0.75rem',
            letterSpacing: '0.01em',
          },
        },
      }}
    />
  );
}
