import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';
import { PremiumInput } from '@/components/ui/primitives';

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
      <Stack
        spacing={2.5}
        component="form"
        noValidate
        onSubmit={handleSubmit(handleResetPassword)}
        sx={{
          p: { xs: 0.5, sm: 1.5 },
          borderRadius: 2.5,
          border: '1px solid #F0DFCB',
          background:
            'linear-gradient(140deg, rgba(255,248,236,0.83), rgba(239,251,248,0.9) 65%, rgba(255,255,255,0.94))',
        }}
      >
        <motion.div variants={itemVariants}>
          <PremiumInput
            type="password"
            fullWidth
            label="New Password"
            {...register('password', {
              required: 'Please enter a password',
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                message: 'Min 8 characters with at least 1 uppercase, 1 lowercase, and 1 number',
              },
            })}
            placeholder="New password"
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
              required: 'Please confirm the password',
              validate: (value, formValues) =>
                value === formValues.password || "Passwords don't match",
            })}
            placeholder="Confirm new password"
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
