import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Paper, Stack, Typography } from '@mui/material';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { appToast } from '@/lib/toast';
import AuthLayout from '@/components/auth/AuthLayout';

type ConfirmState = 'loading' | 'success' | 'error';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConfirmState>('loading');
  const [message, setMessage] = useState('Confirming your email...');
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) {
      return;
    }
    processedRef.current = true;

    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (!userId || !token) {
      setStatus('error');
      setMessage('Invalid confirmation link. Please request a new verification email.');
      appToast.errorAction(
        'Email confirmation failed',
        'Invalid confirmation link',
        'auth-confirm-email-invalid-link',
      );
      return;
    }

    const confirm = async () => {
      try {
        await api.get(API_ENDPOINTS.AUTH.CONFIRM_EMAIL, { params: { userId, token } });
        setStatus('success');
        setMessage('Email confirmed successfully. You can now sign in.');
        appToast.successAction('Email confirmed', 'auth-confirm-email-success');
      } catch {
        setStatus('error');
        setMessage('Email confirmation failed or link has expired.');
        appToast.errorAction(
          'Email confirmation failed',
          'Link expired or invalid',
          'auth-confirm-email-failed',
        );
      }
    };

    void confirm();
  }, [searchParams]);

  return (
    <AuthLayout title="Confirm your email" subtitle="Secure your account before continuing">
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '20px',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack spacing={1.25}>
          <Typography variant="body1" fontWeight={600}>
            {message}
          </Typography>

          {status === 'loading' && (
            <LoadingButton loading fullWidth variant="contained" disabled>
              Confirming
            </LoadingButton>
          )}

          {status === 'success' && (
            <LoadingButton
              fullWidth
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: 999,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
                color: '#FAF9F6',
                py: 1.2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                  color: '#0C0A09',
                }
              }}
            >
              Go to login
            </LoadingButton>
          )}

          {status === 'error' && (
            <LoadingButton
              fullWidth
              variant="outlined"
              component={Link}
              to="/signup"
              sx={{
                borderRadius: 999,
                fontWeight: 700,
                borderColor: '#1C1917',
                color: '#1C1917',
                py: 1.2,
                '&:hover': {
                  borderColor: '#0A0A0A',
                  background: 'rgba(28,25,23,0.05)',
                }
              }}
            >
              Back to sign up
            </LoadingButton>
          )}
        </Stack>
      </Paper>
    </AuthLayout>
  );
}
