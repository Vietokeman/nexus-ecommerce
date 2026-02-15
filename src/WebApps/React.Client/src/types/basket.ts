export interface BasketItem {
  itemNo: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Basket {
  userName: string;
  items: BasketItem[];
  totalPrice: number;
}

export interface BasketCheckout {
  userName: string;
  totalPrice: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  shippingAddress: string;
  invoiceAddress: string;
}
