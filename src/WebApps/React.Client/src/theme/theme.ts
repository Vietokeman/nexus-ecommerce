import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      light: '#ffffff',
      dark: '#DB4444',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '6rem',
      '@media (max-width:960px)': { fontSize: '5rem' },
      '@media (max-width:600px)': { fontSize: '4rem' },
      '@media (max-width:414px)': { fontSize: '2.5rem' },
    },
    h2: {
      fontWeight: 700,
      fontSize: '3.75rem',
      '@media (max-width:960px)': { fontSize: '3rem' },
      '@media (max-width:662px)': { fontSize: '2.3rem' },
      '@media (max-width:414px)': { fontSize: '2.2rem' },
    },
    h3: {
      fontWeight: 600,
      fontSize: '3rem',
      '@media (max-width:960px)': { fontSize: '2.4rem' },
      '@media (max-width:662px)': { fontSize: '2rem' },
      '@media (max-width:414px)': { fontSize: '1.7rem' },
    },
    h4: {
      fontWeight: 600,
      fontSize: '2.125rem',
      '@media (max-width:960px)': { fontSize: '1.5rem' },
      '@media (max-width:600px)': { fontSize: '1.25rem' },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
      '@media (max-width:960px)': { fontSize: '1.25rem' },
      '@media (max-width:600px)': { fontSize: '1.1rem' },
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      '@media (max-width:960px)': { fontSize: '1.1rem' },
      '@media (max-width:600px)': { fontSize: '1rem' },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          backgroundColor: '#000000',
          '&:hover': { backgroundColor: '#333333' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);
export default theme;
