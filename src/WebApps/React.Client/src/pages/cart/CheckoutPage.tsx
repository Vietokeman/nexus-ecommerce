import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';
import type { PaymentRequest } from '@/types/payment';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
  shippingAddress: yup.string().required('Shipping address is required'),
});

type CheckoutForm = yup.InferType<typeof schema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, shipping, taxAmount, total, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('payos');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (formData: CheckoutForm) => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Sync basket to server
      await api.post(API_ENDPOINTS.BASKETS.UPDATE, {
        userName: formData.email,
        items: items.map((i) => ({
          itemNo: i.itemNo,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      // 2. Create checkout / order
      const orderNo = `ORD-${Date.now()}`;
      await api.post(API_ENDPOINTS.BASKETS.CHECKOUT, {
        userName: formData.email,
        totalPrice: total(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        shippingAddress: formData.shippingAddress,
        invoiceAddress: formData.shippingAddress,
      });

      if (paymentMethod === 'payos') {
        // 3. Create PayOS payment link
        const paymentData: PaymentRequest = {
          orderNo,
          amount: Math.round(total() * 23000), // Convert USD to VND
          description: `Order ${orderNo}`,
          buyerName: `${formData.firstName} ${formData.lastName}`,
          buyerEmail: formData.email,
          buyerPhone: formData.phone,
          items: items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            price: Math.round(i.price * 23000),
          })),
        };

        const { data } = await api.post(API_ENDPOINTS.PAYMENT.CREATE, paymentData);
        const paymentUrl = data.result?.paymentUrl || data.paymentUrl;

        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
        toast.error('Failed to create payment link');
      } else {
        // COD - redirect to success
        clearCart();
        navigate(`/order-success/${orderNo}`);
      }
    } catch (err) {
      console.error('Checkout failed', err);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Checkout
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          {/* Shipping Info */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Shipping Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="First Name"
                    fullWidth
                    {...register('firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    {...register('lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Email"
                    fullWidth
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Phone" fullWidth {...register('phone')} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Shipping Address"
                    fullWidth
                    multiline
                    rows={3}
                    {...register('shippingAddress')}
                    error={!!errors.shippingAddress}
                    helperText={errors.shippingAddress?.message}
                  />
                </Grid>
              </Grid>

              {/* Payment Method */}
              <Box sx={{ mt: 3 }}>
                <FormLabel sx={{ fontWeight: 600 }}>Payment Method</FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="payos"
                    control={<Radio />}
                    label="PayOS (Bank Transfer / QR Code)"
                  />
                  <FormControlLabel
                    value="cod"
                    control={<Radio />}
                    label="Cash on Delivery (COD)"
                  />
                </RadioGroup>
              </Box>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {items.map((item) => (
                <Box
                  key={item.itemNo}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography variant="body2">
                    {item.productName} x{item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
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
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : undefined}
              >
                {paymentMethod === 'payos' ? 'Pay with PayOS' : 'Place Order (COD)'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </motion.div>
  );
}
