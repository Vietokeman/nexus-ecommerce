import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
        >
          <motion.div whileHover={{ x: -5 }}>
            <IconButton component={Link} to="/">
              <ArrowBackIcon fontSize={is480 ? 'medium' : 'large'} />
            </IconButton>
          </motion.div>
          <Typography variant="h4" fontWeight={500}>
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
                <Stack key={item.id} component={is480 ? 'div' : Paper} elevation={1}>
                  {/* product card */}
                  <Stack p={2} width={is480 ? '100%' : '18rem'}>
                    <Stack flexDirection="row" justifyContent="flex-end">
                      <Checkbox
                        checked
                        icon={<FavoriteBorder />}
                        checkedIcon={<Favorite sx={{ color: 'red' }} />}
                        onChange={(e) =>
                          handleAddRemoveFromWishlist(item.id, e.target.checked)
                        }
                      />
                    </Stack>
                    <Stack
                      component={Link}
                      to={`/product-details/${item.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                      alignItems="center"
                    >
                      <Typography variant="h6" fontWeight={500} noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ${item.price}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* actions */}
                  <Stack paddingLeft={2} paddingRight={2} paddingBottom={2}>
                    {cartItems.some((cartItem) => cartItem.itemNo === item.id) ? (
                      <Button
                        sx={{ mt: 2 }}
                        size="small"
                        variant="outlined"
                        component={Link}
                        to="/cart"
                      >
                        Already in cart
                      </Button>
                    ) : (
                      <Button
                        sx={{ mt: 2 }}
                        size="small"
                        onClick={() => handleAddToCart(item)}
                        variant="outlined"
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
