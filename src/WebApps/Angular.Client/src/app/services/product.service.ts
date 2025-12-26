import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private apiUrl = environment.apis.product.url;

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl).pipe(
            retry(2),
            catchError(this.handleError)
        );
    }

    getProductById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
            retry(2),
            catchError(this.handleError)
        );
    }

    getProductByNo(productNo: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/get-product-by-no/${productNo}`).pipe(
            retry(2),
            catchError(this.handleError)
        );
    }

    createProduct(product: CreateProductDto): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product).pipe(
            catchError(this.handleError)
        );
    }

    updateProduct(id: string, product: UpdateProductDto): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
            catchError(this.handleError)
        );
    }

    deleteProduct(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
