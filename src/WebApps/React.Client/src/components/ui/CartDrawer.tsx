import { Box, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart-store';
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
          background: 'rgba(28, 25, 23, 0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#FAF9F6',
        },
      }}
    >
      <Stack sx={{ height: '100%' }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ShoppingCartOutlinedIcon sx={{ color: '#D4AF37' }} />
            <Typography variant="h6" fontWeight={800} sx={{ color: '#FAF9F6', letterSpacing: '-0.01em' }}>
              Giỏ hàng
            </Typography>
            <PremiumBadge
              label={items.length}
              sx={{
                background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                color: '#0C0A09',
                fontWeight: 800,
              }}
            />
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: '#FAF9F6', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Items */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
          {items.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }} spacing={2}>
              <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.15)' }} />
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Giỏ hàng của bạn đang trống
              </Typography>
              <PremiumButton
                variant="outlined"
                magnetic={false}
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
                sx={{
                  borderColor: '#D4AF37',
                  color: '#D4AF37',
                  '&:hover': {
                    background: 'rgba(212, 175, 55, 0.08)',
                    borderColor: '#D4AF37',
                  }
                }}
              >
                Mua sắm ngay
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
                      py: 2,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {/* Image */}
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
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
                            sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 20 }}
                          />
                        </Stack>
                      )}
                    </Box>

                    {/* Details */}
                    <Stack flex={1} justifyContent="center" spacing={0.5}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#FAF9F6' }}>
                        {item.productName}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{
                          background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {item.price?.toLocaleString('vi-VN')}₫
                      </Typography>
                    </Stack>

                    {/* Quantity controls */}
                    <Stack alignItems="center" justifyContent="center" spacing={1}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        sx={{
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.itemNo, item.quantity - 1)}
                          sx={{ borderRadius: 0, p: 0.5, color: '#FAF9F6' }}
                        >
                          <RemoveIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ px: 1, minWidth: 20, textAlign: 'center', color: '#FAF9F6' }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.itemNo, item.quantity + 1)}
                          sx={{ borderRadius: 0, p: 0.5, color: '#FAF9F6' }}
                        >
                          <AddIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Stack>
                      <IconButton
                        size="small"
                        onClick={() => removeItem(item.itemNo)}
                        sx={{ color: '#EF4444', p: 0.25, '&:hover': { background: 'rgba(239, 68, 68, 0.08)' } }}
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
          <Stack sx={{ px: 2.5, pb: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Tạm tính
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: '#FAF9F6' }}>
                {subtotal().toLocaleString('vi-VN')}₫
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
            <Stack direction="row" justifyContent="space-between" mb={2.5}>
              <Typography variant="body1" fontWeight={800} sx={{ color: '#FAF9F6' }}>
                Tổng cộng
              </Typography>
              <Typography
                variant="body1"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '1.2rem',
                }}
              >
                {total().toLocaleString('vi-VN')}₫
              </Typography>
            </Stack>
            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.99 }}>
              <PremiumButton
                fullWidth
                variant="contained"
                onClick={handleCheckout}
                sx={{ height: '3.2rem', fontSize: '1rem', fontWeight: 700 }}
              >
                Tiến hành thanh toán
              </PremiumButton>
            </motion.div>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
