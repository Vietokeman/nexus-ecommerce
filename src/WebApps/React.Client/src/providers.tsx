import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { queryClient } from '@/lib/react-query';
import { LAYERS } from '@/lib/layers';
import theme from '@/theme/theme';
import ErrorFallback from '@/components/ui/ErrorFallback';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
        <ToastContainer
          position="top-right"
          autoClose={2200}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="light"
          toastClassName={() => 'nexus-toast'}
          progressClassName="nexus-toast-progress"
          style={{ zIndex: LAYERS.modal }}
          toastStyle={{
            borderRadius: 16,
            border: '1px solid rgba(228, 214, 191, 0.9)',
            background: 'linear-gradient(150deg, rgba(255,249,239,0.97), rgba(241,252,248,0.94))',
            boxShadow: '0 14px 34px -22px rgba(58, 40, 35, 0.4)',
            color: '#2b211d',
            fontWeight: 500,
            letterSpacing: '0.004em',
            backdropFilter: 'blur(8px)',
          }}
        />
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
