import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormHelperText, Stack, TextField, Typography, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';
import AuthLayout from '@/components/auth/AuthLayout';
import { itemVariants } from '@/lib/motion';
import { nexus } from '@/theme/theme';

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
      await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { user: user?.id });
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpForm) => {
    setVerifyLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { otp: data.otp, userId: user?.id });
      toast.success('Email verified! Welcome!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Invalid OTP');
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
      <Stack spacing={2.5} alignItems="center">
        {otpSent ? (
          <Stack
            width="100%"
            spacing={2.5}
            component="form"
            noValidate
            onSubmit={handleSubmit(handleVerifyOtp)}
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
              <TextField
                {...register('otp', {
                  required: 'OTP is required',
                  minLength: { value: 4, message: 'Please enter a 4-digit OTP' },
                })}
                fullWidth
                type="number"
                placeholder="Enter OTP"
              />
              {errors.otp && (
                <FormHelperText sx={{ mt: 0.5 }} error>
                  {errors.otp.message}
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
                type="submit"
                variant="contained"
                fullWidth
                loading={verifyLoading}
              >
                Verify
              </LoadingButton>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                variant="text"
                onClick={handleSendOtp}
                disabled={resendLoading}
                sx={{
                  color: nexus.purple[600],
                  fontWeight: 600,
                  '&:hover': { backgroundColor: nexus.purple[50] },
                }}
              >
                Resend OTP
              </Button>
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
              sx={{ height: '3rem', px: 4, fontSize: '1rem' }}
            >
              Send OTP
            </LoadingButton>
          </motion.div>
        )}
      </Stack>
    </AuthLayout>
  );
}
