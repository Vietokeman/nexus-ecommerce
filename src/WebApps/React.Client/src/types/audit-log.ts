export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityName: string;
  entityId?: string | null;
  correlationId?: string | null;
  changesJson?: string | null;
}

export interface AuditLogPageResult {
  results: AuditLogItem[];
  currentPage: number;
  rowCount: number;
  pageSize: number;
}

export interface AuditLogDateRange {
  startDate?: string;
  endDate?: string;
}
