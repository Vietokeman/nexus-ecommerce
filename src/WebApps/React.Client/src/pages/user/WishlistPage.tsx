import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
} from '@mui/material';
import { Delete, ShoppingCart } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import EmptyState from '@/components/ui/EmptyState';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save items you love for later!"
        actionLabel="Browse Products"
        onAction={() => navigate('/')}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Wishlist ({items.length})
      </Typography>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid key={item.no} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card sx={{ borderRadius: 2, height: '100%' }} elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    #{item.no}
                  </Typography>
                  <Typography variant="h6" color="primary.dark" fontWeight={700}>
                    ${item.price.toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => {
                      addToCart({
                        itemNo: item.no,
                        productName: item.name,
                        price: item.price,
                        quantity: 1,
                      });
                      removeItem(item.no);
                    }}
                  >
                    Add to Cart
                  </Button>
                  <IconButton color="error" onClick={() => removeItem(item.no)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}
