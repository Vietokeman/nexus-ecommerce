import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useActiveSessions } from '@/hooks/useFlashSale';
import { useActiveGroupBuyCampaigns } from '@/hooks/useGroupBuy';
import FlashSaleWidget from '@/components/ui/FlashSaleWidget';
import { nexus } from '@/theme/theme';
import type { Product } from '@/types/product';
import { APP_NAME } from '@/constants';
import loadingAnimation from '@/assets/animations/loading.json';
import { PremiumButton, PremiumCheckbox } from '@/components/ui/primitives';

const ITEMS_PER_PAGE = 10;

const sortOptions = [
  { name: 'Price: low to high', sort: 'price', order: 'asc' },
  { name: 'Price: high to low', sort: 'price', order: 'desc' },
];

// Mock brand/category data - these would come from API
const brands = [
  { id: '1', name: 'Apple' },
  { id: '2', name: 'Samsung' },
  { id: '3', name: 'Sony' },
  { id: '4', name: 'Nike' },
  { id: '5', name: 'Adidas' },
];

const categories = [
  { id: '1', name: 'Smartphones' },
  { id: '2', name: 'Laptops' },
  { id: '3', name: 'Fashion' },
  { id: '4', name: 'Footwear' },
  { id: '5', name: 'Groceries' },
  { id: '6', name: 'Home Decoration' },
];

