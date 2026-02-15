import { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  FavoriteBorder,
  Person,
  Home,
  ShoppingBag,
  Logout,
} from '@mui/icons-material';
import { useCartStore } from '@/store/cart-store';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: <Home /> },
  { label: 'Cart', path: '/cart', icon: <ShoppingCart /> },
  { label: 'Orders', path: '/orders', icon: <ShoppingBag /> },
  { label: 'Wishlist', path: '/wishlist', icon: <FavoriteBorder /> },
  { label: 'Profile', path: '/profile', icon: <Person /> },
];

export default function RootLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={1}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
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
            </Box>

            {/* Desktop Nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              {NAV_ITEMS.map((item) => (
                <Typography
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    fontSize: '0.95rem',
                    '&:hover': { color: '#DB4444' },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit" onClick={() => navigate('/wishlist')}>
                <FavoriteBorder />
              </IconButton>
              <IconButton color="inherit" onClick={() => navigate('/cart')}>
                <Badge badgeContent={totalItems()} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              <IconButton color="inherit" onClick={() => navigate('/profile')}>
                <Person />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              E-COMMERCE
            </Typography>
          </Box>
          <Divider />
          <List>
            {NAV_ITEMS.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#000',
          color: '#fff',
          py: 4,
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                E-COMMERCE
              </Typography>
              <Typography variant="body2" color="grey.400">
                Distributed Microservices E-Commerce Platform
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Quick Links
              </Typography>
              <Typography variant="body2" color="grey.400">
                Home | Products | Cart | Orders
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" color="grey.400">
                vietbmt19@gmail.com
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2, borderColor: 'grey.800' }} />
          <Typography variant="body2" color="grey.500" textAlign="center">
            © {new Date().getFullYear()} E-Commerce. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
