import {
  KeyboardDoubleArrowRight,
  Login,
  Logout,
  Search,
  Share,
} from '@mui/icons-material';
import {
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  AppBar,
  Toolbar,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../contexts/AuthProvider';
import { Filters } from './Filters';
import {
  googleLogout,
  TokenResponse,
  useGoogleLogin,
} from '@react-oauth/google';
import { getUserInfo } from '../api/GoogleApi';
import { SyncIcon } from './SyncIcon';
import { POPCORN_TRACKER_LOGGED_USER_KEY } from '../const';
import { useRef, useState } from 'react';
import { useDialogsContext } from '../contexts/DialogsProvider';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useItems } from '../contexts/ItemsProvider';
import { SearchBar } from './SearchBar';
import { getRightTransitionSx, resetScrollY } from '../utils';

export const HeaderMenu = () => {
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);

  const { userId } = useParams<{ userId: string }>();
  const { items, filteredItems, textFilter, setTextFilter } = useItems();
  const theme = useTheme();
  const { user, setUser, isSyncing } = useAuth();
  const { setDialogsState } = useDialogsContext();
  const location = useLocation();
  const isUnderSm = useMediaQuery(theme.breakpoints.down('sm'));

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const showFilters = !location.pathname.includes('details');
  const areActionsDisabled = isSyncing || !user || !!userId;

  const logout = () => {
    googleLogout();
    setUser(undefined);
    localStorage.removeItem(POPCORN_TRACKER_LOGGED_USER_KEY);
  };

  const handleShowSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    searchInputRef.current && searchInputRef.current.focus();
  };

  const handleSearch = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    resetScrollY();

    setTextFilter(searchInputRef.current?.value ?? undefined);
  };

  const handleClearSearch = () => {
    setTextFilter(undefined);

    if (searchInputRef.current) {
      textFilter && resetScrollY();
      searchInputRef.current.value = '';
    }
  };

  const handleCloseSearchBar = () => {
    setShowSearchBar(false);
    setTextFilter(undefined);

    if (searchInputRef.current) {
      textFilter && resetScrollY();

      searchInputRef.current.value = '';
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 9999,
      }}
    >
      <AppBar
        sx={{
          position: 'static',
          backgroundColor: (theme) => theme.palette.background.default,
          backgroundImage: 'none',
          color: theme.palette.common.white,
          px: 1,
          [theme.breakpoints.up('sm')]: { px: 2 },
        }}
      >
        <Toolbar disableGutters>
          <Typography
            component={Link}
            to="/"
            variant={isUnderSm ? 'h6' : 'h4'}
            sx={{
              textDecoration: 'none',
              color: 'unset',
              flexGrow: 1,
            }}
          >
            {isUnderSm ? 'PT' : 'Popcorn Tracker'} (
            {filteredItems.length !== items.length
              ? `${filteredItems.length}/`
              : ''}
            {items.length})
          </Typography>
          <Box
            sx={{
              backgroundColor: (theme) => theme.palette.background.paper,
              ...getRightTransitionSx(showSearchBar, -2000, 1),
              ...(isUnderSm && { width: '100%' }),
            }}
          >
            <SearchBar
              ref={searchInputRef}
              defaultValue={textFilter}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
            <IconButton
              onClick={handleCloseSearchBar}
              sx={(theme) => ({
                [theme.breakpoints.down('sm')]: { ml: 'auto' },
              })}
            >
              <KeyboardDoubleArrowRight />
            </IconButton>
          </Box>
          <Box sx={getRightTransitionSx(showSearchBar, 1, -2000)}>
            <IconButton onClick={handleShowSearchBar} disabled={isSyncing}>
              <Search />
            </IconButton>
            <IconButton
              onClick={(_e) =>
                setDialogsState((prev) => ({
                  ...prev,
                  addOrUpdate: true,
                }))
              }
              disabled={areActionsDisabled}
            >
              <AddIcon />
            </IconButton>

            <Divider orientation="vertical" flexItem />
            <IconButton
              onClick={(_e) =>
                setDialogsState((prev) => ({ ...prev, share: true }))
              }
              disabled={areActionsDisabled}
            >
              <Share />
            </IconButton>

            <IconButton
              onClick={(_e) =>
                setDialogsState((prev) => ({ ...prev, settings: true }))
              }
              disabled={areActionsDisabled}
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

      {showFilters && <Filters />}
    </Box>
  );
};
