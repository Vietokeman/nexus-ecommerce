import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/types/auth';

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
      toast.error(errorParam);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!token) {
      setError('No authentication token received');
      toast.error('Authentication failed');
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

    toast.success('Login successful!');

    // Redirect to returnUrl or home
    const returnUrl = searchParams.get('returnUrl') || '/';
    navigate(returnUrl, { replace: true });
  }, [searchParams, navigate, setUser, setToken, setRefreshToken]);

  if (error) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', gap: 2 }}>
        <Typography variant="h6" color="error">
          Authentication Failed
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', gap: 2 }}>
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary">
        Completing sign in...
      </Typography>
    </Stack>
  );
}
