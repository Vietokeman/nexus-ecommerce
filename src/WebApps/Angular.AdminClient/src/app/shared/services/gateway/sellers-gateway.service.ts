import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SellersGatewayService {
  constructor(private http: HttpClient) {}

  getSellerProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/api/sellerproducts`);
  }

  getBySeller(userName: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/api/sellerproducts/by-seller/${userName}`);
  }

  getDashboard(userName: string): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/api/sellerproducts/dashboard/${userName}`);
  }
}
