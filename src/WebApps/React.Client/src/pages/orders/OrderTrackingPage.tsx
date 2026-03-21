import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Stack,
  Typography,
  Paper,
  IconButton,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
  Step,
  StepLabel,
  Stepper,
  StepConnector,
  stepConnectorClasses,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaidIcon from '@mui/icons-material/Paid';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';
import { styled } from '@mui/material/styles';
import loadingAnimation from '@/assets/animations/loading.json';
import ImageFallback from '@/components/ui/ImageFallback';

// Order status progression (matching backend enum)
const ORDER_STEPS = [
  { key: 'New', label: 'Mới tạo', icon: <FiberNewIcon />, color: '#6366f1' },
  { key: 'Pending', label: 'Chờ xử lý', icon: <HourglassEmptyIcon />, color: '#f59e0b' },
  { key: 'Paid', label: 'Đã thanh toán', icon: <PaidIcon />, color: '#10b981' },
  { key: 'Shipping', label: 'Đang giao', icon: <LocalShippingIcon />, color: '#3b82f6' },
  { key: 'Shipped', label: 'Đã giao', icon: <InventoryIcon />, color: '#8b5cf6' },
  { key: 'Fulfilled', label: 'Hoàn thành', icon: <CheckCircleIcon />, color: '#059669' },
];

const statusToStep: Record<string, number> = {
  New: 0,
  Pending: 1,
  Paid: 2,
  Shipping: 3,
  Shipped: 4,
  Fulfilled: 5,
  Cancelled: -1,
};

const ColorConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: 'linear-gradient(90deg, #f59e0b 0%, #0f766e 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: 'linear-gradient(90deg, #0f766e 0%, #065f46 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
}));

interface StepIconOwnProps {
  active?: boolean;
  completed?: boolean;
  icon: React.ReactNode;
  stepIndex: number;
}

function ColorStepIcon({ active, completed, icon, stepIndex }: StepIconOwnProps) {
  const step = ORDER_STEPS[stepIndex];
  const bg = completed
    ? 'linear-gradient(135deg, #0f766e, #065f46)'
    : active
      ? `linear-gradient(135deg, ${step?.color || '#f59e0b'}, #0f766e)`
      : '#e0e0e0';

  return (
    <Stack
      sx={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: bg,
        justifyContent: 'center',
        alignItems: 'center',
        color: completed || active ? '#fff' : '#9e9e9e',
        boxShadow: active ? '0 6px 16px rgba(15, 118, 110, 0.35)' : 'none',
        transition: 'all 0.3s',
      }}
    >
      {step?.icon || icon}
    </Stack>
  );
}

