import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
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
      toast.success('Password reset link sent to your email');
      reset();
    } catch (err: unknown) {
      setStatus('rejected');
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Something went wrong');
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
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: nexus.orange[500] }} />
            <Typography
              variant="body2"
              component={Link}
              to="/login"
              sx={{
                textDecoration: 'none',
                fontWeight: 600,
                color: nexus.orange[600],
                '&:hover': { color: nexus.orange[700] },
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
        >
          <motion.div variants={itemVariants}>
            <PremiumInput
              fullWidth
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
                height: '3rem',
                fontSize: '1rem',
                boxShadow: '0 14px 24px -16px rgba(154, 88, 82, 0.75)',
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
              sx={{ color: nexus.neutral[500], mt: 1 }}
            >
              Remember your password?{' '}
              <Typography
                component={Link}
                to="/login"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: nexus.orange[600],
                  '&:hover': { color: nexus.orange[700] },
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
