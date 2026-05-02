import { createTheme } from '@mui/material/styles';

/**
 * VESTI-inspired design system for Smart Inventory Management.
 * Design reference: https://dribbble.com/shots/26989197
 *
 * Key tokens:
 *   - Border radius cards: 20px (bento-box aesthetic)
 *   - Font family: Inter, sans-serif
 *   - Dark sidebar: #1A1D2E
 *   - Pastel stat cards with accent colors
 */

// Stat card pastel palette (used in DashboardPage)
export const statCardPalette = {
  products:    { bg: '#E8F5E9', color: '#10B981', icon: '#10B981' },
  revenue:     { bg: '#E3F2FD', color: '#3B82F6', icon: '#3B82F6' },
  lowStock:    { bg: '#FFF3E0', color: '#F59E0B', icon: '#F59E0B' },
  transactions:{ bg: '#F3E5F5', color: '#8B5CF6', icon: '#8B5CF6' },
};

export const sidebarColors = {
  bg: '#1A1D2E',
  activeItem: 'rgba(255,255,255,0.10)',
  hoverItem: 'rgba(255,255,255,0.06)',
  text: '#9CA3AF',
  textActive: '#FFFFFF',
  width: 260,
};

const createAppTheme = () =>
  createTheme({
    palette: {
      mode: 'light',
      primary:    { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
      secondary:  { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED' },
      success:    { main: '#10B981', light: '#34D399', dark: '#059669' },
      warning:    { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
      error:      { main: '#EF4444', light: '#F87171', dark: '#DC2626' },
      background: { default: '#F5F5F7', paper: '#FFFFFF' },
      text:       { primary: '#1A1A2E', secondary: '#6B7280' },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500, color: '#6B7280' },
      subtitle2: { fontWeight: 500, fontSize: '0.8rem', color: '#6B7280' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 20,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 20 },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 20px',
          },
          containedPrimary: {
            boxShadow: '0 4px 14px rgba(59,130,246,0.30)',
            '&:hover': { boxShadow: '0 6px 20px rgba(59,130,246,0.40)' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 20, fontWeight: 600 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 700, color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
        },
      },
    },
  });

export default createAppTheme;
