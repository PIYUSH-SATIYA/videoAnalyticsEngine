import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2f6f67'
    },
    secondary: {
      main: '#7a8f59'
    },
    background: {
      default: '#f5f5f4',
      paper: '#ffffff'
    },
    text: {
      primary: '#1c1917',
      secondary: '#57534e'
    },
    divider: '#d6d3d1'
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    fontFamily: 'Inter, Segoe UI, Roboto, system-ui, sans-serif',
    h4: {
      fontWeight: 650,
      letterSpacing: '-0.02em'
    },
    h6: {
      fontWeight: 600
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #d6d3d1',
          boxShadow: '0 1px 2px rgb(0 0 0 / 0.06)'
        }
      }
    }
  }
});
