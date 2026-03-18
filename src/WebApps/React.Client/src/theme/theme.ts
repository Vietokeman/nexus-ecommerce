import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/* Premium React foundation tokens (phase 1) */

export const nexus = {
  /* Keep object shape stable because many screens consume these keys directly */
  gradient: {
    primary: 'linear-gradient(140deg, #8A4B45 0%, #B56C63 45%, #D5ABA3 100%)',
    subtle: 'linear-gradient(135deg, #F6EFEB 0%, #F2E8E2 55%, #EADCD4 100%)',
    button: 'linear-gradient(135deg, #9A5852 0%, #B56C63 62%, #CB948B 100%)',
    dark: 'linear-gradient(140deg, #1F1916 0%, #2B211D 55%, #4F433E 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 253, 250, 0.78) 0%, rgba(247, 241, 236, 0.62) 100%)',
  },

  purple: {
    50: '#F9F2F1',
    100: '#F3E7E4',
    200: '#E9D2CE',
    300: '#D5ABA3',
    400: '#C3877F',
    500: '#B56C63',
    600: '#9F554F',
    700: '#8A4B45',
    800: '#6E3A35',
    900: '#522A26',
  },
  orange: {
    50: '#FCF5F2',
    100: '#F7E8E2',
    200: '#EFD3CA',
    300: '#DDA89A',
    400: '#C07F74',
    500: '#B56C63',
    600: '#94534C',
    700: '#73403B',
  },
  neutral: {
    50: '#F7F3EE',
    100: '#F2EDE7',
    200: '#DED5CC',
    300: '#C6BBB0',
    400: '#9D8E84',
    500: '#76665F',
    600: '#5D4D47',
    700: '#4F433E',
    800: '#3A302C',
    900: '#2B211D',
  },

  glass: {
    background: 'rgba(255, 253, 250, 0.74)',
    backgroundDark: 'rgba(31, 25, 22, 0.8)',
    border: 'rgba(255, 255, 255, 0.5)',
    borderDark: 'rgba(110, 58, 53, 0.3)',
    blur: 'blur(20px)',
    blurHeavy: 'blur(28px)',
    shadow: '0 20px 56px -28px rgba(58, 40, 35, 0.28)',
    shadowHover: '0 28px 64px -30px rgba(58, 40, 35, 0.34)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 72,
    '4xl': 96,
  },

  radius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '30px',
    pill: '9999px',
  },

  transition: {
    fast: '160ms cubic-bezier(0.22, 1, 0.36, 1)',
    base: '280ms cubic-bezier(0.22, 1, 0.36, 1)',
    slow: '480ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

let theme = createTheme({
  palette: {
    primary: {
      main: nexus.purple[700],
      light: nexus.purple[400],
      dark: nexus.purple[900],
    },
    secondary: {
      main: nexus.orange[500],
      light: nexus.orange[300],
      dark: nexus.orange[700],
    },
    background: {
      default: nexus.neutral[50],
      paper: '#FFFDFA',
    },
    text: {
      primary: nexus.neutral[900],
      secondary: nexus.neutral[500],
    },
    error: { main: '#B04646' },
    success: { main: '#4E7A62' },
    warning: { main: '#9A5852' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", sans-serif',
    h1: {
      fontFamily: '"Fraunces", "Times New Roman", serif',
      fontWeight: 600,
      fontSize: '3.75rem',
      letterSpacing: '-0.026em',
      lineHeight: 1.06,
      textWrap: 'balance',
      '@media (max-width:1200px)': { fontSize: '3.25rem' },
      '@media (max-width:900px)': { fontSize: '2.65rem' },
      '@media (max-width:600px)': { fontSize: '2.2rem' },
    },
    h2: {
      fontFamily: '"Fraunces", "Times New Roman", serif',
      fontWeight: 600,
      fontSize: '2.9rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.12,
      textWrap: 'balance',
      '@media (max-width:900px)': { fontSize: '2.3rem' },
      '@media (max-width:600px)': { fontSize: '1.9rem' },
    },
    h3: {
      fontWeight: 650,
      fontSize: '2rem',
      letterSpacing: '-0.018em',
      lineHeight: 1.22,
      textWrap: 'balance',
      '@media (max-width:900px)': { fontSize: '1.72rem' },
      '@media (max-width:600px)': { fontSize: '1.45rem' },
    },
    h4: {
      fontWeight: 650,
      fontSize: '1.5rem',
      letterSpacing: '-0.012em',
      lineHeight: 1.28,
      textWrap: 'balance',
      '@media (max-width:900px)': { fontSize: '1.28rem' },
      '@media (max-width:600px)': { fontSize: '1.1rem' },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.08rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '-0.004em',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.002em',
      lineHeight: 1.45,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 450,
      lineHeight: 1.75,
      letterSpacing: '0.004em',
    },
    body2: {
      fontSize: '0.92rem',
      fontWeight: 450,
      lineHeight: 1.7,
      letterSpacing: '0.004em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.004em',
    },
    caption: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 14,
  },
  spacing: 4,
  shadows: [
    'none',
    '0 1px 2px rgba(56, 43, 38, 0.08)',
    '0 2px 6px rgba(56, 43, 38, 0.1)',
    '0 4px 10px rgba(56, 43, 38, 0.12)',
    '0 8px 16px -8px rgba(56, 43, 38, 0.14)',
    '0 12px 24px -12px rgba(56, 43, 38, 0.16)',
    '0 16px 30px -14px rgba(56, 43, 38, 0.18)',
    '0 20px 36px -16px rgba(56, 43, 38, 0.19)',
    '0 24px 42px -18px rgba(56, 43, 38, 0.2)',
    '0 28px 48px -20px rgba(56, 43, 38, 0.21)',
    '0 32px 56px -22px rgba(56, 43, 38, 0.22)',
    '0 36px 64px -24px rgba(56, 43, 38, 0.23)',
    '0 40px 72px -26px rgba(56, 43, 38, 0.24)',
    '0 44px 80px -28px rgba(56, 43, 38, 0.25)',
    '0 48px 88px -30px rgba(56, 43, 38, 0.26)',
    '0 52px 96px -32px rgba(56, 43, 38, 0.27)',
    '0 56px 104px -34px rgba(56, 43, 38, 0.28)',
    '0 60px 112px -36px rgba(56, 43, 38, 0.29)',
    '0 64px 120px -38px rgba(56, 43, 38, 0.3)',
    '0 68px 128px -40px rgba(56, 43, 38, 0.31)',
    '0 72px 136px -42px rgba(56, 43, 38, 0.32)',
    '0 76px 144px -44px rgba(56, 43, 38, 0.33)',
    '0 80px 152px -46px rgba(56, 43, 38, 0.34)',
    '0 84px 160px -48px rgba(56, 43, 38, 0.35)',
    '0 88px 168px -50px rgba(56, 43, 38, 0.36)',
  ],
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
      easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeIn: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      sharp: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    duration: {
      shortest: 120,
      shorter: 160,
      short: 220,
      standard: 280,
      complex: 480,
      enteringScreen: 320,
      leavingScreen: 220,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: nexus.neutral[50],
          color: nexus.neutral[900],
          fontVariantNumeric: 'tabular-nums',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: nexus.radius.pill,
          fontWeight: 600,
          padding: '10px 22px',
          transition: nexus.transition.base,
          boxShadow: 'none',
          '&:active': {
            transform: 'translateY(1px) scale(0.99)',
          },
        },
        contained: {
          background: nexus.gradient.button,
          color: '#fff',
          boxShadow: '0 14px 28px -18px rgba(138, 75, 69, 0.5)',
          '&:hover': {
            background: nexus.gradient.button,
            transform: 'translateY(-1px)',
            boxShadow: '0 20px 36px -20px rgba(138, 75, 69, 0.56)',
            filter: 'saturate(1.05)',
          },
        },
        outlined: {
          borderColor: nexus.neutral[300],
          color: nexus.purple[700],
          backgroundColor: 'rgba(255, 253, 250, 0.9)',
          '&:hover': {
            borderColor: nexus.purple[400],
            backgroundColor: nexus.purple[50],
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: nexus.radius.md,
            transition: nexus.transition.base,
            backgroundColor: '#FFFCF8',
            '& fieldset': {
              borderColor: nexus.neutral[200],
              transition: nexus.transition.base,
            },
            '&:hover fieldset': {
              borderColor: nexus.purple[300],
            },
            '&.Mui-focused fieldset': {
              borderColor: nexus.purple[500],
              borderWidth: '2px',
              boxShadow: `0 0 0 3px ${nexus.purple[100]}`,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: nexus.glass.background,
          backdropFilter: nexus.glass.blur,
          borderBottom: `1px solid ${nexus.neutral[200]}`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.52)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: nexus.radius.lg,
          border: `1px solid ${nexus.neutral[200]}`,
          boxShadow: '0 18px 45px -24px rgba(58, 40, 35, 0.26)',
          transition: nexus.transition.base,
          '&:hover': {
            boxShadow: nexus.glass.shadow,
            borderColor: nexus.purple[300],
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          fontWeight: 500,
        },
        colorPrimary: {
          background: nexus.gradient.button,
          color: '#fff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: nexus.radius.lg,
          backgroundImage: 'none',
          border: `1px solid ${nexus.neutral[200]}`,
          boxShadow: '0 18px 45px -24px rgba(58, 40, 35, 0.2)',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);
export default theme;
