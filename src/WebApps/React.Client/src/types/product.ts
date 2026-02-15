export interface Product {
  id: number;
  no: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface CreateProductDto {
  no: string;
  name: string;
  summary: string;
  description: string;
  price: number;
}

export interface UpdateProductDto {
  name: string;
  summary: string;
  description: string;
  price: number;
}
