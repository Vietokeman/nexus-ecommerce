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
  Tooltip,
  Button,
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
import { nexus } from '@/theme/theme';
import NexusCartLogo from '@/components/auth/NexusCartLogo';

export default function RootLayout() {
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
    { name: 'Profile', to: user?.isAdmin ? '/admin/profile' : '/profile' },
    {
      name: user?.isAdmin ? 'Orders' : 'My orders',
      to: user?.isAdmin ? '/admin/orders' : '/orders',
    },
  ];

  const displayName = user?.firstName || user?.userName || 'User';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ─── Navbar — Nexus glassmorphism ─── */}
      <AppBar
        position="sticky"
        sx={{
          background: nexus.glass.background,
          backdropFilter: nexus.glass.blur,
          WebkitBackdropFilter: nexus.glass.blur,
          borderBottom: `1px solid ${nexus.neutral[200]}`,
          boxShadow: 'none',
          color: nexus.neutral[900],
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, height: '4rem', justifyContent: 'space-between' }}>
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
              Nexus Commerce
            </Typography>
          </Stack>

          {/* Actions */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Tooltip title="Settings">
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
            </Tooltip>
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
              {user?.isAdmin && (
                <MenuItem onClick={handleCloseUserMenu}>
                  <Typography
                    component={Link}
                    sx={{ textDecoration: 'none', color: nexus.neutral[900] }}
                    to="/admin/add-product"
                  >
                    Add new Product
                  </Typography>
                </MenuItem>
              )}
              {/* Seller menu items — only for non-admin users */}
              {!user?.isAdmin && (
                <>
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography
                      component={Link}
                      sx={{ textDecoration: 'none', color: nexus.neutral[900] }}
                      to="/seller/dashboard"
                    >
                      🏪 Seller Dashboard
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography
                      component={Link}
                      sx={{ textDecoration: 'none', color: nexus.neutral[900] }}
                      to="/seller/products"
                    >
                      📦 My Products
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

            {user?.isAdmin && (
              <Button variant="contained" size="small" sx={{ fontSize: '0.75rem' }}>
                Admin
              </Button>
            )}

            {!user?.isAdmin && (
              <Tooltip title="Seller Dashboard">
                <IconButton
                  onClick={() => navigate('/seller/dashboard')}
                  size="small"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  <StorefrontIcon sx={{ color: nexus.neutral[700] }} />
                </IconButton>
              </Tooltip>
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
                <TuneIcon sx={{ color: isFilterOpen ? nexus.purple[700] : nexus.neutral[500] }} />
              </IconButton>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ─── Main Content ─── */}
      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
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
          color: 'rgba(255,255,255,0.8)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          flexWrap="wrap"
          spacing={4}
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
                Nexus Commerce
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              Where smart shopping meets seamless experience. Get 10% off your first order.
            </Typography>
          </Stack>

          {/* Support */}
          <Stack spacing={1}>
            <Typography variant="body1" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Support
            </Typography>
            {['support@nexus.com', '+84 888-888-999', 'Ho Chi Minh City, Vietnam'].map((t) => (
              <Typography
                key={t}
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  '&:hover': { color: nexus.purple[300] },
                }}
              >
                {t}
              </Typography>
            ))}
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
                  '&:hover': { color: nexus.purple[300] },
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
                  '&:hover': { color: nexus.purple[300] },
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
            &copy; Nexus Commerce {new Date().getFullYear()}. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
