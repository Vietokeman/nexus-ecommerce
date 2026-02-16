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
    <Stack height="calc(100vh - 4rem)" justifyContent="flex-start" alignItems="center">
      <Stack
        component={is480 ? 'div' : Paper}
        elevation={1}
        width={is900 ? '100%' : '50rem'}
        p={2}
        mt={is480 ? 0 : 5}
        rowGap={2}
      >
        {/* user details */}
        <Stack
          bgcolor={theme.palette.primary.light}
          color={theme.palette.primary.main}
          p={2}
          rowGap={1}
          borderRadius=".6rem"
          justifyContent="center"
          alignItems="center"
        >
          <Avatar src="none" alt={displayName} sx={{ width: 70, height: 70 }} />
          <Typography>{displayName}</Typography>
          <Typography>{email}</Typography>
        </Stack>

        {/* address section */}
        <Stack justifyContent="center" alignItems="center" rowGap={3}>
          {/* heading and add button */}
          <Stack flexDirection="row" alignItems="center" justifyContent="center" columnGap={1}>
            <Typography variant="h6" fontWeight={400}>
              Manage addresses
            </Typography>
            <Button
              onClick={() => setAddAddress(true)}
              size={is480 ? 'small' : undefined}
              variant="contained"
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
                <TextField type="number" {...register('postalCode', { required: true })} />
              </Stack>
              <Stack>
                <Typography gutterBottom>Country</Typography>
                <TextField {...register('country', { required: true })} />
              </Stack>
              <Stack>
                <Typography gutterBottom>Phone Number</Typography>
                <TextField type="number" {...register('phoneNumber', { required: true })} />
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
                >
                  add
                </LoadingButton>
                <Button
                  color="error"
                  onClick={() => setAddAddress(false)}
                  variant={is480 ? 'outlined' : 'text'}
                  size={is480 ? 'small' : undefined}
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
                <Stack key={address._id} component={Paper} elevation={1} p={2} rowGap={1}>
                  <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={500}>
                      {address.type}
                    </Typography>
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleDeleteAddress(address._id)}
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
              <Typography textAlign="center" mt={2} variant="body2">
                You have no added addresses
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
