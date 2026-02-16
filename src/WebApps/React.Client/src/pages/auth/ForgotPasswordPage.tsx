import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/endpoints';

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotForm>();
  const [status, setStatus] = useState<'idle' | 'pending' | 'fullfilled' | 'rejected'>('idle');
  const theme = useTheme();
  const is500 = useMediaQuery(theme.breakpoints.down(500));

  const handleForgotPassword = async (data: ForgotForm) => {
    setStatus('pending');
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
      setStatus('fullfilled');
      toast.success('Password reset link sent to your email');
      reset();
    } catch (err: unknown) {
      setStatus('rejected');
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center">
      <Stack rowGap="1rem">
        <Stack component={Paper} elevation={2}>
          <Stack
            component="form"
            width={is500 ? '95vw' : '30rem'}
            p={is500 ? '1rem' : '1.5rem'}
            rowGap="1rem"
            noValidate
            onSubmit={handleSubmit(handleForgotPassword)}
          >
            <Stack rowGap=".4rem">
              <Typography variant="h5" fontWeight={600}>
                {status === 'fullfilled'
                  ? 'Email has been sent!'
                  : 'Forgot Your Password?'}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {status === 'fullfilled'
                  ? 'Please check your inbox and click on the received link to reset your password'
                  : 'Enter your registered email below to receive password reset link'}
              </Typography>
            </Stack>

            {status !== 'fullfilled' && (
              <>
                <motion.div whileHover={{ y: -2 }}>
                  <TextField
                    fullWidth
                    sx={{ mt: 1 }}
                    {...register('email', {
                      required: 'Please enter a email',
                      pattern: {
                        value:
                          /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                        message: 'Enter a valid email',
                      },
                    })}
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <FormHelperText sx={{ fontSize: '.9rem', mt: 1 }} error>
                      {errors.email.message}
                    </FormHelperText>
                  )}
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                  <LoadingButton
                    sx={{ height: '2.5rem' }}
                    fullWidth
                    loading={status === 'pending'}
                    type="submit"
                    variant="contained"
                  >
                    Send Password Reset Link
                  </LoadingButton>
                </motion.div>
              </>
            )}
          </Stack>
        </Stack>

        {/* back to login navigation */}
        <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 1.05 }}>
          <Typography
            sx={{ textDecoration: 'none', color: 'text.primary', width: 'fit-content' }}
            mt={2}
            to="/login"
            variant="body2"
            component={Link}
          >
            Go back to{' '}
            <span style={{ color: theme.palette.primary.dark }}>login</span>
          </Typography>
        </motion.div>
      </Stack>
    </Stack>
  );
}
