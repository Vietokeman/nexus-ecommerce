import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
  ListItemIcon,
  ListItemText,
  Container,
  Divider,
  Chip,
  Stack,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCartOutlined,
  FavoriteBorder,
  Tune,
  Home,
  Person,
  ShoppingBag,
  Logout,
  AddCircleOutline,
} from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';

export default function RootLayout() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const totalItems = useCartStore((s) => s.totalItems);
  const wishlistItems = useWishlistStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleFilter = useUIStore((s) => s.toggleFilter);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const is700 = useMediaQuery(theme.breakpoints.down(700));

  const isProductListPage = location.pathname === '/' || location.pathname.startsWith('/product');

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar — white sticky AppBar matching mern-ecommerce */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          color: '#000000',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              E-COMMERCE
            </Typography>

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Filter toggle — only on product list pages */}
              {isProductListPage && (
                <IconButton onClick={toggleFilter} sx={{ color: '#000' }}>
                  <Tune />
                </IconButton>
              )}

              {/* Wishlist */}
              <IconButton onClick={() => navigate('/wishlist')} sx={{ color: '#000' }}>
                <Badge badgeContent={wishlistItems.length} color="error">
                  <FavoriteBorder />
                </Badge>
              </IconButton>

              {/* Cart */}
              <IconButton onClick={() => navigate('/cart')} sx={{ color: '#000' }}>
                <Badge badgeContent={totalItems()} color="error">
                  <ShoppingCartOutlined />
                </Badge>
              </IconButton>

              {/* Admin chip */}
              {user?.isAdmin && (
                <Chip
                  label="Admin"
                  size="small"
                  sx={{
                    bgcolor: '#DB4444',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/admin/dashboard')}
                />
              )}

              {/* Avatar menu */}
              <IconButton onClick={handleMenuOpen}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#000',
                    fontSize: 14,
                  }}
                >
                  {user?.firstName?.[0] ?? user?.userName?.[0] ?? 'U'}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate('/');
                  }}
                >
                  <ListItemIcon>
                    <Home fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Home</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate('/profile');
                  }}
                >
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate('/orders');
                  }}
                >
                  <ListItemIcon>
                    <ShoppingBag fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Orders</ListItemText>
                </MenuItem>
                {user?.isAdmin && (
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate('/admin/add-product');
                    }}
                  >
                    <ListItemIcon>
                      <AddCircleOutline fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Add new Product</ListItemText>
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>

      {/* Footer — matching mern-ecommerce */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#000',
          color: '#fff',
          pt: '3rem',
          px: is700 ? '1rem' : '3rem',
          pb: '1.5rem',
        }}
      >
        <Stack
          flexDirection="row"
          rowGap="1rem"
          justifyContent={is700 ? undefined : 'space-around'}
          flexWrap="wrap"
        >
          {/* Exclusive */}
          <Stack rowGap="1rem" p="1rem">
            <Typography variant="h6" fontSize="1.5rem">
              Exclusive
            </Typography>
            <Typography variant="h6">Subscribe</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>
              Get 10% off your first order
            </Typography>
            <TextField
              placeholder="Enter your email"
              size="small"
              sx={{
                border: '1px solid white',
                borderRadius: '6px',
                '& .MuiInputBase-input': { color: 'whitesmoke' },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <SendIcon sx={{ color: '#fff' }} />
                  </IconButton>
                ),
              }}
            />
          </Stack>

          {/* Support */}
          <Stack rowGap="1rem" p="1rem">
            <Typography variant="h6">Support</Typography>
            <Typography sx={{ fontWeight: 300 }}>vietbmt19@gmail.com</Typography>
            <Typography sx={{ fontWeight: 300 }}>+84 123-456-789</Typography>
          </Stack>

          {/* Account */}
          <Stack rowGap="1rem" p="1rem">
            <Typography variant="h6">Account</Typography>
            <Typography
              sx={{ fontWeight: 300, cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              My Account
            </Typography>
            <Typography
              sx={{ fontWeight: 300, cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              Login / Register
            </Typography>
            <Typography
              sx={{ fontWeight: 300, cursor: 'pointer' }}
              onClick={() => navigate('/cart')}
            >
              Cart
            </Typography>
            <Typography
              sx={{ fontWeight: 300, cursor: 'pointer' }}
              onClick={() => navigate('/wishlist')}
            >
              Wishlist
            </Typography>
          </Stack>

          {/* Quick Links */}
          <Stack rowGap="1rem" p="1rem">
            <Typography variant="h6">Quick Links</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>Privacy Policy</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>Terms Of Use</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>FAQ</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>Contact</Typography>
          </Stack>
        </Stack>

        {/* Copyright */}
        <Stack alignSelf="center" mt={4} alignItems="center">
          <Typography color="GrayText">
            &copy; E-Commerce Store {new Date().getFullYear()}. All rights reserved.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
