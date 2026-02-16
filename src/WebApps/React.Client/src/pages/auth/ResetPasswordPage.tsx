import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FormHelperText,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { MotionConfig, motion } from 'framer-motion';
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
    reset,
    formState: { errors },
  } = useForm<ResetForm>();
  const { userId, passwordResetToken } = useParams<{
    userId: string;
    passwordResetToken: string;
  }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'pending' | 'fullfilled'>('idle');
  const theme = useTheme();
  const is500 = useMediaQuery(theme.breakpoints.down(500));

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
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center">
      <Stack>
        <Stack component={Paper} elevation={2}>
          <Stack
            component="form"
            width={is500 ? '95vw' : '30rem'}
            p="1rem"
            rowGap="1rem"
            noValidate
            onSubmit={handleSubmit(handleResetPassword)}
          >
            <Stack rowGap=".3rem">
              <Typography variant="h4" fontWeight={600}>
                Reset Password
              </Typography>
              <Typography color="GrayText">
                Please enter and confirm new password
              </Typography>
            </Stack>

            <Stack rowGap=".5rem">
              <MotionConfig whileHover={{ y: -2 }}>
                <motion.div>
                  <TextField
                    type="password"
                    fullWidth
                    sx={{ mt: 1 }}
                    {...register('password', {
                      required: 'Please enter a password',
                      pattern: {
                        value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                        message:
                          'at least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number, Can contain special characters',
                      },
                    })}
                    placeholder="New Password"
                  />
                  {errors.password && (
                    <FormHelperText sx={{ mt: 1 }} error>
                      {errors.password.message}
                    </FormHelperText>
                  )}
                </motion.div>

                <motion.div>
                  <TextField
                    type="password"
                    fullWidth
                    sx={{ mt: 1 }}
                    {...register('confirmPassword', {
                      required: 'Please Confirm the password',
                      validate: (value, formValues) =>
                        value === formValues.password || "Passwords dosen't match",
                    })}
                    placeholder="Confirm New Password"
                  />
                  {errors.confirmPassword && (
                    <FormHelperText sx={{ mt: 1 }} error>
                      {errors.confirmPassword.message}
                    </FormHelperText>
                  )}
                </motion.div>
              </MotionConfig>
            </Stack>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
              <LoadingButton
                sx={{ height: '2.5rem' }}
                fullWidth
                loading={status === 'pending'}
                type="submit"
                variant="contained"
              >
                Reset Password
              </LoadingButton>
            </motion.div>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
