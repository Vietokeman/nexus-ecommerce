import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { ForgotPasswordDto } from '@/types/auth';

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordDto>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const theme = useTheme();
  const is500 = useMediaQuery(theme.breakpoints.down(500));

  const onSubmit = async (data: ForgotPasswordDto) => {
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center">
      <Stack component={Paper} elevation={2} p={4} width={is500 ? '95vw' : '30rem'}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body1" color="GrayText" mb={3}>
          {sent
            ? 'Check your email for the reset link.'
            : 'Enter your email address to receive a reset link.'}
        </Typography>

        {!sent && (
          <Stack component="form" noValidate rowGap={2} onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              {...register('email', { required: 'Email is required' })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              loading={loading}
              sx={{
                bgcolor: '#DB4444',
                '&:hover': { bgcolor: '#b33636' },
              }}
            >
              Send Reset Link
            </LoadingButton>
          </Stack>
        )}

        <Typography
          component={RouterLink}
          to="/login"
          variant="body2"
          sx={{
            color: '#DB4444',
            textDecoration: 'none',
            cursor: 'pointer',
            mt: 2,
            textAlign: 'center',
          }}
        >
          Back to Login
        </Typography>
      </Stack>
    </Stack>
  );
}
