import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, AnimatePresence } from 'framer-motion';
import { nexus } from '@/theme/theme';
import { useActiveGroupBuyCampaigns } from '@/hooks/useGroupBuy';
import type { GroupBuyCampaign } from '@/types/group-buy';
import ImageFallback from '@/components/ui/ImageFallback';
import { LAYERS } from '@/lib/layers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function DiscountBadge({ original, group }: { original: number; group: number }) {
  const pct = Math.round(((original - group) / original) * 100);
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        px: 1.5,
        py: 0.5,
        borderRadius: nexus.radius.pill,
        background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
        color: '#0C0A09',
        fontWeight: 700,
        fontSize: '0.75rem',
        zIndex: LAYERS.base,
      }}
    >
      -{pct}%
    </Box>
  );
}

function CampaignCard({ campaign }: { campaign: GroupBuyCampaign }) {
  const deadline = campaign.endDate ? new Date(campaign.endDate) : null;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <motion.div variants={cardVariants}>
      <Box
        component={Link}
        to={`/group-buy/${campaign.id}`}
        sx={{
          display: 'block',
          textDecoration: 'none',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 12px 32px -16px rgba(0, 0, 0, 0.08)',
          transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1), border-color 350ms, box-shadow 350ms',
          '&:hover': {
            transform: 'translateY(-6px)',
            borderColor: '#D4AF37',
            boxShadow: '0 24px 48px -18px rgba(212, 175, 55, 0.25)',
          },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '16/10',
            overflow: 'hidden',
            bgcolor: nexus.neutral[100],
          }}
        >
          <DiscountBadge original={campaign.originalPrice} group={campaign.groupPrice} />
          {campaign.imageUrl ? (
            <ImageFallback
              src={campaign.imageUrl}
              alt={campaign.productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Stack justifyContent="center" alignItems="center" height="100%">
              <GroupsOutlinedIcon sx={{ fontSize: 48, color: nexus.orange[300] }} />
            </Stack>
          )}
        </Box>

        {/* Info */}
        <Stack spacing={1.5} sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} color={nexus.neutral[900]} noWrap>
            {campaign.productName}
          </Typography>
          {campaign.name && (
            <Typography variant="body2" color={nexus.neutral[500]} noWrap>
              {campaign.name}
            </Typography>
          )}

          {/* Prices */}
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ${campaign.groupPrice.toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textDecoration: 'line-through', color: '#8A8576' }}
            >
              ${campaign.originalPrice.toFixed(2)}
            </Typography>
          </Stack>

          {/* Meta */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip
              size="small"
              icon={<GroupsOutlinedIcon sx={{ fontSize: 16 }} />}
              label={`Min ${campaign.minParticipants} people`}
              sx={{
                bgcolor: 'rgba(212,175,55,0.08)',
                color: '#CA8A04',
                fontWeight: 600,
                border: '1px solid rgba(212,175,55,0.2)',
                '& .MuiChip-icon': { color: '#D4AF37' },
              }}
            />
            {daysLeft !== null && (
              <Chip
                size="small"
                icon={<TimerOutlinedIcon sx={{ fontSize: 16 }} />}
                label={daysLeft > 0 ? `${daysLeft}d left` : 'Ending today'}
                sx={{
                  bgcolor: daysLeft <= 1 ? 'rgba(239,68,68,0.08)' : 'rgba(28,25,23,0.05)',
                  color: daysLeft <= 1 ? '#DC2626' : '#1C1917',
                  fontWeight: 600,
                  border: daysLeft <= 1 ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(28,25,23,0.1)',
                  '& .MuiChip-icon': { color: daysLeft <= 1 ? '#DC2626' : '#1C1917' },
                }}
              />
            )}
          </Stack>

          {/* CTA */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.875rem', mt: 1, '&:hover': { color: '#CA8A04' } }}
          >
            <Typography variant="body2" fontWeight={700}>
              View & Start Group
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Stack>
        </Stack>
      </Box>
    </motion.div>
  );
}

export default function GroupBuyListPage() {
  const { data: campaigns, isLoading, error } = useActiveGroupBuyCampaigns();
  const [tab, setTab] = useState<'active' | 'all'>('active');

  return (
    <Stack
      spacing={4}
      sx={{
        px: { xs: 2, md: 4 },
        py: 4,
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      {/* Header */}
      <Stack
        spacing={1}
        className="nx-liquid-glass"
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 48px -20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Group Buy Campaigns
        </Typography>
        <Typography variant="body1" color="#5C584E">
          Team up with others. Save together. The more people join, the lower the price.
        </Typography>
      </Stack>

      {/* Tabs */}
      <Stack direction="row" spacing={1}>
        {(['active', 'all'] as const).map((t) => (
          <Chip
            key={t}
            label={t === 'active' ? 'Active Campaigns' : 'All Campaigns'}
            onClick={() => setTab(t)}
            sx={{
              fontWeight: 700,
              bgcolor: tab === t ? '#1C1917' : 'rgba(255, 255, 255, 0.6)',
              color: tab === t ? '#FAF9F6' : '#1C1917',
              border: '1px solid rgba(28,25,23,0.1)',
              '&:hover': { bgcolor: tab === t ? '#0A0A0A' : 'rgba(255, 255, 255, 0.8)' },
            }}
          />
        ))}
      </Stack>

      {/* Content */}
      {isLoading ? (
        <Stack alignItems="center" py={8}>
          <CircularProgress sx={{ color: nexus.orange[600] }} />
        </Stack>
      ) : error ? (
        <Alert severity="error">Failed to load campaigns. Please try again.</Alert>
      ) : !campaigns?.length ? (
        <Stack alignItems="center" py={8} spacing={2}>
          <GroupsOutlinedIcon sx={{ fontSize: 64, color: nexus.neutral[300] }} />
          <Typography color={nexus.neutral[500]}>No active campaigns right now.</Typography>
        </Stack>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </Box>
          </motion.div>
        </AnimatePresence>
      )}
    </Stack>
  );
}
