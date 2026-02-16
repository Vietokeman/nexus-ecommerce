import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FormHelperText,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { MotionConfig, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import { useAuthStore } from '@/store/auth-store';
import type { LoginDto } from '@/types/auth';
import ecommerceAnimation from '@/assets/animations/ecommerceOutlook.json';

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
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));
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
    <Stack width="100vw" height="100vh" flexDirection="row" sx={{ overflowY: 'hidden' }}>
      {!is900 && (
        <Stack bgcolor="black" flex={1} justifyContent="center">
          <Lottie animationData={ecommerceAnimation} />
        </Stack>
      )}

      <Stack flex={1} justifyContent="center" alignItems="center">
        <Stack flexDirection="row" justifyContent="center" alignItems="center">
          <Stack rowGap=".4rem">
            <Typography variant="h2" sx={{ wordBreak: 'break-word' }} fontWeight={600}>
              E-Commerce
            </Typography>
            <Typography alignSelf="flex-end" color="GrayText" variant="body2">
              - Shop Anything
            </Typography>
          </Stack>
        </Stack>

        <Stack
          mt={4}
          spacing={2}
          width={is480 ? '95vw' : '28rem'}
          component="form"
          noValidate
          onSubmit={handleSubmit(handleLogin)}
        >
          <motion.div whileHover={{ y: -5 }}>
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
              placeholder="Email"
            />
            {errors.email && (
              <FormHelperText sx={{ mt: 1 }} error>
                {errors.email.message}
              </FormHelperText>
            )}
          </motion.div>

          <motion.div whileHover={{ y: -5 }}>
            <TextField
              type="password"
              fullWidth
              {...register('password', { required: 'Password is required' })}
              placeholder="Password"
            />
            {errors.password && (
              <FormHelperText sx={{ mt: 1 }} error>
                {errors.password.message}
              </FormHelperText>
            )}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton
              fullWidth
              sx={{ height: '2.5rem' }}
              loading={loading}
              type="submit"
              variant="contained"
            >
              Login
            </LoadingButton>
          </motion.div>

          <Stack
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap-reverse"
          >
            <MotionConfig whileHover={{ x: 2 }} whileTap={{ scale: 1.05 }}>
              <motion.div>
                <Typography
                  mr="1.5rem"
                  sx={{ textDecoration: 'none', color: 'text.primary' }}
                  to="/forgot-password"
                  component={Link}
                >
                  Forgot password
                </Typography>
              </motion.div>
              <motion.div>
                <Typography
                  sx={{ textDecoration: 'none', color: 'text.primary' }}
                  to="/signup"
                  component={Link}
                >
                  Don&apos;t have an account?{' '}
                  <span style={{ color: theme.palette.primary.dark }}>Register</span>
                </Typography>
              </motion.div>
            </MotionConfig>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
