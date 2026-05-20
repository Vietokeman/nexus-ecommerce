import { useMemo, useState } from 'react';
import { Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useCreateAIChatSession, useAIChatSessionDetail } from '@/hooks/useAIChat';
import { containerVariants, itemVariants } from '@/lib/motion';
import { PremiumButton } from '@/components/ui/primitives';

interface ChatMessage {
  role?: string;
  content?: string;
  message?: string;
  [key: string]: unknown;
}

const prompts = [
  'Tôi cần set quà Tết giá dưới 500k',
  'Gợi ý quà tặng cho sếp nữ theo phong cách premium',
  'Tôi cần sản phẩm giao nhanh trong ngày',
];

export default function AIAssistantPage() {
  const user = useAuthStore((s) => s.user);
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState('');

  const createSession = useCreateAIChatSession();
  const { data: sessionDetail, isFetching } = useAIChatSessionDetail(sessionId);

  const messages = useMemo(() => {
    if (!sessionDetail) {
      return [] as ChatMessage[];
    }

    const source = sessionDetail.messages || sessionDetail.items || sessionDetail.history || [];
    return Array.isArray(source) ? source : [];
  }, [sessionDetail]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Nhập prompt để trò chuyện với AI assistant');
      return;
    }

    try {
      const result = await createSession.mutateAsync({
        userName: user?.userName || user?.email || 'guest',
        prompt: prompt.trim(),
      });

      const nextSessionId = result?.sessionId || result?.id;
      if (!nextSessionId) {
        toast.error('AI response không có session id');
        return;
      }

      setSessionId(String(nextSessionId));
      toast.success('AI session đã được tạo');
    } catch {
      toast.error('Không thể tạo AI session lúc này');
    }
  };

  return (
    <Stack alignItems="center" mt={2} mb="5rem" px={2}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%', maxWidth: '72rem' }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AutoAwesomeIcon sx={{ color: '#D4AF37', fontSize: 32, filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' }} />
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                }}
              >
                AI Shopping Assistant
              </Typography>
            </Stack>
          </motion.div>

          {/* Prompt card */}
          <motion.div variants={itemVariants}>
            <Paper
              className="nx-liquid-glass"
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 24px 48px -20px rgba(0, 0, 0, 0.1)',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Stack spacing={2.5}>
                <Typography variant="body1" sx={{ color: '#5C584E', fontWeight: 500 }}>
                  Mô tả nhu cầu theo phong cách Shopee/TikTok Shop: ngắn gọn, theo budget, theo ngành.
                </Typography>

                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ví dụ: Tôi cần 5 sản phẩm Tết tặng đối tác, tổng budget 2 triệu..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.65)',
                      backdropFilter: 'blur(10px)',
                      '& fieldset': {
                        borderColor: 'rgba(212, 175, 55, 0.15)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#D4AF37',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#CA8A04',
                        boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.15)',
                      },
                    },
                  }}
                />

                <Stack direction="row" flexWrap="wrap" gap={1.25}>
                  {prompts.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      onClick={() => setPrompt(item)}
                      variant="outlined"
                      sx={{
                        borderRadius: '999px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderColor: 'rgba(212,175,55,0.3)',
                        color: '#CA8A04',
                        background: 'rgba(212,175,55,0.05)',
                        transition: 'all 200ms ease',
                        '&:hover': {
                          background: 'rgba(212,175,55,0.12)',
                          borderColor: '#D4AF37',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    />
                  ))}
                </Stack>

                <Stack direction="row" justifyContent="flex-end" pt={1}>
                  <PremiumButton
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={createSession.isPending}
                    magnetic={true}
                    sx={{
                      px: 4.5,
                      py: 1.25,
                      borderRadius: '999px',
                    }}
                  >
                    {createSession.isPending ? 'Asking AI...' : 'Ask AI'}
                  </PremiumButton>
                </Stack>
              </Stack>
            </Paper>
          </motion.div>

          {/* Session details */}
          <AnimatePresence mode="wait">
            {sessionId && (
              <motion.div
                key={sessionId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <Paper
                  className="nx-liquid-glass"
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 24px 48px -20px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={700} color="#2b211d">
                        Session: {sessionId}
                      </Typography>
                      {isFetching && (
                        <Typography variant="body2" sx={{ color: '#CA8A04', fontWeight: 600 }}>
                          Đang tải hội thoại...
                        </Typography>
                      )}
                    </Stack>

                    {!isFetching && messages.length === 0 && (
                      <Typography color="text.secondary" textAlign="center" py={2}>
                        Chưa có tin nhắn trong phiên làm việc này.
                      </Typography>
                    )}

                    <Stack spacing={2} mt={1}>
                      {messages.map((msg: ChatMessage, idx: number) => {
                        const isAssistant = msg.role === 'assistant';
                        return (
                          <motion.div
                            key={`${idx}-${msg.role || 'item'}`}
                            initial={{ opacity: 0, x: isAssistant ? -10 : 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.5) }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                borderRadius: '16px',
                                border: isAssistant
                                  ? '1px solid rgba(212, 175, 55, 0.25)'
                                  : '1px solid rgba(255, 255, 255, 0.15)',
                                background: isAssistant
                                  ? 'rgba(212, 175, 55, 0.05)'
                                  : 'rgba(255, 255, 255, 0.55)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: isAssistant
                                  ? '0 8px 24px -12px rgba(212,175,55,0.2)'
                                  : '0 8px 24px -12px rgba(0,0,0,0.05)',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  letterSpacing: '0.05em',
                                  color: isAssistant ? '#CA8A04' : '#5C584E',
                                  display: 'block',
                                  mb: 0.75,
                                }}
                              >
                                {isAssistant ? 'AI ASSISTANT' : 'YOU'}
                              </Typography>
                              <Typography
                                variant="body1"
                                whiteSpace="pre-wrap"
                                sx={{ color: '#2b211d', lineHeight: 1.6 }}
                              >
                                {msg.content || msg.message || JSON.stringify(msg)}
                              </Typography>
                            </Paper>
                          </motion.div>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </motion.div>
    </Stack>
  );
}

