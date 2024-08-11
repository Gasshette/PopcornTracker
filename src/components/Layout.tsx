import { Outlet } from 'react-router-dom';
import { HeaderMenu } from './HeaderMenu';
import AddOrUpdateItemDialog from '../dialogs/AddOrUpdateItemDialog';
import ConfigDialog from '../dialogs/ConfigDialog';
import { ShareDialog } from '../dialogs/ShareDialog';
import { ThemeProvider } from '@emotion/react';
import {
  createTheme,
  CssBaseline,
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
} from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../contexts/AuthProvider';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { DialogsProvider } from '../contexts/DialogsProvider';
import { ItemsProvider } from '../contexts/ItemsProvider';
import { WorkerProvider } from '../contexts/WorkerProvider';
import SyncWorker from '../workers/SyncWorker.ts?worker';

const theme = createTheme({
  zIndex: {
    modal: 9999,
  },
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

export const Layout = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <WorkerProvider value={syncWorker}>
        <ThemeProvider theme={theme}>
          <CssVarsProvider theme={extendedTheme}>
            <CssBaseline />
            <AuthProvider>
              <ItemsProvider>
                <ConfigProvider>
                  <DialogsProvider>
                    <HeaderMenu />
                    <Outlet />
                    <AddOrUpdateItemDialog />
                    <ConfigDialog />
                    <ShareDialog />
                  </DialogsProvider>
                </ConfigProvider>
              </ItemsProvider>
            </AuthProvider>
          </CssVarsProvider>
        </ThemeProvider>
      </WorkerProvider>
    </GoogleOAuthProvider>
  );
};
