import { Outlet } from 'react-router-dom';
import { HeaderMenu } from './HeaderMenu';
import AddOrUpdateItemDialog from '../dialogs/AddOrUpdateItemDialog';
import ConfigDialog from '../dialogs/ConfigDialog';
import { ShareDialog } from '../dialogs/ShareDialog';
import { createTheme, CssBaseline, darken, ThemeProvider } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../contexts/AuthProvider';
import { ConfigProvider } from '../contexts/ConfigProvider';
import { DialogsProvider } from '../contexts/DialogsProvider';
import { ItemsProvider } from '../contexts/ItemsProvider';
import { WorkerProvider } from '../contexts/WorkerProvider';
import SyncWorker from '../workers/SyncWorker.ts?worker';
import { scrollYKey } from '../const';
import { AutoUpdater } from './AutoUpdater';

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
        variant: 'filled',
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'filled',
      },
    },
    MuiFormControl: {
      defaultProps: {
        variant: 'filled',
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          lineHeight: 1.5,
        },
      },
    },
    // bugfix: https://mui.com/material-ui/guides/interoperability/#css-variables
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: darken(theme.palette.grey[900], 0.3),
        }),
      },
    },
  },
});

const syncWorker = new SyncWorker({
  name: 'sync-worker',
});

export const Layout = () => {
  // Clean the stored scrollY so it does not triggers the scroll on first load
  sessionStorage.removeItem(scrollYKey);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <WorkerProvider value={syncWorker}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <ItemsProvider>
              <AutoUpdater>
                <ConfigProvider>
                  <DialogsProvider>
                    <HeaderMenu />
                    <Outlet />
                    <AddOrUpdateItemDialog />
                    <ConfigDialog />
                    <ShareDialog />
                  </DialogsProvider>
                </ConfigProvider>
              </AutoUpdater>
            </ItemsProvider>
          </AuthProvider>
        </ThemeProvider>
      </WorkerProvider>
    </GoogleOAuthProvider>
  );
};
