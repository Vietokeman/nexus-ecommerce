import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import NexusCartLogo from './NexusCartLogo';
import { nexus } from '@/theme/theme';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/* ── Framer Motion variants for staggered entrance ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export { containerVariants, itemVariants };

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
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ─── LEFT: Dark branding panel ─── */}
      {!isMobile && (
        <Stack
          flex={1}
          className="nx-auth-panel"
          justifyContent="center"
          alignItems="center"
          sx={{ position: 'relative' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Stack alignItems="center" spacing={3}>
              <NexusCartLogo size={100} />
              <Typography
                variant="h3"
                sx={{
                  background: nexus.gradient.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                Nexus Commerce
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  maxWidth: '22rem',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                Where smart shopping meets seamless experience.
                Discover, compare, and shop with confidence.
              </Typography>

              {/* Decorative floating orbs */}
              <Box sx={{ position: 'absolute', top: '15%', left: '10%' }}>
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: nexus.purple[400],
                      opacity: 0.4,
                    }}
                  />
                </motion.div>
              </Box>
              <Box sx={{ position: 'absolute', bottom: '25%', right: '15%' }}>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1 }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: nexus.orange[400],
                      opacity: 0.35,
                    }}
                  />
                </motion.div>
              </Box>
              <Box sx={{ position: 'absolute', top: '55%', left: '20%' }}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: nexus.purple[300],
                      opacity: 0.3,
                    }}
                  />
                </motion.div>
              </Box>
            </Stack>
          </motion.div>
        </Stack>
      )}

      {/* ─── RIGHT: Form panel ─── */}
      <Stack
        flex={1}
        justifyContent="center"
        alignItems="center"
        sx={{
          px: { xs: 2, sm: 4 },
          py: 4,
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
              <Stack alignItems="center" mb={3}>
                <NexusCartLogo size={56} />
              </Stack>
            </motion.div>
          )}

          {/* Title */}
          {title && (
            <motion.div variants={itemVariants}>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mb: 0.5, color: nexus.neutral[900] }}
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
                sx={{ mb: 3, color: nexus.neutral[500] }}
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
