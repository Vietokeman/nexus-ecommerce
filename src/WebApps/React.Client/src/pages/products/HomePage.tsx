import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
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
import EmptyState from '@/components/ui/EmptyState';
import { nexus } from '@/theme/theme';
import type { Product } from '@/types/product';
import { APP_NAME } from '@/constants';
import loadingAnimation from '@/assets/animations/loading.json';
import { PremiumButton, PremiumCheckbox } from '@/components/ui/primitives';
import ImageFallback from '@/components/ui/ImageFallback';
import { LAYERS } from '@/lib/layers';

const ITEMS_PER_PAGE = 10;

const sortOptions = [
  { name: 'Price: low to high', sort: 'price', order: 'asc' },
  { name: 'Price: high to low', sort: 'price', order: 'desc' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeProduct = (raw: any): Product => ({
  id: Number(raw.id ?? raw.productId ?? Date.now()),
  no: String(raw.no ?? raw.productNo ?? raw.itemNo ?? raw.id ?? ''),
  name: String(raw.name ?? raw.productName ?? 'Unnamed product'),
  summary: String(raw.summary ?? raw.shortDescription ?? raw.category ?? ''),
  description: String(raw.description ?? raw.summary ?? ''),
  price: Number(raw.price ?? raw.unitPrice ?? 0),
  category: raw.category ?? raw.categoryName,
  brand: raw.brand ?? raw.attributes?.brand ?? raw.attributes?.manufacturer,
  attributes: raw.attributes,
  imageUrl: raw.imageUrl ?? raw.thumbnailUrl ?? raw.image,
});

const buildFacetOptions = (items: Product[]) => {
  const categorySet = new Set<string>();
  const brandSet = new Set<string>();

  for (const item of items) {
    const category = item.category?.toString().trim();
    if (category) {
      categorySet.add(category);
    }

    const brand = item.brand?.toString().trim();
    if (brand) {
      brandSet.add(brand);
    }
  }

  return {
    categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
    brands: Array.from(brandSet).sort((a, b) => a.localeCompare(b)),
  };
};

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
      elevation={0}
      p={2}
      width={cardWidth}
      sx={{
        cursor: 'pointer',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 12px 32px -16px rgba(0, 0, 0, 0.08)',
        transition: 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1), border-color 350ms, box-shadow 350ms',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: '#D4AF37',
          boxShadow: '0 24px 48px -18px rgba(212, 175, 55, 0.25)',
        },
      }}
      onClick={() => navigate(`/product-details/${product.id}`)}
    >
      {/* Image */}
      <Stack>
        <ImageFallback
          width="100%"
          style={{ aspectRatio: '1/1', objectFit: 'contain' }}
          height="100%"
          src={product.imageUrl}
          fallbackSrc={`https://via.placeholder.com/300?text=${product.name[0]}`}
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
                whileHover={{ scale: 1.3, y: -10 }}
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
          <Typography color="text.secondary">
            {product.brand || product.summary || 'Product'}
          </Typography>
        </Stack>

        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600, color: nexus.neutral[800] }}>
            ${product.price}
          </Typography>
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
  const [facetOptions, setFacetOptions] = useState<{ categories: string[]; brands: string[] }>({
    categories: [],
    brands: [],
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSortValue] = useState<string>('');
  const [brandFilters, setBrandFilters] = useState<Set<string>>(new Set());
  const [categoryFilters, setCategoryFilters] = useState<Set<string>>(new Set());
  const categoryFilterKey = Array.from(categoryFilters).sort().join('|');

  const theme = useTheme();
  const is700 = useMediaQuery(theme.breakpoints.down(700));
  const is600 = useMediaQuery(theme.breakpoints.down(600));
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is488 = useMediaQuery(theme.breakpoints.down(488));

  const { isInWishlist, toggleItem } = useWishlistStore();
  const isFilterOpen = useUIStore((s) => s.isFilterOpen);
  const toggleFilter = useUIStore((s) => s.toggleFilter);
  const closeFilter = useUIStore((s) => s.closeFilter);
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
    document.body.style.overflow = isFilterOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      closeFilter();
    };
  }, [isFilterOpen, closeFilter]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const selectedCategories = categoryFilterKey ? categoryFilterKey.split('|') : [];

        if (selectedCategories.length === 0) {
          const { data } = await api.get(API_ENDPOINTS.PRODUCTS.LIST);
          const list = Array.isArray(data) ? data : (data.result ?? []);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const normalized = list.map((item: any) => normalizeProduct(item));
          setProducts(normalized);
          setFacetOptions(buildFacetOptions(normalized));
          return;
        }

        const responses = await Promise.all(
          selectedCategories.map((category) => api.get(API_ENDPOINTS.SELLER.BY_CATEGORY(category))),
        );

        const merged = responses.flatMap(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.result)) return data.result;
          return [];
        });

        const deduped = Array.from(
          new Map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            merged.map((item: any) => [String(item.id ?? item.itemNo ?? item.productNo), item]),
          ).values(),
        );

        const normalized = deduped.map((item) => normalizeProduct(item));
        setProducts(normalized);
        setFacetOptions(buildFacetOptions(normalized));
      } catch {
        toast.error('Error fetching products, please try again later');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilterKey]);

  // Client-side filtering & sorting
  const filtered = products
    .filter((p) => {
      if (brandFilters.size > 0) {
        const source = (p.brand || p.summary || '').toLowerCase();
        const match = Array.from(brandFilters).some((b) => source.includes(b.toLowerCase()));
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
  const hasActiveFilters = brandFilters.size > 0 || categoryFilters.size > 0;

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
      <Backdrop
        open={isFilterOpen}
        onClick={closeFilter}
        sx={{ zIndex: LAYERS.overlay - 1, backgroundColor: 'rgba(16, 11, 9, 0.3)' }}
      />

      {/* Sliding Filter Sidebar */}
      <motion.div
        style={{
          position: 'fixed',
          background:
            'linear-gradient(165deg, rgba(255,253,250,0.98) 0%, rgba(247,243,238,0.98) 58%, rgba(242,237,231,0.98) 100%)',
          minHeight: '100dvh',
          padding: '1.25rem',
          overflowY: 'scroll',
          width: is500 ? '100vw' : '30rem',
          zIndex: LAYERS.overlay,
          top: 0,
          borderRight: `1px solid ${nexus.neutral[200]}`,
          boxShadow: '20px 0 46px -32px rgba(79,67,62,0.7)',
        }}
        variants={{ show: { left: 0 }, hide: { left: -500 } }}
        initial="hide"
        transition={{ ease: 'easeInOut', duration: 0.7, type: 'spring' }}
        animate={isFilterOpen ? 'show' : 'hide'}
      >
        <Stack mb="5rem" sx={{ scrollBehavior: 'smooth', overflowY: 'scroll' }}>
          <Typography variant="h4" sx={{ letterSpacing: '-0.02em' }}>
            New Arrivals
          </Typography>

          <IconButton onClick={closeFilter} style={{ position: 'absolute', top: 15, right: 15 }}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <ClearIcon fontSize="medium" />
            </motion.div>
          </IconButton>

          <Stack rowGap={2} mt={4}>
            {facetOptions.categories.map((category) => (
              <Typography
                key={category}
                sx={{
                  cursor: 'pointer',
                  fontWeight: categoryFilters.has(category) ? 600 : 400,
                  color: categoryFilters.has(category) ? nexus.orange[700] : 'text.secondary',
                  '&:hover': { color: nexus.orange[700] },
                }}
                variant="body2"
                onClick={() => {
                  const newSet = new Set(categoryFilters);
                  if (newSet.has(category)) newSet.delete(category);
                  else newSet.add(category);
                  setCategoryFilters(newSet);
                  setPage(1);
                }}
              >
                {category}
              </Typography>
            ))}
          </Stack>

          {/* Brand filters */}
          <Stack mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<AddIcon />}>
                <Typography sx={{ fontWeight: 600 }}>Brands</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup
                  onChange={(e) => handleBrandFilter(e as React.ChangeEvent<HTMLInputElement>)}
                >
                  {facetOptions.brands.map((brand) => (
                    <motion.div
                      key={brand}
                      style={{ width: 'fit-content' }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FormControlLabel
                        sx={{ ml: 1 }}
                        control={<PremiumCheckbox />}
                        label={brand}
                        value={brand}
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
                <Typography sx={{ fontWeight: 600 }}>Category</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup
                  onChange={(e) => handleCategoryFilter(e as React.ChangeEvent<HTMLInputElement>)}
                >
                  {facetOptions.categories.map((category) => (
                    <motion.div
                      key={category}
                      style={{ width: 'fit-content' }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FormControlLabel
                        sx={{ ml: 1 }}
                        control={<PremiumCheckbox />}
                        label={category}
                        value={category}
                      />
                    </motion.div>
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Stack>
      </motion.div>

      {/* Floating Glass Blobs Background */}
      <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%', mb: 6 }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <Box
            className="nx-blob-1"
            sx={{
              position: 'absolute',
              top: '5%',
              left: '10%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.08)',
              filter: 'blur(70px)',
            }}
          />
          <Box
            className="nx-blob-2"
            sx={{
              position: 'absolute',
              bottom: '10%',
              right: '5%',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'rgba(28, 25, 23, 0.05)',
              filter: 'blur(90px)',
            }}
          />
        </Box>

        {/* Hero Section */}
        <Stack
          className="nx-liquid-glass"
          sx={{
            position: 'relative',
            width: '100%',
            borderRadius: '24px',
            p: { xs: 4, md: 8 },
            mb: 8,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            zIndex: 1,
          }}
        >
          <Stack spacing={3} maxWidth="42rem">
            <Typography
              variant="overline"
              sx={{
                color: '#D4AF37',
                letterSpacing: '.25em',
                fontWeight: 650,
                fontSize: '0.85rem',
              }}
            >
              ESTD 2026 • THE APOGEE OF LUXURY
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 400,
                color: '#0C0A09',
                lineHeight: 1.1,
              }}
            >
              The New Standard <br />
              Of <span className="nx-luxury-gradient-text" style={{ fontWeight: 600 }}>Refined Living</span>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#5C584E',
                maxWidth: '36rem',
                fontSize: '1.08rem',
                lineHeight: 1.7,
              }}
            >
              Indulge in our collection of meticulously curated masterpieces, crafted with passion and designed for those who appreciate the finer details of life.
            </Typography>
            <Stack direction="row" gap={2} flexWrap="wrap" pt={2}>
              <PremiumButton
                magnetic={false}
                variant="contained"
                onClick={toggleFilter}
                sx={{
                  py: 1.5,
                  px: 4,
                }}
              >
                Discover Collection
              </PremiumButton>
              <PremiumButton
                magnetic={false}
                variant="outlined"
                onClick={() => navigate('/group-buy')}
                sx={{
                  py: 1.5,
                  px: 4,
                }}
              >
                Exclusive Group Deals
              </PremiumButton>
            </Stack>
          </Stack>
        </Stack>

        {/* Storytelling Section */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 10, px: { xs: 2, md: 4 }, zIndex: 1, position: 'relative' }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 48px -20px rgba(0,0,0,0.15)' }}>
              <img
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop"
                alt="Artisan Craftsmanship"
                style={{ width: '100%', height: '440px', objectFit: 'cover' }}
              />
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to top, rgba(28,25,23,0.85) 0%, transparent 60%)'
              }} />
              <Box sx={{ position: 'absolute', bottom: 30, left: 30, color: '#FAF9F6' }}>
                <Typography variant="caption" sx={{ letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>
                  Handcrafted Excellence
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
                  Attention to every stitch and seam
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3.5}>
              <Typography variant="overline" sx={{ color: '#D4AF37', letterSpacing: '.2em', fontWeight: 650 }}>
                OUR HERITAGE
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 400, color: '#1C1917' }}>
                The Alchemy of <br />
                <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Art &amp; Precision</span>
              </Typography>
              <Typography variant="body1" sx={{ color: '#5C584E', lineHeight: 1.8 }}>
                Every product in the {APP_NAME} collection is a testimony to age-old artisan methods combined with contemporary elegance. We partner with the world's most renowned manufacturers to ensure each acquisition is not merely a purchase, but a timeless investment.
              </Typography>
              <Typography variant="body2" sx={{ color: '#7A7568', fontStyle: 'italic', borderLeft: '3px solid #D4AF37', pl: 2 }}>
                "Simplicity is the ultimate sophistication. We strip away the unnecessary to reveal the breathtaking essence of pure form."
              </Typography>
              <Stack direction="row" spacing={6} sx={{ pt: 2 }}>
                <Box>
                  <Typography variant="h3" sx={{ color: '#D4AF37', fontWeight: 600 }}>100%</Typography>
                  <Typography variant="body2" sx={{ color: '#5C584E', mt: 0.5 }}>Authentic Curation</Typography>
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ color: '#D4AF37', fontWeight: 600 }}>24/7</Typography>
                  <Typography variant="body2" sx={{ color: '#5C584E', mt: 0.5 }}>White-glove Service</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Bento Grid - Brand Values */}
        <Box sx={{ mb: 10, px: { xs: 2, md: 4 }, zIndex: 1, position: 'relative' }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{ mb: 1.5, fontWeight: 400 }}
          >
            Pillars of <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Exclusivity</span>
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: '#5C584E', mb: 7 }}
          >
            Our commitment to you spans across four essential foundations of modern luxury.
          </Typography>
          <Grid container spacing={3.5}>
            <Grid item xs={12} md={7}>
              <Paper
                className="nx-liquid-glass"
                sx={{
                  p: 4.5,
                  height: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 350ms ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: '#D4AF37',
                    boxShadow: '0 20px 40px -15px rgba(212, 175, 55, 0.15)',
                  }
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ color: '#1C1917', mb: 1.5 }}>
                    Heritage &amp; Legacy
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5C584E', maxWidth: '85%', lineHeight: 1.6 }}>
                    Tracing roots of traditional production techniques and timeless aesthetics, bringing generations of mastery directly to your doorstep.
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#D4AF37', fontWeight: 650, letterSpacing: '0.1em', cursor: 'pointer' }}>
                  READ STORY →
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                className="nx-liquid-glass"
                sx={{
                  p: 4.5,
                  height: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 350ms ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: '#D4AF37',
                    boxShadow: '0 20px 40px -15px rgba(212, 175, 55, 0.15)',
                  }
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ color: '#1C1917', mb: 1.5 }}>
                    Bespoke Curation
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5C584E', lineHeight: 1.6 }}>
                    Every product is handpicked by luxury specialists to guarantee relevance, prestige, and unmatched aesthetic value.
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#D4AF37', fontWeight: 650, letterSpacing: '0.1em', cursor: 'pointer' }}>
                  LEARN MORE →
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                className="nx-liquid-glass"
                sx={{
                  p: 4.5,
                  height: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 350ms ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: '#D4AF37',
                    boxShadow: '0 20px 40px -15px rgba(212, 175, 55, 0.15)',
                  }
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ color: '#1C1917', mb: 1.5 }}>
                    Uncompromising Quality
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5C584E', lineHeight: 1.6 }}>
                    Subjected to rigorous verification protocols, ensuring only flawless craftsmanship enters your collection.
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#D4AF37', fontWeight: 650, letterSpacing: '0.1em', cursor: 'pointer' }}>
                  OUR LAB →
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Paper
                className="nx-liquid-glass"
                sx={{
                  p: 4.5,
                  height: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 350ms ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: '#D4AF37',
                    boxShadow: '0 20px 40px -15px rgba(212, 175, 55, 0.15)',
                  }
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ color: '#1C1917', mb: 1.5 }}>
                    Sustainable Luxury
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5C584E', maxWidth: '85%', lineHeight: 1.6 }}>
                    Aligning eco-responsible materials, ethical manufacturing practices, and carbon-neutral distribution without compromising elegance.
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#D4AF37', fontWeight: 650, letterSpacing: '0.1em', cursor: 'pointer' }}>
                  GREEN CHARTER →
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Stack mb="3rem">

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
            {hasActiveFilters && (
              <Stack direction="row" gap={1} flexWrap="wrap">
                {Array.from(categoryFilters).map((value) => (
                  <Chip
                    key={`cat-${value}`}
                    label={`Category: ${value}`}
                    onDelete={() => {
                      const next = new Set(categoryFilters);
                      next.delete(value);
                      setCategoryFilters(next);
                    }}
                    sx={{ bgcolor: '#fff', border: `1px solid ${nexus.neutral[300]}` }}
                  />
                ))}
                {Array.from(brandFilters).map((value) => (
                  <Chip
                    key={`brand-${value}`}
                    label={`Brand: ${value}`}
                    onDelete={() => {
                      const next = new Set(brandFilters);
                      next.delete(value);
                      setBrandFilters(next);
                    }}
                    sx={{ bgcolor: '#fff', border: `1px solid ${nexus.neutral[300]}` }}
                  />
                ))}
              </Stack>
            )}
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

          {paginatedProducts.length === 0 && (
            <Stack px={2}>
              <EmptyState
                title="No products match your current filters"
                description="Try clearing some filters or switch to another category to continue browsing premium Tet offers."
                actionLabel="Clear Filters"
                onAction={() => {
                  setBrandFilters(new Set());
                  setCategoryFilters(new Set());
                  setSortValue('');
                  setPage(1);
                }}
              />
            </Stack>
          )}

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

          {/* Exclusive Membership CTA */}
          <Box
            className="nx-liquid-glass-dark"
            sx={{
              mt: 12,
              p: { xs: 5, md: 8 },
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              boxShadow: '0 32px 72px -14px rgba(212, 175, 55, 0.15)',
            }}
          >
            {/* Fine Gold Accents */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Typography variant="overline" sx={{ color: '#D4AF37', letterSpacing: '0.3em', fontWeight: 600 }}>
                    MEMBERSHIP CLUB
                  </Typography>
                  <Typography variant="h2" sx={{ color: '#FAF9F6', fontFamily: '"Cormorant", serif', fontWeight: 400 }}>
                    Join <span className="nx-luxury-gradient-text" style={{ fontWeight: 600 }}>The Nexus Circle</span>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '38rem', lineHeight: 1.7 }}>
                    Unlock the inner sanctum of luxury commerce. Members gain exclusive first-access to limited capsule collections, invitation-only group campaigns, bespoke personal shopping services, and complimentary white-glove shipping globally.
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <PremiumButton
                  magnetic={false}
                  variant="contained"
                  sx={{
                    py: 2,
                    px: 5,
                    fontSize: '1rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                    color: '#0C0A09',
                    boxShadow: '0 20px 40px -15px rgba(212, 175, 55, 0.4)',
                    '&:hover': {
                      filter: 'brightness(1.1) saturate(1.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Request Invitation
                </PremiumButton>
              </Grid>
            </Grid>
          </Box>

        </Stack>
      </Stack>
    </>
  );
}
