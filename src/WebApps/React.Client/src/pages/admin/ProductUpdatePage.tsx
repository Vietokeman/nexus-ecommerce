import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ProductForm {
  name: string;
  summary: string;
  description: string;
  price: number;
}

export default function ProductUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm>({
    name: '',
    summary: '',
    description: '',
    price: 0,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(API_ENDPOINTS.PRODUCTS.DETAIL(id!)).then((r) => r.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        summary: product.summary || '',
        description: product.description || '',
        price: product.price || 0,
      });
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: (data: ProductForm) => api.put(API_ENDPOINTS.PRODUCTS.UPDATE(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast.success('Product updated successfully!');
      navigate('/admin');
    },
    onError: () => toast.error('Failed to update product'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={56} sx={{ mb: 2 }} />
        ))}
      </Paper>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Update Product
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 2, maxWidth: 800, mx: 'auto' }} elevation={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Product Name"
              name="name"
              fullWidth
              value={form.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Summary"
              name="summary"
              fullWidth
              value={form.summary}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={4}
              value={form.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price"
              name="price"
              type="number"
              fullWidth
              value={form.price}
              onChange={handleChange}
              required
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending || !form.name}
              startIcon={mutation.isPending ? <CircularProgress size={20} /> : undefined}
            >
              {mutation.isPending ? 'Updating...' : 'Update Product'}
            </Button>
            <Button variant="outlined" sx={{ ml: 2 }} onClick={() => navigate('/admin')}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
}
