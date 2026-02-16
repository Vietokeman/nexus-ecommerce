import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { motion } from 'framer-motion';
import { nexus } from '@/theme/theme';
import {
  useFlashSaleSession,
  useFlashSaleStock,
  useFlashSalePurchase,
} from '@/hooks/useFlashSale';
import { useAuthStore } from '@/store/auth-store';
import { containerVariants, itemVariants } from '@/components/auth/AuthLayout';
import { toast } from 'react-toastify';
import type { FlashSaleItem } from '@/types/flash-sale';

/* ── Countdown hook ── */
function useCountdown(endTime: string) {
  const calcRemaining = useCallback(() => {
    return Math.max(0, new Date(endTime).getTime() - Date.now());
  }, [endTime]);

  const [ms, setMs] = useState(calcRemaining);

  useEffect(() => {
    const id = setInterval(() => setMs(calcRemaining()), 1000);
    return () => clearInterval(id);
  }, [calcRemaining]);

  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return { h, m, s, expired: ms <= 0 };
}

/* ── Digit box ── */
function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <Stack alignItems="center" spacing={0.25}>
      <Box
        sx={{
          width: 52,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: nexus.radius.md,
          background: nexus.gradient.button,
          color: '#fff',
          fontWeight: 800,
          fontSize: '1.4rem',
          fontFamily: 'monospace',
        }}
      >
        {String(value).padStart(2, '0')}
      </Box>
      <Typography variant="caption" fontWeight={500} color={nexus.neutral[500]}>
        {label}
      </Typography>
    </Stack>
  );
}

/* ── Item Card ── */
function FlashItemCard({ item }: { item: FlashSaleItem }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const purchase = useFlashSalePurchase();
  const { data: stockData } = useFlashSaleStock(item.id);
  const remaining = stockData?.remainingStock ?? item.totalStock - item.soldQuantity;
  const soldPct = ((item.totalStock - remaining) / item.totalStock) * 100;
  const discount = Math.round(
    ((item.originalPrice - item.flashPrice) / item.originalPrice) * 100,
  );

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await purchase.mutateAsync({
        itemId: item.id,
        userName: user.userName,
        quantity: 1,
      });
      toast.success('Purchase confirmed! Proceed to payment.');
      navigate('/checkout');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Purchase failed';
      toast.error(msg);
    }
  };

  const soldOut = remaining <= 0;

  return (
    <motion.div variants={itemVariants}>
      <Box
        sx={{
          borderRadius: nexus.radius.xl,
          border: '1px solid',
          borderColor: nexus.neutral[200],
          overflow: 'hidden',
          transition: nexus.transition.base,
          '&:hover': {
            borderColor: nexus.purple[300],
            boxShadow: `0 8px 30px ${nexus.purple[100]}`,
            transform: 'translateY(-4px)',
          },
          opacity: soldOut ? 0.6 : 1,
        }}
      >
        {/* Image */}
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '1/1',
            bgcolor: nexus.neutral[100],
            overflow: 'hidden',
          }}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Stack justifyContent="center" alignItems="center" height="100%">
              <BoltIcon sx={{ fontSize: 48, color: nexus.orange[300] }} />
            </Stack>
          )}

          {/* Discount badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              px: 1.5,
              py: 0.5,
              borderRadius: nexus.radius.pill,
              background: '#EF4444',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            -{discount}%
          </Box>

          {soldOut && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h5" fontWeight={800} color="#fff">
                SOLD OUT
              </Typography>
            </Box>
          )}
        </Box>

        {/* Info */}
        <Stack spacing={1.5} sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} color={nexus.neutral[900]} noWrap>
            {item.productName}
          </Typography>

          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                background: nexus.gradient.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ${item.flashPrice.toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textDecoration: 'line-through', color: nexus.neutral[400] }}
            >
              ${item.originalPrice.toFixed(2)}
            </Typography>
          </Stack>

          {/* Progress bar */}
          <Stack spacing={0.5}>
            <Box
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: nexus.neutral[200],
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.min(100, soldPct)}%`,
                  background: soldPct >= 80 ? '#EF4444' : nexus.gradient.button,
                  borderRadius: 5,
                  transition: 'width 0.5s ease',
                }}
              />
            </Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" fontWeight={600} color={nexus.neutral[500]}>
                {Math.round(soldPct)}% sold
              </Typography>
              <Typography variant="caption" fontWeight={600} color={nexus.neutral[500]}>
                {remaining} left
              </Typography>
            </Stack>
          </Stack>

          <Typography variant="caption" color={nexus.neutral[400]}>
            Max {item.maxPerUser} per user
          </Typography>

          <Button
            variant="contained"
            fullWidth
            disabled={soldOut || purchase.isPending}
            onClick={handleBuy}
            startIcon={<ShoppingCartOutlinedIcon />}
            sx={{
              background: soldOut ? nexus.neutral[300] : nexus.gradient.button,
              fontWeight: 700,
              borderRadius: nexus.radius.lg,
              '&:hover': { opacity: 0.9 },
            }}
          >
            {soldOut ? 'Sold Out' : purchase.isPending ? 'Buying...' : 'Buy Now'}
          </Button>
        </Stack>
      </Box>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function FlashSaleDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const id = Number(sessionId) || 0;
  const { data: session, isLoading, error } = useFlashSaleSession(id);

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress sx={{ color: nexus.purple[600] }} />
      </Stack>
    );
  }

  if (error || !session) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <Alert severity="error">Flash sale not found.</Alert>
      </Stack>
    );
  }

  const isActive = session.status === 'Active';
  const items = session.items ?? [];

  return (
    <Stack sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }} spacing={4}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: nexus.radius.xl,
              background: nexus.gradient.dark,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BoltIcon sx={{ color: nexus.orange[400], fontSize: 32 }} />
                  <Typography variant="h4" fontWeight={800}>
                    {session.name}
                  </Typography>
                </Stack>
                {session.description && (
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {session.description}
                  </Typography>
                )}
                <Chip
                  label={isActive ? 'LIVE NOW' : session.status}
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: isActive ? '#10B981' : nexus.neutral[600],
                    color: '#fff',
                    fontWeight: 700,
                    animation: isActive ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                    },
                  }}
                />
              </Stack>

              {isActive && <CountdownSection endTime={session.endTime} />}
            </Stack>
          </Box>
        </motion.div>

        {/* Items Grid */}
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
              mt: 4,
            }}
          >
            {items.map((item) => (
              <FlashItemCard key={item.id} item={item} />
            ))}
          </Box>
        </motion.div>

        {items.length === 0 && (
          <Stack alignItems="center" py={8}>
            <Typography color={nexus.neutral[500]}>No items in this sale yet.</Typography>
          </Stack>
        )}
      </motion.div>
    </Stack>
  );
}

function CountdownSection({ endTime }: { endTime: string }) {
  const { h, m, s, expired } = useCountdown(endTime);

  if (expired) {
    return (
      <Chip label="ENDED" sx={{ bgcolor: '#EF4444', color: '#fff', fontWeight: 700 }} />
    );
  }

  return (
    <Stack alignItems="center" spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
        ENDS IN
      </Typography>
      <Stack direction="row" spacing={1}>
        <TimeBox value={h} label="HRS" />
        <TimeBox value={m} label="MIN" />
        <TimeBox value={s} label="SEC" />
      </Stack>
    </Stack>
  );
}
