import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import emptyWishlistAnimation from '@/assets/animations/emptyWishlist.json';

export default function WishlistPage() {
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const cartItems = useCartStore((s) => s.items);
  const addToCart = useCartStore((s) => s.addItem);
  const theme = useTheme();
  const is1130 = useMediaQuery(theme.breakpoints.down(1130));
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const is642 = useMediaQuery(theme.breakpoints.down(642));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleAddRemoveFromWishlist = (productId: string, checked: boolean) => {
    if (!checked) {
      removeFromWishlist(productId);
      toast.success('Product removed from wishlist');
    }
  };

  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    addToCart({ itemNo: item.id, productName: item.name, price: item.price });
    toast.success('Product added to cart');
  };

  return (
    <Stack justifyContent="flex-start" mt={is480 ? 3 : 5} mb="14rem" alignItems="center">
      <Stack width={is1130 ? 'auto' : '70rem'} rowGap={is480 ? 2 : 4}>
        {/* heading area and back button */}
        <Stack
          alignSelf="flex-start"
          flexDirection="row"
          columnGap={1}
          justifyContent="center"
          alignItems="center"
          className="nx-liquid-glass"
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 16px 30px rgba(0, 0, 0, 0.05)',
          }}
        >
          <motion.div whileHover={{ x: -5 }}>
            <IconButton component={Link} to="/">
              <ArrowBackIcon fontSize={is480 ? 'medium' : 'large'} />
            </IconButton>
          </motion.div>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Your wishlist
          </Typography>
        </Stack>

        {/* product grid */}
        <Stack>
          {wishlistItems.length === 0 ? (
            <Stack
              minHeight="60vh"
              width={is642 ? 'auto' : '40rem'}
              justifySelf="center"
              alignSelf="center"
              justifyContent="center"
              alignItems="center"
            >
              <Lottie animationData={emptyWishlistAnimation} />
              <Typography variant="h6" fontWeight={300}>
                You have no items in your wishlist
              </Typography>
            </Stack>
          ) : (
            <Grid container gap={1} justifyContent="center" alignContent="center">
              {wishlistItems.map((item) => (
                <Stack key={item.id} component={is480 ? 'div' : Paper} elevation={0} sx={{ background: 'transparent' }}>
                  {/* product card */}
                  <Stack
                    p={2.5}
                    width={is480 ? '100%' : '18rem'}
                    sx={{
                      borderRadius: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: '0 12px 32px -16px rgba(0, 0, 0, 0.08)',
                      transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1), border-color 350ms, box-shadow 350ms',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        borderColor: '#D4AF37',
                        boxShadow: '0 20px 40px -15px rgba(212, 175, 55, 0.18)',
                      },
                    }}
                  >
                    <Stack flexDirection="row" justifyContent="flex-end">
                      <Checkbox
                        checked
                        icon={<FavoriteBorder />}
                        checkedIcon={<Favorite sx={{ color: 'red' }} />}
                        onChange={(e) => handleAddRemoveFromWishlist(item.id, e.target.checked)}
                      />
                    </Stack>
                    <Stack
                      component={Link}
                      to={`/product-details/${item.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                      alignItems="center"
                    >
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1C1917' }} noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#D4AF37', mt: 0.5 }}>
                        ${item.price}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* actions */}
                  <Stack paddingLeft={2.5} paddingRight={2.5} paddingBottom={2.5}>
                    {cartItems.some((cartItem) => cartItem.itemNo === item.id) ? (
                      <Button
                        sx={{
                          mt: 2,
                          borderRadius: 999,
                          fontWeight: 700,
                          py: 1,
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: '#CA8A04',
                          bgcolor: 'rgba(212,175,55,0.05)',
                        }}
                        size="small"
                        variant="outlined"
                        component={Link}
                        to="/cart"
                      >
                        Already in cart
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => handleAddToCart(item)}
                        variant="contained"
                        sx={{
                          mt: 2,
                          borderRadius: 999,
                          fontWeight: 700,
                          py: 1,
                          background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
                          color: '#FAF9F6',
                          boxShadow: '0 8px 16px -6px rgba(28, 25, 23, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                            color: '#0C0A09',
                            boxShadow: '0 12px 20px -8px rgba(212, 175, 55, 0.4)',
                          },
                        }}
                      >
                        Add To Cart
                      </Button>
                    )}
                  </Stack>
                </Stack>
              ))}
            </Grid>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
