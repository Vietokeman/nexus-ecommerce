import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FormHelperText,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth-store';

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
  const theme = useTheme();
  const is500 = useMediaQuery(theme.breakpoints.down(500));

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
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center">
      <Stack rowGap="1rem">
        <Stack component={Paper} elevation={2}>
          <Stack
            width={is500 ? '95vw' : '30rem'}
            p={is500 ? '1rem' : '1.5rem'}
            rowGap="1rem"
            justifyContent="center"
            alignItems="center"
          >
            <Stack rowGap=".4rem" alignItems="center">
              <Typography variant="h5" fontWeight={600}>
                Verify Your Email
              </Typography>
              <Typography color="text.secondary" variant="body2" textAlign="center">
                {otpSent
                  ? 'Enter the 4 digit OTP sent to your email'
                  : 'Click below to receive a verification code on your email'}
              </Typography>
            </Stack>

            {otpSent ? (
              <Stack
                width="100%"
                rowGap="1rem"
                component="form"
                noValidate
                onSubmit={handleSubmit(handleVerifyOtp)}
              >
                <Stack rowGap="1rem">
                  <Stack>
                    <Typography color="GrayText">OTP sent to</Typography>
                    <Typography fontWeight={600} color="GrayText">
                      {user?.email}
                    </Typography>
                  </Stack>
                  <motion.div whileHover={{ y: -2 }}>
                    <TextField
                      {...register('otp', {
                        required: 'OTP is required',
                        minLength: { value: 4, message: 'Please enter a 4 digit OTP' },
                      })}
                      fullWidth
                      type="number"
                      placeholder="Enter OTP"
                    />
                    {errors.otp && (
                      <FormHelperText sx={{ fontSize: '.9rem', mt: 1 }} error>
                        {errors.otp.message}
                      </FormHelperText>
                    )}
                  </motion.div>
                </Stack>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                  <LoadingButton
                    sx={{ height: '2.5rem' }}
                    type="submit"
                    variant="contained"
                    fullWidth
                    loading={verifyLoading}
                  >
                    Verify
                  </LoadingButton>
                </motion.div>
              </Stack>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <LoadingButton
                  variant="contained"
                  loading={resendLoading}
                  onClick={handleSendOtp}
                >
                  Send OTP
                </LoadingButton>
              </motion.div>
            )}

            {otpSent && (
              <Button
                variant="text"
                onClick={handleSendOtp}
                disabled={resendLoading}
                sx={{ color: theme.palette.primary.dark }}
              >
                Resend OTP
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
