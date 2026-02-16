import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShareIcon from '@mui/icons-material/Share';
import { motion } from 'framer-motion';
import { nexus } from '@/theme/theme';
import { useGroupBuyCampaign, useOpenGroup } from '@/hooks/useGroupBuy';
import { useAuthStore } from '@/store/auth-store';
import { containerVariants, itemVariants } from '@/lib/motion';
import { toast } from 'react-toastify';

export default function GroupBuyCampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const id = Number(campaignId) || 0;
  const { data: campaign, isLoading, error } = useGroupBuyCampaign(id);
  const openGroup = useOpenGroup();
  const [createdSession, setCreatedSession] = useState<{
    inviteCode: string;
    deadline: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleStartGroup = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const session = await openGroup.mutateAsync({
        campaignId: id,
        userName: user.userName,
        quantity,
      });
      setCreatedSession({ inviteCode: session.inviteCode, deadline: session.deadline });
      toast.success('Group created! Share the invite code with friends.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create group';
      toast.error(msg);
    }
  };

  const copyInviteLink = () => {
    if (!createdSession) return;
    const link = `${window.location.origin}/group-buy/join/${createdSession.inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied!');
  };

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress sx={{ color: nexus.purple[600] }} />
      </Stack>
    );
  }

  if (error || !campaign) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <Alert severity="error">Campaign not found.</Alert>
      </Stack>
    );
  }

  const discount = Math.round(
    ((campaign.originalPrice - campaign.groupPrice) / campaign.originalPrice) * 100,
  );
  const activeSessions = campaign.sessions?.filter((s) => s.status === 'Open') ?? [];

  return (
    <Stack sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }} spacing={4}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Hero Card */}
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              borderRadius: nexus.radius.xl,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: nexus.neutral[200],
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }}>
              {/* Image */}
              <Box
                sx={{
                  width: { xs: '100%', md: '45%' },
                  aspectRatio: { xs: '16/9', md: '1/1' },
                  bgcolor: nexus.neutral[100],
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {campaign.imageUrl ? (
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.productName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Stack justifyContent="center" alignItems="center" height="100%">
                    <GroupsOutlinedIcon sx={{ fontSize: 80, color: nexus.purple[200] }} />
                  </Stack>
                )}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    px: 2,
                    py: 0.75,
                    borderRadius: nexus.radius.pill,
                    background: nexus.gradient.button,
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  Save {discount}%
                </Box>
              </Box>

              {/* Details */}
              <Stack flex={1} spacing={2.5} sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography variant="h4" fontWeight={700} color={nexus.neutral[900]}>
                  {campaign.productName}
                </Typography>
                <Typography variant="body1" color={nexus.neutral[500]}>
                  {campaign.name}
                  {campaign.description && ` — ${campaign.description}`}
                </Typography>

                <Stack direction="row" alignItems="baseline" spacing={2}>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      background: nexus.gradient.primary,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ${campaign.groupPrice.toFixed(2)}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ textDecoration: 'line-through', color: nexus.neutral[400] }}
                  >
                    ${campaign.originalPrice.toFixed(2)}
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    icon={<GroupsOutlinedIcon />}
                    label={`Min ${campaign.minParticipants} people`}
                    sx={{ bgcolor: nexus.purple[50], color: nexus.purple[700], fontWeight: 500 }}
                  />
                  <Chip
                    icon={<TimerOutlinedIcon />}
                    label={`${campaign.sessionDurationHours}h per group`}
                    sx={{ bgcolor: nexus.orange[50], color: nexus.orange[700], fontWeight: 500 }}
                  />
                </Stack>

                {/* Quantity */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="body2" fontWeight={600}>
                    Quantity:
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Button
                      size="small"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      sx={{
                        minWidth: 36,
                        border: '1px solid',
                        borderColor: nexus.neutral[300],
                        color: nexus.neutral[700],
                      }}
                    >
                      -
                    </Button>
                    <Typography fontWeight={600} sx={{ minWidth: 24, textAlign: 'center' }}>
                      {quantity}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setQuantity(quantity + 1)}
                      sx={{
                        minWidth: 36,
                        border: '1px solid',
                        borderColor: nexus.neutral[300],
                        color: nexus.neutral[700],
                      }}
                    >
                      +
                    </Button>
                  </Stack>
                </Stack>

                {/* Start Group Button */}
                {!createdSession ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartGroup}
                    disabled={openGroup.isPending}
                    startIcon={<GroupsOutlinedIcon />}
                    sx={{
                      background: nexus.gradient.button,
                      fontWeight: 700,
                      py: 1.5,
                      fontSize: '1rem',
                      borderRadius: nexus.radius.lg,
                      '&:hover': { opacity: 0.9 },
                    }}
                  >
                    {openGroup.isPending ? 'Creating...' : 'Start a Group'}
                  </Button>
                ) : (
                  /* Invite Code Card */
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: nexus.radius.lg,
                      bgcolor: nexus.purple[50],
                      border: '2px solid',
                      borderColor: nexus.purple[200],
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleOutlineIcon sx={{ color: '#10B981' }} />
                        <Typography fontWeight={700} color={nexus.neutral[900]}>
                          Group Created!
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color={nexus.neutral[600]}>
                        Share this invite code or link with your friends to reach the minimum:
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          value={createdSession.inviteCode}
                          size="small"
                          InputProps={{ readOnly: true }}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              fontWeight: 700,
                              fontSize: '1.25rem',
                              letterSpacing: '0.15em',
                              fontFamily: 'monospace',
                            },
                          }}
                        />
                        <Tooltip title="Copy invite link">
                          <IconButton onClick={copyInviteLink} color="primary">
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton
                            onClick={() => {
                              const url = `${window.location.origin}/group-buy/join/${createdSession.inviteCode}`;
                              if (navigator.share)
                                navigator.share({ url, title: 'Join my group buy!' });
                              else copyInviteLink();
                            }}
                            color="primary"
                          >
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Stack>
          </Box>
        </motion.div>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <motion.div variants={itemVariants}>
            <Stack spacing={2} mt={4}>
              <Typography variant="h6" fontWeight={700} color={nexus.neutral[900]}>
                Open Groups ({activeSessions.length})
              </Typography>
              {activeSessions.map((session) => {
                const progress = (session.currentParticipants / campaign.minParticipants) * 100;
                return (
                  <Box
                    key={session.id}
                    sx={{
                      p: 2.5,
                      borderRadius: nexus.radius.lg,
                      border: '1px solid',
                      borderColor: nexus.neutral[200],
                      '&:hover': { borderColor: nexus.purple[300] },
                      transition: nexus.transition.base,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack spacing={1} flex={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '0.75rem',
                              bgcolor: nexus.purple[600],
                            }}
                          >
                            {session.leaderUserName[0]?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {session.leaderUserName}'s group
                          </Typography>
                          <Chip
                            size="small"
                            label={session.inviteCode}
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              bgcolor: nexus.neutral[100],
                            }}
                          />
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, progress)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: nexus.neutral[200],
                                '& .MuiLinearProgress-bar': {
                                  background: nexus.gradient.button,
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight={600} color={nexus.purple[700]}>
                            {session.currentParticipants}/{campaign.minParticipants}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Button
                        onClick={() => navigate(`/group-buy/join/${session.inviteCode}`)}
                        size="small"
                        sx={{
                          ml: 2,
                          fontWeight: 600,
                          color: nexus.purple[700],
                          borderColor: nexus.purple[300],
                          '&:hover': { bgcolor: nexus.purple[50] },
                        }}
                        variant="outlined"
                      >
                        Join
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </motion.div>
        )}
      </motion.div>
    </Stack>
  );
}
