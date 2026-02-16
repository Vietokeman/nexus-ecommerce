/* ═══════════════════════════════════════════════════════════
   GroupBuy Types — Maps to GroupBuy.API entities
   ═══════════════════════════════════════════════════════════ */

export type GroupBuySessionStatus = 'Open' | 'Succeeded' | 'Failed' | 'Cancelled';
export type GroupBuyParticipantStatus = 'Joined' | 'Confirmed' | 'Refunded';
export type GroupBuyCampaignStatus = 'Draft' | 'Active' | 'Ended' | 'Cancelled';

export interface GroupBuyCampaign {
  id: number;
  name: string;
  description?: string;
  productNo: string;
  productName: string;
  imageUrl?: string;
  originalPrice: number;
  groupPrice: number;
  minParticipants: number;
  maxParticipants: number;
  sessionDurationHours: number;
  status: GroupBuyCampaignStatus;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
  sessions?: GroupBuySession[];
}

export interface GroupBuySession {
  id: number;
  campaignId: number;
  leaderUserName: string;
  currentParticipants: number;
  deadline: string;
  status: GroupBuySessionStatus;
  inviteCode: string;
  createdAt?: string;
  completedAt?: string;
  campaign?: GroupBuyCampaign;
  participants?: GroupBuyParticipant[];
}

export interface GroupBuyParticipant {
  id: number;
  sessionId: number;
  userName: string;
  quantity: number;
  unitPrice: number;
  status: GroupBuyParticipantStatus;
  joinedAt: string;
  confirmedAt?: string;
}

/** POST /api/groupbuys/sessions/open */
export interface OpenGroupDto {
  campaignId: number;
  userName: string;
  quantity?: number;
}

/** POST /api/groupbuys/sessions/join */
export interface JoinGroupDto {
  inviteCode: string;
  userName: string;
  quantity?: number;
}

/** POST /api/groupbuys/campaigns */
export interface CreateCampaignDto {
  name: string;
  description?: string;
  productNo: string;
  productName: string;
  imageUrl?: string;
  originalPrice: number;
  groupPrice: number;
  minParticipants?: number;
  maxParticipants?: number;
  sessionDurationHours?: number;
  startDate: string;
  endDate: string;
}