// Product Card component
function ProductCard({
  product,
  onToggleWishlist,
  isInWishlist,
  isAdmin,
}: {
  product: Product;
  onToggleWishlist: (productId: string, checked: boolean) => void;
  isInWishlist: boolean;
  isAdmin: boolean;
}) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const theme = useTheme();
  const is1410 = useMediaQuery(theme.breakpoints.down(1410));
  const is932 = useMediaQuery(theme.breakpoints.down(932));
  const is752 = useMediaQuery(theme.breakpoints.down(752));
  const is608 = useMediaQuery(theme.breakpoints.down(608));
  const is488 = useMediaQuery(theme.breakpoints.down(488));
  const is408 = useMediaQuery(theme.breakpoints.down(408));
  const is500 = useMediaQuery(theme.breakpoints.down(500));

  const isProductAlreadyInCart = cartItems.some((item) => item.itemNo === product.no);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      itemNo: product.no,
      productName: product.name,
      price: product.price,
    });
    toast.success('Product added to cart');
  };

  const cardWidth = is408
    ? 'auto'
    : is488
      ? '200px'
      : is608
        ? '240px'
        : is752
          ? '300px'
          : is932
            ? '240px'
            : is1410
              ? '300px'
              : '340px';

  return (
    <Stack
      component={is408 ? 'div' : Paper}
      mt={is408 ? 2 : 0}
      elevation={1}
      p={2}
      width={cardWidth}
      sx={{ cursor: 'pointer' }}
      onClick={() => navigate(`/product-details/${product.id}`)}
    >
      {/* Image */}
      <Stack>
        <img
          width="100%"
          style={{ aspectRatio: '1/1', objectFit: 'contain' }}
          height="100%"
          src={product.imageUrl || `https://via.placeholder.com/300?text=${product.name[0]}`}
          alt={`${product.name}`}
        />
      </Stack>

      {/* Lower section */}
      <Stack flex={2} justifyContent="flex-end" spacing={1} rowGap={2}>
        <Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={400}>
              {product.name}
            </Typography>
            {!isAdmin && (
              <motion.div
                whileHover={{ scale: 1.3, y: -10, zIndex: 100 }}
                whileTap={{ scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
              >
                <PremiumCheckbox
                  onClick={(e) => e.stopPropagation()}
                  checked={isInWishlist}
                  onChange={(e) => onToggleWishlist(String(product.id), e.target.checked)}
                  icon={<FavoriteBorder />}
                  checkedIcon={<Favorite sx={{ color: 'red' }} />}
                />
              </motion.div>
            )}
          </Stack>
          <Typography color="text.secondary">{product.summary || 'Brand'}</Typography>
        </Stack>

        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography>${product.price}</Typography>
          {isProductAlreadyInCart ? (
            <Typography variant="body2" color="text.secondary">
              Added to cart
            </Typography>
          ) : (
            !isAdmin && (
              <PremiumButton
                magnetic={false}
                onClick={handleAddToCart}
                variant="contained"
                sx={{
                  minWidth: 'fit-content',
                  fontSize: is408 ? '.86rem' : is488 ? '.72rem' : is500 ? '.84rem' : '.9rem',
                  px: is488 ? 1.6 : 2.2,
                  py: is488 ? 0.75 : 0.9,
                }}
              >
                Add To Cart
              </PremiumButton>
            )
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSortValue] = useState<string>('');
  const [brandFilters, setBrandFilters] = useState<Set<string>>(new Set());
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());

  const theme = useTheme();
  const is1200 = useMediaQuery(theme.breakpoints.down(1200));
  const is800 = useMediaQuery(theme.breakpoints.down(800));
  const is700 = useMediaQuery(theme.breakpoints.down(700));
  const is600 = useMediaQuery(theme.breakpoints.down(600));
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is488 = useMediaQuery(theme.breakpoints.down(488));

  const { isInWishlist, toggleItem } = useWishlistStore();
  const isFilterOpen = useUIStore((s) => s.isFilterOpen);
  const toggleFilter = useUIStore((s) => s.toggleFilter);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  /* ── FlashSale & GroupBuy live data ── */
  const { data: flashSessions } = useActiveSessions();
  const activeFlashSession = flashSessions?.[0];
  const { data: groupCampaigns } = useActiveGroupBuyCampaigns();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(API_ENDPOINTS.PRODUCTS.LIST);
        const list = Array.isArray(data) ? data : (data.result ?? []);
        setProducts(list);
      } catch {
        toast.error('Error fetching products, please try again later');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Client-side filtering & sorting
  const filtered = products
    .filter((p) => {
      if (brandFilters.size > 0) {
        const match = Array.from(brandFilters).some((b) =>
          p.summary?.toLowerCase().includes(b.toLowerCase()),
        );
        if (!match) return false;
      }
      if (categoryFilters.size > 0) {
        const match = Array.from(categoryFilters).some((c) =>
          p.name?.toLowerCase().includes(c.toLowerCase()),
        );
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return 0;
    });

  const paginatedProducts = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleBrandFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSet = new Set(brandFilters);
    if (e.target.checked) newSet.add(e.target.value);
    else newSet.delete(e.target.value);
    setBrandFilters(newSet);
    setPage(1);
  };

  const handleCategoryFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSet = new Set(categoryFilters);
    if (e.target.checked) newSet.add(e.target.value);
    else newSet.delete(e.target.value);
    setCategoryFilters(newSet);
    setPage(1);
  };

  const handleToggleWishlist = (productId: string, checked: boolean) => {
    const product = products.find((p) => String(p.id) === productId);
    if (!product) return;
    toggleItem({ id: productId, name: product.name, price: product.price });
    toast.success(checked ? 'Product added to wishlist' : 'Product removed from wishlist');
  };

  if (loading) {
    return (
      <Stack
        width={is500 ? '35vh' : '25rem'}
        minHeight="calc(100dvh - 4rem)"
        justifyContent="center"
        marginRight="auto"
        marginLeft="auto"
      >
        <Lottie animationData={loadingAnimation} />
      </Stack>
    );
  }

  return (
    <>
      {/* Sliding Filter Sidebar */}
      <motion.div
        style={{
          position: 'fixed',
          backgroundColor: '#fffcf8',
          minHeight: '100dvh',
          padding: '1rem',
          overflowY: 'scroll',
          width: is500 ? '100vw' : '30rem',
          zIndex: 500,
          top: 0,
        }}
        variants={{ show: { left: 0 }, hide: { left: -500 } }}
        initial="hide"
        transition={{ ease: 'easeInOut', duration: 0.7, type: 'spring' }}
        animate={isFilterOpen ? 'show' : 'hide'}
      >
        <Stack mb="5rem" sx={{ scrollBehavior: 'smooth', overflowY: 'scroll' }}>
          <Typography variant="h4">New Arrivals</Typography>

          <IconButton onClick={toggleFilter} style={{ position: 'absolute', top: 15, right: 15 }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <ClearIcon fontSize="medium" />
            </motion.div>
          </IconButton>

          <Stack rowGap={2} mt={4}>
            {categories.map((cat) => (
              <Typography
                key={cat.id}
                sx={{
                  cursor: 'pointer',
                  fontWeight: categoryFilters.has(cat.name) ? 600 : 400,
                  color: categoryFilters.has(cat.name) ? 'primary.main' : 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
                variant="body2"
                onClick={() => {
                  const newSet = new Set(categoryFilters);
                  if (newSet.has(cat.name)) newSet.delete(cat.name);
                  else newSet.add(cat.name);
                  setCategoryFilters(newSet);
                  setPage(1);
                }}
              >
                {cat.name}
              </Typography>
            ))}
          </Stack>

          {/* Brand filters */}
          <Stack mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<AddIcon />}>
                <Typography>Brands</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup onChange={(e) => handleBrandFilter(e as React.ChangeEvent<HTMLInputElement>)}>
                  {brands.map((brand) => (
                    <motion.div
                      key={brand.id}
                      style={{ width: 'fit-content' }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FormControlLabel
                        sx={{ ml: 1 }}
                        control={<PremiumCheckbox />}
                        label={brand.name}
                        value={brand.name}
                      />
                    </motion.div>
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>

          {/* Category filters */}
          <Stack mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<AddIcon />}>
                <Typography>Category</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup onChange={(e) => handleCategoryFilter(e as React.ChangeEvent<HTMLInputElement>)}>
                  {categories.map((cat) => (
                    <motion.div
                      key={cat.id}
                      style={{ width: 'fit-content' }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FormControlLabel
                        sx={{ ml: 1 }}
                        control={<PremiumCheckbox />}
                        label={cat.name}
                        value={cat.name}
                      />
                    </motion.div>
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Stack>
      </motion.div>

      <Stack mb="3rem">
        {/* Banner section */}
        {!is600 && (
          <Stack
            sx={{
              width: '100%',
              height: is800 ? '300px' : is1200 ? '400px' : '500px',
              bgcolor: '#000',
              borderRadius: 2,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: nexus.gradient.dark,
            }}
          >
            <Typography variant="h3" color="white" fontWeight={700}>
              {APP_NAME}
            </Typography>
          </Stack>
        )}

        {/* Products section */}
        <Stack rowGap={5} mt={is600 ? 2 : 0}>
          {/* ── Flash Sale Widget ── */}
          {activeFlashSession && (
            <Box sx={{ px: { xs: 1, md: 2 } }}>
              <FlashSaleWidget
                session={activeFlashSession}
                onItemClick={() => navigate(`/flash-sale/${activeFlashSession.id}`)}
              />
              <Stack alignItems="center" mt={1}>
                <PremiumButton
                  onClick={() => navigate(`/flash-sale/${activeFlashSession.id}`)}
                  endIcon={<ArrowForwardIcon />}
                  variant="outlined"
                  magnetic={false}
                  sx={{ fontWeight: 600, color: nexus.purple[600] }}
                >
                  View All Flash Deals
                </PremiumButton>
              </Stack>
            </Box>
          )}

          {/* ── Group Buy Promo ── */}
          {groupCampaigns && groupCampaigns.length > 0 && (
            <Box
              sx={{
                mx: { xs: 1, md: 2 },
                p: 3,
                borderRadius: nexus.radius.xl,
                background: nexus.gradient.dark,
                color: '#fff',
                cursor: 'pointer',
                transition: nexus.transition.base,
                '&:hover': { transform: 'translateY(-2px)', boxShadow: nexus.glass.shadowHover },
              }}
              onClick={() => navigate('/group-buy')}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={2}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <GroupsIcon sx={{ fontSize: 36, color: nexus.orange[400] }} />
                  <Stack>
                    <Typography variant="h6" fontWeight={700}>
                      Group Buy — Save Together
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {groupCampaigns.length} active campaign{groupCampaigns.length > 1 ? 's' : ''}{' '}
                      — invite friends &amp; unlock bulk discounts
                    </Typography>
                  </Stack>
                </Stack>
                <Chip
                  icon={<BoltIcon sx={{ color: '#fff !important' }} />}
                  label="Browse Deals"
                  sx={{
                    background: nexus.gradient.button,
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                />
              </Stack>
            </Box>
          )}

          {/* Sort options */}
          <Stack
            flexDirection="row"
            mr="2rem"
            justifyContent="flex-end"
            alignItems="center"
            columnGap={5}
          >
            <Stack alignSelf="flex-end" width="12rem">
              <FormControl fullWidth>
                <InputLabel id="sort-dropdown">Sort</InputLabel>
                <Select
                  variant="standard"
                  labelId="sort-dropdown"
                  label="Sort"
                  onChange={(e) => setSortValue(e.target.value as string)}
                  value={sort}
                >
                  <MenuItem value="">Reset</MenuItem>
                  {sortOptions.map((option) => (
                    <MenuItem key={option.name} value={`${option.sort}-${option.order}`}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {/* Product grid */}
          <Grid gap={is700 ? 1 : 2} container justifyContent="center" alignContent="center">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={isInWishlist(String(product.id))}
                isAdmin={!!user?.isAdmin}
              />
            ))}
          </Grid>

          {/* Pagination */}
          <Stack
            alignSelf={is488 ? 'center' : 'flex-end'}
            mr={is488 ? 0 : 5}
            rowGap={2}
            p={is488 ? 1 : 0}
          >
            <Pagination
              size={is488 ? 'medium' : 'large'}
              page={page}
              onChange={(_, p) => setPage(p)}
              count={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
              variant="outlined"
              shape="rounded"
            />
            <Typography textAlign="center">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {page * ITEMS_PER_PAGE > filtered.length ? filtered.length : page * ITEMS_PER_PAGE} of{' '}
              {filtered.length} results
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
