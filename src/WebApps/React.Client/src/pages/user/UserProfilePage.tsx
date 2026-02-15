import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Avatar, Divider, Grid, TextField, Button } from '@mui/material';
import { Email, Phone, Home } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const user = {
    firstName: localStorage.getItem('firstName') || 'Guest',
    lastName: localStorage.getItem('lastName') || 'User',
    email: localStorage.getItem('userName') || 'guest@example.com',
    phone: localStorage.getItem('phone') || '',
    address: localStorage.getItem('address') || '',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} elevation={2}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: 40,
              }}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">{user.phone || 'Not provided'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Home fontSize="small" color="action" />
                <Typography variant="body2">{user.address || 'Not provided'}</Typography>
              </Box>
            </Box>
          </Paper>

          <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/orders')}>
            View Orders
          </Button>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 2 }} elevation={2}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Edit Profile
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="First Name" fullWidth defaultValue={user.firstName} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Name" fullWidth defaultValue={user.lastName} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email" fullWidth defaultValue={user.email} disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Phone" fullWidth defaultValue={user.phone} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={3}
                  defaultValue={user.address}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" size="large">
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
}
