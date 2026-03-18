import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useCartStore } from '@/store/cart-store';
import { SHIPPING, TAXES } from '@/constants';
import { PremiumButton } from '@/components/ui/primitives';

/* ── CartItem sub-component ─────────────────────────────────── */
interface CartItemProps {
  itemNo: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

function CartItem({ itemNo, productName, price, quantity, imageUrl }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is552 = useMediaQuery(theme.breakpoints.down(552));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const handleAddQty = () => updateQuantity(itemNo, quantity + 1);
  const handleRemoveQty = () => {
    if (quantity === 1) {
      removeItem(itemNo);
    } else {
      updateQuantity(itemNo, quantity - 1);
    }
  };
  const handleProductRemove = () => {
    removeItem(itemNo);
    toast.success('Product removed from cart');
  };

  return (
    <Stack
      bgcolor="white"
      component={is900 ? 'div' : Paper}
      p={is900 ? 0 : 2}
      elevation={1}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      {/* image and details */}
      <Stack flexDirection="row" rowGap="1rem" alignItems="center" columnGap={2} flexWrap="wrap">
        <Stack
          width={is552 ? 'auto' : '200px'}
          height={is552 ? 'auto' : '200px'}
          component={Link}
          to={`/product-details/${itemNo}`}
        >
          <img
            style={{
              width: '100%',
              height: is552 ? 'auto' : '100%',
              aspectRatio: is552 ? '1/1' : undefined,
              objectFit: 'contain',
            }}
            src={imageUrl || 'https://via.placeholder.com/200'}
            alt={`${productName} image`}
          />
        </Stack>

        <Stack>
          <Typography
            component={Link}
            to={`/product-details/${itemNo}`}
            sx={{ textDecoration: 'none', color: theme.palette.primary.main }}
            variant="h6"
            fontWeight={500}
          >
            {productName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Product
          </Typography>
          <Typography mt={1}>Quantity</Typography>
          <Stack flexDirection="row" alignItems="center">
            <IconButton onClick={handleRemoveQty}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography>{quantity}</Typography>
            <IconButton onClick={handleAddQty}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      {/* price and remove button */}
      <Stack
        justifyContent="space-evenly"
        alignSelf={is552 ? 'flex-end' : undefined}
        height="100%"
        rowGap="1rem"
        alignItems="flex-end"
      >
        <Typography variant="body2">${price}</Typography>
        <PremiumButton
          size={is480 ? 'small' : undefined}
          onClick={handleProductRemove}
          variant="contained"
          magnetic={false}
        >
          Remove
        </PremiumButton>
      </Stack>
    </Stack>
  );
}

/* ── Cart component (also reusable in Checkout) ────────────── */
interface CartProps {
  checkout?: boolean;
}

export function CartContent({ checkout }: CartProps) {
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const subtotal = useCartStore((s) => s.subtotal);
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (items.length === 0 && !checkout) {
      navigate('/');
    }
  }, [items, navigate, checkout]);

  return (
    <Stack justifyContent="flex-start" alignItems="center" mb="5rem">
      <Stack
        width={is900 ? 'auto' : '50rem'}
        mt="3rem"
        paddingLeft={checkout ? 0 : 2}
        paddingRight={checkout ? 0 : 2}
        rowGap={4}
      >
        {/* cart items */}
        <Stack rowGap={2}>
          {items.map((item) => (
            <CartItem
              key={item.itemNo}
              itemNo={item.itemNo}
              productName={item.productName}
              price={item.price}
              quantity={item.quantity}
              imageUrl={item.imageUrl}
            />
          ))}
        </Stack>

        {/* subtotal */}
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          {checkout ? (
            <Stack rowGap={2} width="100%">
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Subtotal</Typography>
                <Typography>${subtotal()}</Typography>
              </Stack>
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Shipping</Typography>
                <Typography>${SHIPPING}</Typography>
              </Stack>
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Taxes ({TAXES}%)</Typography>
                <Typography>${((subtotal() * TAXES) / 100).toFixed(2)}</Typography>
              </Stack>
              <hr />
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Total</Typography>
                <Typography>${(subtotal() + SHIPPING + (subtotal() * TAXES) / 100).toFixed(2)}</Typography>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack>
                <Typography variant="h6" fontWeight={500}>
                  Subtotal
                </Typography>
                <Typography>Total items in cart {totalItems()}</Typography>
                <Typography variant="body1" color="text.secondary">
                  Shipping and taxes will be calculated at checkout.
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="h6" fontWeight={500}>
                  ${subtotal()}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>

        {/* checkout or continue shopping */}
        {!checkout && (
          <Stack rowGap="1rem">
            <PremiumButton
              variant="contained"
              magnetic={false}
              onClick={() => navigate('/checkout')}
            >
              Checkout
            </PremiumButton>
            <motion.div style={{ alignSelf: 'center' }} whileHover={{ y: 2 }}>
              <Chip
                sx={{ cursor: 'pointer', borderRadius: '8px' }}
                component={Link}
                to="/"
                label="or continue shopping"
                variant="outlined"
              />
            </motion.div>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

/* ── Default export for route ──────────────────────────────── */
export default function CartPage() {
  return <CartContent />;
}
