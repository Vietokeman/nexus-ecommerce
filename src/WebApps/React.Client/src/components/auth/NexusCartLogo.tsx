import { Box } from '@mui/material';
import { nexus } from '@/theme/theme';

interface NexusCartLogoProps {
  size?: number;
}

/**
 * Pure-CSS gradient shopping cart logo for the Nexus Commerce brand.
 * No external images required — fully rendered with SVG + gradient.
 */
export default function NexusCartLogo({ size = 80 }: NexusCartLogoProps) {
  const id = 'nx-cart-gradient';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 4px 16px rgba(124, 58, 237, 0.3))',
      }}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={nexus.purple[500]} />
            <stop offset="50%" stopColor={nexus.purple[400]} />
            <stop offset="100%" stopColor={nexus.orange[500]} />
          </linearGradient>
        </defs>
        {/* Cart body */}
        <path
          d="M10 12h6l8 32h24l6-20H22"
          stroke={`url(#${id})`}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Cart wheels */}
        <circle cx="26" cy="52" r="4" fill={`url(#${id})`} />
        <circle cx="44" cy="52" r="4" fill={`url(#${id})`} />
        {/* Plus accent */}
        <line
          x1="40"
          y1="16"
          x2="40"
          y2="28"
          stroke={`url(#${id})`}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="34"
          y1="22"
          x2="46"
          y2="22"
          stroke={`url(#${id})`}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );
}
