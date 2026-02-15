import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import { useAuthStore } from '@/store/auth-store';
import type { LoginDto } from '@/types/auth';
import ecommerceAnimation from '@/assets/animations/ecommerceOutlook.json';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginDto) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Login successful!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack width="100vw" height="100vh" flexDirection="row" sx={{ overflow: 'hidden' }}>
      {/* Left side — Lottie animation */}
      {!is900 && (
        <Stack
          width="50%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          sx={{ bgcolor: '#000' }}
        >
          <Lottie animationData={ecommerceAnimation} style={{ width: '80%', maxWidth: 500 }} />
        </Stack>
      )}

      {/* Right side — Form */}
      <Stack
        width={is900 ? '100%' : '50%'}
        height="100%"
        justifyContent="center"
        alignItems="center"
        p={4}
      >
        <Stack
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          width="100%"
          maxWidth={400}
          rowGap={2}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Log in to E-Commerce
          </Typography>
          <Typography variant="body1" color="GrayText" mb={2}>
            Enter your details below
          </Typography>

          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register('email', { required: 'Email is required' })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message}
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
              mt: 1,
            }}
          >
            Log In
          </LoadingButton>

          <Stack flexDirection="row" justifyContent="space-between" mt={1}>
            <motion.div whileHover={{ y: -2 }}>
              <Typography
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: '#DB4444',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Forgot Password?
              </Typography>
            </motion.div>
            <motion.div whileHover={{ y: -2 }}>
              <Typography
                component={RouterLink}
                to="/signup"
                variant="body2"
                sx={{
                  color: '#DB4444',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Don&apos;t have an account? Sign Up
              </Typography>
            </motion.div>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
