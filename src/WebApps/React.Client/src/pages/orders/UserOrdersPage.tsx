import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import loadingAnimation from '@/assets/animations/loading.json';
import noOrdersAnimation from '@/assets/animations/noOrders.json';
import ImageFallback from '@/components/ui/ImageFallback';

interface OrderItem {
  productName: string;
  itemNo: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  documentNo: string;
  createdDate: string;
  totalPrice: number;
  status: string;
  orderItems: OrderItem[];
}

const statusColorMap: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  Pending: 'warning',
  Paid: 'info',
  Shipping: 'info',
  Shipped: 'info',
  Fullfilled: 'success',
  Cancelled: 'error',
};

export default function UserOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const cartItems = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addItem);
  const theme = useTheme();
  const is1200 = useMediaQuery(theme.breakpoints.down(1200));
  const is768 = useMediaQuery(theme.breakpoints.down(768));
  const is660 = useMediaQuery(theme.breakpoints.down(660));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const userName = user?.userName || user?.email || 'guest';

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ['orders', userName],
    queryFn: () =>
      api.get(API_ENDPOINTS.ORDERS.BY_USER(userName)).then((r) => r.data?.result || r.data || []),
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error('Error fetching orders, please try again later');
    }
  }, [isError]);

  const handleAddToCart = (item: OrderItem) => {
    addToCart({ itemNo: item.itemNo, productName: item.productName, price: item.price });
    toast.success('Product added to cart');
  };

  return (
    <Stack justifyContent="center" alignItems="center">
      {isLoading ? (
        <Stack
          width={is480 ? 'auto' : '25rem'}
          height="calc(100vh - 4rem)"
          justifyContent="center"
          alignItems="center"
        >
          <Lottie animationData={loadingAnimation} />
        </Stack>
      ) : (
        <Stack
          width={is1200 ? 'auto' : '60rem'}
          p={is480 ? 2 : 4}
          mb="5rem"
          sx={{
            borderRadius: is480 ? 0 : 4,
            border: is480 ? 'none' : '1px solid #ECE2D4',
            background: is480 ? 'transparent' : 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF6 100%)',
            boxShadow: is480 ? 'none' : '0 20px 38px rgba(120, 94, 52, 0.08)',
          }}
        >
          {/* heading and navigation */}
          <Stack
            flexDirection="row"
            columnGap={2}
            sx={{
              p: { xs: 0, sm: 1.5 },
              borderRadius: 3,
              background:
                'linear-gradient(130deg, rgba(255,247,232,0.9), rgba(241,251,249,0.9) 58%, rgba(255,255,255,1))',
              border: '1px solid #EFE1CB',
            }}
          >
            {!is480 && (
              <motion.div whileHover={{ x: -5 }} style={{ alignSelf: 'center' }}>
                <IconButton
                  component={Link}
                  to="/"
                  sx={{ bgcolor: '#FFFFFF', border: '1px solid #E8DCCB' }}
                >
                  <ArrowBackIcon fontSize="large" />
                </IconButton>
              </motion.div>
            )}

            <Stack rowGap={1}>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Order history
              </Typography>
              <Typography sx={{ wordWrap: 'break-word' }} color="text.secondary">
                Check the status of recent orders, manage returns, and discover similar products.
              </Typography>
            </Stack>
          </Stack>

          {/* orders */}
          <Stack mt={5} rowGap={5}>
            {orders.map((order) => (
              <Stack
                key={order.id}
                p={is480 ? 0 : 2.25}
                component={is480 ? 'div' : Paper}
                elevation={0}
                rowGap={2}
                sx={{
                  borderRadius: 3,
                  border: is480 ? 'none' : '1px solid #E7DCCD',
                  background: is480 ? 'transparent' : 'linear-gradient(180deg, #FFFFFF, #FFFCF8)',
                  boxShadow: is480 ? 'none' : '0 16px 30px rgba(130, 95, 53, 0.07)',
                }}
              >
                {/* upper */}
                <Stack
                  flexDirection="row"
                  rowGap="1rem"
                  justifyContent="space-between"
                  flexWrap="wrap"
                >
                  <Stack flexDirection="row" columnGap={4} rowGap="1rem" flexWrap="wrap">
                    <Stack>
                      <Typography>Order Number</Typography>
                      <Typography color="text.secondary">{order.documentNo}</Typography>
                    </Stack>
                    <Stack>
                      <Typography>Date Placed</Typography>
                      <Typography color="text.secondary">
                        {new Date(order.createdDate).toDateString()}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography>Total Amount</Typography>
                      <Typography fontWeight={700} color="primary.main">
                        ${order.totalPrice}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack>
                    <Typography fontWeight={600}>Item: {order.orderItems?.length || 0}</Typography>
                  </Stack>
                </Stack>

                {/* middle */}
                <Stack rowGap={2}>
                  {order.orderItems?.map((product) => (
                    <Stack
                      key={product.itemNo}
                      mt={2}
                      flexDirection="row"
                      rowGap={is768 ? '2rem' : undefined}
                      columnGap={4}
                      flexWrap={is768 ? 'wrap' : 'nowrap'}
                      sx={{
                        p: { xs: 1.5, sm: 1.75 },
                        borderRadius: 2.5,
                        border: '1px solid #EEE4D7',
                        background: '#FFFFFF',
                      }}
                    >
                      <Stack>
                        <ImageFallback
                          style={{
                            width: '100%',
                            aspectRatio: is480 ? '3/2' : '1/1',
                            objectFit: 'contain',
                            borderRadius: 12,
                            border: '1px solid #EFE5D7',
                            background: '#FFFCF7',
                          }}
                          src={product.imageUrl}
                          fallbackSrc="https://via.placeholder.com/200"
                          alt={product.productName}
                        />
                      </Stack>

                      <Stack rowGap={1} width="100%">
                        <Stack flexDirection="row" justifyContent="space-between">
                          <Stack>
                            <Typography variant="h6" fontSize="1rem" fontWeight={500}>
                              {product.productName}
                            </Typography>
                            <Typography color="text.secondary" fontSize=".9rem">
                              Qty: {product.quantity}
                            </Typography>
                          </Stack>
                          <Typography>${product.price}</Typography>
                        </Stack>

                        <Stack
                          mt={2}
                          alignSelf={is480 ? 'flex-start' : 'flex-end'}
                          flexDirection="row"
                          columnGap={2}
                        >
                          <Button
                            size="small"
                            component={Link}
                            to={`/product-details/${product.itemNo}`}
                            variant="outlined"
                            sx={{ borderRadius: 999, px: 1.6 }}
                          >
                            View Product
                          </Button>
                          {cartItems.some((ci) => ci.itemNo === product.itemNo) ? (
                            <Button
                              size="small"
                              variant="contained"
                              component={Link}
                              to="/cart"
                              sx={{ borderRadius: 999, px: 1.6 }}
                            >
                              Already in Cart
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleAddToCart(product)}
                              sx={{ borderRadius: 999, px: 1.6 }}
                            >
                              Buy Again
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>

                {/* lower */}
                <Stack
                  mt={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack mb={2} direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={600}>Status</Typography>
                    <Chip
                      size="small"
                      label={order.status}
                      color={statusColorMap[order.status] || 'default'}
                      variant="outlined"
                    />
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    to={`/orders/${order.documentNo}/tracking`}
                    sx={{ mb: 2, fontWeight: 700, borderRadius: 999, px: 1.8 }}
                  >
                    Track Order
                  </Button>
                </Stack>
              </Stack>
            ))}

            {/* no orders animation */}
            {orders.length === 0 && (
              <Stack mt={is480 ? '2rem' : 0} mb="7rem" alignSelf="center" rowGap={2}>
                <Stack width={is660 ? 'auto' : '30rem'} height={is660 ? 'auto' : '30rem'}>
                  <Lottie animationData={noOrdersAnimation} />
                </Stack>
                <Typography textAlign="center" alignSelf="center" variant="h6">
                  oh! Looks like you haven't been shopping lately
                </Typography>
                <Button component={Link} to="/" variant="contained" sx={{ borderRadius: 999, px: 2.2 }}>
                  Explore Tet Collection
                </Button>
              </Stack>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
