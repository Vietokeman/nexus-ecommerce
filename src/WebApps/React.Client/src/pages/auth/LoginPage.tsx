import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Divider, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { appToast } from '@/lib/toast';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import type { LoginDto } from '@/types/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';
import { PremiumButton, PremiumInput, PremiumPasswordInput } from '@/components/ui/primitives';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type ExternalProvider = {
  name: string;
};

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
  const [providers, setProviders] = useState({ google: true, github: true });

  useEffect(() => {
    if (isAuthenticated && user?.isVerified) {
      navigate('/');
    } else if (isAuthenticated && user && !user.isVerified) {
      navigate('/verify-otp');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data } = await api.get(API_ENDPOINTS.AUTH.EXTERNAL_PROVIDERS);
        const list: ExternalProvider[] = Array.isArray(data) ? data : (data?.result ?? []);
        if (!Array.isArray(list) || list.length === 0) {
          return;
        }

        const providerNames = new Set(
          list.map((p) => p?.name?.toLowerCase()).filter((name): name is string => Boolean(name)),
        );

        setProviders({
          google: providerNames.has('google'),
          github: providerNames.has('github'),
        });
      } catch {
        // Keep default social providers when provider discovery fails.
      }
    };

    void fetchProviders();
  }, []);

  const handleLogin = async (data: LoginDto) => {
    setLoading(true);
    try {
      await login(data);
      appToast.successAction('Login successful', 'auth-login-success');
      reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.errorAction('Login failed', error.response?.data?.message, 'auth-login-error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue shopping">
      <Stack spacing={2.5} component="form" noValidate onSubmit={handleSubmit(handleLogin)}>
        <motion.div variants={itemVariants}>
          <Stack
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255, 255, 255, 0.75)', letterSpacing: '0.01em', fontWeight: 500 }}
            >
              Secure login with real-time order and checkout sync.
            </Typography>
          </Stack>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PremiumInput
            fullWidth
            density="compact"
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
          <PremiumPasswordInput
            fullWidth
            density="compact"
            label="Password"
            {...register('password', { required: 'Password is required' })}
            placeholder="Password"
            autoComplete="current-password"
            errorText={errors.password?.message}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Stack direction="row" justifyContent="flex-end" mb={0.5}>
            <Typography
              variant="body2"
              component={Link}
              to="/forgot-password"
              sx={{
                textDecoration: 'none',
                color: '#D4AF37',
                fontWeight: 700,
                letterSpacing: '0.01em',
                transition: 'color 200ms ease',
                '&:hover': { color: '#FEF08A' },
              }}
            >
              Forgot password?
            </Typography>
          </Stack>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.99 }}
        >
          <LoadingButton
            fullWidth
            sx={{
              height: '3.1rem',
              fontSize: '1rem',
              borderRadius: 999,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
              color: '#0C0A09',
              boxShadow: '0 16px 32px -12px rgba(212, 175, 55, 0.3)',
              transition: 'all 280ms cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFFDF0 0%, #FEF08A 50%, #D4AF37 100%)',
                boxShadow: '0 20px 40px -10px rgba(212, 175, 55, 0.45)',
              },
              '&.MuiLoadingButton-loading': {
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
            loading={loading}
            type="submit"
            variant="contained"
          >
            Sign In
          </LoadingButton>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Divider sx={{ my: 1, '&::before, &::after': { borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.4)', px: 1.5, fontWeight: 500 }}
            >
              or continue with
            </Typography>
          </Divider>
        </motion.div>

        {(providers.google || providers.github) && (
          <motion.div variants={itemVariants}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {providers.google && (
                <PremiumButton
                  fullWidth
                  variant="outlined"
                  magnetic={false}
                  startIcon={<GoogleIcon />}
                  onClick={() => {
                    window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.EXTERNAL_LOGIN}?provider=Google`;
                  }}
                  sx={{
                    height: '2.95rem',
                    textTransform: 'none',
                    borderRadius: 999,
                    fontWeight: 600,
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FAF9F6',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      borderColor: '#D4AF37',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#FAF9F6',
                    },
                  }}
                >
                  Google
                </PremiumButton>
              )}
              {providers.github && (
                <PremiumButton
                  fullWidth
                  variant="outlined"
                  magnetic={false}
                  startIcon={<GitHubIcon />}
                  onClick={() => {
                    window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.EXTERNAL_LOGIN}?provider=GitHub`;
                  }}
                  sx={{
                    height: '2.95rem',
                    textTransform: 'none',
                    borderRadius: 999,
                    fontWeight: 600,
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FAF9F6',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      borderColor: '#D4AF37',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#FAF9F6',
                    },
                  }}
                >
                  GitHub
                </PremiumButton>
              )}
            </Stack>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: 'rgba(255, 255, 255, 0.45)', mt: 1.25, fontWeight: 500 }}
          >
            Don&apos;t have an account?{' '}
            <Typography
              component={Link}
              to="/signup"
              variant="body2"
              sx={{
                textDecoration: 'none',
                fontWeight: 700,
                color: '#D4AF37',
                transition: 'color 200ms ease',
                '&:hover': { color: '#FEF08A' },
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
