import { Component, OnInit } from '@angular/core';
import {
  AuditLogItem,
  AuditLogsGatewayService,
} from '../../shared/services/gateway/audit-logs-gateway.service';

interface PagedEvent {
  page?: number;
  rows?: number;
}

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss'],
})
export class AuditLogsComponent implements OnInit {
  public blockedPanel = false;
  public keyword = '';
  public fromDate = '';
  public toDate = '';
  public pageIndex = 1;
  public pageSize = 20;
  public totalCount = 0;
  public items: AuditLogItem[] = [];

  constructor(private auditLogsService: AuditLogsGatewayService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.toggleBlockUI(true);
    this.auditLogsService
      .getAuditLogs(
        this.keyword,
        this.pageIndex,
        this.pageSize,
        this.fromDate,
        this.toDate,
      )
      .subscribe({
        next: (response) => {
          this.items = response.results;
          this.totalCount = response.rowCount;
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  pageChanged(event: PagedEvent): void {
    this.pageIndex = (event.page ?? 0) + 1;
    this.pageSize = event.rows ?? this.pageSize;
    this.loadData();
  }

  private toggleBlockUI(enabled: boolean): void {
    this.blockedPanel = enabled;
  }
}
