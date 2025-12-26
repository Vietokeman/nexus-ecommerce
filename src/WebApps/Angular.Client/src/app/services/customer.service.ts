import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Customer, CreateCustomerDto } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = environment.apis.customer.url;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getCustomerByUsername(username: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl.replace('/customers', '/customer')}/${username}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl.replace('/customers', '/customer'), customer).pipe(
      catchError(this.handleError)
    );
  }

  deleteCustomer(username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl.replace('/customers', '/customer')}/${username}`).pipe(
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
