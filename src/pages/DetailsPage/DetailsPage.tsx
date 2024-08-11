import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppMessage } from '../../components/AppMessage';
import { useItems } from '../../contexts/ItemsProvider';
import { useFetchMedia } from '../../hooks/useFetchItem';
import { Item } from '../../types/Item';
import { DetailsContent } from './DetailsContent';
import DetailsHeader from './DetailsHeader';

export const DetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { getItem } = useItems();

  if (!id) {
    throw new Error('Id not found in the URL');
  }

  const item = getItem(id);

  if (!item) {
    throw new Error(`Item not found with id ${id}`);
  }

  return <Content id={id} sourceItem={item} />;
};

interface ContentProps {
  sourceItem: Item;
  id: string;
}
const Content = (props: ContentProps) => {
  const { id, sourceItem } = props;

  const { deletedItemRef } = useItems();
  const { data, isLoading, error } = useFetchMedia(sourceItem);

  const item = useMemo(() => {
    const newItem: Item = {
      ...sourceItem,
      media: data ?? null,
    };

    return newItem;
  }, [sourceItem, data]);

  if (error) {
    if (id === deletedItemRef.current?.id) {
      return (
        <AppMessage>
          <CircularProgress />
        </AppMessage>
      );
    }

    return <Typography>{error.message}</Typography>;
  }

  if (isLoading || !item) {
    return (
      <Stack
        sx={{
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={'4rem'} />
      </Stack>
    );
  }

  return (
    <>
      <Box sx={(theme) => theme.mixins.toolbar} />
      <DetailsHeader item={item} />
      <DetailsContent item={item} />
    </>
  );
};
