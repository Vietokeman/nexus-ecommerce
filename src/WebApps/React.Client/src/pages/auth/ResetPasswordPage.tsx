import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>();
  const { userId, passwordResetToken } = useParams<{
    userId: string;
    passwordResetToken: string;
  }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const is500 = useMediaQuery(theme.breakpoints.down(500));

  const password = watch('password');

  const onSubmit = async (data: ResetForm) => {
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        password: data.password,
        userId,
        token: passwordResetToken,
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center">
      <Stack component={Paper} elevation={2}>
        <Stack
          component="form"
          width={is500 ? '95vw' : '30rem'}
          p="1rem"
          rowGap="1rem"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <Stack rowGap=".3rem">
            <Typography variant="h4" fontWeight={600}>
              Reset Password
            </Typography>
            <Typography color="GrayText">Please enter and confirm new password</Typography>
          </Stack>

            <motion.div whileHover={{ y: -2 }}>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Minimum 6 characters',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (v) => v === password || 'Passwords do not match',
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </motion.div>

          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={loading}
            sx={{
              bgcolor: '#DB4444',
              '&:hover': { bgcolor: '#b33636' },
            }}
          >
            Reset Password
          </LoadingButton>
        </Stack>
      </Stack>
    </Stack>
  );
}
