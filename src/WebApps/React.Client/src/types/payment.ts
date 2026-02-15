export interface PaymentRequest {
  orderNo: string;
  amount: number;
  description: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  items: PaymentItem[];
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentResponse {
  orderNo: string;
  orderCode: number;
  paymentUrl: string;
  status: string;
}

export interface PaymentStatusResponse {
  orderNo: string;
  status: string;
  amount: number;
  paidAt?: string;
  paymentMethod?: string;
}
