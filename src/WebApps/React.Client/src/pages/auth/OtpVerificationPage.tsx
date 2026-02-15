import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Stack, TextField, Typography, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
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

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.isVerified) {
      navigate('/');
    }
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
      await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        otp: data.otp,
        userId: user?.id,
      });
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
      <Stack
        component={Paper}
        elevation={1}
        justifyContent="center"
        alignItems="center"
        p="2rem"
        rowGap="2rem"
      >
        <Typography mt={4} variant="h5" fontWeight={500}>
          Verify Your Email Address
        </Typography>

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
                <Typography color="GrayText">Enter the 4 digit OTP sent to</Typography>
                <Typography fontWeight={600} color="GrayText">
                  {user?.email}
                </Typography>
              </Stack>
              <TextField
                {...register('otp', {
                  required: 'OTP is required',
                  minLength: { value: 4, message: 'Please enter a 4 digit OTP' },
                })}
                fullWidth
                type="number"
                error={!!errors.otp}
                helperText={errors.otp?.message}
              />
            </Stack>
            <LoadingButton
              type="submit"
              variant="contained"
              fullWidth
              loading={verifyLoading}
              sx={{
                bgcolor: '#DB4444',
                '&:hover': { bgcolor: '#b33636' },
              }}
            >
              Verify
            </LoadingButton>
          </Stack>
        ) : (
          <Stack rowGap="1rem" alignItems="center">
            <Typography color="GrayText" textAlign="center">
              Click below to receive a verification code on your email
            </Typography>
            <LoadingButton
              variant="contained"
              loading={resendLoading}
              onClick={handleSendOtp}
              sx={{
                bgcolor: '#DB4444',
                '&:hover': { bgcolor: '#b33636' },
              }}
            >
              Send OTP
            </LoadingButton>
          </Stack>
        )}

        {otpSent && (
          <Button
            variant="text"
            onClick={handleSendOtp}
            disabled={resendLoading}
            sx={{ color: '#DB4444' }}
          >
            Resend OTP
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
