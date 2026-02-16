import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/* ═══════════════════════════════════════════════════════════
   NEXUS COMMERCE — Design Tokens
   ═══════════════════════════════════════════════════════════ */

export const nexus = {
  /* ── Gradient palette (purple → orange) ── */
  gradient: {
    primary: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #F97316 100%)',
    subtle: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #FB923C 100%)',
    button: 'linear-gradient(90deg, #7C3AED 0%, #9333EA 50%, #F97316 100%)',
    dark: 'linear-gradient(135deg, #1E1028 0%, #0F0A1A 50%, #1A0F0A 100%)',
    glass:
      'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(249,115,22,0.05) 100%)',
  },

  /* ── Core colours ── */
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6D28D9',
    900: '#5B21B6',
  },
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  /* ── Glassmorphism ── */
  glass: {
    background: 'rgba(255, 255, 255, 0.7)',
    backgroundDark: 'rgba(15, 10, 26, 0.85)',
    border: 'rgba(255, 255, 255, 0.18)',
    borderDark: 'rgba(124, 58, 237, 0.2)',
    blur: 'blur(16px)',
    blurHeavy: 'blur(24px)',
    shadow: '0 8px 32px rgba(124, 58, 237, 0.12)',
    shadowHover: '0 12px 40px rgba(124, 58, 237, 0.2)',
  },

  /* ── Spacing / radii ── */
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    pill: '9999px',
  },

  /* ── Transitions ── */
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
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
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: nexus.neutral[900],
      secondary: nexus.neutral[500],
    },
    error: { main: '#EF4444' },
    success: { main: '#10B981' },
    warning: { main: nexus.orange[500] },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
      '@media (max-width:960px)': { fontSize: '2.75rem' },
      '@media (max-width:600px)': { fontSize: '2.25rem' },
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
      '@media (max-width:960px)': { fontSize: '2rem' },
      '@media (max-width:600px)': { fontSize: '1.75rem' },
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.25,
      '@media (max-width:960px)': { fontSize: '1.75rem' },
      '@media (max-width:600px)': { fontSize: '1.5rem' },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      '@media (max-width:960px)': { fontSize: '1.25rem' },
      '@media (max-width:600px)': { fontSize: '1.125rem' },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: nexus.radius.md,
          fontWeight: 600,
          padding: '10px 24px',
          transition: nexus.transition.base,
        },
        contained: {
          background: nexus.gradient.button,
          color: '#fff',
          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
          '&:hover': {
            background: nexus.gradient.button,
            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
            filter: 'brightness(1.08)',
          },
        },
        outlined: {
          borderColor: nexus.purple[300],
          color: nexus.purple[700],
          '&:hover': {
            borderColor: nexus.purple[500],
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
            backgroundColor: nexus.neutral[50],
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
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: nexus.radius.lg,
          border: `1px solid ${nexus.neutral[200]}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: nexus.transition.base,
          '&:hover': {
            boxShadow: nexus.glass.shadow,
            borderColor: nexus.purple[200],
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: nexus.radius.sm,
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
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);
export default theme;
