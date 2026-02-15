import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import { useAuthStore } from '@/store/auth-store';
import type { SignupDto } from '@/types/auth';
import ecommerceAnimation from '@/assets/animations/ecommerceOutlook.json';

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupDto>();
  const signup = useAuthStore((s) => s.signup);
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const [loading, setLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async (data: SignupDto) => {
    setLoading(true);
    try {
      await signup(data);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Signup failed');
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
            Create an account
          </Typography>
          <Typography variant="body1" color="GrayText" mb={2}>
            Enter your details below
          </Typography>

          <TextField
            label="Name"
            fullWidth
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

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
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            {...register('confirmPassword', {
              required: 'Confirm password is required',
              validate: (v) => v === password || 'Passwords do not match',
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
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
            Create Account
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
                to="/login"
                variant="body2"
                sx={{
                  color: '#DB4444',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Already have an account? Log in
              </Typography>
            </motion.div>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
