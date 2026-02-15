import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Divider, Chip, IconButton } from '@mui/material';
import { ShoppingCart, FavoriteBorder, Favorite, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import Spinner from '@/components/ui/Spinner';
import type { Product } from '@/types/product';

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
        setProduct(data.result ?? data);
      } catch {
        console.error('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <Spinner />;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: 3,
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h1" color="grey.400">
              {product.name[0]}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box>
            <Chip label={product.no} size="small" sx={{ mb: 1 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="h5" color="primary.dark" fontWeight={700} gutterBottom>
              ${product.price.toFixed(2)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Summary
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {product.summary}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {product.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={() =>
                  addItem({
                    itemNo: product.no,
                    productName: product.name,
                    price: product.price,
                  })
                }
              >
                Add to Cart
              </Button>
              <IconButton
                size="large"
                onClick={() =>
                  toggleItem({
                    id: String(product.id),
                    name: product.name,
                    price: product.price,
                  })
                }
              >
                {isInWishlist(String(product.id)) ? (
                  <Favorite sx={{ color: '#DB4444', fontSize: 32 }} />
                ) : (
                  <FavoriteBorder sx={{ fontSize: 32 }} />
                )}
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </motion.div>
  );
}
