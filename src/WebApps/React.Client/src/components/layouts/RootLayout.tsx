import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Container,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { useSignalRNotification } from '@/hooks/useSignalRNotification';
import { nexus } from '@/theme/theme';
import NexusCartLogo from '@/components/auth/NexusCartLogo';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { APP_NAME } from '@/constants';
import { PremiumTooltip } from '@/components/ui/primitives';

export default function RootLayout() {
  useSignalRNotification();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const totalItems = useCartStore((s) => s.totalItems);
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isFilterOpen = useUIStore((s) => s.isFilterOpen);
  const toggleFilter = useUIStore((s) => s.toggleFilter);
  const navigate = useNavigate();
  const location = useLocation();

  const isProductList = location.pathname === '/';

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const settings = [
    { name: 'Home', to: '/' },
    { name: 'Profile', to: '/profile' },
    { name: 'My orders', to: '/orders' },
  ];

  const displayName = user?.firstName || user?.userName || 'User';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* ─── Navbar — Nexus glassmorphism ─── */}
      <AppBar
        position="sticky"
        sx={{
          background:
            'linear-gradient(145deg, rgba(255,253,250,0.92) 0%, rgba(247,241,236,0.86) 58%, rgba(242,237,231,0.9) 100%)',
          backdropFilter: nexus.glass.blur,
          WebkitBackdropFilter: nexus.glass.blur,
          borderBottom: `1px solid ${nexus.neutral[200]}`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.62), 0 10px 24px -20px rgba(79,67,62,0.65)',
          color: nexus.neutral[900],
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4.5 }, height: '4.5rem', justifyContent: 'space-between' }}>
          {/* Brand */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            component="a"
            href="/"
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            <NexusCartLogo size={32} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.01em',
                display: { xs: 'none', sm: 'block' },
                background: nexus.gradient.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {APP_NAME}
            </Typography>
          </Stack>

          {/* Actions */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <NotificationDropdown />

            <PremiumTooltip title="Settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={displayName}
                  sx={{
                    width: 36,
                    height: 36,
                    background: nexus.gradient.button,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </PremiumTooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* Seller menu items — only for non-admin users */}
              {!user?.isAdmin && (
                <>
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography
                      component={Link}
                      sx={{ textDecoration: 'none', color: nexus.neutral[900] }}
                      to="/seller/dashboard"
                    >
                      Seller Dashboard
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography
                      component={Link}
                      sx={{ textDecoration: 'none', color: nexus.neutral[900] }}
                      to="/seller/products"
                    >
                      My Products
                    </Typography>
                  </MenuItem>
                </>
              )}
              {settings.map((setting) => (
                <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                  <Typography
                    component={Link}
                    sx={{ textDecoration: 'none', color: nexus.neutral[900] }}
                    to={setting.to}
                  >
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={handleLogout}>
                <Typography sx={{ color: '#EF4444' }}>Logout</Typography>
              </MenuItem>
            </Menu>

            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: nexus.neutral[600],
              }}
            >
              Hey, {displayName}
            </Typography>

            {!user?.isAdmin && (
              <PremiumTooltip title="Seller Dashboard">
                <IconButton
                  onClick={() => navigate('/seller/dashboard')}
                  size="small"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  <StorefrontIcon sx={{ color: nexus.neutral[700] }} />
                </IconButton>
              </PremiumTooltip>
            )}

            {cartItems.length > 0 && (
              <Badge badgeContent={totalItems()} color="secondary">
                <IconButton onClick={() => navigate('/cart')} size="small">
                  <ShoppingCartOutlinedIcon sx={{ color: nexus.neutral[700] }} />
                </IconButton>
              </Badge>
            )}

            {!user?.isAdmin && (
              <Badge badgeContent={wishlistItems.length} color="secondary">
                <IconButton component={Link} to="/wishlist" size="small">
                  <FavoriteBorderIcon sx={{ color: nexus.neutral[700] }} />
                </IconButton>
              </Badge>
            )}

            {isProductList && (
              <IconButton onClick={toggleFilter} size="small">
                <TuneIcon sx={{ color: isFilterOpen ? nexus.orange[700] : nexus.neutral[500] }} />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ─── Main Content ─── */}
      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
          <Outlet />
        </Container>
      </Box>

      {/* ─── Footer — Nexus dark gradient ─── */}
      <Box
        component="footer"
        className="nx-auth-panel"
        sx={{
          pt: 6,
          pb: 3,
          px: { xs: 2, md: 6 },
          color: 'rgba(255,255,255,0.84)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          flexWrap="wrap"
          spacing={5}
          mb={5}
        >
          {/* Brand column */}
          <Stack spacing={1.5} maxWidth="16rem">
            <Stack direction="row" alignItems="center" spacing={1}>
              <NexusCartLogo size={28} />
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  background: nexus.gradient.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {APP_NAME}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              Crafted commerce for modern shoppers with curated products and trusted fulfillment.
            </Typography>
          </Stack>

          {/* Support */}
          <Stack spacing={1}>
            <Typography variant="body1" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Support
            </Typography>
            <Typography
              component="a"
              href="mailto:support@nexus.com"
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': { color: nexus.orange[300] },
              }}
            >
              support@nexus.com
            </Typography>
            <Typography
              component="a"
              href="tel:+84888888999"
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': { color: nexus.orange[300] },
              }}
            >
              +84 888-888-999
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Ho Chi Minh City, Vietnam
            </Typography>
          </Stack>

          {/* Account */}
          <Stack spacing={1}>
            <Typography variant="body1" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Account
            </Typography>
            {[
              { label: 'My Account', to: '/profile' },
              { label: 'Login / Register', to: '/login' },
              { label: 'Cart', to: '/cart' },
              { label: 'Wishlist', to: '/wishlist' },
            ].map((item) => (
              <Typography
                key={item.label}
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  '&:hover': { color: nexus.orange[300] },
                }}
                onClick={() => navigate(item.to)}
              >
                {item.label}
              </Typography>
            ))}
          </Stack>

          {/* Quick Links */}
          <Stack spacing={1}>
            <Typography variant="body1" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Quick Links
            </Typography>
            {['Privacy Policy', 'Terms Of Use', 'FAQ', 'Contact'].map((t) => (
              <Typography
                key={t}
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  '&:hover': { color: nexus.orange[300] },
                }}
              >
                {t}
              </Typography>
            ))}
          </Stack>
        </Stack>

        {/* Divider & Copyright */}
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)' }}>
            &copy; {APP_NAME} {new Date().getFullYear()}. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
