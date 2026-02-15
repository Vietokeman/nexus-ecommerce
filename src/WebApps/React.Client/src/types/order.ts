export interface OrderItem {
  productNo: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  documentNo?: string;
  userName: string;
  totalPrice: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  shippingAddress: string;
  invoiceAddress: string;
  status?: string;
  createdDate?: string;
  orderItems?: OrderItem[];
}
