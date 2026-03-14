export interface SellerProduct {
  id: number;
  sellerUserName: string;
  no: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  attributes: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  highlights: string;
  stockQuantity: number;
  status: string;
  averageRating: number;
  reviewCount: number;
  createdDate: string;
}

export interface CreateSellerProductDto {
  no: string;
  sellerUserName: string;
  name: string;
  summary?: string;
  basicDescription?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  stockQuantity: number;
  useAI: boolean;
}

export interface UpdateSellerProductDto {
  name: string;
  summary?: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  highlights?: string;
  stockQuantity: number;
}

export interface AIContentRequest {
  productName: string;
  category?: string;
  basicDescription?: string;
  price: number;
}

export interface AIContentResponse {
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  highlights: string;
}

export interface ProductReview {
  id: number;
  productId: number;
  userName: string;
  displayName: string;
  orderId?: number;
  rating: number;
  comment?: string;
  sellerReply?: string;
  sellerReplyDate?: string;
  isVerifiedPurchase: boolean;
  createdDate: string;
}

export interface CreateReviewDto {
  productId: number;
  userName: string;
  displayName: string;
  orderId?: number;
  rating: number;
  comment?: string;
}

export interface ReviewSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface SellerDashboard {
  totalProducts: number;
  activeProducts: number;
  totalReviews: number;
  averageRating: number;
  totalRevenue: number;
  pendingProducts: number;
  recentProducts: SellerProduct[];
  recentReviews: ProductReview[];
}
