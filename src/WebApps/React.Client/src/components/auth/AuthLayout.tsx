import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import ecommerceAnimation from '@/assets/animations/ecommerceOutlook.json';
import { nexus } from '@/theme/theme';
import { containerVariants, itemVariants } from '@/lib/motion';

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

  return (
    <Stack
      direction="row"
      sx={{
        width: '100vw',
        minHeight: '100dvh',
        overflow: 'hidden',
      }}
    >
      {/* ─── LEFT: Dark branding panel with Lottie animation ─── */}
      {!isMobile && (
        <Stack
          flex={1}
          className="nx-auth-panel"
          justifyContent="center"
          alignItems="center"
          sx={{ position: 'relative' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%' }}
          >
            <div className="nx-lottie-container">
              <Lottie
                animationData={ecommerceAnimation}
                loop={true}
                autoplay={true}
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '700px',
                  maxHeight: '700px',
                }}
              />
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
              <Typography variant="body2" sx={{ mb: 3, color: nexus.neutral[600], maxWidth: '34ch' }}>
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
