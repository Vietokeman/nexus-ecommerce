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
import type { SignupDto } from '@/types/auth';
import ecommerceAnimation from '@/assets/animations/ecommerceOutlook.json';

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SignupDto>();
  const signup = useAuthStore((s) => s.signup);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const [loading, setLoading] = useState(false);

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated && user && !user.isVerified) {
      navigate('/verify-otp');
    } else if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSignup = async (data: SignupDto) => {
    setLoading(true);
    try {
      await signup(data);
      toast.success('Welcome! Verify your email to start shopping.');
      reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Signup failed');
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
          onSubmit={handleSubmit(handleSignup)}
        >
          <MotionConfig whileHover={{ y: -5 }}>
            <motion.div>
              <TextField
                fullWidth
                {...register('name', { required: 'Username is required' })}
                placeholder="Username"
              />
              {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
            </motion.div>

            <motion.div>
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
              {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField
                type="password"
                fullWidth
                {...register('password', {
                  required: 'Password is required',
                  pattern: {
                    value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                    message:
                      'At least 8 characters, must contain at least 1 uppercase, 1 lowercase, and 1 number',
                  },
                })}
                placeholder="Password"
              />
              {errors.password && (
                <FormHelperText error>{errors.password.message}</FormHelperText>
              )}
            </motion.div>

            <motion.div>
              <TextField
                type="password"
                fullWidth
                {...register('confirmPassword', {
                  required: 'Confirm Password is required',
                  validate: (value) => value === password || "Passwords doesn't match",
                })}
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && (
                <FormHelperText error>{errors.confirmPassword.message}</FormHelperText>
              )}
            </motion.div>
          </MotionConfig>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton
              sx={{ height: '2.5rem' }}
              fullWidth
              loading={loading}
              type="submit"
              variant="contained"
            >
              Signup
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
                  to="/login"
                  component={Link}
                >
                  Already a member?{' '}
                  <span style={{ color: theme.palette.primary.dark }}>Login</span>
                </Typography>
              </motion.div>
            </MotionConfig>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
