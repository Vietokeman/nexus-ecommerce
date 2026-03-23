import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AuditLogItem {
  id?: string;
  userName?: string;
  actionName?: string;
  entityName?: string;
  ipAddress?: string;
  createdDate?: string;
  [key: string]: unknown;
}

export interface AuditLogPagedResult {
  results: AuditLogItem[];
  rowCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogsGatewayService {
  constructor(private http: HttpClient) {}

  getAuditLogs(
    keyword: string,
    pageIndex: number,
    pageSize: number,
    fromDate?: string,
    toDate?: string,
  ): Observable<AuditLogPagedResult> {
    let params = new HttpParams()
      .set('keyword', keyword || '')
      .set('pageIndex', pageIndex)
      .set('pageSize', pageSize);

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http
      .get<any>(`${environment.API_URL}/api/admin/audit-logs`, { params })
      .pipe(
        map((response) => ({
          results: response?.results || response?.items || response?.data || [],
          rowCount:
            response?.rowCount ||
            response?.totalCount ||
            response?.total ||
            (response?.results || response?.items || response?.data || [])
              .length ||
            0,
        })),
      );
  }
}
