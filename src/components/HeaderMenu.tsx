import { Login, Logout } from '@mui/icons-material';
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

interface AppBarProps {
  setDialogState: React.Dispatch<React.SetStateAction<DialogsState>>;
}
export const HeaderMenu = (prop: AppBarProps) => {
  const { setDialogState } = prop;

  const { user, setUser, isSyncing } = useAuth();
  const theme = useTheme();
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse: TokenResponse) => {
      try {
        const userInfo = await getUserInfo(tokenResponse);

        setUser(userInfo);
      } catch (err: any) {
        console.error(err);
      }
    },
  });

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
                  xxs: 'none',
                  sm: 'block',
                },
              }}
            >
              Popcorn Tracker
            </Typography>
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
              <IconButton sx={{ ml: 'auto' }} onClick={() => login()}>
                <Login />
              </IconButton>
            ) : (
              <IconButton
                sx={{ ml: 'auto' }}
                onClick={() => {
                  googleLogout();
                  setUser(undefined);
                }}
                disabled={isSyncing || !user}
              >
                <Logout />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <Paper sx={{ px: 2, py: 1, width: '100%', borderRadius: 0 }}>
        <Filters />
      </Paper>
    </Affix>
  );
};
