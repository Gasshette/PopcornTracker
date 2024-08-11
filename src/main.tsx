import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import App from './App.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { WorkerProvider } from './contexts/WorkerProvider.tsx';
import SyncWorker from './workers/SyncWorker.ts?worker';
import { GoogleOAuthProvider } from '@react-oauth/google';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    // bugfix: https://mui.com/material-ui/guides/interoperability/#css-variables
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey[900],
          '& .MuiPaper-root': {
            backgroundColor: theme.palette.grey[800],
          },
        }),
      },
    },
  },
});

const extendedTheme = extendTheme(theme);

const syncWorker = new SyncWorker({
  name: 'sync-worker',
});

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <WorkerProvider value={syncWorker}>
      <ThemeProvider theme={theme}>
        <CssVarsProvider theme={extendedTheme}>
          <CssBaseline />
          <StrictMode>
            <App />
          </StrictMode>
        </CssVarsProvider>
      </ThemeProvider>
    </WorkerProvider>
  </GoogleOAuthProvider>
);
