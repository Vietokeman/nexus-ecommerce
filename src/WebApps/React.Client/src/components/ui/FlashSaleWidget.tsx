import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { nexus } from '@/theme/theme';
import type { FlashSaleItem, FlashSaleSession } from '@/types/flash-sale';

interface FlashSaleWidgetProps {
  session: FlashSaleSession;
  onItemClick?: (item: FlashSaleItem) => void;
}

/* ── Countdown helper ── */
function useCountdown(endTime: string) {
  const target = useMemo(() => new Date(endTime).getTime(), [endTime]);
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target, remaining]);

  const hrs = Math.floor(remaining / 3_600_000);
  const mins = Math.floor((remaining % 3_600_000) / 60_000);
  const secs = Math.floor((remaining % 60_000) / 1_000);

  return { hrs, mins, secs, isExpired: remaining <= 0 };
}

/* ── Countdown digit box ── */
function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <Stack alignItems="center" spacing={0.25}>
      <Box
        sx={{
          background: nexus.gradient.button,
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.25rem',
          borderRadius: nexus.radius.sm,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
        }}
      >
        {String(value).padStart(2, '0')}
      </Box>
      <Typography variant="caption" sx={{ color: nexus.neutral[500], fontWeight: 500 }}>
        {label}
      </Typography>
    </Stack>
  );
}

/**
 * Flash Sale "Deal of the Hour" widget.
 * Shows a countdown timer + items with gradient progress bars.
 */
export default function FlashSaleWidget({ session, onItemClick }: FlashSaleWidgetProps) {
  const { hrs, mins, secs, isExpired } = useCountdown(session.endTime);
  const items = session.items || [];

  if (isExpired || items.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 4,
              height: 32,
              borderRadius: 2,
              background: nexus.gradient.button,
            }}
          />
          <Typography variant="h5" fontWeight={700} sx={{ color: nexus.neutral[900] }}>
            Deal of the Hour
          </Typography>
          <Chip
            label="FLASH SALE"
            size="small"
            color="primary"
            sx={{ fontWeight: 700, letterSpacing: '0.05em' }}
          />
        </Stack>

        {/* Countdown */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TimeBox value={hrs} label="Hours" />
          <Typography variant="h6" sx={{ color: nexus.purple[500], fontWeight: 700, pb: 2 }}>
            :
          </Typography>
          <TimeBox value={mins} label="Mins" />
          <Typography variant="h6" sx={{ color: nexus.purple[500], fontWeight: 700, pb: 2 }}>
            :
          </Typography>
          <TimeBox value={secs} label="Secs" />
        </Stack>
      </Stack>

      {/* Items grid */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': {
            background: nexus.purple[300],
            borderRadius: 9999,
          },
        }}
      >
        {items.map((item) => {
          const soldPercent = item.totalStock > 0
            ? Math.min(100, (item.soldQuantity / item.totalStock) * 100)
            : 0;
          const discount = item.originalPrice > 0
            ? Math.round(((item.originalPrice - item.flashPrice) / item.originalPrice) * 100)
            : 0;

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              style={{ minWidth: 220 }}
            >
              <Card
                onClick={() => onItemClick?.(item)}
                sx={{
                  cursor: 'pointer',
                  overflow: 'hidden',
                  border: `1px solid ${nexus.neutral[200]}`,
                  '&:hover': {
                    borderColor: nexus.purple[300],
                    boxShadow: nexus.glass.shadowHover,
                  },
                }}
              >
                {/* Image */}
                <Box sx={{ position: 'relative', pt: '100%', bgcolor: nexus.neutral[100] }}>
                  {item.imageUrl ? (
                    <CardMedia
                      component="img"
                      image={item.imageUrl}
                      alt={item.productName}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Stack
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="h3" sx={{ color: nexus.neutral[300] }}>
                        🛒
                      </Typography>
                    </Stack>
                  )}

                  {/* Discount badge */}
                  {discount > 0 && (
                    <Chip
                      label={`-${discount}%`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: nexus.gradient.button,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>

                {/* Info */}
                <Stack sx={{ p: 1.5 }} spacing={0.5}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    sx={{ color: nexus.neutral[900] }}
                  >
                    {item.productName}
                  </Typography>

                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{
                        background: nexus.gradient.primary,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      ${item.flashPrice.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: 'line-through',
                        color: nexus.neutral[400],
                      }}
                    >
                      ${item.originalPrice.toFixed(2)}
                    </Typography>
                  </Stack>

                  {/* Progress bar */}
                  <Box sx={{ mt: 0.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={soldPercent}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: nexus.neutral[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: nexus.gradient.button,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: nexus.neutral[500], mt: 0.25, display: 'block' }}
                    >
                      {item.soldQuantity}/{item.totalStock} sold
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </motion.div>
          );
        })}
      </Stack>
    </Box>
  );
}
