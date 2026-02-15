import { Box, CircularProgress } from '@mui/material';

export default function Spinner() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={48} sx={{ color: '#DB4444' }} />
    </Box>
  );
}
