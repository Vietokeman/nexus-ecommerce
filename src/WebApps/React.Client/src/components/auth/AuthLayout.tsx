import { lazy, Suspense, useEffect, useState } from 'react';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { nexus } from '@/theme/theme';
import { containerVariants, itemVariants } from '@/lib/motion';

const LazyLottie = lazy(() => import('lottie-react'));

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Split-screen auth layout:
 * - Left panel (desktop): dark gradient with branding + gradient cart logo
 * - Right panel: white form area with glassmorphism container
 */
export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let mounted = true;
    import('@/assets/animations/ecommerceOutlook.json').then((mod) => {
      if (mounted) {
        setAnimationData(mod.default);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Stack
      direction="row"
      sx={{
        width: '100vw',
        minHeight: '100dvh',
        overflow: 'hidden',
      }}
    >
      {/* ─── LEFT: Keep Lottie animation but load it lazily for faster first paint ─── */}
      {!isMobile && (
        <Stack
          flex={1}
          className="nx-auth-panel"
          justifyContent="center"
          alignItems="center"
          sx={{
            position: 'relative',
            px: 6,
            background:
              'radial-gradient(120% 120% at 20% 10%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%), linear-gradient(150deg, #3E2A25 0%, #5C4038 55%, #7B5748 100%)',
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <div className="nx-lottie-container">
              <Suspense
                fallback={
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '700px',
                      maxHeight: '700px',
                      borderRadius: 4,
                      background:
                        'radial-gradient(90% 90% at 50% 50%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) 100%)',
                    }}
                  />
                }
              >
                {animationData ? (
                  <LazyLottie
                    animationData={animationData}
                    loop
                    autoplay
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '700px',
                      maxHeight: '700px',
                    }}
                  />
                ) : null}
              </Suspense>
            </div>
          </motion.div>
        </Stack>
      )}

      {/* ─── RIGHT: Form panel ─── */}
      <Stack
        flex={1}
        justifyContent="center"
        alignItems="center"
        sx={{
          background:
            'radial-gradient(120% 120% at 0% 0%, rgba(213,171,163,0.2) 0%, rgba(247,243,238,0.72) 40%, rgba(247,243,238,0.95) 100%)',
          px: { xs: 2, sm: 5 },
          py: { xs: 5, md: 7 },
          overflowY: 'auto',
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: '28rem' }}
        >
          {/* Mobile-only logo */}
          {isMobile && (
            <motion.div variants={itemVariants}>
              <Stack alignItems="center" mb={4}>
                <Typography
                  variant="h4"
                  sx={{
                    background: nexus.gradient.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                  }}
                >
                  Nexus Commerce
                </Typography>
              </Stack>
            </motion.div>
          )}

          {/* Title */}
          {title && (
            <motion.div variants={itemVariants}>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  mb: 0.5,
                  color: nexus.neutral[900],
                  letterSpacing: '-0.02em',
                  textWrap: 'balance',
                }}
              >
                {title}
              </Typography>
            </motion.div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.div variants={itemVariants}>
              <Typography
                variant="body2"
                sx={{ mb: 3, color: nexus.neutral[600], maxWidth: '34ch' }}
              >
                {subtitle}
              </Typography>
            </motion.div>
          )}

          {/* Form content */}
          {children}
        </motion.div>
      </Stack>
    </Stack>
  );
}
