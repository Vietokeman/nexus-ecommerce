/* ═══════════════════════════════════════════════════════════
   GroupBuy Types — Maps to GroupBuy.API entities
   ═══════════════════════════════════════════════════════════ */

export type GroupBuyStatus =
  | 'Draft'
  | 'Active'
  | 'Completed'
  | 'Cancelled'
  | 'Expired';

export interface GroupBuyCampaign {
  id: number;
  productNo: string;
  productName?: string;
  originalPrice: number;
  groupPrice: number;
  minParticipants: number;
  maxParticipants: number;
  status: GroupBuyStatus;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
}

export interface GroupBuySession {
  id: number;
  campaignId: number;
  leaderUserName: string;
  inviteCode: string;
  deadline: string;
  currentParticipants: number;
  status: string;
  participants?: GroupBuyParticipant[];
}

export interface GroupBuyParticipant {
  id: number;
  sessionId: number;
  userName: string;
  joinedAt: string;
}

export interface OpenGroupDto {
  campaignId: number;
}

export interface JoinGroupDto {
  inviteCode: string;
}
