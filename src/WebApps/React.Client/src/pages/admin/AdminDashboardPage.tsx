import { Box, Typography, Grid, Paper, Skeleton } from '@mui/material';
import { ShoppingCart, People, Inventory, AttachMoney } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboardPage() {
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get(API_ENDPOINTS.PRODUCTS.LIST).then((r) => {
      const data = r.data;
      return Array.isArray(data) ? data : (data?.result ?? []);
    }),
  });

  const stats: StatCard[] = [
    {
      title: 'Total Products',
      value: products?.length || 0,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Active Orders',
      value: '—',
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Customers',
      value: '—',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Revenue',
      value: '—',
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid key={i} item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  borderLeft: `4px solid ${stat.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
                elevation={2}
              >
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  {loadingProducts ? (
                    <Skeleton width={60} height={32} />
                  ) : (
                    <Typography variant="h5" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dashboard analytics and recent activity will appear here once the system collects data.
        </Typography>
      </Paper>
    </motion.div>
  );
}
