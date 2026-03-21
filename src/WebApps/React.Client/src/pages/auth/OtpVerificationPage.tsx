import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { appToast } from '@/lib/toast';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';
import { nexus } from '@/theme/theme';
import { PremiumButton, PremiumInput } from '@/components/ui/primitives';

interface OtpForm {
  otp: string;
}

export default function OtpVerificationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpForm>();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleSendOtp = async () => {
    setResendLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { userId: user?.id });
      setOtpSent(true);
      appToast.successAction('OTP sent to your email', 'auth-otp-resend-success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.errorAction('Failed to send OTP', error.response?.data?.message, 'auth-otp-resend-error');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpForm) => {
    setVerifyLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { otp: data.otp, userId: user?.id });
      appToast.successAction('Email verified! Welcome!', 'auth-otp-verify-success');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      appToast.errorAction('Invalid OTP', error.response?.data?.message, 'auth-otp-verify-error');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        otpSent
          ? 'Enter the 4-digit OTP sent to your email'
          : 'Click below to receive a verification code'
      }
    >
      <Stack spacing={2.5} alignItems="center" width="100%">
        {otpSent ? (
          <Stack
            width="100%"
            spacing={2.5}
            component="form"
            noValidate
            onSubmit={handleSubmit(handleVerifyOtp)}
            sx={{
              p: { xs: 0.5, sm: 1.5 },
              borderRadius: 2.5,
              border: '1px solid #F0DFCB',
              background:
                'linear-gradient(140deg, rgba(255,248,236,0.83), rgba(239,251,248,0.9) 65%, rgba(255,255,255,0.94))',
            }}
          >
            <motion.div variants={itemVariants}>
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ color: nexus.neutral[500] }}>
                  OTP sent to
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: nexus.neutral[700] }}>
                  {user?.email}
                </Typography>
              </Stack>
            </motion.div>

            <motion.div variants={itemVariants}>
              <PremiumInput
                density="compact"
                {...register('otp', {
                  required: 'OTP is required',
                  minLength: { value: 4, message: 'Please enter a 4-digit OTP' },
                })}
                fullWidth
                type="number"
                label="Verification Code"
                placeholder="Enter OTP"
                errorText={errors.otp?.message}
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
                type="submit"
                variant="contained"
                fullWidth
                loading={verifyLoading}
              >
                Verify
              </LoadingButton>
            </motion.div>

            <motion.div variants={itemVariants}>
              <PremiumButton
                variant="text"
                onClick={handleSendOtp}
                magnetic={false}
                disabled={resendLoading}
                sx={{
                  color: nexus.orange[700],
                  fontWeight: 700,
                  '&:hover': { backgroundColor: nexus.orange[50] },
                }}
              >
                Resend OTP
              </PremiumButton>
            </motion.div>
          </Stack>
        ) : (
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.99 }}
          >
            <LoadingButton
              variant="contained"
              loading={resendLoading}
              onClick={handleSendOtp}
              sx={{
                height: '3.1rem',
                px: 4,
                fontSize: '1rem',
                borderRadius: 999,
                fontWeight: 700,
                boxShadow: '0 16px 30px -14px rgba(154, 88, 82, 0.75)',
              }}
            >
              Send OTP
            </LoadingButton>
          </motion.div>
        )}
      </Stack>
    </AuthLayout>
  );
}
