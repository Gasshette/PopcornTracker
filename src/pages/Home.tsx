import { Item } from '../types/Item';
import ListItem from '../components/ListItem';
import AddOrUpdateItemDialog from '../dialogs/AddOrUpdateItemDialog';
import { useEffect, useState } from 'react';
import DraggableList from '../components/DraggableList';
import ConfigDialog from '../dialogs/ConfigDialog';
import { Box, Divider, Paper, useTheme } from '@mui/material';
import DetailsItemDialog from '../dialogs/detailsItemDialog/DetailsItemDialog';
import { HeaderMenu } from '../components/HeaderMenu';
import { useItems } from '../contexts/ItemsProvider';

export interface DialogsState {
  addOrUpdate: boolean;
  settings: boolean;
  details: boolean;
}

export interface DialogsItemsState {
  addOrUpdate?: Item;
  details?: Item;
}

const Todo = () => {
  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <h2>TODO</h2>
        <ul>
          <li>Make list items swipable : right = delete, left = favorite</li>
        </ul>
      </Paper>
    </>
  );
};

export const Home = () => {
  const { items } = useItems();
  const [dialogsItemsState, setDialogsItemsState] = useState<DialogsItemsState>(
    {}
  );
  const [dialogsState, setDialogState] = useState<DialogsState>({
    addOrUpdate: false,
    settings: false,
    details: false,
  });
  const theme = useTheme();

  const handleCloseAddOrUpdate = () => {
    setDialogState((prev) => ({ ...prev, details: false, addOrUpdate: false }));
    setDialogsItemsState((prev) => ({
      ...prev,
      addOrUpdate: undefined,
      details: undefined,
    }));
  };

  const handleEditItem = (item: Item) => {
    setDialogsItemsState((prev) => ({ ...prev, addOrUpdate: item }));
    setDialogState((prev) => ({ ...prev, addOrUpdate: true }));
  };

  useEffect(() => {
    setDialogState((prev) => ({
      ...prev,
      addOrUpdate: !!dialogsItemsState.addOrUpdate,
    }));
  }, [dialogsItemsState.addOrUpdate]);

  return (
    <>
      <AddOrUpdateItemDialog
        item={dialogsItemsState.addOrUpdate}
        open={dialogsState.addOrUpdate}
        onClose={handleCloseAddOrUpdate}
      />
      <DetailsItemDialog
        sourceItem={dialogsItemsState.details}
        open={dialogsState.details}
        onClose={() => setDialogState((prev) => ({ ...prev, details: false }))}
        onEdit={handleEditItem}
      />

      <ConfigDialog
        open={dialogsState.settings}
        onClose={() => setDialogState((prev) => ({ ...prev, settings: false }))}
      />

      <HeaderMenu setDialogState={setDialogState} />

      {import.meta.env.DEV && <Todo />}

      <Box sx={{ p: 2, [theme.breakpoints.down('sm')]: { p: 1 } }}>
        <DraggableList
          isFavorite
          items={items.filter((item) => item.isFavorite)}
          render={(item: Item) => (
            <ListItem
              item={item}
              openItemDetails={(item: Item) => {
                setDialogsItemsState((prev) => ({ ...prev, details: item }));
                setDialogState((prev) => ({ ...prev, details: true }));
              }}
            />
          )}
        />
        {items.some((i) => i.isFavorite) && <Divider sx={{ my: 2 }} />}
        <DraggableList
          items={items.filter((item) => !item.isFavorite)}
          render={(item: Item) => (
            <ListItem
              item={item}
              openItemDetails={(item: Item) => {
                setDialogsItemsState((prev) => ({ ...prev, details: item }));
                setDialogState((prev) => ({ ...prev, details: true }));
              }}
            />
          )}
        />
      </Box>
    </>
  );
};
