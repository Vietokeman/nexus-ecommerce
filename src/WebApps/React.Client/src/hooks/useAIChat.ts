import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

export interface CreateChatSessionPayload {
  userName: string;
  prompt: string;
  context?: string;
}

export function useCreateAIChatSession() {
  return useMutation({
    mutationFn: (payload: CreateChatSessionPayload) =>
      api.post(API_ENDPOINTS.AI.CHAT_SESSIONS, payload).then((r) => r.data?.result || r.data),
  });
}

export function useAIChatSessionDetail(sessionId: string) {
  return useQuery({
    queryKey: ['ai-chat-session', sessionId],
    queryFn: () =>
      api.get(API_ENDPOINTS.AI.SESSION_DETAIL(sessionId)).then((r) => r.data?.result || r.data),
    enabled: !!sessionId,
  });
}
