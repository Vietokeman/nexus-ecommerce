import { Box, CircularProgress } from '@mui/material';
import { nexus } from '@/theme/theme';

export default function Spinner() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={48} sx={{ color: nexus.purple[500] }} />
    </Box>
  );
}
