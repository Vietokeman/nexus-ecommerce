/* ═══════════════════════════════════════════════════════════
   FlashSale Types — Maps to FlashSale.API entities + Redis
   ═══════════════════════════════════════════════════════════ */

export type FlashSaleStatus = 'Draft' | 'Active' | 'Ended' | 'Cancelled';
export type FlashSaleOrderStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface FlashSaleSession {
  id: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: FlashSaleStatus;
  maxConcurrentUsers?: number;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
}

export interface FlashSaleOrder {
  id: number;
  itemId: number;
  userName: string;
  quantity: number;
  unitPrice: number;
  status: FlashSaleOrderStatus;
  createdAt?: string;
}

/** POST /api/flashsales/purchase — Backend also requires UserName */
export interface FlashSalePurchaseDto {
  itemId: number;
  userName: string;
  quantity?: number;
}

/** GET /api/flashsales/items/{itemId}/stock response */
export interface FlashSaleStockResponse {
  itemId: number;
  remainingStock: number;
}
