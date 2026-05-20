import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Paper, Stack, Typography } from '@mui/material';
import { useAuthStore } from '@/store/auth-store';
import { appToast } from '@/lib/toast';
import type { User } from '@/types/auth';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import Spinner from '@/components/ui/Spinner';

/**
 * Handles the OAuth callback from the backend.
 * The backend redirects here with token, refreshToken, and user info in query params.
 */
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken);
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  const mapQueryUser = (): User => ({
    id: searchParams.get('userId') ?? '',
    email: searchParams.get('email') ?? '',
    firstName: searchParams.get('firstName') ?? '',
    lastName: searchParams.get('lastName') ?? '',
    userName: searchParams.get('userName') ?? searchParams.get('email') ?? '',
    isAdmin: searchParams.get('isAdmin') === 'true',
    isVerified: searchParams.get('isVerified') === 'true',
  });

  const normalizeUser = (raw: unknown): User | null => {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const dto = raw as Partial<User>;
    if (!dto.id || !dto.email) {
      return null;
    }

    return {
      id: dto.id,
      email: dto.email,
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      userName: dto.userName ?? dto.email,
      isAdmin: Boolean(dto.isAdmin),
      isVerified: Boolean(dto.isVerified),
    };
  };

  const hydrateUserFromMe = async (): Promise<User | null> => {
    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.ME);
      const candidate = (data?.result ?? data) as unknown;
      return normalizeUser(candidate);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (processedRef.current) {
      return;
    }
    processedRef.current = true;

    const token =
      searchParams.get('token') ?? searchParams.get('accessToken') ?? searchParams.get('jwt');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      setError(decodedError);
      appToast.errorAction('Authentication failed', decodedError, 'auth-oauth-callback-error');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!token) {
      setError('No authentication token received');
      appToast.errorAction('Authentication failed', undefined, 'auth-oauth-callback-missing-token');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const run = async () => {
      setToken(token);
      const refreshToken = searchParams.get('refreshToken');
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      const hydrated = await hydrateUserFromMe();
      const fallbackUser = mapQueryUser();
      const user = hydrated ?? fallbackUser;

      if (!user.id || !user.email) {
        setError('Unable to resolve account details from OAuth callback');
        appToast.errorAction(
          'Authentication failed',
          'Unable to resolve account details from OAuth callback',
          'auth-oauth-callback-user-hydration-failed',
        );
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      setUser(user);
      useAuthStore.setState({
        user,
        token,
        refreshToken: refreshToken ?? null,
        isAuthenticated: true,
      });

      appToast.successAction('Login successful!', 'auth-oauth-callback-success');
      const returnUrl = searchParams.get('returnUrl') || '/';
      navigate(returnUrl, { replace: true });
    };

    void run();
  }, [searchParams, navigate, setUser, setToken, setRefreshToken]);

  if (error) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: '100dvh',
          px: 2,
          background: 'linear-gradient(135deg, #1C1917 0%, #0C0A09 100%)',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 4, sm: 5 },
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="error.main" fontWeight={800} sx={{ mb: 1.5 }}>
            Authentication Failed
          </Typography>
          <Typography variant="body2" sx={{ color: '#FAF9F6', mt: 1.25 }}>
            {error}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1.5 }}>
            Redirecting to login...
          </Typography>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        minHeight: '100dvh',
        px: 2,
        background: 'linear-gradient(135deg, #1C1917 0%, #0C0A09 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 520,
          p: { xs: 4, sm: 5 },
          borderRadius: '20px',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 20px 38px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
        }}
      >
        <Spinner />
        <Typography variant="body1" sx={{ mt: 2.5, fontWeight: 600, color: '#FAF9F6' }}>
          Completing sign in...
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.45)', mt: 1, display: 'block' }}>
          Securing your session and syncing preferences
        </Typography>
      </Paper>
    </Stack>
  );
}
