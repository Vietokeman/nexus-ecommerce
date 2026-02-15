import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@/components/layouts/RootLayout';
import Spinner from '@/components/ui/Spinner';

/* ─── Lazy Pages ─── */
const HomePage = lazy(() => import('@/pages/products/HomePage'));
const ProductDetailsPage = lazy(() => import('@/pages/products/ProductDetailsPage'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/cart/CheckoutPage'));
const PaymentSuccessPage = lazy(() => import('@/pages/payment/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('@/pages/payment/PaymentCancelPage'));
const OrderSuccessPage = lazy(() => import('@/pages/orders/OrderSuccessPage'));
const UserOrdersPage = lazy(() => import('@/pages/orders/UserOrdersPage'));
const UserProfilePage = lazy(() => import('@/pages/user/UserProfilePage'));
const WishlistPage = lazy(() => import('@/pages/user/WishlistPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AddProductPage = lazy(() => import('@/pages/admin/AddProductPage'));
const ProductUpdatePage = lazy(() => import('@/pages/admin/ProductUpdatePage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products/:id',
        element: (
          <SuspenseWrapper>
            <ProductDetailsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'cart',
        element: (
          <SuspenseWrapper>
            <CartPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'checkout',
        element: (
          <SuspenseWrapper>
            <CheckoutPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'payment/success',
        element: (
          <SuspenseWrapper>
            <PaymentSuccessPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'payment/cancel',
        element: (
          <SuspenseWrapper>
            <PaymentCancelPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'order-success/:orderNo',
        element: (
          <SuspenseWrapper>
            <OrderSuccessPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'orders',
        element: (
          <SuspenseWrapper>
            <UserOrdersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <UserProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <SuspenseWrapper>
            <WishlistPage />
          </SuspenseWrapper>
        ),
      },
      /* ─── Admin ─── */
      {
        path: 'admin',
        element: (
          <SuspenseWrapper>
            <AdminDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'admin/products/add',
        element: (
          <SuspenseWrapper>
            <AddProductPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'admin/products/:id/edit',
        element: (
          <SuspenseWrapper>
            <ProductUpdatePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <SuspenseWrapper>
            <AdminOrdersPage />
          </SuspenseWrapper>
        ),
      },
      /* ─── Fallback ─── */
      {
        path: '404',
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);
