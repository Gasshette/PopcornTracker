import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { AppMessage } from '../../components/AppMessage';
import { useItems } from '../../contexts/ItemsProvider';
import { useFetchMedia } from '../../hooks/useFetchItem';
import { Item } from '../../types/Item';
import { DetailsContent } from './DetailsContent';
import DetailsHeader from './DetailsHeader';
import { BigLoader } from '../../components/BigLoader';

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

  const item = {
    ...sourceItem,
    media: data ?? null,
  };

  if (error) {
    if (id === deletedItemRef.current?.id) {
      return (
        <AppMessage>
          <BigLoader />
        </AppMessage>
      );
    }

    return <Typography>{error.message}</Typography>;
  }

  if (isLoading || !item) {
    return (
      <AppMessage>
        <BigLoader />
      </AppMessage>
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
