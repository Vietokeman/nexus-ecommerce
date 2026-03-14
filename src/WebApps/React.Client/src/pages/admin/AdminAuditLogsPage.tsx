import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useDebounce } from '@/hooks/useDebounce';
import type { AuditLogItem } from '@/types/audit-log';

const PAGE_SIZE = 20;

function formatTime(value: string): string {
  return new Date(value).toLocaleString();
}

function buildDiff(log: AuditLogItem): { oldValues: Record<string, string | null>; newValues: Record<string, string | null> } {
  if (!log.changesJson) {
    return { oldValues: {}, newValues: {} };
  }

  try {
    const parsed = JSON.parse(log.changesJson) as Record<string, { oldValue?: string | null; newValue?: string | null }>;
    const oldValues: Record<string, string | null> = {};
    const newValues: Record<string, string | null> = {};

    Object.entries(parsed).forEach(([key, value]) => {
      oldValues[key] = value.oldValue ?? null;
      newValues[key] = value.newValue ?? null;
    });

    return { oldValues, newValues };
  } catch {
    return { oldValues: {}, newValues: {} };
  }
}

function getActionColor(action: string): 'success' | 'error' | 'info' | 'warning' {
  const upperAction = action.toUpperCase();
  if (upperAction.includes('DELETE')) {
    return 'error';
  }

  if (upperAction.includes('POST') || upperAction.includes('CREATE')) {
    return 'success';
  }

  if (upperAction.includes('UPDATE') || upperAction.includes('PUT') || upperAction.includes('PATCH')) {
    return 'warning';
  }

  return 'info';
}

export default function AdminAuditLogsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const debouncedSearch = useDebounce(searchInput, 300);

  const query = useAuditLogs({
    searchTerm: debouncedSearch,
    dateRange: {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    page,
    pageSize: PAGE_SIZE,
  });

  const rows = query.data?.results ?? [];
  const totalRows = query.data?.rowCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  const diff = useMemo(() => {
    if (!selectedLog) {
      return { oldValues: {}, newValues: {} };
    }

    return buildDiff(selectedLog);
  }, [selectedLog]);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track system-level data changes with full-text Elasticsearch search.
        </Typography>
      </Box>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <TextField
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              label="Search by action, user, entity, field values"
              fullWidth
              size="medium"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => setSelectedLog(row)}
              >
                <TableCell>{formatTime(row.timestamp)}</TableCell>
                <TableCell>{row.user}</TableCell>
                <TableCell>
                  <Chip
                    label={row.action}
                    color={getActionColor(row.action)}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>{row.entityName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!query.isLoading && rows.length === 0 && (
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Typography>No logs found for the current filters.</Typography>
        </Paper>
      )}

      <Stack direction="row" justifyContent="center">
        <Pagination
          page={page}
          count={pageCount}
          onChange={(_event, value) => setPage(value)}
          color="primary"
        />
      </Stack>

      <Dialog
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>JSON Diff Viewer</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              {selectedLog ? `${selectedLog.entityName} · ${selectedLog.action} · ${formatTime(selectedLog.timestamp)}` : ''}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#FEF2F2' }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Old Values
                  </Typography>
                  <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12 }}>
                    {JSON.stringify(diff.oldValues, null, 2)}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#ECFDF3' }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    New Values
                  </Typography>
                  <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12 }}>
                    {JSON.stringify(diff.newValues, null, 2)}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
