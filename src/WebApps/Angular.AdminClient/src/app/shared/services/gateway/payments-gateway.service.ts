import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentsGatewayService {
  constructor(private http: HttpClient) {}

  getUserPaymentHistory(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/api/payment/user/${userId}`);
  }

  getOrderStatus(orderNo: string): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/api/payment/${orderNo}/status`);
  }

  cancelOrder(orderNo: string): Observable<any> {
    return this.http.post<any>(`${environment.API_URL}/api/payment/cancel/${orderNo}`, {});
  }
}
