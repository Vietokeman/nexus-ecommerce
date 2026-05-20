import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/* Premium React foundation tokens (phase 1) */

export const nexus = {
  /* Keep object shape stable because many screens consume these keys directly */
  gradient: {
    primary: 'linear-gradient(135deg, #1C1917 0%, #0A0A0A 100%)',
    subtle: 'linear-gradient(135deg, #FAF8F5 0%, #F5F2EC 55%, #EAE5DC 100%)',
    button: 'linear-gradient(135deg, #FEF08A 0%, #D4AF37 50%, #CA8A04 100%)',
    dark: 'linear-gradient(135deg, #1C1917 0%, #0C0A09 60%, #020202 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
  },

  purple: {
    50: '#F5F5F4',
    100: '#E7E5E4',
    200: '#D6D3D1',
    300: '#A8A29E',
    400: '#78716C',
    500: '#57534E',
    600: '#44403C',
    700: '#292524',
    800: '#1C1917',
    900: '#0C0A09',
  },
  orange: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#854D0E',
  },
  neutral: {
    50: '#FAF9F6',
    100: '#F5F4F0',
    200: '#E6E4DD',
    300: '#D5D2C8',
    400: '#A39F93',
    500: '#7A7568',
    600: '#5C584E',
    700: '#4C483F',
    800: '#33302B',
    900: '#1A1816',
  },

  glass: {
    background: 'rgba(255, 255, 255, 0.07)',
    backgroundDark: 'rgba(10, 10, 10, 0.60)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderDark: 'rgba(212, 175, 55, 0.15)',
    blur: 'blur(25px)',
    blurHeavy: 'blur(35px)',
    shadow: '0 24px 64px -16px rgba(0, 0, 0, 0.15)',
    shadowHover: '0 32px 72px -14px rgba(212, 175, 55, 0.12)',
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
      main: nexus.neutral[900],
      light: nexus.neutral[600],
      dark: '#0A0A0A',
    },
    secondary: {
      main: '#D4AF37',
      light: '#FEF08A',
      dark: '#CA8A04',
    },
    background: {
      default: nexus.neutral[50],
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0C0A09',
      secondary: '#5C584E',
    },
    error: { main: '#991B1B' },
    success: { main: '#166534' },
    warning: { main: '#854D0E' },
  },
  typography: {
    fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
    h1: {
      fontFamily: '"Cormorant", "Fraunces", serif',
      fontWeight: 600,
      fontSize: '4rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.05,
      textWrap: 'balance',
      '@media (max-width:1200px)': { fontSize: '3.5rem' },
      '@media (max-width:900px)': { fontSize: '2.8rem' },
      '@media (max-width:600px)': { fontSize: '2.2rem' },
    },
    h2: {
      fontFamily: '"Cormorant", "Fraunces", serif',
      fontWeight: 600,
      fontSize: '2.8rem',
      letterSpacing: '-0.015em',
      lineHeight: 1.1,
      textWrap: 'balance',
      '@media (max-width:900px)': { fontSize: '2.2rem' },
      '@media (max-width:600px)': { fontSize: '1.8rem' },
    },
    h3: {
      fontFamily: '"Cormorant", "Fraunces", serif',
      fontWeight: 600,
      fontSize: '2.1rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      textWrap: 'balance',
      '@media (max-width:900px)': { fontSize: '1.75rem' },
      '@media (max-width:600px)': { fontSize: '1.45rem' },
    },
    h4: {
      fontFamily: '"Cormorant", "Fraunces", serif',
      fontWeight: 600,
      fontSize: '1.6rem',
      letterSpacing: '-0.005em',
      lineHeight: 1.25,
      textWrap: 'balance',
      '@media (max-width:900px)': { fontSize: '1.35rem' },
      '@media (max-width:600px)': { fontSize: '1.15rem' },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.005em',
      lineHeight: 1.35,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.08rem',
      letterSpacing: '-0.005em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '-0.002em',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.002em',
      lineHeight: 1.45,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.7,
      letterSpacing: '0.005em',
    },
    body2: {
      fontSize: '0.92rem',
      fontWeight: 400,
      lineHeight: 1.65,
      letterSpacing: '0.005em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
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
    '0 1px 2px rgba(10, 10, 10, 0.05)',
    '0 2px 6px rgba(10, 10, 10, 0.07)',
    '0 4px 10px rgba(10, 10, 10, 0.09)',
    '0 8px 16px -8px rgba(10, 10, 10, 0.11)',
    '0 12px 24px -12px rgba(10, 10, 10, 0.13)',
    '0 16px 30px -14px rgba(10, 10, 10, 0.15)',
    '0 20px 36px -16px rgba(10, 10, 10, 0.17)',
    '0 24px 42px -18px rgba(10, 10, 10, 0.19)',
    '0 28px 48px -20px rgba(10, 10, 10, 0.20)',
    '0 32px 56px -22px rgba(10, 10, 10, 0.21)',
    '0 36px 64px -24px rgba(10, 10, 10, 0.22)',
    '0 40px 72px -26px rgba(10, 10, 10, 0.23)',
    '0 44px 80px -28px rgba(10, 10, 10, 0.24)',
    '0 48px 88px -30px rgba(10, 10, 10, 0.25)',
    '0 52px 96px -32px rgba(10, 10, 10, 0.26)',
    '0 56px 104px -34px rgba(10, 10, 10, 0.27)',
    '0 60px 112px -36px rgba(10, 10, 10, 0.28)',
    '0 64px 120px -38px rgba(10, 10, 10, 0.29)',
    '0 68px 128px -40px rgba(10, 10, 10, 0.30)',
    '0 72px 136px -42px rgba(10, 10, 10, 0.31)',
    '0 76px 144px -44px rgba(10, 10, 10, 0.32)',
    '0 80px 152px -46px rgba(10, 10, 10, 0.33)',
    '0 84px 160px -48px rgba(10, 10, 10, 0.34)',
    '0 88px 168px -50px rgba(10, 10, 10, 0.35)',
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
          color: '#0C0A09',
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
          color: '#0C0A09',
          boxShadow: '0 14px 28px -18px rgba(212, 175, 55, 0.35)',
          '&:hover': {
            background: nexus.gradient.button,
            transform: 'translateY(-1px)',
            boxShadow: '0 20px 36px -20px rgba(212, 175, 55, 0.5)',
            filter: 'brightness(1.05) saturate(1.1)',
          },
        },
        outlined: {
          borderColor: nexus.neutral[300],
          color: nexus.neutral[900],
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212, 175, 55, 0.05)',
            color: '#CA8A04',
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
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: nexus.neutral[200],
              transition: nexus.transition.base,
            },
            '&:hover fieldset': {
              borderColor: '#D4AF37',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#CA8A04',
              borderWidth: '2px',
              boxShadow: `0 0 0 3px rgba(212,175,55,0.15)`,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: nexus.glass.blur,
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: nexus.radius.lg,
          border: `1px solid ${nexus.glass.border}`,
          background: nexus.glass.background,
          backdropFilter: nexus.glass.blur,
          boxShadow: nexus.glass.shadow,
          transition: nexus.transition.base,
          '&:hover': {
            boxShadow: nexus.glass.shadowHover,
            borderColor: '#D4AF37',
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
          color: '#0C0A09',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: nexus.radius.lg,
          backgroundImage: 'none',
          border: `1px solid ${nexus.neutral[200]}`,
          boxShadow: '0 18px 45px -24px rgba(10, 10, 10, 0.1)',
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);
export default theme;
