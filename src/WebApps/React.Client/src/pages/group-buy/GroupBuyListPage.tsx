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
        background: nexus.gradient.button,
        color: '#fff',
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
          borderRadius: nexus.radius.xl,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: '#E7DAC5',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF6 100%)',
          transition: nexus.transition.base,
          '&:hover': {
            borderColor: '#D9BA89',
            boxShadow: '0 14px 30px rgba(124, 92, 52, 0.14)',
            transform: 'translateY(-4px)',
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
                background: nexus.gradient.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ${campaign.groupPrice.toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ textDecoration: 'line-through', color: nexus.neutral[400] }}
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
                bgcolor: '#FFF5E8',
                color: nexus.orange[700],
                fontWeight: 500,
                '& .MuiChip-icon': { color: nexus.orange[500] },
              }}
            />
            {daysLeft !== null && (
              <Chip
                size="small"
                icon={<TimerOutlinedIcon sx={{ fontSize: 16 }} />}
                label={daysLeft > 0 ? `${daysLeft}d left` : 'Ending today'}
                sx={{
                  bgcolor: daysLeft <= 1 ? '#FEF2F2' : nexus.orange[50],
                  color: daysLeft <= 1 ? '#DC2626' : nexus.orange[700],
                  fontWeight: 500,
                  '& .MuiChip-icon': { color: daysLeft <= 1 ? '#DC2626' : nexus.orange[500] },
                }}
              />
            )}
          </Stack>

          {/* CTA */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ color: nexus.orange[700], fontWeight: 700, fontSize: '0.875rem', mt: 1 }}
          >
            <Typography variant="body2" fontWeight={600}>
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
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          border: '1px solid #EEDFCB',
          background:
            'linear-gradient(145deg, rgba(255,248,236,0.9), rgba(240,251,248,0.88) 60%, rgba(255,255,255,0.96))',
          boxShadow: '0 16px 30px rgba(126, 93, 53, 0.1)',
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            background: nexus.gradient.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          Group Buy
        </Typography>
        <Typography variant="body1" color={nexus.neutral[500]}>
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
              fontWeight: 600,
              bgcolor: tab === t ? nexus.orange[700] : nexus.neutral[100],
              color: tab === t ? '#fff' : nexus.neutral[600],
              '&:hover': { bgcolor: tab === t ? nexus.orange[700] : nexus.neutral[200] },
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
