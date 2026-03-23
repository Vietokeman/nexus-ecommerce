/**
 * Maps to backend CatalogProduct entity.
 * `attributes` is a JSON object stored as JSONB in PostgreSQL.
 */
export interface Product {
  id: number;
  no: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  category?: string;
  brand?: string;
  attributes?: Record<string, string | number | boolean>;
  imageUrl?: string;
}

export interface CreateProductDto {
  no: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  category?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface UpdateProductDto {
  name: string;
  summary: string;
  description: string;
  price: number;
  category?: string;
  attributes?: Record<string, string | number | boolean>;
}
