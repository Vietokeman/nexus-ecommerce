import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductsGatewayService {
  constructor(private http: HttpClient) {}

  getProducts(keyword: string): Observable<any[]> {
    let params = new HttpParams();
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<any[]>(`${environment.API_URL}/api/products`, { params });
  }

  getByProductNo(productNo: string): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/api/products/search/${productNo}`);
  }
}
