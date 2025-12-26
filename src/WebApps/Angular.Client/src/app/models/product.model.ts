export interface Product {
    id: string;
    no: string;
    name: string;
    summary: string;
    description: string;
    imageFile: string;
    price: number;
    category: string;
    createdDate?: Date;
    lastModifiedDate?: Date;
}

export interface CreateProductDto {
    no: string;
    name: string;
    summary: string;
    description: string;
    imageFile: string;
    price: number;
    category: string;
}

export interface UpdateProductDto {
    name: string;
    summary: string;
    description: string;
    imageFile: string;
    price: number;
    category: string;
}
