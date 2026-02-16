import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type {
  GroupBuyCampaign,
  GroupBuySession,
  GroupBuyParticipant,
  OpenGroupDto,
  JoinGroupDto,
} from '@/types/group-buy';

/* ── Query Keys ── */
const keys = {
  all: ['group-buy'] as const,
  campaigns: () => [...keys.all, 'campaigns'] as const,
  activeCampaigns: () => [...keys.all, 'campaigns', 'active'] as const,
  campaign: (id: number) => [...keys.all, 'campaign', id] as const,
  session: (code: string) => [...keys.all, 'session', code] as const,
};

/* ── Queries ── */

export function useGroupBuyCampaigns() {
  return useQuery({
    queryKey: keys.campaigns(),
    queryFn: async () => {
      const { data } = await api.get<GroupBuyCampaign[]>(API_ENDPOINTS.GROUP_BUY.CAMPAIGNS);
      return data;
    },
  });
}

export function useActiveGroupBuyCampaigns() {
  return useQuery({
    queryKey: keys.activeCampaigns(),
    queryFn: async () => {
      const { data } = await api.get<GroupBuyCampaign[]>(API_ENDPOINTS.GROUP_BUY.ACTIVE_CAMPAIGNS);
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useGroupBuyCampaign(id: number) {
  return useQuery({
    queryKey: keys.campaign(id),
    queryFn: async () => {
      const { data } = await api.get<GroupBuyCampaign>(API_ENDPOINTS.GROUP_BUY.CAMPAIGN_DETAIL(id));
      return data;
    },
    enabled: id > 0,
  });
}

export function useGroupBuySessionByCode(inviteCode: string) {
  return useQuery({
    queryKey: keys.session(inviteCode),
    queryFn: async () => {
      const { data } = await api.get<GroupBuySession>(
        API_ENDPOINTS.GROUP_BUY.SESSION_BY_CODE(inviteCode),
      );
      return data;
    },
    enabled: !!inviteCode,
    refetchInterval: 10_000, // Poll for live participant count
  });
}

/* ── Mutations ── */

export function useOpenGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: OpenGroupDto) => {
      const { data } = await api.post<GroupBuySession>(API_ENDPOINTS.GROUP_BUY.OPEN_GROUP, dto);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.activeCampaigns() });
    },
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: JoinGroupDto) => {
      const { data } = await api.post<GroupBuyParticipant>(API_ENDPOINTS.GROUP_BUY.JOIN_GROUP, dto);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: keys.session(variables.inviteCode) });
    },
  });
}
