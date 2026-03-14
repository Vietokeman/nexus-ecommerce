import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { AuditLogDateRange, AuditLogPageResult } from '@/types/audit-log';

export interface UseAuditLogsParams {
  searchTerm?: string;
  dateRange?: AuditLogDateRange;
  page: number;
  pageSize: number;
}

const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (params: UseAuditLogsParams) =>
    [
      ...auditLogKeys.all,
      params.searchTerm ?? '',
      params.dateRange?.startDate ?? '',
      params.dateRange?.endDate ?? '',
      params.page,
      params.pageSize,
    ] as const,
};

export function useAuditLogs(params: UseAuditLogsParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get<AuditLogPageResult>(API_ENDPOINTS.AUDIT_LOGS.LIST, {
        params: {
          searchTerm: params.searchTerm,
          startDate: params.dateRange?.startDate,
          endDate: params.dateRange?.endDate,
          page: params.page,
          pageSize: params.pageSize,
        },
      });

      return data;
    },
  });
}
