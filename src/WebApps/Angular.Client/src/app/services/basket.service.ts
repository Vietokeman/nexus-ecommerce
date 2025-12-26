import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cart, BasketCheckout } from '../models/basket.model';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private apiUrl = environment.apis.basket.url;

  constructor(private http: HttpClient) {}

  getBasket(username: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${username}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  updateBasket(cart: Cart): Observable<Cart> {
    return this.http.post<Cart>(this.apiUrl, cart).pipe(
      catchError(this.handleError)
    );
  }

  deleteBasket(username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  checkout(basketCheckout: BasketCheckout): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/checkout`, basketCheckout).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