interface Order {
  id: string;
  documentNo: string;
  createdDate: string;
  totalPrice: number;
  status: string;
  firstName?: string;
  lastName?: string;
  shippingAddress?: string;
  orderItems?: Array<{
    productName: string;
    itemNo: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
}

export default function OrderTrackingPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const theme = useTheme();
  const is768 = useMediaQuery(theme.breakpoints.down(768));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const userName =
    useAuthStore((s) => s.user)?.userName || useAuthStore((s) => s.user)?.email || '';

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order | undefined>({
    queryKey: ['order-tracking', orderNo, userName],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.ORDERS.BY_USER(userName));
      const orders: Order[] = data?.result || data || [];
      return orders.find((o) => o.documentNo === orderNo);
    },
    enabled: !!orderNo && !!userName,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    if (isError) toast.error('Không tìm thấy đơn hàng');
  }, [isError]);

  if (isLoading) {
    return (
      <Stack
        width={is480 ? 'auto' : '25rem'}
        height="calc(100vh - 4rem)"
        justifyContent="center"
        alignItems="center"
        mx="auto"
      >
        <Lottie animationData={loadingAnimation} />
      </Stack>
    );
  }

  if (!order) {
    return (
      <Stack height="50vh" justifyContent="center" alignItems="center">
        <Typography variant="h5">Không tìm thấy đơn hàng</Typography>
      </Stack>
    );
  }

  const isCancelled = order.status === 'Cancelled';
  const currentStep = statusToStep[order.status] ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Stack sx={{ maxWidth: 900, mx: 'auto', py: 4, px: is480 ? 2 : 4 }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          mb={4}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            border: '1px solid #EFE3D1',
            background:
              'linear-gradient(135deg, rgba(255,247,233,0.9), rgba(241,250,248,0.9) 65%, rgba(255,255,255,1))',
            boxShadow: '0 14px 28px rgba(132, 96, 54, 0.1)',
          }}
        >
          <motion.div whileHover={{ x: -5 }}>
            <IconButton
              component={Link}
              to="/orders"
              sx={{ bgcolor: '#FFFFFF', border: '1px solid #E8DAC3' }}
            >
              <ArrowBackIcon />
            </IconButton>
          </motion.div>
          <div>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              📦 Theo dõi đơn hàng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mã đơn: {order.documentNo}
            </Typography>
          </div>
        </Stack>

        {/* Status Banner */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: isCancelled
              ? 'linear-gradient(135deg, #fef2f2, #fde8e8)'
              : currentStep >= 5
                ? 'linear-gradient(135deg, #ecfdf5, #d7f5eb)'
                : 'linear-gradient(135deg, #fffbf1, #e8f7f4)',
            border: isCancelled
              ? '1px solid #fca5a5'
              : currentStep >= 5
                ? '1px solid #6ee7b7'
                : '1px solid #EBCFA5',
            boxShadow: '0 16px 30px rgba(111, 84, 46, 0.1)',
          }}
        >
          <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
            {isCancelled ? (
              <CancelIcon sx={{ fontSize: 40, color: '#ef4444' }} />
            ) : currentStep >= 5 ? (
              <CheckCircleIcon sx={{ fontSize: 40, color: '#10b981' }} />
            ) : (
              ORDER_STEPS[currentStep]?.icon
            )}
            <Stack>
              <Typography variant="h5" fontWeight={700}>
                {isCancelled
                  ? 'Đơn hàng đã bị hủy'
                  : currentStep >= 5
                    ? 'Đơn hàng hoàn thành!'
                    : ORDER_STEPS[currentStep]?.label || order.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ngày đặt:{' '}
                {new Date(order.createdDate).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Stack>
            <Chip
              label={order.status}
              color={isCancelled ? 'error' : 'primary'}
              sx={{ ml: 'auto' }}
            />
          </Stack>
        </Paper>

        {/* Timeline Stepper */}
        {!isCancelled && (
          <Paper
            sx={{
              p: is480 ? 2 : 4,
              mb: 4,
              borderRadius: 3,
              border: '1px solid #ECE1D1',
              background: 'linear-gradient(180deg, #FFFFFF, #FFFCF7)',
              boxShadow: '0 14px 28px rgba(125, 95, 54, 0.08)',
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={3}>
              Tiến trình đơn hàng
            </Typography>
            <Stepper
              alternativeLabel={!is768}
              orientation={is768 ? 'vertical' : 'horizontal'}
              activeStep={currentStep}
              connector={<ColorConnector />}
            >
              {ORDER_STEPS.map((step, index) => (
                <Step key={step.key} completed={index <= currentStep}>
                  <StepLabel
                    StepIconComponent={(props) => (
                      <ColorStepIcon {...props} icon={step.icon} stepIndex={index} />
                    )}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={index === currentStep ? 700 : 400}
                      color={index <= currentStep ? 'text.primary' : 'text.secondary'}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        {/* Order Info */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: '1px solid #ECE1D2',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF7 100%)',
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={2}>
            Thông tin đơn hàng
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Người nhận</Typography>
              <Typography fontWeight={500}>
                {order.firstName} {order.lastName}
              </Typography>
            </Stack>
            {order.shippingAddress && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Địa chỉ giao hàng</Typography>
                <Typography fontWeight={500} textAlign="right" maxWidth="60%">
                  {order.shippingAddress}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Tổng tiền</Typography>
              <Typography fontWeight={700} color="primary" fontSize="1.2rem">
                ${order.totalPrice}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Order Items */}
        {order.orderItems && order.orderItems.length > 0 && (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #ECE1D2',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF7 100%)',
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Sản phẩm ({order.orderItems.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              {order.orderItems.map((item) => (
                <Stack
                  key={item.itemNo}
                  direction="row"
                  alignItems="center"
                  gap={2}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid #EEE3D4',
                    '&:hover': { bgcolor: '#FFFBF4' },
                  }}
                >
                  <ImageFallback
                    src={item.imageUrl}
                    fallbackSrc={`https://via.placeholder.com/60?text=${item.productName[0]}`}
                    alt={item.productName}
                    style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <Stack flex={1}>
                    <Typography fontWeight={500}>{item.productName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      SL: {item.quantity} × ${item.price}
                    </Typography>
                  </Stack>
                  <Typography fontWeight={600}>${item.quantity * item.price}</Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
        )}
      </Stack>
    </motion.div>
  );
}
