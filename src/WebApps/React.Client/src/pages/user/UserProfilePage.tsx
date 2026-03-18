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
        p={{ xs: 2, md: 3 }}
        mt={is480 ? 0 : 1}
        rowGap={2.5}
        sx={{
          borderRadius: is480 ? 0 : 4,
          border: is480 ? 'none' : '1px solid #EDE2D2',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFCF7 100%)',
          boxShadow: is480 ? 'none' : '0 20px 40px rgba(130, 95, 53, 0.08)',
        }}
      >
        {/* user details */}
        <Stack
          bgcolor="#FFF8EE"
          color="text.primary"
          p={{ xs: 2.25, md: 2.5 }}
          rowGap={1}
          borderRadius={3}
          border="1px solid #EFD9B7"
          justifyContent="center"
          alignItems="center"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              right: -60,
              top: -80,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(15,118,110,0.18), rgba(15,118,110,0))',
            },
          }}
        >
          <Avatar
            src="none"
            alt={displayName}
            sx={{
              width: 78,
              height: 78,
              bgcolor: theme.palette.primary.main,
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.4rem',
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
            <Typography variant="h6" fontWeight={700}>
              Manage addresses
            </Typography>
            <Button
              onClick={() => setAddAddress(true)}
              size={is480 ? 'small' : undefined}
              variant="contained"
              sx={{
                borderRadius: 999,
                px: 2.25,
                fontWeight: 700,
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
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3,
                border: '1px solid #ECDCC8',
                background: 'linear-gradient(180deg, #FFFFFF, #FFF9F0)',
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
                  sx={{ borderRadius: 999, fontWeight: 700, px: 2.5 }}
                >
                  add
                </LoadingButton>
                <Button
                  color="error"
                  onClick={() => setAddAddress(false)}
                  variant={is480 ? 'outlined' : 'text'}
                  size={is480 ? 'small' : undefined}
                  sx={{ borderRadius: 999, px: 2 }}
                >
                  cancel
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
                  p={{ xs: 2, md: 2.25 }}
                  rowGap={1}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #E9DECF',
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF8 100%)',
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
                      sx={{ borderRadius: 999 }}
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
