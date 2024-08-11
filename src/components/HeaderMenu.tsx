import { Login, Logout, Search } from '@mui/icons-material';
import {
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  AppBar,
  Toolbar,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../contexts/AuthProvider';
import { DialogsState } from '../pages/Home';
import Filters from './Filters';
import Affix from './Affix';
import {
  googleLogout,
  TokenResponse,
  useGoogleLogin,
} from '@react-oauth/google';
import { getUserInfo } from '../api/GoogleApi';
import { SyncIcon } from './SyncIcon';
import { POPCORN_TRACKER_LOGGED_USER_KEY } from '../const';
import { useState } from 'react';

interface AppBarProps {
  setDialogState: React.Dispatch<React.SetStateAction<DialogsState>>;
}

export const HeaderMenu = (prop: AppBarProps) => {
  const { setDialogState } = prop;

  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);

  const { user, setUser, isSyncing } = useAuth();
  const theme = useTheme();
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse: TokenResponse) => {
      try {
        const userInfo = await getUserInfo(tokenResponse);
        localStorage.setItem(
          POPCORN_TRACKER_LOGGED_USER_KEY,
          JSON.stringify(userInfo)
        );
        setUser(userInfo);
      } catch (err: any) {
        console.error(err);
      }
    },
  });

  const logout = () => {
    googleLogout();
    setUser(undefined);
    localStorage.removeItem(POPCORN_TRACKER_LOGGED_USER_KEY);
  };

  return (
    <Affix>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          sx={{
            position: 'static',
            backgroundColor: 'var(--mui-palette-background-default)',
            backgroundImage: 'none',
            color: theme.palette.common.white,
            px: 2,
          }}
        >
          <Toolbar disableGutters>
            <Typography
              variant={isUnderSm ? 'h6' : 'h4'}
              component="div"
              sx={{
                flexGrow: 1,
                display: {
                  xs: 'none',
                  sm: 'block',
                },
              }}
            >
              Popcorn Tracker
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <IconButton
                onClick={(_e) => setShowSearchBar(!showSearchBar)}
                disabled={isSyncing || !user}
              >
                <Search />
              </IconButton>
              <IconButton
                onClick={(_e) =>
                  setDialogState((prev) => ({ ...prev, addOrUpdate: true }))
                }
                disabled={isSyncing || !user}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                onClick={(_e) =>
                  setDialogState((prev) => ({ ...prev, settings: true }))
                }
                disabled={isSyncing || !user}
              >
                <SettingsIcon />
              </IconButton>
              {isSyncing ? (
                <IconButton disabled>
                  <SyncIcon sx={{ color: theme.palette.common.white }} />
                </IconButton>
              ) : !user ? (
                <IconButton onClick={() => login()}>
                  <Login />
                </IconButton>
              ) : (
                <IconButton onClick={logout} disabled={isSyncing || !user}>
                  <Logout />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
      <Paper sx={{ px: 2, py: 1, width: '100%', borderRadius: 0 }}>
        <Filters showSearchBar={showSearchBar} />
      </Paper>
    </Affix>
  );
};
