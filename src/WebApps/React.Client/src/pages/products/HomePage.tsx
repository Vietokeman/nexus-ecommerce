import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import { Search, FavoriteBorder, Favorite, ShoppingCart } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import type { Product } from '@/types/product';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleItem } = useWishlistStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.PRODUCTS.LIST);
        setProducts(Array.isArray(data) ? data : (data.result ?? []));
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.no.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      {/* Hero Banner */}
      <Box
        sx={{
          bgcolor: '#000',
          color: '#fff',
          borderRadius: 3,
          p: { xs: 4, md: 6 },
          mb: 4,
          background: 'linear-gradient(135deg, #000 0%, #333 100%)',
        }}
      >
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Welcome to Our Store
        </Typography>
        <Typography variant="h6" color="grey.400" sx={{ mb: 3 }}>
          Discover amazing products at the best prices
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ bgcolor: '#DB4444', '&:hover': { bgcolor: '#b33636' } }}
        >
          Shop Now
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Products Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              <Skeleton width="60%" sx={{ mt: 1 }} />
              <Skeleton width="40%" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Grid container spacing={3}>
            {filtered.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <motion.div variants={item}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 200,
                          bgcolor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => navigate(`/product-details/${product.id}`)}
                      >
                        <Typography variant="h4" color="grey.400">
                          {product.name[0]}
                        </Typography>
                      </CardMedia>
                      <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() =>
                          toggleItem({
                            id: String(product.id),
                            name: product.name,
                            price: product.price,
                          })
                        }
                      >
                        {isInWishlist(String(product.id)) ? (
                          <Favorite sx={{ color: '#DB4444' }} />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>
                    </Box>
                    <CardContent sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        noWrap
                        onClick={() => navigate(`/product-details/${product.id}`)}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {product.summary}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 2,
                        }}
                      >
                        <Typography variant="h6" fontWeight={700} color="primary.dark">
                          ${product.price.toFixed(2)}
                        </Typography>
                        <IconButton
                          color="primary"
                          onClick={() =>
                            addItem({
                              itemNo: product.no,
                              productName: product.name,
                              price: product.price,
                            })
                          }
                        >
                          <ShoppingCart />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}
    </Box>
  );
}
