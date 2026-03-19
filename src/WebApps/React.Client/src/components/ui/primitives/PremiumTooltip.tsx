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
            backgroundColor: 'rgba(56, 40, 33, 0.96)',
            color: '#fffdfa',
            border: '1px solid rgba(244, 223, 188, 0.34)',
            boxShadow: '0 18px 45px -22px rgba(58, 40, 35, 0.45)',
            fontSize: '0.76rem',
            letterSpacing: '0.01em',
            fontWeight: 500,
          },
        },
      }}
    />
  );
}
