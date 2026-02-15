import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import EmptyState from '@/components/ui/EmptyState';
import type { Order } from '@/types/order';

const statusColor: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  New: 'info',
  Pending: 'warning',
  Processing: 'info',
  Paid: 'success',
  Completed: 'success',
  Cancelled: 'error',
  Failed: 'error',
};

export default function UserOrdersPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const userName = localStorage.getItem('userName') || 'guest';

  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', userName],
    queryFn: () =>
      api.get(API_ENDPOINTS.ORDERS.BY_USER(userName)).then((r) => r.data || r.data?.result || []),
  });

  const orders = data || [];

  const tabs = ['All', 'Pending', 'Paid', 'Completed', 'Cancelled'];
  const filtered =
    tab === 0 ? orders : orders.filter((o) => o.status === tabs[tab]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Orders
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {tabs.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {isLoading ? (
        <Box>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height={80} sx={{ mb: 1 }} />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="You haven't placed any orders yet."
          actionLabel="Shop Now"
          onAction={() => navigate('/')}
        />
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Order No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {order.documentNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdDate || '').toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">{order.orderItems?.length || 0}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    ${order.totalPrice?.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={order.status}
                      color={statusColor[order.status || ''] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" startIcon={<Visibility />}>
                      Detail
                    </Button>
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
