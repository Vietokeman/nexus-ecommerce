import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Paper, Stack, Typography } from '@mui/material';
import { useAuthStore } from '@/store/auth-store';
import { appToast } from '@/lib/toast';
import type { User } from '@/types/auth';
import Spinner from '@/components/ui/Spinner';
import { nexus } from '@/theme/theme';

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

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam);
      appToast.errorAction('Authentication failed', errorParam, 'auth-oauth-callback-error');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!token) {
      setError('No authentication token received');
      appToast.errorAction('Authentication failed', undefined, 'auth-oauth-callback-missing-token');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Build user from query params
    const user: User = {
      id: searchParams.get('userId') ?? '',
      email: searchParams.get('email') ?? '',
      firstName: searchParams.get('firstName') ?? '',
      lastName: searchParams.get('lastName') ?? '',
      userName: searchParams.get('email') ?? '',
      isAdmin: searchParams.get('isAdmin') === 'true',
      isVerified: searchParams.get('isVerified') === 'true',
    };

    // Store token, refreshToken, and user
    setToken(token);
    const refreshToken = searchParams.get('refreshToken');
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setUser(user);

    // Update zustand persist state
    useAuthStore.setState({
      user,
      token,
      refreshToken: refreshToken ?? null,
      isAuthenticated: true,
    });

    appToast.successAction('Login successful!', 'auth-oauth-callback-success');

    // Redirect to returnUrl or home
    const returnUrl = searchParams.get('returnUrl') || '/';
    navigate(returnUrl, { replace: true });
  }, [searchParams, navigate, setUser, setToken, setRefreshToken]);

  if (error) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100dvh', px: 2 }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 2.5, sm: 3 },
            borderRadius: 4,
            border: '1px solid #EBCFC8',
            background: 'linear-gradient(145deg, #FFF6F4 0%, #FFFFFF 75%)',
            boxShadow: '0 18px 36px rgba(132, 79, 74, 0.14)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="error" fontWeight={800}>
            Authentication Failed
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Redirecting to login...
          </Typography>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100dvh', px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 520,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 4,
          border: '1px solid #EFE0CB',
          background:
            'linear-gradient(150deg, rgba(255,248,236,0.85), rgba(239,251,248,0.9) 62%, rgba(255,255,255,0.95))',
          boxShadow: '0 20px 38px rgba(124, 92, 52, 0.12)',
          textAlign: 'center',
        }}
      >
        <Spinner />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
          Completing sign in...
        </Typography>
        <Typography variant="caption" sx={{ color: nexus.neutral[500], mt: 0.5, display: 'block' }}>
          Securing your session and syncing preferences
        </Typography>
      </Paper>
    </Stack>
  );
}
