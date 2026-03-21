import { useMemo, useState } from 'react';
import {
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';
import { useCreateAIChatSession, useAIChatSessionDetail } from '@/hooks/useAIChat';

interface ChatMessage {
  role?: string;
  content?: string;
  message?: string;
  [key: string]: unknown;
}

const prompts = [
  'Toi can set qua Tet gia duoi 500k',
  'Goi y qua tang cho sep nu theo phong cach premium',
  'Toi can san pham giao nhanh trong ngay',
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
      toast.error('Nhap prompt de tro chuyen voi AI assistant');
      return;
    }

    try {
      const result = await createSession.mutateAsync({
        userName: user?.userName || user?.email || 'guest',
        prompt: prompt.trim(),
      });

      const nextSessionId = result?.sessionId || result?.id;
      if (!nextSessionId) {
        toast.error('AI response khong co session id');
        return;
      }

      setSessionId(String(nextSessionId));
      toast.success('AI session da duoc tao');
    } catch {
      toast.error('Khong the tao AI session luc nay');
    }
  };

  return (
    <Stack alignItems="center" mt={2} mb="5rem" px={2}>
      <Stack width="100%" maxWidth="72rem" spacing={2.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoAwesomeIcon color="warning" />
          <Typography variant="h4" fontWeight={800}>
            AI Shopping Assistant
          </Typography>
        </Stack>

        <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E9DCC9' }}>
          <Stack spacing={1.25}>
            <Typography color="text.secondary">
              Mo ta nhu cau theo phong cach Shopee/TikTok Shop: ngan gon, theo budget, theo nganh.
            </Typography>

            <TextField
              multiline
              rows={3}
              fullWidth
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Vi du: Toi can 5 san pham Tet tang doi tac, tong budget 2 trieu"
            />

            <Stack direction="row" flexWrap="wrap" gap={1}>
              {prompts.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  onClick={() => setPrompt(item)}
                  variant="outlined"
                />
              ))}
            </Stack>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={createSession.isPending}
              >
                {createSession.isPending ? 'Dang tao session...' : 'Ask AI'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {sessionId && (
          <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E9DCC9' }}>
            <Typography fontWeight={700}>Session: {sessionId}</Typography>
            {isFetching && <Typography color="text.secondary">Dang tai hoi thoai...</Typography>}

            {!isFetching && messages.length === 0 && (
              <Typography color="text.secondary">Chua co message trong session.</Typography>
            )}

            <Stack mt={1.5} spacing={1.2}>
              {messages.map((msg: ChatMessage, idx: number) => (
                <Paper
                  key={`${idx}-${msg.role || 'item'}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid #EFE3D1',
                    background:
                      msg.role === 'assistant'
                        ? 'linear-gradient(180deg, #FFFFFF 0%, #F8FFFA 100%)'
                        : 'linear-gradient(180deg, #FFFFFF 0%, #FFF9F2 100%)',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {(msg.role || 'message').toUpperCase()}
                  </Typography>
                  <Typography whiteSpace="pre-wrap">
                    {msg.content || msg.message || JSON.stringify(msg)}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
}
