import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';

interface AddressForm {
  type: string;
  street: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  state: string;
  city: string;
}

interface Address extends AddressForm {
  _id: string;
}

export default function UserProfilePage() {
  const { register, handleSubmit, reset } = useForm<AddressForm>();
  const user = useAuthStore((s) => s.user);
  const theme = useTheme();
  const [addAddress, setAddAddress] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.userName || 'Guest';
  const email = user?.email || user?.userName || 'guest@example.com';

  const handleAddAddress = (data: AddressForm) => {
    setLoading(true);
    const newAddress: Address = { ...data, _id: `addr-${Date.now()}` };
    setAddresses((prev) => [...prev, newAddress]);
    toast.success('Address added');
    setAddAddress(false);
    reset();
    setLoading(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a._id !== id));
    toast.success('Address deleted');
  };

  return (
    <Stack
      minHeight="calc(100vh - 4rem)"
      justifyContent="flex-start"
      alignItems="center"
      sx={{
        py: { xs: 1.5, md: 4 },
      }}
    >
      <Stack
        component={is480 ? 'div' : Paper}
        elevation={0}
        width={is900 ? '100%' : '56rem'}
        p={{ xs: 2, md: 4 }}
        mt={is480 ? 0 : 1}
        rowGap={2.5}
        className="nx-liquid-glass"
        sx={{
          borderRadius: is480 ? 0 : '24px',
          border: is480 ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: is480 ? 'none' : '0 32px 64px -24px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* user details */}
        <Stack
          className="nx-liquid-glass"
          color="text.primary"
          p={{ xs: 2.5, md: 3 }}
          rowGap={1}
          borderRadius="20px"
          border="1px solid rgba(212, 175, 55, 0.2)"
          justifyContent="center"
          alignItems="center"
          sx={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Avatar
            src="none"
            alt={displayName}
            sx={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #feefc3 0%, #D4AF37 50%, #CA8A04 100%)',
              color: '#1C1917',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
            {displayName}
          </Typography>
          <Typography color="text.secondary">{email}</Typography>
        </Stack>

        {/* address section */}
        <Stack justifyContent="center" alignItems="stretch" rowGap={3}>
          {/* heading and add button */}
          <Stack
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            columnGap={1}
          >
             <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #1C1917 0%, #0D0C0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.01em' }}>
              Manage addresses
            </Typography>
            <Button
              onClick={() => setAddAddress(true)}
              size={is480 ? 'small' : undefined}
              variant="contained"
              sx={{
                borderRadius: 999,
                px: 3,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
                color: '#FAF9F6',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                  color: '#0C0A09',
                }
              }}
            >
              Add
            </Button>
          </Stack>

          {/* add address form */}
          {addAddress && (
            <Stack
              width="100%"
              component="form"
              noValidate
              onSubmit={handleSubmit(handleAddAddress)}
              rowGap={2}
              className="nx-liquid-glass"
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Stack>
                <Typography gutterBottom>Type</Typography>
                <TextField
                  placeholder="Eg. Home, Business"
                  {...register('type', { required: true })}
                />
              </Stack>
              <Stack>
                <Typography gutterBottom>Street</Typography>
                <TextField {...register('street', { required: true })} />
              </Stack>
              <Stack>
                <Typography gutterBottom>Postal Code</Typography>
                <TextField type="text" {...register('postalCode', { required: true })} />
              </Stack>
              <Stack>
                <Typography gutterBottom>Country</Typography>
                <TextField {...register('country', { required: true })} />
              </Stack>
              <Stack>
                <Typography gutterBottom>Phone Number</Typography>
                <TextField type="text" {...register('phoneNumber', { required: true })} />
              </Stack>
              <Stack>
                <Typography gutterBottom>State</Typography>
                <TextField {...register('state', { required: true })} />
              </Stack>
              <Stack>
                <Typography gutterBottom>City</Typography>
                <TextField {...register('city', { required: true })} />
              </Stack>
              <Stack flexDirection="row" alignSelf="flex-end" columnGap={is480 ? 1 : 2}>
                <LoadingButton
                  loading={loading}
                  type="submit"
                  size={is480 ? 'small' : undefined}
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 700,
                    px: 3,
                    background: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
                    color: '#FAF9F6',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
                      color: '#0C0A09',
                    }
                  }}
                >
                  Add
                </LoadingButton>
                <Button
                  color="error"
                  onClick={() => setAddAddress(false)}
                  variant="outlined"
                  size={is480 ? 'small' : undefined}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      background: 'rgba(239, 68, 68, 0.05)',
                    }
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          )}

          {/* mapping on addresses */}
          <Stack width="100%" rowGap={2}>
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <Stack
                  key={address._id}
                  component={Paper}
                  elevation={0}
                  p={{ xs: 2, md: 2.5 }}
                  rowGap={1}
                  className="nx-liquid-glass"
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                      {address.type}
                    </Typography>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleDeleteAddress(address._id)}
                      sx={{
                        borderRadius: 999,
                        px: 2,
                        fontWeight: 700,
                        borderColor: '#ef4444',
                        '&:hover': {
                          background: 'rgba(239, 68, 68, 0.05)',
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                  <Typography>{address.street}</Typography>
                  <Typography>
                    {address.city}, {address.state}, {address.country} - {address.postalCode}
                  </Typography>
                  <Typography>{address.phoneNumber}</Typography>
                </Stack>
              ))
            ) : (
              <Typography textAlign="center" mt={2} variant="body2" color="text.secondary">
                You have no added addresses
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
