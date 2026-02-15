export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string | number) => `/api/products/${id}`,
    BY_NO: (productNo: string) => `/api/products/get-product-by-no/${productNo}`,
  },
  CUSTOMERS: {
    LIST: '/api/customers',
    DETAIL: (username: string) => `/api/customer/${username}`,
    CREATE: '/api/customer',
    DELETE: '/api/customer',
  },
  BASKETS: {
    GET: (username: string) => `/api/baskets/${username}`,
    UPDATE: '/api/baskets',
    DELETE: (username: string) => `/api/baskets/${username}`,
    CHECKOUT: '/api/baskets/checkout',
  },
  ORDERS: {
    LIST: '/api/v1/orders',
    BY_USER: (username: string) => `/api/v1/orders/${username}`,
    CREATE: '/api/v1/orders',
    UPDATE: (id: string | number) => `/api/v1/orders/${id}`,
    DELETE: (id: string | number) => `/api/v1/orders/${id}`,
  },
  INVENTORY: {
    STOCK: (itemNo: string) => `/api/inventory/stock/${itemNo}`,
  },
  PAYMENT: {
    CREATE: '/api/payment/create',
    STATUS: (orderNo: string) => `/api/payment/${orderNo}/status`,
    STATUS_BY_CODE: (orderCode: number) => `/api/payment/code/${orderCode}/status`,
    CANCEL: (orderNo: string) => `/api/payment/cancel/${orderNo}`,
    USER: (userId: string) => `/api/payment/user/${userId}`,
  },
} as const;
