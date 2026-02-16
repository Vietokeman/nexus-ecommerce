import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormHelperText, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';
import type { LoginDto } from '@/types/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';
import { nexus } from '@/theme/theme';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginDto>();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.isVerified) {
      navigate('/');
    } else if (isAuthenticated && user && !user.isVerified) {
      navigate('/verify-otp');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (data: LoginDto) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Login successful');
      reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue shopping">
      <Stack
        spacing={2.5}
        component="form"
        noValidate
        onSubmit={handleSubmit(handleLogin)}
      >
        <motion.div variants={itemVariants}>
          <TextField
            fullWidth
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value:
                  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                message: 'Enter a valid email',
              },
            })}
            placeholder="Email address"
            autoComplete="email"
          />
          {errors.email && (
            <FormHelperText sx={{ mt: 0.5 }} error>
              {errors.email.message}
            </FormHelperText>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <TextField
            type="password"
            fullWidth
            {...register('password', { required: 'Password is required' })}
            placeholder="Password"
            autoComplete="current-password"
          />
          {errors.password && (
            <FormHelperText sx={{ mt: 0.5 }} error>
              {errors.password.message}
            </FormHelperText>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Stack direction="row" justifyContent="flex-end" mb={0.5}>
            <Typography
              variant="body2"
              component={Link}
              to="/forgot-password"
              sx={{
                textDecoration: 'none',
                color: nexus.purple[600],
                fontWeight: 500,
                '&:hover': { color: nexus.purple[800] },
              }}
            >
              Forgot password?
            </Typography>
          </Stack>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.99 }}>
          <LoadingButton
            fullWidth
            sx={{ height: '3rem', fontSize: '1rem' }}
            loading={loading}
            type="submit"
            variant="contained"
          >
            Sign In
          </LoadingButton>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: nexus.neutral[500], mt: 1 }}
          >
            Don&apos;t have an account?{' '}
            <Typography
              component={Link}
              to="/signup"
              variant="body2"
              sx={{
                textDecoration: 'none',
                fontWeight: 600,
                color: nexus.purple[600],
                '&:hover': { color: nexus.purple[800] },
              }}
            >
              Create account
            </Typography>
          </Typography>
        </motion.div>
      </Stack>
    </AuthLayout>
  );
}
