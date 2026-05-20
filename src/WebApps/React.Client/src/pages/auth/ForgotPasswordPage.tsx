import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { appToast } from '@/lib/toast';
import { API_ENDPOINTS } from '@/lib/endpoints';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';
import { nexus } from '@/theme/theme';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { PremiumInput } from '@/components/ui/primitives';

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotForm>();
  const [status, setStatus] = useState<'idle' | 'pending' | 'fulfilled' | 'rejected'>('idle');

  const handleForgotPassword = async (data: ForgotForm) => {
    setStatus('pending');
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
      setStatus('fulfilled');
      appToast.successAction('Password reset link sent to your email', 'auth-forgot-password-success');
      reset();
    } catch (err: unknown) {
      setStatus('rejected');
      const error = err as { response?: { data?: { message?: string } } };
      appToast.errorAction(
        'Something went wrong',
        error.response?.data?.message,
        'auth-forgot-password-error',
      );
    }
  };

  const successTitle = 'Email has been sent!';
  const successSubtitle =
    'Please check your inbox and click on the received link to reset your password.';

  return (
    <AuthLayout
      title={status === 'fulfilled' ? successTitle : 'Forgot your password?'}
      subtitle={
        status === 'fulfilled'
          ? successSubtitle
          : 'Enter your registered email to receive a reset link'
      }
    >
      {status === 'fulfilled' ? (
        <motion.div variants={itemVariants}>
          <Stack alignItems="center" spacing={3} mt={2}>
            <CheckCircleOutlineIcon
              sx={{
                fontSize: 68,
                color: '#D4AF37',
                filter: 'drop-shadow(0 8px 18px rgba(212, 175, 55, 0.32))',
              }}
            />
            <Typography
              variant="body2"
              component={Link}
              to="/login"
              sx={{
                textDecoration: 'none',
                fontWeight: 700,
                color: '#1C1917',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 999,
                px: 3,
                py: 1,
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(8px)',
                transition: 'all 300ms',
                '&:hover': {
                  color: '#FAF9F6',
                  background: '#1C1917',
                  borderColor: '#1C1917',
                },
              }}
            >
              Back to Sign In
            </Typography>
          </Stack>
        </motion.div>
      ) : (
        <Stack
          spacing={2.5}
          component="form"
          noValidate
          onSubmit={handleSubmit(handleForgotPassword)}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '16px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div variants={itemVariants}>
            <PremiumInput
              fullWidth
              density="compact"
              label="Email"
              {...register('email', {
                required: 'Please enter your email',
                pattern: {
                  value:
                    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
                  message: 'Enter a valid email',
                },
              })}
              placeholder="Email address"
              autoComplete="email"
              errorText={errors.email?.message}
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
          >
            <LoadingButton
              sx={{
                height: '3.1rem',
                fontSize: '1rem',
                borderRadius: 999,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
                color: '#FAF9F6',
                boxShadow: '0 16px 30px -14px rgba(28, 25, 23, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                  color: '#0C0A09',
                  boxShadow: '0 20px 40px -15px rgba(212, 175, 55, 0.4)',
                }
              }}
              fullWidth
              loading={status === 'pending'}
              type="submit"
              variant="contained"
            >
              Send Reset Link
            </LoadingButton>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ color: nexus.neutral[500], mt: 1.25, fontWeight: 500 }}
            >
              Remember your password?{' '}
              <Typography
                component={Link}
                to="/login"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: '#D4AF37',
                  '&:hover': { color: '#CA8A04' },
                }}
              >
                Sign in
              </Typography>
            </Typography>
          </motion.div>
        </Stack>
      )}
    </AuthLayout>
  );
}
