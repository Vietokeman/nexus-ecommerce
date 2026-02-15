import { useState } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import EmptyState from '@/components/ui/EmptyState';
import type { Order } from '@/types/order';

const statusColor: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Processing: 'info',
  Paid: 'success',
  Completed: 'success',
  Cancelled: 'error',
  Failed: 'error',
};

export default function AdminOrdersPage() {
  const [tab, setTab] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api.get(API_ENDPOINTS.ORDERS.LIST).then((r) => r.data || []),
  });

  const orders = Array.isArray(data) ? data : [];
  const tabs = ['All', 'Pending', 'Paid', 'Completed', 'Cancelled'];
  const filtered = tab === 0 ? orders : orders.filter((o: Order) => o.status === tabs[tab]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Manage Orders
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {tabs.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {isLoading ? (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={60} sx={{ mb: 1 }} />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState title="No orders found" description="No orders match the selected filter." />
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Order No</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((order: Order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {order.documentNo || order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.userName || order.emailAddress || '—'}</TableCell>
                  <TableCell>{new Date(order.createdDate || '').toLocaleDateString()}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ${order.totalPrice?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={order.status || 'New'}
                      color={statusColor[order.status || ''] || 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </motion.div>
  );
}
