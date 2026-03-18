import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Divider, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';
import type { SignupDto } from '@/types/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';
import { nexus } from '@/theme/theme';
import { PremiumButton, PremiumInput } from '@/components/ui/primitives';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
        <motion.div variants={itemVariants}>
          <Stack
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid #F0DEC4',
              background:
                'linear-gradient(140deg, rgba(255,248,236,0.86), rgba(239,251,248,0.9) 65%, rgba(255,255,255,0.95))',
            }}
          >
            <Typography variant="caption" sx={{ color: nexus.neutral[600], letterSpacing: '0.01em' }}>
              Build your account in seconds and unlock personalized recommendations.
            </Typography>
          </Stack>
        </motion.div>

        {/* First & Last Name side-by-side */}
        <motion.div variants={itemVariants}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Stack flex={1}>
              <PremiumInput
                fullWidth
                label="First Name"
                {...register('firstName', { required: 'First name is required' })}
                placeholder="First name"
                autoComplete="given-name"
                errorText={errors.firstName?.message}
              />
            </Stack>
            <Stack flex={1}>
              <PremiumInput
                fullWidth
                label="Last Name"
                {...register('lastName', { required: 'Last name is required' })}
                placeholder="Last name"
                autoComplete="family-name"
                errorText={errors.lastName?.message}
              />
            </Stack>
          </Stack>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PremiumInput
            fullWidth
            label="Email"
            {...register('email', {
              required: 'Email is required',
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

        <motion.div variants={itemVariants}>
          <PremiumInput
            type="password"
            fullWidth
            label="Password"
            {...register('password', {
              required: 'Password is required',
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                message: 'Min 8 characters with at least 1 uppercase, 1 lowercase, and 1 number',
              },
            })}
            placeholder="Password"
            autoComplete="new-password"
            errorText={errors.password?.message}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PremiumInput
            type="password"
            fullWidth
            label="Confirm Password"
            {...register('confirmPassword', {
              required: 'Confirm password is required',
              validate: (value) => value === password || "Passwords don't match",
            })}
            placeholder="Confirm password"
            autoComplete="new-password"
            errorText={errors.confirmPassword?.message}
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
              boxShadow: '0 16px 30px -14px rgba(154, 88, 82, 0.75)',
            }}
            fullWidth
            loading={loading}
            type="submit"
            variant="contained"
          >
            Create Account
          </LoadingButton>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" sx={{ color: nexus.neutral[500], px: 1.5, fontWeight: 500 }}>
              or sign up with
            </Typography>
          </Divider>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <PremiumButton
              fullWidth
              variant="outlined"
              magnetic={false}
              startIcon={<GoogleIcon />}
              onClick={() => {
                window.location.href = `${API_BASE_URL}/api/auth/external-login?provider=Google`;
              }}
              sx={{
                height: '2.95rem',
                textTransform: 'none',
                borderRadius: 999,
                fontWeight: 600,
                borderColor: '#EBDCC9',
                color: nexus.neutral[700],
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  borderColor: '#ea4335',
                  backgroundColor: 'rgba(234, 67, 53, 0.08)',
                  color: '#ea4335',
                },
              }}
            >
              Google
            </PremiumButton>
            <PremiumButton
              fullWidth
              variant="outlined"
              magnetic={false}
              startIcon={<GitHubIcon />}
              onClick={() => {
                window.location.href = `${API_BASE_URL}/api/auth/external-login?provider=GitHub`;
              }}
              sx={{
                height: '2.95rem',
                textTransform: 'none',
                borderRadius: 999,
                fontWeight: 600,
                borderColor: '#EBDCC9',
                color: nexus.neutral[700],
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: 'rgba(51, 51, 51, 0.08)',
                  color: '#333',
                },
              }}
            >
              GitHub
            </PremiumButton>
          </Stack>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: nexus.neutral[500], mt: 1.25, fontWeight: 500 }}
          >
            Already have an account?{' '}
            <Typography
              component={Link}
              to="/login"
              variant="body2"
              sx={{
                textDecoration: 'none',
                fontWeight: 700,
                color: nexus.orange[700],
                '&:hover': { color: nexus.orange[700] },
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
