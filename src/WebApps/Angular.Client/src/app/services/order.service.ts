import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';

@Injectable({
    providedIn: 'root',
})
export class OrderService {
    private apiUrl = environment.apis.ordering.url;

    constructor(private http: HttpClient) { }

    getOrders(username: string): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/${username}`).pipe(
            retry(2),
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
