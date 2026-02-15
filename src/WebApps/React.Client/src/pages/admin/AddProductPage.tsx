import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ProductForm {
  name: string;
  summary: string;
  description: string;
  price: number;
  no: string;
}

export default function AddProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm>({
    name: '',
    summary: '',
    description: '',
    price: 0,
    no: '',
  });

  const mutation = useMutation({
    mutationFn: (data: ProductForm) => api.post(API_ENDPOINTS.PRODUCTS.CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      navigate('/admin');
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Add New Product
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 2, maxWidth: 800, mx: 'auto' }} elevation={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Product No"
              name="no"
              fullWidth
              value={form.no}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
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
              disabled={mutation.isPending || !form.name || !form.no}
              startIcon={mutation.isPending ? <CircularProgress size={20} /> : undefined}
            >
              {mutation.isPending ? 'Creating...' : 'Create Product'}
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
