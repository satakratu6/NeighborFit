import React, { useMemo, useState } from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider, createTheme, CssBaseline, responsiveFontSizes } from '@mui/material';

function Main() {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() =>
    responsiveFontSizes(createTheme({
      palette: {
        mode,
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#ff9800',
        },
        background: {
          default: mode === 'dark' ? '#181a1b' : '#f4f6fa',
          paper: mode === 'dark' ? '#23272f' : '#fff',
        },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
            },
          },
        },
      },
    })), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App toggleTheme={() => setMode(m => m === 'light' ? 'dark' : 'light')} mode={mode} />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>,
)
