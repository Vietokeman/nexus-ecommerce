import { useRef } from 'react';
import { Button, type ButtonProps } from '@mui/material';
import { motion, useMotionValue, useSpring } from 'framer-motion';

import type { ElementType } from 'react';

export type PremiumButtonProps<C extends ElementType = 'button'> = ButtonProps<C> & {
  magnetic?: boolean;
};

export default function PremiumButton<C extends ElementType = 'button'>({
  magnetic = true,
  children,
  sx,
  ...props
}: PremiumButtonProps<C>) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 170, damping: 16, mass: 0.25 });
  const y = useSpring(my, { stiffness: 170, damping: 16, mass: 0.25 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    mx.set(dx * 0.12);
    my.set(dy * 0.12);
  };

  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div style={{ x, y }} onMouseMove={handleMove} onMouseLeave={reset}>
      <Button
        {...props}
        ref={ref}
        onBlur={reset}
        sx={{
          borderRadius: '9999px',
          px: 2.75,
          py: 1.15,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.01em',
          transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
          '&:active': { transform: 'translateY(1px) scale(0.985)' },
          ...sx,
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
}
