import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  Paper,
  Radio,
  Stack,
  TextField,
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

const SHIPPING = 5.55;
const TAXES = 2.0;

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

  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const handleAddAddress = (data: AddressForm) => {
    const newAddress: Address = { ...data, _id: `addr-${Date.now()}` };
    setAddresses((prev) => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    reset();
    toast.success('Address added');
  };

  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setOrderLoading(true);
    try {
      const orderNo = `ORD-${Date.now()}`;
      const total = subtotal() + SHIPPING + TAXES;

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
          amount: Math.round(total * 23000),
          description: `Order ${orderNo}`,
          buyerName: `${user?.firstName} ${user?.lastName}`,
          buyerEmail: user?.email || user?.userName,
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
    >
      {/* left box */}
      <Stack rowGap={4}>
        {/* heading */}
        <Stack flexDirection="row" columnGap={is480 ? 0.3 : 1} alignItems="center">
          <motion.div whileHover={{ x: -5 }}>
            <IconButton component={Link} to="/cart">
              <ArrowBackIcon fontSize={is480 ? 'medium' : 'large'} />
            </IconButton>
          </motion.div>
          <Typography variant="h4">Shipping Information</Typography>
        </Stack>

        {/* address form */}
        <Stack component="form" noValidate rowGap={2} onSubmit={handleSubmit(handleAddAddress)}>
          <Stack>
            <Typography gutterBottom>Type</Typography>
            <TextField placeholder="Eg. Home, Business" {...register('type', { required: true })} />
          </Stack>
          <Stack>
            <Typography gutterBottom>Street</Typography>
            <TextField {...register('street', { required: true })} />
          </Stack>
          <Stack>
            <Typography gutterBottom>Country</Typography>
            <TextField {...register('country', { required: true })} />
          </Stack>
          <Stack>
            <Typography gutterBottom>Phone Number</Typography>
            <TextField type="number" {...register('phoneNumber', { required: true })} />
          </Stack>
          <Stack flexDirection="row">
            <Stack width="100%">
              <Typography gutterBottom>City</Typography>
              <TextField {...register('city', { required: true })} />
            </Stack>
            <Stack width="100%">
              <Typography gutterBottom>State</Typography>
              <TextField {...register('state', { required: true })} />
            </Stack>
            <Stack width="100%">
              <Typography gutterBottom>Postal Code</Typography>
              <TextField type="number" {...register('postalCode', { required: true })} />
            </Stack>
          </Stack>
          <Stack flexDirection="row" alignSelf="flex-end" columnGap={1}>
            <LoadingButton type="submit" variant="contained">
              add
            </LoadingButton>
            <Button color="error" variant="outlined" onClick={() => reset()}>
              Reset
            </Button>
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
          <Grid container gap={2} width={is900 ? 'auto' : '50rem'} justifyContent="flex-start" alignContent="flex-start">
            {addresses.map((address, index) => (
              <FormControl key={address._id}>
                <Stack
                  p={2}
                  width={is480 ? '100%' : '20rem'}
                  height={is480 ? 'auto' : '15rem'}
                  rowGap={2}
                  component={Paper}
                  elevation={1}
                >
                  <Stack flexDirection="row" alignItems="center">
                    <Radio
                      checked={selectedAddress?._id === address._id}
                      name="addressRadioGroup"
                      onChange={() => setSelectedAddress(addresses[index])}
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
      <Stack width={is900 ? '100%' : 'auto'} alignItems={is900 ? 'flex-start' : undefined}>
        <Typography variant="h4">Order summary</Typography>
        <CartContent checkout />
        <LoadingButton
          fullWidth
          loading={orderLoading}
          variant="contained"
          onClick={handleCreateOrder}
          size="large"
        >
          Pay and order
        </LoadingButton>
      </Stack>
    </Stack>
  );
}
