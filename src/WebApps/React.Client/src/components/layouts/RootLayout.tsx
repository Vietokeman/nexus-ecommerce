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
  TextField,
  Tooltip,
  Button,
  Chip,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import SendIcon from '@mui/icons-material/Send';
import { MotionConfig, motion } from 'framer-motion';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';

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
  const theme = useTheme();
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const is700 = useMediaQuery(theme.breakpoints.down(700));

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
    { name: user?.isAdmin ? 'Orders' : 'My orders', to: user?.isAdmin ? '/admin/orders' : '/orders' },
  ];

  const displayName = user?.firstName || user?.userName || 'User';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar — matching mern-ecommerce exactly */}
      <AppBar
        position="sticky"
        sx={{ backgroundColor: 'white', boxShadow: 'none', color: 'text.primary' }}
      >
        <Toolbar sx={{ p: 1, height: '4rem', display: 'flex', justifyContent: 'space-around' }}>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            E-COMMERCE
          </Typography>

          <Stack flexDirection="row" alignItems="center" justifyContent="center" columnGap={2}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={displayName} src="/broken-image.jpg" />
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
                    color="text.primary"
                    sx={{ textDecoration: 'none' }}
                    to="/admin/add-product"
                    textAlign="center"
                  >
                    Add new Product
                  </Typography>
                </MenuItem>
              )}
              {settings.map((setting) => (
                <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                  <Typography
                    component={Link}
                    color="text.primary"
                    sx={{ textDecoration: 'none' }}
                    to={setting.to}
                    textAlign="center"
                  >
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>

            <Typography variant="h6" fontWeight={300}>
              {is480 ? displayName.split(' ')[0] : `Hey👋, ${displayName}`}
            </Typography>

            {user?.isAdmin && <Button variant="contained">Admin</Button>}

            <Stack
              sx={{
                flexDirection: 'row',
                columnGap: '1rem',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cartItems.length > 0 && (
                <Badge badgeContent={totalItems()} color="error">
                  <IconButton onClick={() => navigate('/cart')}>
                    <ShoppingCartOutlinedIcon />
                  </IconButton>
                </Badge>
              )}

              {!user?.isAdmin && (
                <Stack>
                  <Badge badgeContent={wishlistItems.length} color="error">
                    <IconButton component={Link} to="/wishlist">
                      <FavoriteBorderIcon />
                    </IconButton>
                  </Badge>
                </Stack>
              )}

              {isProductList && (
                <IconButton onClick={toggleFilter}>
                  <TuneIcon sx={{ color: isFilterOpen ? 'black' : '' }} />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>

      {/* Footer — matching mern-ecommerce exactly */}
      <Stack
        sx={{
          backgroundColor: theme.palette.primary.main,
          paddingTop: '3rem',
          paddingLeft: is700 ? '1rem' : '3rem',
          paddingRight: is700 ? '1rem' : '3rem',
          paddingBottom: '1.5rem',
          rowGap: '5rem',
          color: theme.palette.primary.light,
          justifyContent: 'space-around',
        }}
      >
        {/* Upper */}
        <Stack
          flexDirection="row"
          rowGap="1rem"
          justifyContent={is700 ? undefined : 'space-around'}
          flexWrap="wrap"
        >
          <Stack rowGap="1rem" padding="1rem">
            <Typography variant="h6" fontSize="1.5rem">
              Exclusive
            </Typography>
            <Typography variant="h6">Subscribe</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>
              Get 10% off your first order
            </Typography>
            <TextField
              placeholder="Enter your email"
              sx={{
                border: '1px solid white',
                borderRadius: '6px',
              }}
              InputProps={{
                endAdornment: (
                  <IconButton>
                    <SendIcon sx={{ color: theme.palette.primary.light }} />
                  </IconButton>
                ),
                style: { color: 'whitesmoke' },
              }}
            />
          </Stack>

          <Stack rowGap="1rem" padding="1rem">
            <Typography variant="h6">Support</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>
              11th Main Street, Dhaka, DH 1515, California.
            </Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>
              exclusive@gmail.com
            </Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>
              +88015-88888-9999
            </Typography>
          </Stack>

          <Stack rowGap="1rem" padding="1rem">
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
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>Shop</Typography>
          </Stack>

          <Stack rowGap="1rem" padding="1rem">
            <Typography variant="h6">Quick Links</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>Privacy Policy</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>Terms Of Use</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>FAQ</Typography>
            <Typography sx={{ fontWeight: 300, cursor: 'pointer' }}>Contact</Typography>
          </Stack>

          <Stack rowGap="1rem" padding="1rem">
            <Typography variant="h6">Download App</Typography>
            <Typography sx={{ fontWeight: 300, color: 'graytext', fontWeight2: 500 }}>
              Save $3 with App New User Only
            </Typography>
            <Stack mt={0.6} flexDirection="row" columnGap="2rem">
              <MotionConfig whileHover={{ scale: 1.1 }} whileTap={{ scale: 1 }}>
                <motion.span style={{ cursor: 'pointer', fontSize: '1.5rem' }}>📘</motion.span>
                <motion.span style={{ cursor: 'pointer', fontSize: '1.5rem' }}>🐦</motion.span>
                <motion.span style={{ cursor: 'pointer', fontSize: '1.5rem' }}>📷</motion.span>
                <motion.span style={{ cursor: 'pointer', fontSize: '1.5rem' }}>💼</motion.span>
              </MotionConfig>
            </Stack>
          </Stack>
        </Stack>

        {/* Lower */}
        <Stack alignSelf="center">
          <Typography color="GrayText">
            &copy; E-Commerce Store {new Date().getFullYear()}. All right reserved
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
