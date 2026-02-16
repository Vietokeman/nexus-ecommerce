import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormHelperText, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';
import type { SignupDto } from '@/types/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';
import { nexus } from '@/theme/theme';

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
    <AuthLayout title="Create account" subtitle="Join Nexus Commerce and start shopping">
      <Stack spacing={2.5} component="form" noValidate onSubmit={handleSubmit(handleSignup)}>
        {/* First & Last Name side-by-side */}
        <motion.div variants={itemVariants}>
          <Stack direction="row" spacing={1.5}>
            <Stack flex={1}>
              <TextField
                fullWidth
                {...register('firstName', { required: 'First name is required' })}
                placeholder="First name"
                autoComplete="given-name"
              />
              {errors.firstName && (
                <FormHelperText sx={{ mt: 0.5 }} error>
                  {errors.firstName.message}
                </FormHelperText>
              )}
            </Stack>
            <Stack flex={1}>
              <TextField
                fullWidth
                {...register('lastName', { required: 'Last name is required' })}
                placeholder="Last name"
                autoComplete="family-name"
              />
              {errors.lastName && (
                <FormHelperText sx={{ mt: 0.5 }} error>
                  {errors.lastName.message}
                </FormHelperText>
              )}
            </Stack>
          </Stack>
        </motion.div>

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
            {...register('password', {
              required: 'Password is required',
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                message: 'Min 8 characters with at least 1 uppercase, 1 lowercase, and 1 number',
              },
            })}
            placeholder="Password"
            autoComplete="new-password"
          />
          {errors.password && (
            <FormHelperText sx={{ mt: 0.5 }} error>
              {errors.password.message}
            </FormHelperText>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <TextField
            type="password"
            fullWidth
            {...register('confirmPassword', {
              required: 'Confirm password is required',
              validate: (value) => value === password || "Passwords don't match",
            })}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <FormHelperText sx={{ mt: 0.5 }} error>
              {errors.confirmPassword.message}
            </FormHelperText>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.99 }}
        >
          <LoadingButton
            sx={{ height: '3rem', fontSize: '1rem' }}
            fullWidth
            loading={loading}
            type="submit"
            variant="contained"
          >
            Create Account
          </LoadingButton>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography variant="body2" textAlign="center" sx={{ color: nexus.neutral[500], mt: 1 }}>
            Already have an account?{' '}
            <Typography
              component={Link}
              to="/login"
              variant="body2"
              sx={{
                textDecoration: 'none',
                fontWeight: 600,
                color: nexus.purple[600],
                '&:hover': { color: nexus.purple[800] },
              }}
            >
              Sign in
            </Typography>
          </Typography>
        </motion.div>
      </Stack>
    </AuthLayout>
  );
}
