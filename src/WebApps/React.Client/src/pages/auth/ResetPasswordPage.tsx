import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormHelperText, Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetForm>();
  const { userId, passwordResetToken } = useParams<{
    userId: string;
    passwordResetToken: string;
  }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'pending' | 'fullfilled'>('idle');

  const handleResetPassword = async (data: ResetForm) => {
    setStatus('pending');
    try {
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        password: data.password,
        userId,
        token: passwordResetToken,
      });
      setStatus('fullfilled');
      toast.success('Password has been reset successfully');
      navigate('/login');
    } catch (err: unknown) {
      setStatus('idle');
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Error resetting password');
    }
    reset();
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter and confirm your new password">
      <Stack spacing={2.5} component="form" noValidate onSubmit={handleSubmit(handleResetPassword)}>
        <motion.div variants={itemVariants}>
          <TextField
            type="password"
            fullWidth
            {...register('password', {
              required: 'Please enter a password',
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                message: 'Min 8 characters with at least 1 uppercase, 1 lowercase, and 1 number',
              },
            })}
            placeholder="New password"
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
              required: 'Please confirm the password',
              validate: (value, formValues) =>
                value === formValues.password || "Passwords don't match",
            })}
            placeholder="Confirm new password"
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
            loading={status === 'pending'}
            type="submit"
            variant="contained"
          >
            Reset Password
          </LoadingButton>
        </motion.div>
      </Stack>
    </AuthLayout>
  );
}
