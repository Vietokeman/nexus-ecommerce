/* ═══════════════════════════════════════════════════════════
   FlashSale Types — Maps to FlashSale.API entities
   ═══════════════════════════════════════════════════════════ */

export type FlashSaleStatus = 'Draft' | 'Active' | 'Ended' | 'Cancelled';

export interface FlashSaleSession {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  status: FlashSaleStatus;
  items?: FlashSaleItem[];
}

export interface FlashSaleItem {
  id: number;
  sessionId: number;
  productNo: string;
  productName: string;
  originalPrice: number;
  flashPrice: number;
  totalStock: number;
  soldQuantity: number;
  maxPerUser: number;
  imageUrl?: string;
}

export interface FlashSaleOrder {
  id: number;
  itemId: number;
  userName: string;
  quantity: number;
  unitPrice: number;
  status: string;
  createdDate?: string;
}

export interface FlashSalePurchaseDto {
  itemId: number;
  quantity: number;
}
