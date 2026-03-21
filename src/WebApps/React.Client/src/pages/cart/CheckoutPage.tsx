import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Paper,
  Radio,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { CartContent } from './CartPage';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { SHIPPING, TAXES, VND_RATE } from '@/constants';
import { PremiumButton, PremiumInput } from '@/components/ui/primitives';

const RESERVE_WINDOW_MS = 15 * 60 * 1000;

const getReserveKey = (userIdentity: string) => `checkout-reserve-expire-at:${userIdentity}`;

interface AddressForm {
  type: string;
  street: string;
  country: string;
  phoneNumber: string;
  city: string;
  state: string;
  postalCode: string;
}

interface Address extends AddressForm {
  _id: string;
}

export default function CheckoutPage() {
  const { register, handleSubmit, reset } = useForm<AddressForm>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [orderLoading, setOrderLoading] = useState(false);
  const [reserveExpiresAt, setReserveExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const subTotalValue = subtotal();
  const taxValue = (subTotalValue * TAXES) / 100;
  const grandTotal = subTotalValue + SHIPPING + taxValue;
  const userIdentity = user?.email || user?.userName || 'guest';

  useEffect(() => {
    if (items.length === 0) {
      setReserveExpiresAt(null);
      return;
    }

    const key = getReserveKey(userIdentity);
    const saved = Number(window.sessionStorage.getItem(key) ?? 0);
    const baseTime = Date.now();
    const nextExpire = saved > baseTime ? saved : baseTime + RESERVE_WINDOW_MS;
    window.sessionStorage.setItem(key, String(nextExpire));
    setReserveExpiresAt(nextExpire);
  }, [items.length, userIdentity]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const reserveRemainingMs = useMemo(() => {
    if (!reserveExpiresAt) {
      return 0;
    }
    return Math.max(0, reserveExpiresAt - now);
  }, [reserveExpiresAt, now]);

  const reserveExpired = items.length > 0 && reserveRemainingMs <= 0;
  const reserveMinutes = Math.floor(reserveRemainingMs / 60000)
    .toString()
    .padStart(2, '0');
  const reserveSeconds = Math.floor((reserveRemainingMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');

  const restartReserveWindow = () => {
    const key = getReserveKey(userIdentity);
    const nextExpire = Date.now() + RESERVE_WINDOW_MS;
    window.sessionStorage.setItem(key, String(nextExpire));
    setReserveExpiresAt(nextExpire);
  };

  const handleAddAddress = (data: AddressForm) => {
    const newAddress: Address = { ...data, _id: `addr-${Date.now()}` };
    setAddresses((prev) => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    reset();
    toast.success('Address added');
  };

  const handleCreateOrder = async () => {
    if (reserveExpired) {
      toast.error('Your 15-minute stock reservation has expired. Please refresh it before checkout.');
      return;
    }

    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setOrderLoading(true);
    try {
      const orderNo = `ORD-${Date.now()}`;
      const total = grandTotal;

      await api.post(API_ENDPOINTS.BASKETS.UPDATE, {
        userName: user?.email || user?.userName,
        items: items.map((i) => ({
          itemNo: i.itemNo,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      await api.post(API_ENDPOINTS.BASKETS.CHECKOUT, {
        userName: user?.email || user?.userName,
        totalPrice: total,
        firstName: user?.firstName,
        lastName: user?.lastName,
        emailAddress: user?.email || user?.userName,
        shippingAddress: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`,
        invoiceAddress: `${selectedAddress.street}, ${selectedAddress.city}`,
      });

      if (selectedPaymentMethod === 'CARD') {
        const paymentData = {
          orderNo,
          amount: Math.round(total * VND_RATE),
          description: `Order ${orderNo}`,
          buyerName: `${user?.firstName} ${user?.lastName}`,
          buyerEmail: user?.email || user?.userName,
          items: items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            price: Math.round(i.price * VND_RATE),
          })),
        };
        const { data } = await api.post(API_ENDPOINTS.PAYMENT.CREATE, paymentData);
        const paymentUrl = data.result?.paymentUrl || data.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
      }

      clearCart();
      navigate(`/order-success/${orderNo}`);
    } catch {
      toast.error('Error creating order, please try again');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <Stack
      flexDirection="row"
      p={2}
      rowGap={10}
      justifyContent="center"
      flexWrap="wrap"
      mb="5rem"
      mt={2}
      columnGap={4}
      alignItems="flex-start"
      sx={{
        borderRadius: { xs: 0, md: 4 },
      }}
    >
      {items.length === 0 && (
        <Stack
          width="100%"
          maxWidth="56rem"
          p={3}
          sx={{ borderRadius: 3, border: '1px solid #EADCC8', background: '#fff' }}
        >
          <Typography variant="h5" fontWeight={700}>
            Your cart is empty
          </Typography>
          <Typography color="text.secondary" mt={0.8} mb={2}>
            Add products before continuing to checkout.
          </Typography>
          <PremiumButton magnetic={false} onClick={() => navigate('/')}>
            Continue Shopping
          </PremiumButton>
        </Stack>
      )}

      {items.length > 0 && (
      <>
      <Stack
        width="100%"
        maxWidth="56rem"
        sx={{
          p: 2,
          borderRadius: 2.5,
          border: reserveExpired ? '1px solid #F0B3A8' : '1px solid #E5D9C5',
          background: reserveExpired
            ? 'linear-gradient(145deg, rgba(255,244,241,0.92), rgba(255,255,255,0.98))'
            : 'linear-gradient(145deg, rgba(255,248,236,0.9), rgba(240,251,248,0.88) 62%, rgba(255,255,255,0.96))',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <Typography variant="body1" fontWeight={700}>
            Temporary stock reservation window
          </Typography>
          <Typography variant="h6" fontWeight={800} color={reserveExpired ? 'error.main' : 'success.main'}>
            {reserveMinutes}:{reserveSeconds}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Checkout should be completed within 15 minutes to keep reserved stock stable.
        </Typography>
        {reserveExpired && (
          <Stack direction="row" mt={1.25}>
            <PremiumButton magnetic={false} variant="outlined" onClick={restartReserveWindow}>
              Restart 15-minute reservation
            </PremiumButton>
          </Stack>
        )}
      </Stack>

      {/* left box */}
      <Stack
        rowGap={4}
        sx={{
          p: { xs: 1.25, md: 2.25 },
          borderRadius: 3,
          border: '1px solid #EEDFCB',
          background:
            'linear-gradient(145deg, rgba(255,248,236,0.9), rgba(240,251,248,0.9) 62%, rgba(255,255,255,0.96))',
          boxShadow: '0 18px 34px rgba(126, 93, 53, 0.1)',
        }}
      >
        {/* heading */}
        <Stack flexDirection="row" columnGap={is480 ? 0.3 : 1} alignItems="center">
          <motion.div whileHover={{ x: -5 }}>
            <IconButton
              component={Link}
              to="/cart"
              sx={{ border: '1px solid #E7DCCB', bgcolor: '#FFFFFF' }}
            >
              <ArrowBackIcon fontSize={is480 ? 'medium' : 'large'} />
            </IconButton>
          </motion.div>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Shipping Information
          </Typography>
        </Stack>

        {/* address form */}
        <Stack
          component="form"
          noValidate
          rowGap={2}
          onSubmit={handleSubmit(handleAddAddress)}
          sx={{
            p: { xs: 1, sm: 1.75 },
            borderRadius: 2.5,
            border: '1px solid #EBDCC7',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF6 100%)',
          }}
        >
          <PremiumInput
            label="Type"
            placeholder="Eg. Home, Business"
            {...register('type', { required: true })}
          />
          <PremiumInput label="Street" {...register('street', { required: true })} />
          <PremiumInput label="Country" {...register('country', { required: true })} />
          <PremiumInput
            label="Phone Number"
            type="number"
            {...register('phoneNumber', { required: true })}
          />
          <Stack flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
            <Stack width="100%">
              <PremiumInput label="City" {...register('city', { required: true })} />
            </Stack>
            <Stack width="100%">
              <PremiumInput label="State" {...register('state', { required: true })} />
            </Stack>
            <Stack width="100%">
              <PremiumInput
                label="Postal Code"
                type="number"
                {...register('postalCode', { required: true })}
              />
            </Stack>
          </Stack>
          <Stack flexDirection="row" alignSelf="flex-end" columnGap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              sx={{ borderRadius: '9999px', px: 2.5, fontWeight: 700 }}
            >
              add
            </LoadingButton>
            <PremiumButton
              color="error"
              variant="outlined"
              magnetic={false}
              onClick={() => reset()}
            >
              Reset
            </PremiumButton>
          </Stack>
        </Stack>

        {/* existing addresses */}
        <Stack rowGap={3}>
          <Stack>
            <Typography variant="h6">Address</Typography>
            <Typography variant="body2" color="text.secondary">
              Choose from existing Addresses
            </Typography>
          </Stack>
          <Grid
            container
            gap={2}
            width={is900 ? 'auto' : '50rem'}
            justifyContent="flex-start"
            alignContent="flex-start"
          >
            {addresses.map((address, index) => (
              <FormControl key={address._id}>
                <Stack
                  p={2}
                  width={is480 ? '100%' : '20rem'}
                  height={is480 ? 'auto' : '15rem'}
                  rowGap={2}
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 2.5,
                    border:
                      selectedAddress?._id === address._id
                        ? '1px solid #DCB47A'
                        : '1px solid #E9DFD1',
                    background: selectedAddress?._id === address._id ? '#FFF8ED' : '#FFFFFF',
                    boxShadow:
                      selectedAddress?._id === address._id
                        ? '0 12px 24px rgba(126, 93, 53, 0.13)'
                        : '0 8px 18px rgba(126, 93, 53, 0.07)',
                  }}
                >
                  <Stack flexDirection="row" alignItems="center">
                    <Radio
                      checked={selectedAddress?._id === address._id}
                      name="addressRadioGroup"
                      onChange={() => setSelectedAddress(addresses[index] ?? null)}
                    />
                    <Typography>{address.type}</Typography>
                  </Stack>
                  <Stack>
                    <Typography>{address.street}</Typography>
                    <Typography>
                      {address.state}, {address.city}, {address.country}, {address.postalCode}
                    </Typography>
                    <Typography>{address.phoneNumber}</Typography>
                  </Stack>
                </Stack>
              </FormControl>
            ))}
          </Grid>
        </Stack>

        {/* payment methods */}
        <Stack rowGap={3}>
          <Stack>
            <Typography variant="h6">Payment Methods</Typography>
            <Typography variant="body2" color="text.secondary">
              Please select a payment method
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={selectedPaymentMethod === 'COD' ? 'Cash on Delivery selected' : 'Cash on Delivery'}
              color={selectedPaymentMethod === 'COD' ? 'success' : 'default'}
              variant={selectedPaymentMethod === 'COD' ? 'filled' : 'outlined'}
            />
            <Chip
              label={selectedPaymentMethod === 'CARD' ? 'Card Payment selected' : 'Card Payment'}
              color={selectedPaymentMethod === 'CARD' ? 'success' : 'default'}
              variant={selectedPaymentMethod === 'CARD' ? 'filled' : 'outlined'}
            />
          </Stack>
          <Stack rowGap={2}>
            <Stack flexDirection="row" justifyContent="flex-start" alignItems="center">
              <Radio
                checked={selectedPaymentMethod === 'COD'}
                onChange={() => setSelectedPaymentMethod('COD')}
              />
              <Typography>Cash</Typography>
            </Stack>
            <Stack flexDirection="row" justifyContent="flex-start" alignItems="center">
              <Radio
                checked={selectedPaymentMethod === 'CARD'}
                onChange={() => setSelectedPaymentMethod('CARD')}
              />
              <Typography>Card</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* right box */}
      <Stack
        width={is900 ? '100%' : 'auto'}
        alignItems={is900 ? 'flex-start' : undefined}
        sx={{
          p: { xs: 1.25, md: 2 },
          borderRadius: 3,
          border: '1px solid #EADCC8',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF6 100%)',
          boxShadow: '0 16px 30px rgba(126, 93, 53, 0.08)',
        }}
      >
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          Order summary
        </Typography>
        <CartContent checkout />
        <Divider />
        <Stack rowGap={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography fontWeight={600}>${subTotalValue.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Shipping</Typography>
            <Typography fontWeight={600}>${SHIPPING.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Tax ({TAXES}%)</Typography>
            <Typography fontWeight={600}>${taxValue.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" mt={0.5}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" fontWeight={800}>${grandTotal.toFixed(2)}</Typography>
          </Stack>
        </Stack>
        <LoadingButton
          fullWidth
          loading={orderLoading}
          variant="contained"
          onClick={handleCreateOrder}
          size="large"
          disabled={!selectedAddress || items.length === 0 || reserveExpired}
          sx={{ borderRadius: 999, fontWeight: 700 }}
        >
          Pay and order
        </LoadingButton>
      </Stack>
      </>
      )}
    </Stack>
  );
}
