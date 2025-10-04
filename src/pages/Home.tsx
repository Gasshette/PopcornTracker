import { Item } from '../types/Item';
import { useEffect } from 'react';
import VirtualizedList from '../components/VirtualizedList';
import { Box, Button, Paper, Stack, useTheme } from '@mui/material';
import { useItems } from '../contexts/ItemsProvider';
import { useDialogsContext } from '../contexts/DialogsProvider';
import { refetchAllItems } from '../utils';
import { migrateDefaultConfigColors } from '../api/migrations/restDbMigrations';

export interface DialogsItemsState {
  addOrUpdate?: Item;
}

const Todo = () => {
  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <h2>TODO</h2>
        <ul>
          <li>Call TMDB for series/anime episodes' infos</li>
        </ul>
      </Paper>
    </>
  );
};

export const listStyle = {
  height: '300px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  width: '100%',
  maxWidth: '500px',
  borderRadius: '4px',
};

export const Home = () => {
  const { items = [], setItems } = useItems();
  const { dialogsState, setDialogsState } = useDialogsContext();
  const theme = useTheme();

  const handleRefetch = async () => {
    const newItems = await refetchAllItems(items);
    setItems(newItems);
  };

  useEffect(() => {
    setDialogsState((prev) => ({
      ...prev,
      addOrUpdate: !!dialogsState.addOrUpdate,
    }));
  }, [dialogsState.addOrUpdate]);

  return (
    <>
      {import.meta.env.DEV && (
        <Box sx={{ mt: 14 }}>
          <Todo />
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Button variant="contained" onClick={handleRefetch}>
              Refetch items
            </Button>

            <Button
              variant="contained"
              onClick={migrateDefaultConfigColors}
              disabled
            >
              Migrate colors
            </Button>
          </Stack>
        </Box>
      )}

      <Box
        sx={{
          mt: import.meta.env.DEV ? 0 : 14.5,
          p: 2,
          [theme.breakpoints.down('sm')]: { p: 1 },
        }}
      >
        <VirtualizedList />
      </Box>
    </>
  );
};
