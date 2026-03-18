import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Rating, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import { MotionConfig, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import type { Product } from '@/types/product';
import loadingAnimation from '@/assets/animations/loading.json';
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import type { ReviewSummary } from '@/types/seller';
import { PremiumButton, PremiumCheckbox } from '@/components/ui/primitives';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const COLORS = ['#020202', '#F6F6F6', '#B82222', '#BEA9A9', '#E2BB8D'];

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(-1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const { isInWishlist, toggleItem } = useWishlistStore();
  const user = useAuthStore((s) => s.user);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);

  const theme = useTheme();
  const is1420 = useMediaQuery(theme.breakpoints.down(1420));
  const is990 = useMediaQuery(theme.breakpoints.down(990));
  const is840 = useMediaQuery(theme.breakpoints.down(840));
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const is387 = useMediaQuery(theme.breakpoints.down(387));
  const is340 = useMediaQuery(theme.breakpoints.down(340));

  const isProductAlreadyInCart = cartItems.some((item) => item.itemNo === product?.no);
  const isProductAlreadyInWishlist = id ? isInWishlist(id) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
        setProduct(data.result ?? data);
      } catch {
        toast.error('Error fetching product details, please try again later');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch review summary for rating display
  useEffect(() => {
    if (!id) return;
    api
      .get(API_ENDPOINTS.REVIEWS.SUMMARY(Number(id)))
      .then(({ data }) => setReviewSummary(data?.result || data))
      .catch(() => {
        /* ignore — reviews may not exist */
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      itemNo: product.no,
      productName: product.name,
      price: product.price,
    });
    toast.success('Product added to cart');
    setQuantity(1);
  };

  const handleDecreaseQty = () => {
    if (quantity !== 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQty = () => {
    if (quantity < 20) setQuantity(quantity + 1);
  };

  const handleAddRemoveFromWishlist = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product || !id) return;
    toggleItem({ id, name: product.name, price: product.price });
    toast.success(e.target.checked ? 'Product added to wishlist' : 'Product removed from wishlist');
  };

  // Mock images (since our API may not have images array)
  const images = [
    product?.imageUrl || `https://via.placeholder.com/500?text=${product?.name?.[0] || 'P'}`,
  ];

  if (loading) {
    return (
      <Stack
        width={is500 ? '35vh' : '25rem'}
        height="calc(100vh - 4rem)"
        justifyContent="center"
        alignItems="center"
        mx="auto"
      >
        <Lottie animationData={loadingAnimation} />
      </Stack>
    );
  }

  if (!product) {
    return (
      <Stack height="50vh" justifyContent="center" alignItems="center">
        <Typography variant="h5">Product not found</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ justifyContent: 'center', alignItems: 'center', mb: '3rem', rowGap: '2.5rem' }}>
      <Stack>
        {/* Product details */}
        <Stack
          width={is480 ? 'auto' : is1420 ? 'auto' : '88rem'}
          p={is480 ? 2 : 0}
          height={is840 ? 'auto' : '50rem'}
          rowGap={5}
          mt={is840 ? 0 : 5}
          justifyContent="center"
          mb={5}
          flexDirection={is840 ? 'column' : 'row'}
          columnGap={is990 ? '2rem' : '5rem'}
        >
          {/* Left stack (images) */}
          <Stack
            sx={{
              flexDirection: 'row',
              columnGap: '2.5rem',
              alignSelf: 'flex-start',
              height: '100%',
            }}
          >
            {/* Image selection thumbnails */}
            {!is1420 && (
              <Stack
                sx={{ display: 'flex', rowGap: '1.5rem', height: '100%', overflowY: 'scroll' }}
              >
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1 }}
                    style={{ width: '200px', cursor: 'pointer' }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      style={{ width: '100%', objectFit: 'contain' }}
                      src={image}
                      alt={`${product.name} image`}
                    />
                  </motion.div>
                ))}
              </Stack>
            )}

            {/* Selected image */}
            <Stack mt={is480 ? '0rem' : '5rem'}>
              <Stack width={is480 ? '100%' : is990 ? '400px' : '500px'}>
                <Box
                  component="img"
                  sx={{
                    width: '100%',
                    objectFit: 'contain',
                    overflow: 'hidden',
                    aspectRatio: '1/1',
                  }}
                  src={images[selectedImageIndex]}
                  alt={product.name}
                />
              </Stack>
            </Stack>
          </Stack>

          {/* Right stack - about product */}
          <Stack rowGap="1.5rem" width={is480 ? '100%' : '25rem'}>
            {/* Title, rating, price */}
            <Stack rowGap=".5rem">
              <Typography variant="h4" fontWeight={600}>
                {product.name}
              </Typography>
              <Stack
                sx={{
                  flexDirection: 'row',
                  columnGap: is340 ? '.5rem' : '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  rowGap: '1rem',
                }}
              >
                <Rating value={reviewSummary?.averageRating ?? 0} precision={0.5} readOnly />
                <Typography>
                  {reviewSummary && reviewSummary.totalReviews > 0
                    ? `(${reviewSummary.totalReviews} review${reviewSummary.totalReviews > 1 ? 's' : ''})`
                    : '( No reviews )'}
                </Typography>
                <Typography color="green">In Stock</Typography>
              </Stack>
              <Typography variant="h5">${product.price}</Typography>
            </Stack>

            {/* Description */}
            <Stack rowGap=".8rem">
              <Typography>{product.description || product.summary}</Typography>
              <hr />
            </Stack>

            {/* Color, size and add-to-cart */}
            {!user?.isAdmin && (
              <Stack sx={{ rowGap: '1.3rem' }} width="fit-content">
                {/* Colors */}
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  columnGap={is387 ? '5px' : '1rem'}
                  width="fit-content"
                >
                  <Typography>Colors: </Typography>
                  <Stack flexDirection="row" columnGap={is387 ? '.5rem' : '.2rem'}>
                    {COLORS.map((color, index) => (
                      <div
                        key={color}
                        style={{
                          backgroundColor: 'white',
                          border:
                            selectedColorIndex === index
                              ? `1px solid ${theme.palette.primary.dark}`
                              : '',
                          width: is340 ? '40px' : '50px',
                          height: is340 ? '40px' : '50px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: '100%',
                        }}
                      >
                        <div
                          onClick={() => setSelectedColorIndex(index)}
                          style={{
                            width: '40px',
                            height: '40px',
                            border: color === '#F6F6F6' ? '1px solid grayText' : '',
                            backgroundColor: color,
                            borderRadius: '100%',
                            cursor: 'pointer',
                          }}
                        />
                      </div>
                    ))}
                  </Stack>
                </Stack>

                {/* Size */}
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  columnGap={is387 ? '5px' : '1rem'}
                  width="fit-content"
                >
                  <Typography>Size: </Typography>
                  <Stack flexDirection="row" columnGap={is387 ? '.5rem' : '1rem'}>
                    {SIZES.map((size) => (
                      <motion.div
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.99 }}
                        style={{
                          border: selectedSize === size ? '' : '1px solid grayText',
                          borderRadius: '10px',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '1.2rem',
                          backgroundColor: selectedSize === size ? '#9a5852' : '#fffcf8',
                          color: selectedSize === size ? 'white' : '',
                        }}
                      >
                        <p>{size}</p>
                      </motion.div>
                    ))}
                  </Stack>
                </Stack>

                {/* Quantity, add to cart and wishlist */}
                <Stack flexDirection="row" columnGap={is387 ? '.3rem' : '1.5rem'} width="100%">
                  {/* Quantity */}
                  <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                    <MotionConfig>
                      <PremiumButton
                        magnetic={false}
                        onClick={handleDecreaseQty}
                        variant="outlined"
                        sx={{
                          minWidth: 46,
                          px: 0,
                          borderRadius: '10px',
                        }}
                      >
                        -
                      </PremiumButton>
                      <p style={{ margin: '0 1rem', fontSize: '1.1rem', fontWeight: '400' }}>
                        {quantity}
                      </p>
                      <PremiumButton
                        magnetic={false}
                        onClick={handleIncreaseQty}
                        variant="contained"
                        sx={{
                          minWidth: 46,
                          px: 0,
                          borderRadius: '10px',
                        }}
                      >
                        +
                      </PremiumButton>
                    </MotionConfig>
                  </Stack>

                  {/* Add to cart */}
                  {isProductAlreadyInCart ? (
                    <PremiumButton
                      variant="contained"
                      magnetic={false}
                      onClick={() => navigate('/cart')}
                    >
                      In Cart
                    </PremiumButton>
                  ) : (
                    <PremiumButton
                      onClick={handleAddToCart}
                      variant="contained"
                      magnetic={false}
                    >
                      Add To Cart
                    </PremiumButton>
                  )}

                  {/* Wishlist */}
                  <motion.div
                    style={{
                      border: '1px solid grayText',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <PremiumCheckbox
                      checked={isProductAlreadyInWishlist}
                      onChange={handleAddRemoveFromWishlist}
                      icon={<FavoriteBorder />}
                      checkedIcon={<Favorite sx={{ color: 'red' }} />}
                    />
                  </motion.div>
                </Stack>
              </Stack>
            )}

            {/* Product perks */}
            <Stack
              mt={3}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px grayText solid',
                borderRadius: '7px',
              }}
            >
              <Stack
                p={2}
                flexDirection="row"
                alignItems="center"
                columnGap="1rem"
                width="100%"
                justifyContent="flex-start"
              >
                <Box>
                  <LocalShippingOutlinedIcon />
                </Box>
                <Stack>
                  <Typography>Free Delivery</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter your postal for delivery availability
                  </Typography>
                </Stack>
              </Stack>
              <hr style={{ width: '100%' }} />
              <Stack
                p={2}
                flexDirection="row"
                alignItems="center"
                width="100%"
                columnGap="1rem"
                justifyContent="flex-start"
              >
                <Box>
                  <CachedOutlinedIcon />
                </Box>
                <Stack>
                  <Typography>Return Delivery</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Free 30 Days Delivery Returns
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* Product Reviews Section */}
      {product && (
        <Stack sx={{ maxWidth: '88rem', width: '100%', px: is480 ? 2 : 4 }}>
          <ProductReviewsSection productId={product.id ?? Number(id)} />
        </Stack>
      )}
    </Stack>
  );
}
