import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { Add, Remove, Delete, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cart-store';
import EmptyState from '@/components/ui/EmptyState';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, shipping, taxAmount, total } =
    useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add some products to get started!"
        actionLabel="Browse Products"
        onAction={() => navigate('/')}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Continue Shopping
      </Button>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Shopping Cart ({items.length} items)
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Cart Items */}
        <Box sx={{ flex: 2 }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Subtotal</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.itemNo}>
                    <TableCell>
                      <Typography fontWeight={600}>{item.productName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        #{item.itemNo}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">${item.price.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.itemNo, item.quantity - 1)}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 1, minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.itemNo, item.quantity + 1)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeItem(item.itemNo)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button variant="outlined" color="error" onClick={clearCart}>
              Clear Cart
            </Button>
          </Box>
        </Box>

        {/* Order Summary */}
        <Paper sx={{ flex: 1, p: 3, height: 'fit-content', borderRadius: 2 }} elevation={2}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Order Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal</Typography>
            <Typography>${subtotal().toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Shipping</Typography>
            <Typography>${shipping().toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Tax (5%)</Typography>
            <Typography>${taxAmount().toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Total
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.dark">
              ${total().toFixed(2)}
            </Typography>
          </Box>
          <Button variant="contained" fullWidth size="large" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </Button>
        </Paper>
      </Box>
    </motion.div>
  );
}
