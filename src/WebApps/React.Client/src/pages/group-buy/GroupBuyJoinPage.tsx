import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';
import { nexus } from '@/theme/theme';
import { useGroupBuySessionByCode, useJoinGroup } from '@/hooks/useGroupBuy';
import { useAuthStore } from '@/store/auth-store';
import { containerVariants, itemVariants } from '@/lib/motion';
import { toast } from 'react-toastify';

function CountdownTimer({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);

  if (diff <= 0) return <Chip label="Expired" color="error" size="small" />;

  return (
    <Stack direction="row" spacing={0.5}>
      {[
        { v: h, l: 'h' },
        { v: m, l: 'm' },
        { v: s, l: 's' },
      ].map(({ v, l }) => (
        <Box
          key={l}
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: nexus.radius.md,
            background: nexus.gradient.button,
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            minWidth: 36,
            textAlign: 'center',
          }}
        >
          {String(v).padStart(2, '0')}
          {l}
        </Box>
      ))}
    </Stack>
  );
}

export default function GroupBuyJoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const {
    data: session,
    isLoading,
    error,
  } = useGroupBuySessionByCode(inviteCode ?? '');
  const joinGroup = useJoinGroup();

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!inviteCode) return;
    try {
      await joinGroup.mutateAsync({
        inviteCode,
        userName: user.userName,
        quantity: 1,
      });
      toast.success("You've joined the group!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join group';
      toast.error(msg);
    }
  };

  const isOpen = session?.status === 'Open';
  const isSucceeded = session?.status === 'Succeeded';
  const isFailed = session?.status === 'Failed';
  const campaign = session?.campaign;
  const participants = session?.participants ?? [];
  const minNeeded = campaign?.minParticipants ?? 3;
  const progress = session ? (session.currentParticipants / minNeeded) * 100 : 0;
  const alreadyJoined = user
    ? participants.some((p) => p.userName === user.userName)
    : false;

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress sx={{ color: nexus.purple[600] }} />
      </Stack>
    );
  }

  if (error || !session) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="60vh" spacing={2}>
        <ErrorOutlineIcon sx={{ fontSize: 64, color: nexus.neutral[300] }} />
        <Typography color={nexus.neutral[500]}>
          Invalid invite code or session not found.
        </Typography>
        <Button onClick={() => navigate('/group-buy')} sx={{ color: nexus.purple[700] }}>
          Browse Campaigns
        </Button>
      </Stack>
    );
  }

  return (
    <Stack sx={{ maxWidth: 600, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }} spacing={3}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Status Banner */}
        <motion.div variants={itemVariants}>
          {isSucceeded && (
            <Alert
              icon={<CheckCircleOutlineIcon />}
              severity="success"
              sx={{ borderRadius: nexus.radius.lg, mb: 2 }}
            >
              Group succeeded! All participants have been confirmed.
            </Alert>
          )}
          {isFailed && (
            <Alert
              icon={<ErrorOutlineIcon />}
              severity="error"
              sx={{ borderRadius: nexus.radius.lg, mb: 2 }}
            >
              This group has expired. Not enough participants joined in time.
            </Alert>
          )}
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Box
            sx={{
              borderRadius: nexus.radius.xl,
              border: '2px solid',
              borderColor: isSucceeded
                ? '#10B981'
                : isFailed
                  ? '#EF4444'
                  : nexus.purple[200],
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                background: isSucceeded
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : isFailed
                    ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                    : nexus.gradient.button,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700} color="#fff">
                  {session.leaderUserName}'s Group
                </Typography>
                <Chip
                  label={session.inviteCode}
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    letterSpacing: '0.1em',
                  }}
                />
              </Stack>
            </Box>

            <Stack spacing={3} sx={{ p: 3 }}>
              {/* Product Info */}
              {campaign && (
                <Stack spacing={1}>
                  <Typography variant="h5" fontWeight={700}>
                    {campaign.productName}
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography
                      variant="h4"
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
                      sx={{ textDecoration: 'line-through', color: nexus.neutral[400] }}
                    >
                      ${campaign.originalPrice.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              )}

              <Divider />

              {/* Progress */}
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={600} color={nexus.neutral[700]}>
                    {session.currentParticipants} of {minNeeded} needed
                  </Typography>
                  {isOpen && <CountdownTimer deadline={session.deadline} />}
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, progress)}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: nexus.neutral[200],
                    '& .MuiLinearProgress-bar': {
                      background: isSucceeded
                        ? 'linear-gradient(90deg, #10B981, #059669)'
                        : nexus.gradient.button,
                      borderRadius: 6,
                    },
                  }}
                />
              </Stack>

              {/* Participants */}
              <Stack spacing={1.5}>
                <Typography variant="body2" fontWeight={600} color={nexus.neutral[700]}>
                  Participants
                </Typography>
                <Stack spacing={1}>
                  {participants.map((p) => (
                    <Stack
                      key={p.id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1.5,
                        borderRadius: nexus.radius.md,
                        bgcolor: nexus.neutral[50],
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          fontSize: '0.75rem',
                          bgcolor: nexus.purple[600],
                        }}
                      >
                        {p.userName[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500} flex={1}>
                        {p.userName}
                        {p.userName === session.leaderUserName && (
                          <Chip
                            label="Leader"
                            size="small"
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: nexus.orange[100],
                              color: nexus.orange[700],
                            }}
                          />
                        )}
                      </Typography>
                      <Chip
                        label={p.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          bgcolor:
                            p.status === 'Confirmed'
                              ? '#D1FAE5'
                              : p.status === 'Refunded'
                                ? '#FEE2E2'
                                : nexus.purple[50],
                          color:
                            p.status === 'Confirmed'
                              ? '#065F46'
                              : p.status === 'Refunded'
                                ? '#991B1B'
                                : nexus.purple[700],
                        }}
                      />
                    </Stack>
                  ))}
                  {/* Empty slots */}
                  {isOpen &&
                    Array.from({ length: Math.max(0, minNeeded - session.currentParticipants) }).map(
                      (_, i) => (
                        <Stack
                          key={`empty-${i}`}
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          sx={{
                            p: 1.5,
                            borderRadius: nexus.radius.md,
                            border: '1px dashed',
                            borderColor: nexus.neutral[300],
                          }}
                        >
                          <Avatar sx={{ width: 30, height: 30, bgcolor: nexus.neutral[200] }}>?</Avatar>
                          <Typography variant="body2" color={nexus.neutral[400]}>
                            Waiting for someone...
                          </Typography>
                        </Stack>
                      ),
                    )}
                </Stack>
              </Stack>

              {/* Join Button */}
              {isOpen && !alreadyJoined && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleJoin}
                  disabled={joinGroup.isPending}
                  startIcon={<GroupsOutlinedIcon />}
                  sx={{
                    background: nexus.gradient.button,
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: nexus.radius.lg,
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  {joinGroup.isPending ? 'Joining...' : 'Join This Group'}
                </Button>
              )}
              {alreadyJoined && (
                <Alert severity="info" sx={{ borderRadius: nexus.radius.lg }}>
                  You are already in this group.
                </Alert>
              )}
            </Stack>
          </Box>
        </motion.div>
      </motion.div>
    </Stack>
  );
}
