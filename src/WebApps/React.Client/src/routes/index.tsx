import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/components/layouts/RootLayout';
import Protected from '@/components/auth/Protected';
import AdminRoute from '@/components/auth/AdminRoute';
import Spinner from '@/components/ui/Spinner';

/* ─── Lazy Pages: Auth (Public) ─── */
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const OtpVerificationPage = lazy(() => import('@/pages/auth/OtpVerificationPage'));

/* ─── Lazy Pages: Protected (User) ─── */
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

/* ─── Lazy Pages: Admin ─── */
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AddProductPage = lazy(() => import('@/pages/admin/AddProductPage'));
const ProductUpdatePage = lazy(() => import('@/pages/admin/ProductUpdatePage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));

/* ─── Lazy Pages: Other ─── */
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <S>{children}</S>
    </Protected>
  );
}

function A({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <S>{children}</S>
    </AdminRoute>
  );
}

export const router = createBrowserRouter([
  /* ─── Public Auth Routes (no layout) ─── */
  {
    path: '/signup',
    element: (
      <S>
        <SignupPage />
      </S>
    ),
  },
  {
    path: '/login',
    element: (
      <S>
        <LoginPage />
      </S>
    ),
  },
  {
    path: '/verify-otp',
    element: (
      <S>
        <OtpVerificationPage />
      </S>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <S>
        <ForgotPasswordPage />
      </S>
    ),
  },
  {
    path: '/reset-password/:userId/:passwordResetToken',
    element: (
      <S>
        <ResetPasswordPage />
      </S>
    ),
  },

  /* ─── Protected Routes (with Navbar + Footer layout) ─── */
  {
    path: '/',
    element: <RootLayout />,
    children: [
      /* User Routes */
      {
        index: true,
        element: (
          <P>
            <HomePage />
          </P>
        ),
      },
      {
        path: 'product-details/:id',
        element: (
          <P>
            <ProductDetailsPage />
          </P>
        ),
      },
      {
        path: 'cart',
        element: (
          <P>
            <CartPage />
          </P>
        ),
      },
      {
        path: 'checkout',
        element: (
          <P>
            <CheckoutPage />
          </P>
        ),
      },
      {
        path: 'payment/success',
        element: (
          <P>
            <PaymentSuccessPage />
          </P>
        ),
      },
      {
        path: 'payment/cancel',
        element: (
          <P>
            <PaymentCancelPage />
          </P>
        ),
      },
      {
        path: 'order-success/:orderNo',
        element: (
          <P>
            <OrderSuccessPage />
          </P>
        ),
      },
      {
        path: 'orders',
        element: (
          <P>
            <UserOrdersPage />
          </P>
        ),
      },
      {
        path: 'profile',
        element: (
          <P>
            <UserProfilePage />
          </P>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <P>
            <WishlistPage />
          </P>
        ),
      },

      /* ─── Admin Routes ─── */
      {
        path: 'admin/dashboard',
        element: (
          <A>
            <AdminDashboardPage />
          </A>
        ),
      },
      {
        path: 'admin/add-product',
        element: (
          <A>
            <AddProductPage />
          </A>
        ),
      },
      {
        path: 'admin/product-update/:id',
        element: (
          <A>
            <ProductUpdatePage />
          </A>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <A>
            <AdminOrdersPage />
          </A>
        ),
      },

      /* ─── Fallback ─── */
      {
        path: '*',
        element: (
          <S>
            <NotFoundPage />
          </S>
        ),
      },
    ],
  },
]);
