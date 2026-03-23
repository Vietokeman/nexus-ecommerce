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
import { nexus } from '@/theme/theme';
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
              borderRadius: 2,
              border: '1px solid #F0DEC4',
              background:
                'linear-gradient(140deg, rgba(255,247,234,0.82), rgba(241,252,248,0.88) 65%, rgba(255,255,255,0.94))',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: nexus.neutral[600], letterSpacing: '0.01em' }}
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
                color: nexus.orange[700],
                fontWeight: 700,
                letterSpacing: '0.01em',
                '&:hover': { color: nexus.orange[700] },
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
              boxShadow: '0 16px 30px -14px rgba(154, 88, 82, 0.75)',
            }}
            loading={loading}
            type="submit"
            variant="contained"
          >
            Sign In
          </LoadingButton>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Divider sx={{ my: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: nexus.neutral[500], px: 1.5, fontWeight: 500 }}
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
              )}
            </Stack>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Typography
            variant="body2"
            textAlign="center"
            sx={{ color: nexus.neutral[500], mt: 1.25, fontWeight: 500 }}
          >
            Don&apos;t have an account?{' '}
            <Typography
              component={Link}
              to="/signup"
              variant="body2"
              sx={{
                textDecoration: 'none',
                fontWeight: 700,
                color: nexus.orange[700],
                '&:hover': { color: nexus.orange[700] },
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
