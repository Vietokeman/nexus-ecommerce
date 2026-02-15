export interface Order {
  id: number;
  userName: string;
  totalPrice: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  shippingAddress: string;
  invoiceAddress: string;
  status?: string;
}
