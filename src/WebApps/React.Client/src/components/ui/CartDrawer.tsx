import { Box, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart-store';
import { nexus } from '@/theme/theme';
import ImageFallback from '@/components/ui/ImageFallback';
import { PremiumBadge, PremiumButton } from '@/components/ui/primitives';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = useCartStore((s) => s.total);
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          background:
            'linear-gradient(160deg, rgba(255,252,246,0.96), rgba(245,253,251,0.95) 60%, rgba(255,255,255,0.98))',
          backdropFilter: nexus.glass.blurHeavy,
          WebkitBackdropFilter: nexus.glass.blurHeavy,
          borderLeft: '1px solid #EADCC8',
        },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E8DCCB' }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShoppingCartOutlinedIcon sx={{ color: nexus.orange[600] }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: nexus.neutral[900] }}>
              Cart
            </Typography>
            <PremiumBadge
              label={items.length}
              sx={{ background: nexus.gradient.button, color: '#fff' }}
            />
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Items */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
          {items.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }} spacing={2}>
              <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: nexus.neutral[300] }} />
              <Typography variant="body1" sx={{ color: nexus.neutral[500] }}>
                Your cart is empty
              </Typography>
              <PremiumButton
                variant="outlined"
                magnetic={false}
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
              >
                Start Shopping
              </PremiumButton>
            </Stack>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.itemNo}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      py: 1.5,
                      borderBottom: '1px solid #F0E6D8',
                    }}
                  >
                    {/* Image */}
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: nexus.radius.md,
                        backgroundColor: '#FFFDF8',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #EDE2D2',
                      }}
                    >
                      {item.imageUrl ? (
                        <ImageFallback
                          src={item.imageUrl}
                          alt={item.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Stack
                          alignItems="center"
                          justifyContent="center"
                          sx={{ width: '100%', height: '100%' }}
                        >
                          <ShoppingCartOutlinedIcon
                            sx={{ color: nexus.neutral[300], fontSize: 20 }}
                          />
                        </Stack>
                      )}
                    </Box>

                    {/* Details */}
                    <Stack flex={1} justifyContent="center" spacing={0.25}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {item.productName}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          background: nexus.gradient.primary,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Stack>

                    {/* Quantity controls */}
                    <Stack alignItems="center" justifyContent="center" spacing={0.5}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                          border: '1px solid #E8DCC9',
                          borderRadius: nexus.radius.sm,
                          overflow: 'hidden',
                          background: '#FFFFFF',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.itemNo, item.quantity - 1)}
                          sx={{ borderRadius: 0, p: 0.5 }}
                        >
                          <RemoveIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ px: 1, minWidth: 24, textAlign: 'center' }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.itemNo, item.quantity + 1)}
                          sx={{ borderRadius: 0, p: 0.5 }}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                      <IconButton
                        size="small"
                        onClick={() => removeItem(item.itemNo)}
                        sx={{ color: '#EF4444' }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </Box>

        {/* Footer Summary */}
        {items.length > 0 && (
          <Stack sx={{ px: 2.5, pb: 2.5, pt: 1.5, borderTop: `1px solid ${nexus.neutral[200]}` }}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" sx={{ color: nexus.neutral[500] }}>
                Subtotal
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ${subtotal().toFixed(2)}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography variant="body1" fontWeight={700}>
                Total
              </Typography>
              <Typography
                variant="body1"
                fontWeight={700}
                sx={{
                  background: nexus.gradient.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ${total().toFixed(2)}
              </Typography>
            </Stack>
            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.99 }}>
              <PremiumButton
                fullWidth
                variant="contained"
                onClick={handleCheckout}
                sx={{ height: '3rem', fontSize: '1rem', fontWeight: 700 }}
              >
                Proceed to Checkout
              </PremiumButton>
            </motion.div>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
